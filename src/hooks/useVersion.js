import { useEffect } from 'react';
import { version as currentVersion } from '../../package.json';

export default function useVersion() {
  useEffect(() => {
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion !== currentVersion) {
      localStorage.setItem('appVersion', currentVersion);
      alert(`App updated from ${storedVersion} to ${currentVersion}.`);
    }
  }, []);

  return currentVersion;
}
