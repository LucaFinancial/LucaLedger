# Change Log for Luca Ledger

This file documents the changes made starting from v1.1.2

# v1.1.2

Since this is the first version documented it will not discuss changes, this is the current state of the application. This will note the features which should be referenced in future change logs.

### Features

- Views: Dashboard, Accounts, Ledger
- Dashboard view shows a list of accounts and their current balances.
  - Credit card accounts will subtract from totals unless they have negative values, which are ignored. A negative credit card balance represents available spending based on forecasting, it does not actually indicate a credit.
- Accounts view can load, create, and save accounts. Load is limited to Google Chrome, but this is expected to change in a future version.
- Using Yup to create and validate schemas for accounts and transactions.
- Account types: Checking, Savings, Credit Card

# v1.2.x

These are the changes made in any of the v1.2 versions.

### Changes

- New Home View Boilerplate
- Added Home View
- Dashboard routing and nav button
- Home view associated with root path
- New Home Content
- Add Luca Bio
- New Load Account Action - uses `<input>` tag allowing Firefox and Safari to load accounts - major improvement to usability
- Refactor Load Account Button - needed to add a shell component for the UI and hide the input tag
