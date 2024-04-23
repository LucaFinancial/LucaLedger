import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import {
  categorySchema,
  entitySchema,
  recurringTransactionSchema,
  recurringTransactionEventSchema,
  schema,
  transactionSchema,
} from "@luca-financial/luca-schema";

const ajv = new Ajv2020();
addFormats(ajv);

const validateCategory = ajv.compile(categorySchema);
const validateEntity = ajv.compile(entitySchema);
const validateRecurringTransaction = ajv.compile(recurringTransactionSchema);
const validateRecurringTransactionEvent = ajv.compile(
  recurringTransactionEventSchema
);
const validateSchema = ajv.compile(schema);
const validateTransaction = ajv.compile(transactionSchema);

export {
  validateCategory,
  validateEntity,
  validateRecurringTransaction,
  validateRecurringTransactionEvent,
  validateSchema,
  validateTransaction,
};
