import React from "react";
import {
  ComponentGenMiddleware, ComponentGenMiddlewareContext,
  Entry,
  EntryTransMiddleware,
  EntryTransMiddlewareContext, Field,
  FieldGenMiddleware, FieldGenMiddlewareContext,
  VHDirection
} from "./types";
// @ts-ignore
import * as R from "ramda";
import {vhDirectionToFlexDirection} from "./utils";

const r = R;

type GeneralComponentProps = {
  style?: Record<string, any> | undefined;
  className?: string | undefined;
  _componental?: {
    componentName?: string | undefined;
    entryTransMiddlewares?: EntryTransMiddleware[] | undefined;
    fieldGenMiddlewares?: FieldGenMiddleware[] | undefined;
    componentGenMiddlewares?: ComponentGenMiddleware[] | undefined;
    reactEntries?: Record<string, any> | undefined;
    entries?: Entry[] | undefined;
    wrapperProps?: {
      style?: Record<string, any> | undefined;
      className?: string | undefined;
      [key: string]: any;
    } | undefined;
    direction?: VHDirection | undefined;
  } | undefined,
  [key: string]: any;
};

type GeneralComponentProtoProps = {
  _componental: {
    componentName: string;
    entryTransMiddlewares: EntryTransMiddleware[];
    fieldGenMiddlewares: FieldGenMiddleware[];
    componentGenMiddlewares: ComponentGenMiddleware[];
    reactEntries: Record<string, any>;
    entries: Entry[];
    wrapperProps: {
      style?: Record<string, any> | undefined;
      className?: string | undefined;
      [key: string]: any;
    };
    direction: VHDirection;
  },
};

type GeneralComponent = React.FC<GeneralComponentProps>;
type GeneralComponentProto = React.FC<GeneralComponentProtoProps>;

let generalComponentProto: GeneralComponentProto;
let generalComponent: GeneralComponent;

generalComponentProto = (p: GeneralComponentProtoProps) => {
  const componental = p._componental;

  {
    const reactEntriesToEntries = (reactEntries: Record<string, any>): Entry[] => {
      const mapper = ([name, value]: [string, any]): Entry => ({
        kind: "RAW",
        name,
        value,
      });
      return Object.entries(reactEntries).map(mapper);
    };
    const reactEntries = componental.reactEntries;
    const entries: Entry[] = reactEntriesToEntries(reactEntries);
    componental.entries = entries;
  }



  const transformEntries = (middlewares: EntryTransMiddleware[], entries: Entry[]): Entry[] => {
    if (middlewares.length === 0) {
      return entries;
    }

    const [first, ...extra] = middlewares;

    const context: EntryTransMiddlewareContext = componental;
    return transformEntries(extra, first(entries, context));
  };

  const generateField = (middlewares: FieldGenMiddleware[], entry: Entry): Field => {
    if (middlewares.length === 0) {
      console.error(entry);
      throw new Error('Cannot convert entry to field.');
    }

    const [first, ...extra] = middlewares;

    const context: FieldGenMiddlewareContext = componental;
    const maybeField = first(entry, context);

    if (maybeField != null) {
      return maybeField;
    } else {
      return generateField(extra, entry);
    }
  };

  const generateFields = (middlewares: FieldGenMiddleware[], entries: Entry[]): Field[] => {
    return r.map((entry: Entry) => generateField(middlewares, entry), entries);
  };

  const generateComponent = (middlewares: ComponentGenMiddleware[], field: Field): React.FC => {
    if (middlewares.length === 0) {
      console.error(field);
      throw new Error('Cannot convert field to component.');
    }

    const [first, ...extra] = middlewares;

    const context: ComponentGenMiddlewareContext = {
      ...componental,
      generalComponent,
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

  // Transform entries.
  const transformedEntries = transformEntries(componental.entryTransMiddlewares, componental.entries);
  console.log(componental.entries);
  console.log(transformedEntries);

  // Generate fields.
  const fields = generateFields(componental.fieldGenMiddlewares, transformedEntries);

  // Generate components.
  const components = generateComponents(componental.componentGenMiddlewares, fields);

  // Bundle.
  const Component_ = (C: React.FC, index: number) => <C key={fields[index].name}/>;
  const wrapComponents = (components: React.FC[]): React.FC => {
    const NewComp = () => {
      return <div
        style={{
          border: "1px solid lightgray",
          display: "inline-flex",
          flexDirection: vhDirectionToFlexDirection(componental.direction),
          ...componental.wrapperProps.style
        }}
        {...r.omit(["style"], componental.wrapperProps)}
      >
        {r.addIndex(r.map)(Component_, components)}
      </div>
    };
    return NewComp;
  };

  const Wrapped = wrapComponents(components);
  return <Wrapped/>;
};

generalComponent = (p: GeneralComponentProps) => {
  // const removeNullFields = (a: Record<string, any>) => {
  //   return Object.fromEntries(
  //     Object.entries(a)
  //       .filter(
  //         ([key, value]) => value != null
  //       )
  //   );
  // };
  const GCP = generalComponentProto;
  const reactEntries = {
    ...r.omit(["_componental", "style", "className"], p),
    ...p._componental?.entries,
  };
  const notNull = (a: any) => a != null;
  return <GCP
    _componental={{
      componentName: p._componental?.componentName ?? "GeneralComponent",
      entryTransMiddlewares: p._componental?.entryTransMiddlewares ?? [],
      fieldGenMiddlewares: p._componental?.fieldGenMiddlewares ?? [],
      componentGenMiddlewares: p._componental?.componentGenMiddlewares ?? [],
      reactEntries,
      entries: [], // todo remove this
      direction: p._componental?.direction ?? "vertical",
      wrapperProps: {
        ...p._componental?.wrapperProps,
        style: {...p.style, ...p._componental?.wrapperProps?.style},
        className: [p.className, p._componental?.wrapperProps?.className]
          .filter(notNull)
          .join(" "),
      },
    }}
  />;
};

const GeneralComponent = generalComponent;

export default GeneralComponent;
export type {GeneralComponentProps};
