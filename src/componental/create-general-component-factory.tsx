import {
  ComponentGenMiddleware,
  ComponentGenMiddlewareContext,
  Entry,
  EntryTransMiddleware,
  EntryTransMiddlewareContext,
  Field,
  FieldGenMiddleware,
  FieldGenMiddlewareContext,
  CreateGeneralComponent,
  CreateGeneralComponentFactoryParams,
  EntryObject, VHDirection, ItemFromClient, GeneralComponentProps
} from "./types";
import React from "react";
import rawObjectFromProps from "./raw-object-from-props";
// @ts-ignore
import * as R from "ramda";

const r = R;

const createItemFromClient = (componentName: string, props: GeneralComponentProps): ItemFromClient => {
  const notNull = (a: any) => a != null;

  const item: ItemFromClient = {
    kind: "FROM_CLIENT",
    componentName,
    props,
    entries: {
      ...r.omit(["style", "className", "_componental"], props),
      ...props?._componental?.props,
    },
    wrapperProps: {
      ...r.omit(["style", "className"], props?._componental?.wrapperProps ?? {}),
      style: {...props?.style, ...props?._componental?.wrapperProps?.style},
      className: [props?.className, props?._componental?.wrapperProps?.className].filter(notNull).join(" "),
    },
    direction: props?._componental?.direction ?? "vertical",
  };

  if (Object.entries(item.wrapperProps.style!).length === 0)
  {
    delete item.wrapperProps.style;
  }
  if (Object.entries(item.wrapperProps.className!).length === 0)
  {
    delete item.wrapperProps.className;
  }

  return item;
};

const createGeneralComponentFactory = (p: CreateGeneralComponentFactoryParams): CreateGeneralComponent => {


  let rawObjectTakingGeneralObject: React.FC<{style?: Record<string, any> | undefined; className?: string | undefined; rawObject: EntryObject}>;
  let generalComponent: React.FC;



  const transformEntries = (middlewares: EntryTransMiddleware[], entries: Entry[]): Entry[] => {
    if (middlewares.length === 0) {
      return entries;
    }

    const [first, ...extra] = middlewares;

    const context: EntryTransMiddlewareContext = {...p};
    return transformEntries(extra, first(entries, context));
  };

  const generateField = (middlewares: FieldGenMiddleware[], entry: Entry, rawObject: EntryObject): Field => {
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

  const generateFields = (middlewares: FieldGenMiddleware[], rawObject: EntryObject): Field[] => {
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
      generateComponent: (rawObject: EntryObject) => () => <R rawObject={rawObject}/>,
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

  rawObjectTakingGeneralObject = ({style, className, rawObject}: {style?: Record<string, any> | undefined; className?: string | undefined; rawObject: EntryObject }) => {
    // Transform entries.
    const transformedEntries = transformEntries(p.entryTransMiddlewares, rawObject.entries);

    // Generate fields.
    const fields = generateFields(p.fieldGenMiddlewares, {entries: transformedEntries, direction: rawObject.direction});

    // Generate components.
    const components = generateComponents(p.componentGenMiddlewares, fields);

    // Bundle.
    const wrapComponents = (components: React.FC[], direction: VHDirection = "vertical"): React.FC => {
      const NewComp = () => {
        return <div style={{border: "1px solid lightgray", display: "inline-flex", flexDirection: direction === "vertical" ? "column" : "row", ...style}} className={className}>
          {r.addIndex(r.map)((C: React.FC, index: number) => <C key={fields[index].name}/>, components)}
        </div>
      };
      return NewComp;
    };

    const Wrapped = wrapComponents(components, rawObject.direction);
    return <Wrapped/>;
  };

  generalComponent = (p: Record<string, any>) => {
    // Take style and className.
    const {style, className, ...rawRecord} = p

    // To rawObject.
    const rawObject = rawObjectFromProps(rawRecord, "vertical");

    const R = rawObjectTakingGeneralObject;

    return <R style={style} className={className} rawObject={rawObject}/>;
  };

  return (componentName: string) => ()
  const theGeneralComponent = (p: GeneralComponentProps) => {
    const item = createItemFromClient()

  }

  // todo handle componentName.
  return (componentName: string) => generalComponent;
};

export default createGeneralComponentFactory;
