// @ts-ignore
import * as R from "ramda";
import {Entry, Field, FieldGenMiddleware, FieldGenMiddlewareContext} from "../types";
import rawObjectFromProps from "../raw-object-from-props";

const r = R;

const genList: FieldGenMiddleware = (entry: Entry) => {
  if (entry.kind !== "RAW") { return; }

  const {name, value} = entry;

  if (!Array.isArray(value)) { return; }

  return {
    kind: "LIST",
    name,
    subobjects: r.map(rawObjectFromProps),
  } as Field;
};

export default genList;
