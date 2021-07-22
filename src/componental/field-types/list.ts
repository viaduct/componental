import {EntryObject, VHDirection} from "../types";

type FieldList = {
  kind: "LIST";
  name: string;
  subobjects: EntryObject[];
  direction: VHDirection;
};

export default FieldList;
