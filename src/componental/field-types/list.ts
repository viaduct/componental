import {RawObject} from "../types";

type FieldList = {
  kind: "LIST";
  name: string;
  subobjects: RawObject[];
  direction: "horizontal" | "vertical";
};

export default FieldList;
