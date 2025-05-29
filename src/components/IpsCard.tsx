import React, { useEffect, useState, useCallback } from "react";
import IpRow from "./IpRow";
import { useTimeControl } from "../context/timeContext";
import styles from "../styles/IpsCard.module.css";
import { BATCH_TIME_ZONE_API_URL, IP_FIELDS } from '../utils/consts';

type TField = {
  id: string;
  ip: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  error?: string;
  isLoading?: boolean;
};

const STORAGE_KEY = 'ip-lookup-data';

const saveToLocalStorage = (data: TField[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromLocalStorage = (): TField[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

export const IpsCard: React.FC = () => {
  const [ipRows, setIpRows] = useState<TField[]>(loadFromLocalStorage());
  const [isSyncing, setIsSyncing] = useState(false);

  const { startInterval, stopInterval } = useTimeControl();

  useEffect(() => {
    saveToLocalStorage(ipRows);
  }, [ipRows]);

  useEffect(() => {
    setIsSyncing(ipRows.length === 0);
  }, [ipRows]);

  const addRow = useCallback(() => {
    const newRow: TField = {
      id: crypto.randomUUID(),
      ip: "",
    };

    setIpRows((prev) => [...prev, newRow]);
  }, []);

  const handleUpdate = useCallback((id: string, ip: string, country = '', countryCode = '', timezone = '') => {
    setIpRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, ip, country, countryCode, timezone } : row
      )
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setIpRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);

    setIpRows((prev) =>
      prev.map((row) => ({
        ...row,
        isLoading: true,
        error: undefined,
      }))
    );

    const batchIps = ipRows.reduce((acc, row) => {
      // Skip IPs that already have valid data
      if (row.ip && !row.timezone) {
        acc.push({ query: row.ip, fields: IP_FIELDS });
      }
      return acc;
    }, [] as Record<string, string | string[]>[]);

    // If no IPs need to be looked up, finish early
    if (batchIps.length === 0) {
      setIsSyncing(false);

      return;
    }

    try {
      const response = await fetch(BATCH_TIME_ZONE_API_URL, {
        method: 'POST',
        body: JSON.stringify(batchIps),
      });

      const data = await response.json();

      const resultMap = new Map<string, Record<string, string>>();

      for (const result of data) {
        resultMap.set(result.query, result);
      }

      setIpRows((prevRows) =>
        prevRows.map((row) => {
          if (row.timezone) {
            return row;
          }

          const result = resultMap.get(row.ip.trim());

          if (result) {
            if (result.status === "fail") {
              return {
                ...row,
                country: undefined,
                countryCode: undefined,
                timezone: undefined,
                isLoading: false,
                error: result.message,
              };
            }

            return {
              ...row,
              ip: result.query,
              country: result.country,
              countryCode: result.countryCode,
              timezone: result.timezone,
              isLoading: false,
              error: undefined,
            };
          } else {
            return { ...row, isLoading: false, error: 'Invalid IP address' };
          }
        })
      );
    } catch (error) {
      console.error('Error syncing IPs:', error);

      setIpRows((prevRows) =>
        prevRows.map((row) => ({
          ...row,
          isLoading: false,
          error: "Network error",
        }))
      );
    } finally {
      setIsSyncing(false);
    }
  }, [ipRows]);

  useEffect(() => {
    const hasActiveTimezone = ipRows.some((ipRow) => !!ipRow.timezone);

    if (hasActiveTimezone) {
      startInterval();
    } else {
      stopInterval();
    }
  }, [ipRows]);

  return (
    <div className={styles.card} data-testid="ip-card">
      <div className={styles.header}>
        <h2>IP Lookup</h2>
      </div>
      <div className={styles.actions}>
        <button className={styles.add_btn} data-testid="add-button" onClick={addRow}>Add</button>
        <button
          className={styles.sync_btn}
          data-testid="sync-button"
          disabled={isSyncing}
          onClick={handleSync}
        >
          Sync
        </button>
      </div>
      <div className={styles.ips_list} data-testid="ip-list">
        {ipRows.length === 0 && <p data-testid="initial-message">Click the "Add" button to add an IP address...</p>}
        {ipRows.map((ipRow, index) => (
          <IpRow
            key={ipRow.id}
            id={ipRow.id}
            index={index + 1}
            data={ipRow}
            handleUpdate={handleUpdate}
            handleRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default IpsCard;
