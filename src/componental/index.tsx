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
    // subfields: Field[];
    subobjects: RawObject[];
  }
);

type RawEntry = [string, any];
type RawObject = RawEntry[];
type EditEntry = {
  value: RawEntry;
  setter: RawEntry;
};
type Entry = RawEntry | EditEntry;
type EntryKind = "raw" | "edit";

type EntryTransMiddleware = (entries: Entry[])=>Entry[];
type FieldGenMiddleware = (entry: Entry, generateField: (entry: Entry)=>Field)=>Field | undefined;
type ComponentGenMiddleware = (field: Field, generateComponent: (field: Field)=>React.FC)=>React.FC | undefined;

let rawObjectToComponent: (rawObject: RawObject)=>React.FC;

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

  return;
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

              return;
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
      ...r.groupBy(entryKind, entries)
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
    if (entryKind(entry) !== "edit") { return; }

    console.log(entryKind(entry));
    // @ts-ignore
    console.log(';;;', entry, entry.value);
    const {
      value: [valueName, valueValue],
      setter: [setterName, setterValue],
    } = entry as EditEntry;

    if (typeof valueValue !== "string") { return; }

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
    if (entryKind(entry) !== "edit") { return; }

    const {
      value: [valueName, valueValue],
      setter: [setterName, setterValue],
    } = entry as EditEntry;

    if (!(typeof valueValue === "number" && Number.isInteger(valueValue))) { return; }

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
    if (entryKind(entry) !== "raw") { return; }

    const [name, value] = entry as RawEntry;

    if (!(typeof value === "string" || typeof value === "number")) { return; }

    return {
      kind: "RENDER_STRING",
      name,
      value: value.toString(),
    };
  },

  // Generate RENDER_STRING for Date value.
  (entry: Entry) => {
    if (entryKind(entry) !== "raw") { return; }

    const [name, value] = entry as RawEntry;

    if (!(value instanceof Date)) { return; }

    return {
      kind: "RENDER_STRING",
      name,
      value: moment(value).calendar(),
    };
  },

  // Generate BUTTON for function value.
  (entry: Entry) => {
    if (entryKind(entry) !== "raw") { return; }

    const [name, value] = entry as RawEntry;

    if (typeof value !== "function") { return; }

    return {
      kind: "BUTTON",
      name,
      event: value,
    };
  },

  // Generate LIST for list(js array) value.
  (entry: Entry, generateField) => {
    if (entryKind(entry) !== "raw") { return; }

    const [name, value] = entry as RawEntry;

    if (!Array.isArray(value)) { return; }

    return {
      kind: "LIST",
      name,
      subobjects: value.map(a => Object.entries(a)),
      // subfields: value.map(generateField),
    } as Field;
  },
];

const componentGenMiddlewares: ComponentGenMiddleware[] = [
  // Generate EDIT_STRING component.
  (field) => {
    if (field.kind !== "EDIT_STRING") { return; }

    return ()=><input
      type={"text"}
      value={field.value}
      onChange={e => {
        field.setter(e.target.value);
      }}
      placeholder={field.name}
    />;
  },

  // Generate EDIT_INTEGER component.
  (field) => {
    if (field.kind !== "EDIT_INTEGER") { return; }

    return ()=><input
        type={"number"}
        value={field.value.toString()}
        onChange={e => {
          const value = e.target.value;

          const numberValue = Number(value);
          if (Number.isNaN(numberValue))
          {
            field.setter(field.value);
            return;
          }

          field.setter(numberValue);
        }}
        placeholder={field.name}
    />;
  },

  // Generate RENDER_STRING component.
  (field) => {
    if (field.kind !== "RENDER_STRING") { return; }

    return ()=><span>{field.value}</span>;
  },

  // Generate BUTTON component.
  (field) => {
    if (field.kind !== "BUTTON") { return; }

    return ()=><input type={"button"} onClick={field.event} value={field.name}/>;
  },

  // Generate LIST component.
  (field, generateComponent) => {
    if (field.kind !== "LIST") { return; }

    // Define container.
    const Container = ({children}: {children: any}) => <div style={{display: "inline-block"}}>{children}</div>;

    // Generate components for the fields.
    const components: React.FC[] = field.subobjects.map(rawObjectToComponent);
    // const components: React.FC[] = field.subfields.map(generateComponent);

    // Make them into one component, and response.
    return ()=><div style={{display: "inline-block"}}>
      {components.map(C => <Container><C/></Container>)}
    </div>;
  },
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

// const GeneralComponent2 = (p: Record<string, any>) => {
//   const fieldsWithNormalizedName = r.map(
//     ([key, value]: [string, any]) => [fromCamelCase(key), value],
//     Object.entries(p)
//   );
//
//   const entries = convertEditEntries(fieldsWithNormalizedName);
//
//   const fields: Field[] = entries.map(entryToField);
//
//   return <div style={{border: "1px solid black", borderRadius: "8px", display: "inline-block"}}>
//     {fields.map(
//       (field: Field) => <FieldComponent key={field.name} field={field}/>
//     )}
//   </div>;
// };

const transformEntries = (middlewares: EntryTransMiddleware[], entries: Entry[]): Entry[] => {
  const reducer = (entries: Entry[], middleware: EntryTransMiddleware): Entry[] => {
    return middleware(entries);
  };
  return r.reduce(
    reducer,
    entries,
    middlewares
  );
};

const generateFields = (middlewares: FieldGenMiddleware[], entries: Entry[]): Field[] => {
  let entryToField: (entry: Entry)=>Field;
  const entryToFieldImpl = (entry: Entry, leftMiddlewares: FieldGenMiddleware[]): Field => {
    if (leftMiddlewares.length === 0)
    {
      console.error(entry);
      throw new Error('Cannot convert entry to field.');
    }

    const [cur, ...extra] = leftMiddlewares;

    const maybeField = cur(entry, entryToField);

    if (maybeField != null) { return maybeField; }
    else { return entryToFieldImpl(entry, extra); }
  };
  entryToField = (entry: Entry)=>entryToFieldImpl(entry, middlewares);


  const fields = r.map(entryToField, entries);

  return fields;
};

const generateComponents = (middlewares: ComponentGenMiddleware[], fields: Field[]): React.FC[] => {
  let fieldToComponent: (field: Field)=>React.FC;
  const fieldToComponentImpl = (field: Field, leftMiddlewares: ComponentGenMiddleware[]): React.FC => {
    if (leftMiddlewares.length === 0)
    {
      console.error(field);
      throw new Error('Cannot convert field to component.');
    }

    const [cur, ...extra] = leftMiddlewares;

    const maybeComponent = cur(field, fieldToComponent);

    if (maybeComponent != null) { return maybeComponent; }
    else { return fieldToComponentImpl(field, extra); }
  };
  fieldToComponent = (field: Field)=>fieldToComponentImpl(field, middlewares);


  const components = r.map(fieldToComponent, fields);

  return components;
};

rawObjectToComponent = (rawObject: RawObject): React.FC => {
  // Transform entries.
  const transformedEntries = transformEntries(entryTransMiddlewares, rawObject);

  // Generate fields.
  const fields = generateFields(fieldGenMiddlewares, transformedEntries);

  // Generate components.
  const components = generateComponents(componentGenMiddlewares, fields);

  // Bundle.
  const Container = ({children}: {children: any}) => <div style={{display: "block"}}>{children}</div>;
  const result = ()=><div style={{display: "inline-block", border: "1px solid black"}}>
    {components.map(C => <Container><C/></Container>)}
  </div>;

  return result;
};

const GeneralComponent = (p: Record<string, any>) => {
  const C = rawObjectToComponent(Object.entries(p));
  return <C/>;
  // // Props to entries.
  // const entries: RawEntry[] = Object.entries(p);
  //
  // // Transform entries.
  // const transformedEntries = transformEntries(entryTransMiddlewares, entries);
  //
  // // Generate fields.
  // const fields = generateFields(fieldGenMiddlewares, transformedEntries);
  //
  // // Generate components.
  // const components = generateComponents(componentGenMiddlewares, fields);
  //
  // // Bundle.
  // const Container = ({children}: {children: any}) => <div style={{display: "block"}}>{children}</div>;
  // const result = <div style={{display: "block"}}>
  //   {components.map(C => <Container><C/></Container>)}
  // </div>;
  //
  // // Render.
  // return result;
};

const handler = {
  get: (obj: any, componentName: string) => {
    if (componentName in obj) { return obj[componentName]; }

    return GeneralComponent;
  }
};

const GC = new Proxy({}, handler);

export default GC;
