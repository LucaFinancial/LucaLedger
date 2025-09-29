import * as yup from 'yup';

import { TransactionStatusEnum } from './constants';

const commonTransactionSchema = yup.object({
  id: yup.string().required('Transaction ID is required'),
  status: yup
    .string()
    .required('Transaction status is required')
    .oneOf(Object.values(TransactionStatusEnum), 'Invalid status value'),
  date: yup.date().required('Transaction date is required'),
  amount: yup.number().required('Transaction amount is required'),
  description: yup.string().required('Transaction description is required'),
  categoryId: yup.string(),
});

export default {
  transaction: commonTransactionSchema,
};
