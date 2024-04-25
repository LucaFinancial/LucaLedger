import AddEntityButton from './components/AddEntityButton';
import EntityTable from './components/EntityTable';

export default function EntitiesPage() {
  return (
    <div>
      <h1>Entities Management</h1>
      <AddEntityButton />
      <EntityTable />
    </div>
  );
}
