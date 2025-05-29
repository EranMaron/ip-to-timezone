import { useTime } from '../context/timeContext';
import { formatTime } from '../utils/helpers';

export const useLocalTime = (timezone?: string): string => {
    useTime();

    if (!timezone) {
        return 'N/A';
    }

    return formatTime(timezone);
};