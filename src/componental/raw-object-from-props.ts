import {RawEntry, EntryObject, VHDirection} from "./types";

const rawObjectFromProps = (obj: Record<string, any>, direction: VHDirection): EntryObject => {
  // To entries.
  const entries = Object.entries(obj);

  // Convert a js entry into RawEntries.
  const mapper = ([name, value]: [string, any]): RawEntry => ({
    kind: "RAW",
    name,
    value,
  });
  const rawObject: EntryObject = {
    entries: entries.map(mapper),
    direction,
  };

  // Response.
  return rawObject;
};

export default rawObjectFromProps;
