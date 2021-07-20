import {RawEntry, RawObject} from "./types";

const rawObjectFromProps = (obj: Record<string, any>): RawObject => {
  // To entries.
  const entries = Object.entries(obj);

  // Convert a js entry into RawEntries.
  const mapper = ([name, value]: [string, any]): RawEntry => ({
    kind: "RAW",
    name,
    value,
  });
  const rawEntries: RawObject = entries.map(mapper);

  // Response.
  return rawEntries;
};

export default rawObjectFromProps;
