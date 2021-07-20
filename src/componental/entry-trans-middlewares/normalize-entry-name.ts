import {Entry, EntryTransMiddleware} from "../types";
// @ts-ignore
import * as R from "ramda";
import {fromCamelCase} from "../utils";
const r = R;

const normalizeEntryName: EntryTransMiddleware = (entries: Entry[]): Entry[] => {
  const mapper = (entry: Entry): Entry => {
    if (entry.kind === "RAW")
    {
      return r.over(r.lensProp("name"), fromCamelCase, entry);
    }
    else
    {
      return entry;
    }
  };
  const newEntries: Entry[] = r.map(mapper, entries);

  return newEntries;
};

export default normalizeEntryName;
