import { useState, useMemo } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';
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

  // Sort by closing date descending
  const statements = useMemo(
    () =>
      [...accountStatements].sort((a, b) =>
        b.closingDate.localeCompare(a.closingDate)
      ),
    [accountStatements]
  );

  const handleView = (statement) => {
    setSelectedStatement(statement);
    setModalOpen(true);
  };

  const handleEdit = (statement) => {
    setSelectedStatement(statement);
    setModalOpen(true);
  };

  const handleLock = (statement) => {
    dispatch(statementActions.lockStatement(statement.id));
  };

  const handleSave = (statementId, updates) => {
    dispatch(statementActions.updateStatementProperty(statementId, updates));
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStatement(null);
  };

  const handleCreateDraft = () => {
    // TODO: Implement draft creation logic
    console.log('Create draft statement');
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
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={2}
      >
        <Typography variant='h6'>Statements</Typography>
        <Button
          startIcon={<Add />}
          variant='outlined'
          size='small'
          onClick={handleCreateDraft}
        >
          Create Draft
        </Button>
      </Box>

      <Box>
        {statements.map((statement) => (
          <StatementCard
            key={statement.id}
            statement={statement}
            onView={handleView}
            onEdit={handleEdit}
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
          readOnly={selectedStatement.status === 'locked'}
        />
      )}
    </Box>
  );
}

StatementsPanel.propTypes = {
  accountId: PropTypes.string.isRequired,
};
