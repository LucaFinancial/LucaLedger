import { useState } from 'react';

export default function useJsonFileReader() {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);

  const readJsonFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        setJsonData(json);
      } catch (e) {
        setError('Failed to parse JSON');
        console.error('Error parsing JSON:', e);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
      console.error('Error reading file:', reader.error);
    };
    reader.readAsText(file);
  };

  return { readJsonFile, jsonData, error };
}
