import {ComponentGenMiddleware, ComponentGenMiddlewareContext, Field, RawEntry} from "../types";
import React from "react";

const genList: ComponentGenMiddleware = (field: Field, context: ComponentGenMiddlewareContext) => {
  if (field.kind !== "LIST") { return; }

  // Define container.
  const Container = ({children}: {children: any}) => <div style={{display: "inline-block"}}>{children}</div>;

  // Generate components for the fields.
  const components: React.FC[] = field.subobjects.map(context.generateComponent);

  // Make them into one component, and response.
  return ()=><div style={{display: "inline-block"}}>
    {components.map((C: React.FC, index: number) => {
      const subobject = field.subobjects[index];

      const key = subobject.find(({name}: RawEntry) => name === "key");
      const id = subobject.find(({name}: RawEntry) => name === "id");

      return <Container key={(key ?? id ?? {}).value}><C/></Container>;
    })}
  </div>;
};

export default genList;
