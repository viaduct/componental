import {RawEntry} from "./types";

const toRawEntry = (jsEntry: [string, any]): RawEntry => {
  const [name, value] = jsEntry;
  return {
    kind: "RAW",
    name,
    value,
  };
};

export default toRawEntry;
