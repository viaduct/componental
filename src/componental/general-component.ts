import {EntryObject, CreateGeneralComponent, ItemFromClient, ItemPayload} from "./types";
import React from "react";
// @ts-ignore
import * as R from "ramda";
const r = R;

type VHDirection = "vertical" | "horizontal";

type ComponentContext = {
  componentName: string;
  props: Record<string, any>;
  wrapperProps: Record<string, any>;
  direction: VHDirection;
  path: (string | number)[];
};

type UnitedComponentContext = CreateGeneralComponent & ComponentContext;

type EntryTransContext = {};
type UnitedEntryTransContext = UnitedComponentContext & EntryTransContext;

type FieldGenContext = {};


type EntryTransMiddlewareContext = {};
type FieldGenMiddlewareContext = {
  parentObject: EntryObject;
};
type ComponentGenMiddlewareContext = {
  generateComponent: (rawObject: EntryObject)=>React.FC;
};

// type GeneralComponentProps = {
//   style?: Record<string, any> | undefined;
//   className?: Record<string, any> | undefined;
//   _componental?: Partial<ComponentContext> | undefined;
// } & Record<string, any>;

type GeneralComponentProps = {
  style?: Record<string, any> | undefined;
  className?: string | undefined;
  _componental?: {
    props?: Record<string, any> | undefined;
    wrapperProps?: {
      style?: Record<string, any> | undefined;
      className?: string | undefined;
      [key: string]: any;
    } | undefined;
    direction?: VHDirection | undefined;
  } | undefined,
  [key: string]: any;
};
const createItemPayload = (props: GeneralComponentProps): ItemPayload => {
  const notNull = (a: any) => a != null;

  const item: ItemPayload = {
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

// const createComponentContext = (componentName: string, props: Record<string, any>) => {
//   const {style, className, _componental, ...extraProps} = props;
//
//   // Merge styles.
//   let resultStyle: Record<string, any> | undefined = {...style, ..._componental?.wrapperProps?.style};
//   if (Object.entries(resultStyle!).length === 0) { resultStyle = undefined; }
//
//   // Merge classNames.
//   const notNull = (a: any) => a != null;
//   let resultClassName: string | undefined = [className, _componental?.wrapperProps?.className].filter(notNull).join("").trim();
//   if (resultClassName.length === 0) { resultClassName = undefined; }
//
//   // Merge props.
//   let resultProps: Record<string, any> | undefined = {...extraProps, ..._componental?.props};
//   // if (Object.entries(resultProps!).length === 0) { resultProps = undefined; }
//
//   // Compose.
//   const result: Partial<ComponentContext> = {};
//   result.componentName = componentName;
//   result.props = resultProps;
//   result.wrapperProps = {
//     ..._componental?.wrapperProps,
//     style: resultStyle,
//     className: resultClassName,
//   };
//   // @ts-ignore
//   if (result.wrapperProps.style == null) { delete result.wrapperProps.style; }
//   // @ts-ignore
//   if (result.wrapperProps.className == null) { delete result.wrapperProps.className; }
//   result.direction = _componental?.direction ?? "vertical";
//   result.path = _componental?.path ?? [];
//
//   return result as ComponentContext;
// };

// const createGeneralComponent = (componentName: string, pipeline: Pipeline): React.FC<GeneralComponentProps> => {
//   const NewComp = (p: GeneralComponentProps) => {
//     // Create component-context.
//     const context: ComponentContext = createComponentContext(componentName, p);
//
//
//   };
// };
