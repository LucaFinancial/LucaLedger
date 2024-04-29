export default function getVersion(data) {
  if (data.version) {
    return data.version.split('.')[0];
  } else if (data.schema && data.schema.version) {
    return data.schema.version.split('.')[0];
  }
  return null;
}
