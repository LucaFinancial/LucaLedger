import { useState, useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectors as statementSelectors,
  actions as statementActions,
} from '@/store/statements';
import StatementCard from '@/components/StatementCard';
import StatementDetailsModal from '@/components/StatementDetailsModal';

export default function StatementsPanel({ accountId }) {
  const dispatch = useDispatch();
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get all statements for this account
  const accountStatements = useSelector(
    statementSelectors.selectStatementsByAccountId(accountId)
  );

  // Sort by end date descending
  const statements = useMemo(
    () =>
      [...accountStatements].sort((a, b) => b.endDate.localeCompare(a.endDate)),
    [accountStatements]
  );

  const handleView = (statement) => {
    setSelectedStatement(statement);
    setModalOpen(true);
  };

  const handleLock = (statement) => {
    dispatch(statementActions.lockStatement(statement.id));
  };

  const handleUnlock = (statement) => {
    dispatch(statementActions.unlockStatement(statement.id));
  };

  const handleSave = (statementId, updates) => {
    dispatch(statementActions.updateStatementProperty(statementId, updates));
  };

  const handleDelete = (statementId) => {
    dispatch(statementActions.deleteStatement(statementId));
    setModalOpen(false);
    setSelectedStatement(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStatement(null);
  };

  if (statements.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant='body1'
          color='text.secondary'
          gutterBottom
        >
          No statements available
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
        >
          Statements will be automatically generated when you view this account
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box mb={2}>
        <Typography variant='h6'>Statements</Typography>
      </Box>

      <Box>
        {statements.map((statement) => (
          <StatementCard
            key={statement.id}
            statement={statement}
            onView={handleView}
            onLock={handleLock}
            compact
          />
        ))}
      </Box>

      {selectedStatement && (
        <StatementDetailsModal
          open={modalOpen}
          onClose={handleModalClose}
          statement={selectedStatement}
          onSave={handleSave}
          onLock={handleLock}
          onUnlock={handleUnlock}
          onDelete={handleDelete}
          readOnly={selectedStatement.status === 'locked'}
        />
      )}
    </Box>
  );
}

StatementsPanel.propTypes = {
  accountId: PropTypes.string.isRequired,
};
