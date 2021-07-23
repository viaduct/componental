import {VHDirection} from "../types";

type FieldList = {
  kind: "LIST";
  name: string;
  subobjects: {reactProps: Record<string, any>}[];
  direction: VHDirection;
};

export default FieldList;
