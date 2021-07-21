import {EntryObject} from "../types";

type FieldList = {
  kind: "LIST";
  name: string;
  subobjects: EntryObject[];
  direction: "horizontal" | "vertical";
};

export default FieldList;
