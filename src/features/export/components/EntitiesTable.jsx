import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

import { useEntities } from '@/hooks';

export default function EntitiesTable() {
  const { entities } = useEntities();

  return (
    <div>
      <h2>Entities</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entities.map((entity) => (
            <TableRow key={entity.id}>
              <TableCell>{entity.name}</TableCell>
              <TableCell>{entity.createdAt}</TableCell>
              <TableCell>{entity.updatedAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
