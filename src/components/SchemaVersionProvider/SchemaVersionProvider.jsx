import { useEffect } from 'react';

export default function SchemaVersionProvider() {
  useEffect(() => {
    // This component is deprecated - schema version is now managed by store migration
    // Just log the current version for debugging
    const storedSchemaVersion = localStorage.getItem('dataSchemaVersion');
    console.log(
      `[SchemaVersionProvider] Current schema version: ${
        storedSchemaVersion || 'not set'
      }`
    );
  }, []);

  return null;
}
