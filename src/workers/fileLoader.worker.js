/**
 * Web Worker for asynchronous file loading and parsing
 * Handles both v1 and v2 schema formats
 */

// Schema detection from file structure
function detectSchema(data) {
  // v2 schema has top-level 'accounts' array and 'transactions' array
  if (data.schemaVersion === '2.0.0' && data.accounts && data.transactions) {
    return 'v2';
  }

  // v1 schema has single account object with transactions array
  if (data.id && data.name && data.type) {
    return 'v1';
  }

  throw new Error('Unrecognized file format. Expected v1 or v2 schema.');
}

// Validate basic structure
function validateData(data, schema) {
  if (schema === 'v2') {
    if (!Array.isArray(data.accounts)) {
      throw new Error('Invalid v2 schema: accounts must be an array');
    }
    if (!Array.isArray(data.transactions)) {
      throw new Error('Invalid v2 schema: transactions must be an array');
    }
    return true;
  }

  if (schema === 'v1') {
    if (!data.id || !data.name || !data.type) {
      throw new Error('Invalid v1 schema: missing required account fields');
    }
    if (data.transactions && !Array.isArray(data.transactions)) {
      throw new Error('Invalid v1 schema: transactions must be an array');
    }
    return true;
  }

  return false;
}

// Process file in chunks to avoid blocking
async function processFile(file) {
  try {
    // Send initial progress
    self.postMessage({
      type: 'progress',
      phase: 'reading',
      progress: 0,
    });

    // Read file as text (async operation)
    const text = await file.text();

    self.postMessage({
      type: 'progress',
      phase: 'parsing',
      progress: 50,
    });

    // Parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error('Invalid JSON format: ' + error.message);
    }

    self.postMessage({
      type: 'progress',
      phase: 'validating',
      progress: 75,
    });

    // Detect schema
    const schema = detectSchema(data);

    // Validate data structure
    validateData(data, schema);

    self.postMessage({
      type: 'progress',
      phase: 'complete',
      progress: 100,
    });

    // Send success result
    self.postMessage({
      type: 'success',
      data,
      schema,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
    });
  }
}

// Listen for messages from main thread
self.addEventListener('message', async (event) => {
  const { type, file } = event.data;

  if (type === 'load') {
    await processFile(file);
  } else if (type === 'cancel') {
    // Clean up and send cancellation confirmation
    self.postMessage({
      type: 'cancelled',
    });
    // Close worker
    self.close();
  }
});
