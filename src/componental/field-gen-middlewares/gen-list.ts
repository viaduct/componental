// @ts-ignore
import * as R from "ramda";
import {Entry, Field, FieldGenMiddleware} from "../types";

const r = R;

const genList: FieldGenMiddleware = (entry: Entry) => {
  if (entry.kind !== "RAW") { return; }

  const {name, value} = entry;

  if (!Array.isArray(value)) { return; }

  return {
    kind: "LIST",
    name,
    subobjects: r.map(
      (valueItem: any) => ({ reactProps: valueItem }),
      entry.value
    ),
    direction: "horizontal",
  } as Field;
};

export default genList;
