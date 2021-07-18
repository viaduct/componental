import React from "react";
import moment from "moment";
// @ts-ignore
import * as R from "ramda";
import {Set, Map} from "immutable";

const r = R;

type Field = (
  {
    kind: "RENDER_STRING";
    name: string;
    value: string;
  } |
  {
    kind: "EDIT_STRING";
    name: string;
    valueName: string;
    setterName: string;
    value: string;
    setter: (value: string)=>void;
  } |
  {
    kind: "EDIT_INTEGER";
    name: string;
    valueName: string;
    setterName: string;
    value: number;
    setter: (value: number)=>void;
  } |
  {
    kind: "BUTTON";
    name: string;
    event: ()=>void;
  } |
  {
    kind: "LIST";
    name: string;
    subfields: Field[];
  }
);

type RawEntry = [string, any];
type EditEntry = {
  value: RawEntry;
  setter: RawEntry;
};
type Entry = RawEntry | EditEntry;
type EntryKind = "raw" | "edit";

type EntryTransMiddleware = (entries: Entry[])=>Entry[];
type FieldGenMiddleware = (entry: Entry, generateField: (entry: Entry)=>Field | undefined)=>Field | undefined;
type ComponentGenMiddleware = (field: Field, generateComponent: (field: Field)=>React.FC | undefined)=>React.FC | undefined;

const entryKind = (entry: Entry): EntryKind => Array.isArray(entry) ? "raw" : "edit";

const isUpperCase = (value: string): boolean => value === value.toUpperCase();
const fromCamelCase = (camel: string): string => {
  // String to characters.
  const chars: string[] = Array.from(camel);

  // Convert capital character into space + lowercase.
  const normalizedChars: string[] = chars.map(
    (char: string) => {
      if (isUpperCase(char))
      {
        return " " + char.toLowerCase();
      }
      else
      {
        return char;
      }
    }
  );

  // Join.
  const normalized: string = normalizedChars.join("");

  // Response.
  return normalized;
};

const toCamelCase = (normalized: string): string => {
  const impl = (name: string, isCapital: boolean): string => {
    if (name.length === 0) { return ""; }

    const first = name[0];
    const extra = name.slice(1, name.length);

    if (first === " ")
    {
      return impl(extra, true);
    }

    const char = isCapital ? first.toUpperCase() : first.toLowerCase();
    return char + impl(extra, false);
  };

  return impl(normalized, false);
};

const eventName = (name: string): string | undefined => {
  const nameTokens = name.split(" ");

  if (nameTokens.length > 2) {
    const first = nameTokens[0];
    const last = nameTokens[nameTokens.length - 1];

    if (first === "on" && last === "change")
    {
      return nameTokens.slice(1, nameTokens.length - 1).join(" ");
    }
  }

  return undefined;
};



const entryTransMiddlewares: EntryTransMiddleware[] = [
  // Change camel-case names into normalized format.
  (entries: Entry[]) => {
    const entriesByKind = {
      raw: [],
      edit: [],
      ...r.groupBy(entryKind, entries),
    };

    const rawEntriesWithNormalizedName = entriesByKind.raw.map(
      r.over(r.lensIndex(0), fromCamelCase)
    );

    return [...rawEntriesWithNormalizedName, ...entriesByKind.edit];
  },

  // Bundle value-setter pairs.
  (entries: Entry[]) => {
    const convertEditEntries = (rawEntries: RawEntry[]): Entry[] => {
      const extractEditEntries = (rawPairs: [string, any][]): {
        extraRawPairs: RawEntry[];
        editPairs: EditEntry[];
      } => {
        // Take everything which is on_x_change.
        const eventNames: {name: string; index: number;}[] = r.pipe(
          r.map(r.nth(0)), // Take name.
          r.map(eventName), // Take event name
          r.addIndex(r.map)(// Attach index.
            (name: string | undefined, index: number) => ({name, index})
          ),
          r.filter( // Filter undefined(not-event) fields.
            ({name}: {name: string | undefined}) => name != null
          )
        )(rawPairs);

        // Check whether there"s any matching value names.
        const editPairs: EditEntry[] = r.pipe(
          r.map(
            ({name, index}: {name: string; index: number;}) => {
              const nameEq = (rawPair: [string, any]) => rawPair[0] === name;
              const rawPairWithEventName: [string, any] | undefined = r.find(nameEq, rawPairs);

              if (rawPairWithEventName != null)
              {
                return {
                  value: rawPairWithEventName,
                  setter: rawPairs[index],
                } as EditEntry;
              }

              return undefined;
            }
          ),
          r.filter((a: any) => a != null)
        )(eventNames) as EditEntry[];

        // Prepare extraRawPairs.
        let editPairNames: Set<string> = Set();
        editPairs.forEach(
          ({value, setter}) => {
            editPairNames = editPairNames.add(value[0]);
            editPairNames = editPairNames.add(setter[0]);
          }
        );
        const notEditPair = (rawPair: [string, any]) => !editPairNames.has(rawPair[0]);
        const extraRawPairs: RawEntry[] = r.filter(notEditPair, rawPairs);

        return {
          editPairs,
          extraRawPairs,
        };
      };

      const result = extractEditEntries(rawEntries);
      return [...result.extraRawPairs, ...result.editPairs];
    };

    const entriesByKind = {
      raw: [],
      edit: [],
      ...r.group(entryKind, entries)
    };

    // Only raw entries are taken by the actual middleware implementation.
    const passedEntries: Entry[] = convertEditEntries(entriesByKind.raw as RawEntry[]);

    // Merge and response.
    return [...passedEntries, ...entriesByKind.edit];
  },
];

const fieldGenMiddlewares: FieldGenMiddleware[] = [
  // Generate EDIT_STRING.
  (entry: Entry) => {
    if (entryKind(entry) !== "edit") { return undefined; }

    const {
      value: [valueName, valueValue],
      setter: [setterName, setterValue],
    } = entry as EditEntry;

    if (typeof valueValue !== "string") { return undefined; }

    return {
      kind: "EDIT_STRING",
      name: valueName,
      valueName: valueName,
      setterName: setterName,
      value: valueValue,
      setter: setterValue,
    };
  },

  // Generate EDIT_INTEGER.
  (entry: Entry) => {
    if (entryKind(entry) !== "edit") { return undefined; }

    const {
      value: [valueName, valueValue],
      setter: [setterName, setterValue],
    } = entry as EditEntry;

    if (!(typeof valueValue === "number" && Number.isInteger(valueValue))) { return undefined; }

    return {
      kind: "EDIT_INTEGER",
      name: valueName,
      valueName: valueName,
      setterName: setterName,
      value: valueValue,
      setter: setterValue,
    };
  },

  // Generate RENDER_STRING for string or number value.
  (entry: Entry) => {
    if (entryKind(entry) !== "raw") { return undefined; }

    const [name, value] = entry as RawEntry;

    if (!(typeof value === "string" || typeof value === "number")) { return undefined; }

    return {
      kind: "RENDER_STRING",
      name,
      value: value.toString(),
    };
  },

  // Generate RENDER_STRING for Date value.
  (entry: Entry) => {
    if (entryKind(entry) !== "raw") { return undefined; }

    const [name, value] = entry as RawEntry;

    if (!(value instanceof Date)) { return undefined; }

    return {
      kind: "RENDER_STRING",
      name,
      value: moment(value).calendar(),
    };
  },

  // Generate BUTTON for function value.
  (entry: Entry) => {
    if (entryKind(entry) !== "raw") { return undefined; }

    const [name, value] = entry as RawEntry;

    if (!(typeof value !== "function")) { return undefined; }

    return {
      kind: "BUTTON",
      name,
      event: value,
    };
  },

  // Generate LIST for list(js array) value.
  (entry: Entry, generateField) => {
    if (entryKind(entry) !== "raw") { return undefined; }

    const [name, value] = entry as RawEntry;

    if (!Array.isArray(value)) { return undefined; }

    return {
      kind: "LIST",
      name,
      subfields: value.map(generateField),
    } as Field;
  },
];

const componentGenMiddlewares: ComponentGenMiddleware[] = [
  // Generate EDIT_STRING component.


  // Generate EDIT_INTEGER component.

  // Generate RENDER_STRING component.

  // Generate BUTTON component.

  // Generate LIST component.
];


const entryToField = (entry: Entry): Field => {
  const editEntryToField = (editPair: EditEntry): Field => {
    const theValue = editPair.value[1];

    if (typeof theValue === "string")
    {
      return {
        kind: "EDIT_STRING",
        name: editPair.value[0],
        valueName: editPair.value[0],
        setterName: editPair.setter[0],
        value: editPair.value[1],
        setter: editPair.setter[1],
      };
    }

    if (typeof theValue === "number" && Number.isInteger(theValue))
    {
      return {
        kind: "EDIT_INTEGER",
        name: editPair.value[0],
        valueName: editPair.value[0],
        setterName: editPair.setter[0],
        value: editPair.value[1],
        setter: editPair.setter[1],
      };
    }

    throw new Error("Cannot convert to Field.");
  };

  const rawEntryToField = (rawPair: [string, any]): Field => {
    const [name, value] = rawPair;

    if (typeof value === "string" || typeof value === "number")
    {
      return {
        kind: "RENDER_STRING",
        name,
        value: value.toString(),
      };
    }

    if (value instanceof Date)
    {
      return {
        kind: "RENDER_STRING",
        name,
        value: value.toLocaleString(), // todo use moment
      };
    }

    if (typeof value === "function")
    {
      return {
        kind: "BUTTON",
        name,
        event: value,
      };
    }

    throw new Error("Cannot convert to Field.");
  };

  switch (entryKind(entry))
  {
    case "edit": return editEntryToField(entry as EditEntry);
    case "raw": return rawEntryToField(entry as RawEntry);
  }
};

const FieldComponent = (p: {field: Field}) => {
  let result;
  switch (p.field.kind)
  {
    case "RENDER_STRING":
      result = <span>{p.field.value}</span>;
      break;

    case "EDIT_STRING":
      result = <input
        type={"text"}
        value={p.field.value}
        onChange={e => {
          if (p.field.kind !== "EDIT_STRING") { return; }

          p.field.setter(e.target.value);
        }}
        placeholder={p.field.name}
      />;
      break;

    case "EDIT_INTEGER":
      result = <input
        type={"number"}
        value={p.field.value.toString()}
        onChange={e => {
          if (p.field.kind !== "EDIT_INTEGER") { return; }

          const value = e.target.value;

          const numberValue = Number(value);
          if (Number.isNaN(numberValue))
          {
            p.field.setter(p.field.value);
            return;
          }

          p.field.setter(numberValue);
        }}
        placeholder={p.field.name}
      />;
      break;

    case "BUTTON":
      result = <input type={"button"} onClick={p.field.event} value={p.field.name}/>;
      break;

    default: throw new Error("Cannot be happen!");
  }

  return <div style={{display: "block"}}>
    {result}
  </div>;
};

const GeneralComponent = (p: Record<string, any>) => {
  const fieldsWithNormalizedName = r.map(
    ([key, value]: [string, any]) => [fromCamelCase(key), value],
    Object.entries(p)
  );

  const entries = convertEditEntries(fieldsWithNormalizedName);

  const fields: Field[] = entries.map(entryToField);

  return <div style={{border: "1px solid black", borderRadius: "8px", display: "inline-block"}}>
    {fields.map(
      (field: Field) => <FieldComponent key={field.name} field={field}/>
    )}
  </div>;
};

const handler = {
  get: (obj: any, componentName: string) => {
    if (componentName in obj) { return obj[componentName]; }
    
    return GeneralComponent;
  }
};

const GC = new Proxy({}, handler);

export default GC;
