import {
  ComponentGenMiddleware,
  ComponentGenMiddlewareContext,
  Entry,
  EntryTransMiddleware,
  EntryTransMiddlewareContext,
  Field,
  FieldGenMiddleware,
  FieldGenMiddlewareContext,
  Pipeline,
  PipelineParams,
  RawObject
} from "./types";
import React from "react";
import rawObjectFromProps from "./raw-object-from-props";
// @ts-ignore
import * as R from "ramda";

const r = R;

const createPipeline = (p: PipelineParams): Pipeline => {
  let rawObjectTakingGeneralObject: React.FC<{ rawObject: RawObject }>;
  let generalComponent: React.FC;

  const transformEntries = (middlewares: EntryTransMiddleware[], entries: Entry[]): Entry[] => {
    if (middlewares.length === 0) {
      return entries;
    }

    const [first, ...extra] = middlewares;

    const context: EntryTransMiddlewareContext = {};
    return transformEntries(extra, first(entries, context));
  };

  const generateField = (middlewares: FieldGenMiddleware[], entry: Entry, rawObject: RawObject): Field => {
    if (middlewares.length === 0) {
      console.error(entry);
      throw new Error('Cannot convert entry to field.');
    }

    const [first, ...extra] = middlewares;

    const context: FieldGenMiddlewareContext = {parentObject: rawObject};
    const maybeField = first(entry, context);

    if (maybeField != null) {
      return maybeField;
    } else {
      return generateField(extra, entry, rawObject);
    }
  };

  const generateFields = (middlewares: FieldGenMiddleware[], rawObject: RawObject): Field[] => {
    const entries: Entry[] = rawObject.entries;
    return r.map((entry: Entry) => generateField(middlewares, entry, rawObject), entries);
  };

  const generateComponent = (middlewares: ComponentGenMiddleware[], field: Field): React.FC => {
    if (middlewares.length === 0) {
      console.error(field);
      throw new Error('Cannot convert field to component.');
    }

    const [first, ...extra] = middlewares;

    const R = rawObjectTakingGeneralObject;
    const context: ComponentGenMiddlewareContext = {
      generateComponent: (rawObject: RawObject) => () => <R rawObject={rawObject}/>,
    };
    const maybeComponent = first(field, context);

    if (maybeComponent != null) {
      return maybeComponent;
    } else {
      return generateComponent(extra, field);
    }
  };

  const generateComponents = (middlewares: ComponentGenMiddleware[], fields: Field[]): React.FC[] => {
    return r.map((field: Field) => generateComponent(middlewares, field), fields);
  };

  rawObjectTakingGeneralObject = ({rawObject}: { rawObject: RawObject }) => {
    // Transform entries.
    const transformedEntries = transformEntries(p.entryTransMiddlewares, rawObject.entries);

    // Generate fields.
    const fields = generateFields(p.fieldGenMiddlewares, {entries: transformedEntries, direction: rawObject.direction});

    // Generate components.
    const components = generateComponents(p.componentGenMiddlewares, fields);

    // Bundle.
    const wrapComponents = (components: React.FC[], direction: "vertical" | "horizontal" = "vertical"): React.FC => {
      const NewComp = () => {
        return <div style={{display: "inline-flex", flexDirection: direction === "vertical" ? "column" : "row"}}>
          {r.addIndex(r.map)((C: React.FC, index: number) => <C key={fields[index].name}/>, components)}
        </div>
      };
      return NewComp;
    };

    const Wrapped = wrapComponents(components, rawObject.direction);
    return <Wrapped/>;
  };

  generalComponent = (rawRecord: Record<string, any>) => {
    // To rawObject.
    const rawObject = rawObjectFromProps(rawRecord, "vertical");

    const R = rawObjectTakingGeneralObject;

    return <R rawObject={rawObject}/>;
  };

  return {generalComponent};
};

export default createPipeline;
