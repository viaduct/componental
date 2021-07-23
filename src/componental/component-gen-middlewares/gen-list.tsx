import {ComponentGenMiddleware, ComponentGenMiddlewareContext, Field} from "../types";
import React from "react";
import {vhDirectionToFlexDirection} from "../utils";

const genList: ComponentGenMiddleware = (field: Field, context: ComponentGenMiddlewareContext) => {
  if (field.kind !== "LIST") { return; }

  // Define container.
  const Container = ({children}: {children: any}) => <div style={{display: "inline-block"}}>{children}</div>;

  // Generate components for the fields.
  const mapper = (subobject: {reactProps: Record<string, any>}) => {
    const GC = context.generalComponent;
    return ()=><GC
      _componental={{
        componentName: context.componentName,
        entryTransMiddlewares: context.entryTransMiddlewares,
        fieldGenMiddlewares: context.fieldGenMiddlewares,
        componentGenMiddlewares: context.componentGenMiddlewares,
        reactEntries: subobject.reactProps, //entriesToReactEntries(subobject.entries),
        direction: "vertical",
        wrapperProps: context.wrapperProps,
      }}
    />;
  };
  const components: React.FC[] = field.subobjects.map(mapper);

  // Make them into one component, and response.
  const Component_ = (C: React.FC, index: number) => {
    const subobject: {reactProps: Record<string, any>} = field.subobjects[index];

    const entryNameEq = (eqWith: string) => ([name, _]: [string, any]) => {
      return name === eqWith;
    };

    const keyPair = Object.entries(subobject.reactProps).find(entryNameEq("key"));
    const idPair = Object.entries(subobject.reactProps).find(entryNameEq("id"));

    const key = keyPair != null ? keyPair[1] : undefined;
    const id = idPair != null ? idPair[1] : undefined;

    return <Container key={key ?? id ?? undefined}><C/></Container>;
  };
  return ()=><div style={{display: "inline-flex", flexWrap: "wrap", flexDirection: vhDirectionToFlexDirection(field.direction)}}>
    {components.map(Component_)}
  </div>;
};

export default genList;
