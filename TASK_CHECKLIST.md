# Task Checklist (Expanded)

## 0) Rename `CreateNewButton` to `CreateNewAccountButton`

- **File:** [src/views/Accounts/CreateNewButton.jsx](src/views/Accounts/CreateNewButton.jsx)
- **Required changes:**
  - Rename the component to `CreateNewAccountButton`.
  - Update the filename and all import paths/usages accordingly.

## 1) Rename `loadAccount` to `loadData` (do this before anything else)

- **File:** [src/store/accounts/actions.js](src/store/accounts/actions.js)
- **Required changes:**
  - Rename `loadAccount` to `loadData` (dataset-wide loader).
  - Update all call sites to the new name.

## 2) Create `processLoadedData()` in dataProcessing.js

- **File:** [src/utils/dataProcessing.js](src/utils/dataProcessing.js)
- **Purpose:** Provide a single, consistent data processing pipeline for all loaded data (file import or IndexedDB), so validation, field stripping, and migration logic are not duplicated or inconsistent.
- **Pipeline (exact order):**
  1.  **Remove past recurring transaction events FIRST** (this is the only allowed record removal)
  2.  Validate collections
  3.  **If migration is needed:** run migration first (it may fix invalid fields/values)
  4.  Validate again
  5.  **If validation still fails:**
      - Strip invalid fields immediately (no user permission required)
      - **Do NOT** set invalid values to defaults without explicit user permission

  6.  Validate again
  7.  **If validation errors remain:** display validation errors to the user **with a list of failures**, prompt for action, and provide:
      - A **"Download JSON of invalid objects"** option
      - A **user-facing** action labeled to convey **"remove invalid objects"** (wording TBD, but should not say "remove all failed objects")
      - A **Cancel** action that warns the user invalid data may cause further problems if they proceed without fixing

- **Behavior constraints:**
  - `processLoadedData()` must **not** remove invalid objects automatically.
  - When the user chooses **remove invalid objects**, perform removal explicitly (separate step/function) and then continue loading.
  - When the user chooses **apply defaults**, only then set invalid values to defaults.

- **Record removal rule:** Past recurring transaction events are always removed first. If validation errors remain, invalid objects are **only** removed when the user explicitly chooses the **user-facing** "remove invalid objects" action.
- **Return signature:** `{ data, changed, errors, removedRecords }`
  - `data`: cleaned collections
  - `changed`: true if any modifications were made (stripping, migration, or removals)
  - `errors`: validation errors from final validation (to inform user messaging)
  - `removedRecords`: count of records removed in final validation

## 3) Update EncryptionProvider.jsx

- **File:** [src/components/EncryptionProvider/EncryptionProvider.jsx](src/components/EncryptionProvider/EncryptionProvider.jsx)
- **Purpose:** Ensure IndexedDB data goes through the exact same pipeline as file imports after decryption, with category loading always enabled.
- **Required changes:**
  - Replace manual filtering/migration logic with a single call to `processLoadedData()`.
  - Remove local past-event filtering (it must only happen inside `processLoadedData()`).
  - Use `result.changed` to decide if the cleaned data should be written back to IndexedDB.
  - When writing back, write all collections consistently (accounts, transactions, categories, statements, recurringTransactions, recurringTransactionEvents, transactionSplits).
  - Categories from IndexedDB are always loaded (no conditional prompt/decision).

## 4) Update LoadButton.jsx

- **File:** [src/views/Accounts/LoadButton.jsx](src/views/Accounts/LoadButton.jsx)
- **Purpose:** Ensure file imports follow the same pipeline as IndexedDB loads, while keeping the category decision flow intact.
- **Required changes:**
  - Detect category presence _before_ calling `processLoadedData()`.
  - Show the category confirmation modal first.
  - Only after user decision, call `processLoadedData()` and pass **only the cleaned data** into the Redux loader.
  - LoadButton should not use `changed`, `errors`, or any other metadata from `processLoadedData()`.
  - Categories from file imports are conditional based on the user decision.
  - Remove local past-event filtering (it must only happen inside `processLoadedData()`).
  - No `alert()` usage (use the validation error UI instead).

## 5) Simplify renamed load action

- **File:** [src/store/accounts/actions.js](src/store/accounts/actions.js)
- **Purpose:** Treat the load action as a pure “apply already-processed data” step.
- **Required changes:**
  - Remove schema version parsing (`parseSchemaVersion`, `schemaVersion` checks) from the action.
  - Remove migration logic (`migrateDataToSchema`) from the action.
  - Remove any direct schema validation in the action (`validateSchema`, `validateSchemaSync`).
  - Keep only merge/upsert logic into Redux collections and loading/error state handling.
  - Do not display validation errors here; this action only accepts cleaned data.

## 6) Implement validation error UI and JSON export

- **Files:** new UI component + shared CSV export helper (exact location TBD)
- **Required behavior:**
  - Render a list of validation failures (collection, id, field, message).
  - Provide buttons: **Download JSON**, **Remove invalid objects**, **Cancel (with warning)**.
  - Ensure both file-import and IndexedDB flows can invoke this UI.
