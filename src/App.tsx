import { TimeProvider } from './context/timeContext';
import IpsCard from './components/IpsCard';
import styles from './app.module.css';

const App = () => (
  <TimeProvider>
    <div className={styles.app}>
      <header>
        <img className={styles.logo} src="/assets/torq_logo.webp" alt="logo" />
      </header>
      <IpsCard />
    </div>
  </TimeProvider>
);

export default App;
