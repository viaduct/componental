import {ComponentGenMiddleware, ComponentGenMiddlewareContext, Entry, Field, RawEntry} from "../types";
import React from "react";
import {vhDirectionToFlexDirection} from "../utils";

const genList: ComponentGenMiddleware = (field: Field, context: ComponentGenMiddlewareContext) => {
  if (field.kind !== "LIST") { return; }

  // Define container.
  const Container = ({children}: {children: any}) => <div style={{display: "inline-block"}}>{children}</div>;

  // Generate components for the fields.
  const components: React.FC[] = field.subobjects.map(context.generateComponent);

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
