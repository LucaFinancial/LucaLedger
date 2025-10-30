import { useEffect } from 'react';

import { version as currentVersion } from '../../../package.json';

export default function VersionProvider() {
  useEffect(() => {
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion !== currentVersion) {
      localStorage.setItem('appVersion', currentVersion);
    }
  }, []);
  return <></>;
}
