import {Entry, FieldGenMiddleware} from "../types";

const genEditString: FieldGenMiddleware = (entry: Entry) => {
  if (entry.kind !== "EDIT") { return; }

  const {
    value: {name: valueName, value: valueValue},
    setter: {name: setterName, value: setterValue},
  } = entry;

  if (typeof valueValue !== "string") { return; }

  return {
    kind: "EDIT_STRING",
    name: valueName,
    valueName,
    setterName,
    value: valueValue,
    setter: setterValue,
  };
};

export default genEditString;
