import { useEffect } from 'react';

import { version as currentVersion } from '../../../package.json';

export default function VersionProvider() {
  useEffect(() => {
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion !== currentVersion) {
      localStorage.setItem('appVersion', currentVersion);
      alert(
        `Luca Ledger has been updated since the last time you were here! You were last on ${storedVersion} and are now using ${currentVersion}`
      );
    }
  }, []);
  return <></>;
}
