export default (
  api: any,
  path: string,
  method: string,
  status: string,
  example: string | undefined
) => {
  const paths = api.definition.paths;
  const noSlashPath = path.replace(/\/$/, "");
  if (!paths.hasOwnProperty(noSlashPath)) {
    return false;
  }
  const pathItem = paths[noSlashPath];
  if (!pathItem.hasOwnProperty(method.toLowerCase())) {
    return false;
  }
  const responses = pathItem[method.toLowerCase()].responses;
  if (!responses.hasOwnProperty(status)) {
    return false;
  }
  const response = responses[status];
  if (!response.content || !response.content["application/json"]) {
    return false;
  }
  const responseData = response.content["application/json"];
  if (!responseData || !responseData.hasOwnProperty("examples")) {
    return false;
  }
  if (example && responseData.examples.hasOwnProperty(example)) {
    return responseData.examples[example];
  }

  return Object.values(response.examples).pop();
};
