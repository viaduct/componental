import {Entry, FieldGenMiddleware} from "../types";

const genRenderStringFromStringNumber: FieldGenMiddleware = (entry: Entry) => {
  if (entry.kind !== "RAW") { return; }

  const {name, value} = entry;

  if (!(typeof value === "string" || typeof value === "number")) { return; }

  return {
    kind: "RENDER_STRING",
    name,
    value: value.toString(),
  };
};

export default genRenderStringFromStringNumber;
