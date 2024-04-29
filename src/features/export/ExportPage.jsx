import { categorySchema, entitySchema, transactionSchema } from 'luca-schema';

import SchemaDrivenTable from '@/components/tables/SchemaDrivenTable';
import ExportButton from './components/ExportButton';

export default function ExportPage() {
  return (
    <div style={{ position: 'relative' }}>
      <ExportButton />
      <SchemaDrivenTable
        title='Entities'
        data={[]}
        schema={entitySchema}
      />
      <SchemaDrivenTable
        title='Categories'
        data={[]}
        schema={categorySchema}
      />
      <SchemaDrivenTable
        title='Transactions'
        data={[]}
        schema={transactionSchema}
      />
      <div>
        <h2>Recurring Transactions</h2>
      </div>
      <div>
        <h2>Recurring Transaction Events</h2>
      </div>
    </div>
  );
}
