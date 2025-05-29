import { useForm } from 'react-hook-form';
import { useTime } from '../context/timeContext';
import { formatTime, isValidIp } from '../utils/helpers';
import styles from '../styles/IpRow.module.css';
import { useEffect } from 'react';
import { FLAG_CDN_URL, IP_FIELDS, SINGLE_TIME_ZONE_API_URL } from '../utils/consts';

type IPRowProps = {
  id: string;
  index: number;
  data: {
    ip: string;
    country?: string;
    countryCode?: string;
    timezone?: string;
    isLoading?: boolean
    error?: string;
  };
  handleUpdate: (id: string, ip: string, country: string, countryCode: string, timezone: string) => void;
  handleRemove: (id: string) => void;
};

type FormValues = {
  ip: string;
};

const IpRow: React.FC<IPRowProps> = ({ id, index, data, handleUpdate, handleRemove }) => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onBlur', defaultValues: { ip: data.ip } });

  useTime();

  useEffect(() => {
    if (data.isLoading) {
      clearErrors("ip");
    } else if (data.error) {
      setError("ip", {
        type: "manual",
        message: data.error,
      });
    }
  }, [data.isLoading]);

  const localTime = data.timezone ? formatTime(data.timezone) : 'N/A';

  const ipValue = watch("ip");

  const handleBlur = async () => {
    const trimmedIp = ipValue.trim();

    if (!trimmedIp || trimmedIp === data.ip) {
      return;
    }

    clearErrors("ip");

    try {
      const res = await fetch(`${SINGLE_TIME_ZONE_API_URL}${trimmedIp}?fields=${IP_FIELDS}`);
      const { status, message, country, countryCode, timezone } = await res.json();

      if (status === "fail") {
        setError("ip", {
          type: "manual",
          message: message || "Invalid IP",
        });

        handleUpdate(id, trimmedIp, '', '', '');
      } else {
        handleUpdate(id, trimmedIp, country, countryCode, timezone);
      }
    } catch (error) {
      console.error(error);
      setError("ip", {
        type: "manual",
        message: "Network error",
      });
    }
  };

  return (
    <div className={styles.row}>
      <label
        htmlFor={`ip-input-${id}`}
        data-testid="ip-row-label"
      >
        {index}
      </label>
      <input
        id={`ip-input-${id}`}
        data-testid="ip-input"
        value={ipValue}
        disabled={isSubmitting}
        autoFocus
        placeholder="Enter IPv4/IPv6 address..."
        {...register("ip", {
          validate: (value) => {
            if (!value.trim()) {
              return true;
            }

            return isValidIp(value) || "Invalid IP address";
          },
        })}
        onBlur={handleSubmit(handleBlur)}
      />
      <div className={styles.info}>
        <button className={styles.remove_btn} data-testid="remove-button" onClick={() => handleRemove(id)}>X</button>
        {(isSubmitting || data.isLoading) && <p>Looking up...</p>}
        {data.timezone && data.countryCode && !data.isLoading && (
          <>
            <img
              data-testid="country-flag"
              src={`${FLAG_CDN_URL}${data.countryCode?.toLowerCase()}.webp`}
              alt={data.country}
            />
            <p data-testid="local-time" className={styles.time}>{localTime || ''}</p>
          </>
        )}
        {errors.ip && <p data-testid="error-message" className={styles.error}>{errors.ip.message}</p>}
      </div>
    </div>
  )
};

export default IpRow;
