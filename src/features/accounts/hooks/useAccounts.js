import { useState } from 'react';

const useAccounts = () => {
  const [accounts /* , setAccounts */] = useState([]);

  return accounts;
};

export default useAccounts;
