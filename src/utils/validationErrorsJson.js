export const buildValidationErrorsJson = (errors) => {
  return JSON.stringify(
    errors.map((error) => ({
      collection: error.collection ?? null,
      index: error.index ?? null,
      entity: error.entity ?? null,
      errors: error.errors ?? [],
      message: error.message ?? null,
    })),
    null,
    2,
  );
};

export const downloadValidationErrorsJson = (
  errors,
  filename = 'luca-ledger-validation-errors.json',
) => {
  const json = buildValidationErrorsJson(errors);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
