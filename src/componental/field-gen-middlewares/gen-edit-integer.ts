import {Entry, FieldGenMiddleware} from "../types";

const genEditInteger: FieldGenMiddleware = (entry: Entry) => {
  if (entry.kind !== "EDIT") { return; }

  const {
    value: {name: valueName, value: valueValue},
    setter: {name: setterName, value: setterValue},
  } = entry;

  if (!(typeof valueValue === "number" && Number.isInteger(valueValue))) { return; }

  return {
    kind: "EDIT_INTEGER",
    name: valueName,
    valueName,
    setterName,
    value: valueValue,
    setter: setterValue,
  };
};

export default genEditInteger;
