import { schemas } from '@luca-financial/luca-schema';
import { Fragment, useEffect } from 'react';

import SchemaDrivenTable from '@comp/schemaDrivenTable/SchemaDrivenTable';
import { ListTypeEnum } from '@store/schemaDrivenSlice';
import ImportButton from './components/ImportButton';
import LoadButton from './components/LoadButton';
import { useJsonFileReader, useLoader } from './hooks';

export default function ImportPage() {
  const { readJsonFile, jsonData } = useJsonFileReader();
  const { loadJsonData } = useLoader();

  const handleFileLoad = (file) => {
    readJsonFile(file);
  };

  useEffect(() => {
    if (jsonData) {
      loadJsonData(jsonData);
    }
  }, [jsonData, loadJsonData]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
          gap: '1rem',
          padding: '8px',
        }}
      >
        <LoadButton onFileLoad={handleFileLoad} />
        <ImportButton />
      </div>
      {Object.keys(schemas).map((key) => (
        <Fragment key={key}>
          <SchemaDrivenTable
            schemaKey={key}
            listType={ListTypeEnum.LOADED}
            readOnly={false}
            displayIsValid={true}
          />
        </Fragment>
      ))}
    </div>
  );
}
