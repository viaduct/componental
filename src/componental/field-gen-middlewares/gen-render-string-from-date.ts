import moment from "moment";
import {Entry, FieldGenMiddleware} from "../types";

const genRenderStringFromDate: FieldGenMiddleware = (entry: Entry) => {
  if (entry.kind !== "RAW") { return; }

  const {name, value} = entry;

  if (!(value instanceof Date)) { return; }

  return {
    kind: "RENDER_STRING",
    name,
    value: moment(value).calendar(),
  };
};

export default genRenderStringFromDate;
