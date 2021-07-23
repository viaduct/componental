import {ComponentGenMiddleware, ComponentGenMiddlewareContext, Entry, EntryObject, Field, RawEntry} from "../types";
import React from "react";
import {vhDirectionToFlexDirection} from "../utils";

const genList: ComponentGenMiddleware = (field: Field, context: ComponentGenMiddlewareContext) => {
  if (field.kind !== "LIST") { return; }

  // Define container.
  const Container = ({children}: {children: any}) => <div style={{display: "inline-block"}}>{children}</div>;

  // Generate components for the fields.
  const mapper = (subobject: EntryObject) => {
    // Go back to reactEntries.
    const entryToReactEntry = (entry: Entry): [string, any] => {
      if (entry.kind === "EDIT") { throw new Error("EDIT entry cannot be converted to react-entry."); }

      return [entry.name, entry.value];
    };
    const entriesToReactEntries = (entries: Entry[]): Record<string, any> => Object.fromEntries(entries.map(entryToReactEntry));
    const GC = context.generalComponent;
    // todo I think passing the whole context is not a good idea.
    // todo I didn't pass reactEntries. The children may have the root components's reactEntries.(May not cause serious problem.)
    console.log({...context, reactEntries: entriesToReactEntries(subobject.entries)});
    return ()=><GC _componental={{...context, entries: undefined, reactEntries: entriesToReactEntries(subobject.entries)}}/>;
  };
  const components: React.FC[] = field.subobjects.map(mapper);

  // Make them into one component, and response.
  return ()=><div style={{display: "inline-flex", flexWrap: "wrap", flexDirection: vhDirectionToFlexDirection(field.direction)}}>
    {components.map((C: React.FC, index: number) => {
      const subobject = field.subobjects[index];

      const entryNameEq = (eqWith: string) => (entry: Entry) => {
        if (entry.kind !== "RAW")
        {
          return false;
        }

        return entry.name === eqWith;
      };
      const key = subobject.entries.find(entryNameEq("key"));
      const id = subobject.entries.find(entryNameEq("id"));

      return <Container key={(key ?? id ?? {}).value}><C/></Container>;
    })}
  </div>;
};

export default genList;
