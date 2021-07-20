import {RawObject} from "../types";

type FieldList = {
  kind: "LIST";
  name: string;
  subobjects: RawObject[];
};

export default FieldList;
