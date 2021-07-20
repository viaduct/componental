import {RawEntry, RawObject} from "./types";

const rawObjectFromProps = (obj: Record<string, any>, direction: "horizontal" | "vertical"): RawObject => {
  // To entries.
  const entries = Object.entries(obj);

  // Convert a js entry into RawEntries.
  const mapper = ([name, value]: [string, any]): RawEntry => ({
    kind: "RAW",
    name,
    value,
  });
  const rawObject: RawObject = {
    entries: entries.map(mapper),
    direction,
  };

  // Response.
  return rawObject;
};

export default rawObjectFromProps;
