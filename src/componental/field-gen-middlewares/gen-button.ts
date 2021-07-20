import {Entry, FieldGenMiddleware} from "../types";

const genButton: FieldGenMiddleware = (entry: Entry) => {
  if (entry.kind !== "RAW") { return; }

  const {name, value} = entry;

  if (typeof value !== "function") { return; }

  return {
    kind: "BUTTON",
    name,
    event: value,
  };
};

export default genButton;
