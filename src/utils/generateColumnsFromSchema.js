export default function generateColumnsFromSchema(schema) {
  return Object.keys(schema.properties).map((key) => {
    const property = schema.properties[key];
    return {
      title: key,
      ...property,
      field: key,
    };
  });
}
