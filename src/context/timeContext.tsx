import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

type TTimeControlContext = {
  startInterval: () => void;
  stopInterval: () => void;
};

const TimeContext = createContext<Date | null>(null);
const TimeControlContext = createContext<TTimeControlContext | null>(null);

export const TimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [time, setTime] = useState(new Date());
  const intervalId = useRef<number | null>(null);

  const startInterval = () => {
    if (intervalId.current) {
      return;
    }

    intervalId.current = setInterval(() => {
      setTime(new Date());
    }, 1000);
  };

  const stopInterval = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, []);

  return (
    <TimeControlContext.Provider value={{ startInterval, stopInterval }}>
      <TimeContext.Provider value={time}>{children}</TimeContext.Provider>
    </TimeControlContext.Provider>
  );
};

export const useTime = () => {
  const context = useContext(TimeContext);
  if (context === null) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};

export const useTimeControl = () => {
  const context = useContext(TimeControlContext);
  if (context === null) {
    throw new Error('useTimeControl must be used within a TimeProvider');
  }
  return context;
};