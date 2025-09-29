import { useState } from 'react';
import OpenModalButton from './OpenModalButton';
import ModalDialog from './ModalDialog';

export default function RepeatedTransactionsModal() {
  const [open, setOpen] = useState(false);
  const [reset, setReset] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setReset(true);
    }, 300);
  };

  return (
    <>
      <OpenModalButton handleOpen={handleOpen} />
      <ModalDialog
        open={open}
        handleClose={handleClose}
        reset={reset}
        setReset={setReset}
      />
    </>
  );
}
