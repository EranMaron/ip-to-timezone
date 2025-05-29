import { useForm } from 'react-hook-form';
import { useTime } from '../context/timeContext';
import { formatTime, isValidIp } from '../utils/helpers';
import styles from '../styles/IpRow.module.css';
import { useEffect } from 'react';
import { FLAG_CDN_URL, SINGLE_TIME_ZONE_API_URL } from '../utils/consts';
import type { TIpRowProps, TFormValues } from '../types/types';

const IpRow: React.FC<TIpRowProps> = ({ id, index, data, handleUpdate, handleRemove }) => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<TFormValues>({ mode: 'onBlur', defaultValues: { ip: data.ip } });

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
      const res = await fetch(`${SINGLE_TIME_ZONE_API_URL}${trimmedIp}`);
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
      console.error('Error fetching timezone:', error);

      setError("ip", {
        type: "manual",
        message: "Network error",
      });
    }
  };

  return (
    <div className={styles.row}>
      <label>{index}</label>
      <input
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
        <button className={styles.remove_btn} onClick={() => handleRemove(id)}>X</button>
        {(isSubmitting || data.isLoading) && <p>Looking up...</p>}
        {data.timezone && data.countryCode && !data.isLoading && (
          <>
            <img
              src={`${FLAG_CDN_URL}${data.countryCode?.toLowerCase()}.webp`}
              alt={data.country}
            />
            <p className={styles.time}>{localTime || ''}</p>
          </>
        )}
        {errors.ip && <p className={styles.error}>{errors.ip.message}</p>}
      </div>
    </div>
  )
};

export default IpRow;
