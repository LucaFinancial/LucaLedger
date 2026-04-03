import { useState } from 'react';
import ModalDialog from './ModalDialog';

export default function RepeatedTransactionsModal({ open, onClose }) {
  const [reset, setReset] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setReset(true);
    }, 300);
  };

  return (
    <ModalDialog
      open={open}
      handleClose={handleClose}
      reset={reset}
      setReset={setReset}
    />
  );
}

