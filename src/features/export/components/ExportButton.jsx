import { Button, Typography } from '@mui/material';
import packageInfo from 'luca-schema/package.json';

import { useEntities, useTransactions } from '@/hooks';
import { validateLucaSchema, validateSchema } from '@/store/validators';

export default function ExportButton() {
  const { transactions } = useTransactions();
  const { entities } = useEntities();
  const schemaVersion = packageInfo.version;

  const handleExport = () => {
    const schema = {
      id: 'luca-schema',
      name: 'Luca Schema',
      version: schemaVersion,
    };

    const valid = validateSchema(schema);

    if (!valid) {
      console.error(validateSchema.errors);
      return;
    }

    const data = {
      schema,
      transactions,
      entities,
    };

    const validData = validateLucaSchema(data);

    if (!validData) {
      console.error(validateLucaSchema.errors);
      return;
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'absolute', right: '50px' }}>
      <Typography variant='subtitle2'>{schemaVersion}</Typography>
      <Button
        variant='contained'
        color='primary'
        onClick={handleExport}
      >
        Export
      </Button>
    </div>
  );
}
