import { TimeProvider } from './context/timeContext';
import IpsCard from './components/IpsCard';
import styles from './app.module.css';
import torqLogo from '/assets/torq_logo.webp';

const App = () => (
  <TimeProvider>
    <div className={styles.app}>
      <header>
        <img className={styles.logo} src={torqLogo} alt="logo" />
      </header>
      <IpsCard />
    </div>
  </TimeProvider>
);

export default App;
