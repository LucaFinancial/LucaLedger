import EntitiesTable from './components/EntitiesTable';
import ExportButton from './components/ExportButton';
import TransactionsTable from './components/TransactionsTable';

export default function ExportPage() {
  return (
    <div style={{ position: 'relative' }}>
      <ExportButton />
      <div>
        <EntitiesTable />
      </div>
      <div>
        <TransactionsTable />
      </div>
      <div>
        <h2>Categories</h2>
      </div>
      <div>
        <h2>Recurring Transactions</h2>
      </div>
      <div>
        <h2>Recurring Transaction Events</h2>
      </div>
    </div>
  );
}
