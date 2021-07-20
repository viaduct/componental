// @ts-ignore
import * as R from "ramda";
import {Entry, Field, FieldGenMiddleware, FieldGenMiddlewareContext} from "../types";
import rawObjectFromProps from "../raw-object-from-props";

const r = R;

const genList: FieldGenMiddleware = (entry: Entry, context: FieldGenMiddlewareContext) => {
  if (entry.kind !== "RAW") { return; }

  const {name, value} = entry;

  if (!Array.isArray(value)) { return; }

  return {
    kind: "LIST",
    name,
    subobjects: r.map((valueItem: Record<string, any>) => rawObjectFromProps(valueItem, context.parentObject.direction), entry.value),
    direction: context.parentObject.direction === "horizontal" ? "vertical" : "horizontal",
  } as Field;
};

export default genList;
