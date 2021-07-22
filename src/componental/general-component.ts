import {EntryObject, CreateGeneralComponent} from "./types";
import React from "react";

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

type GeneralComponentProps = {
  style?: Record<string, any> | undefined;
  className?: Record<string, any> | undefined;
  _componental?: Partial<ComponentContext> | undefined;
} & Record<string, any>;

const createComponentContext = (componentName: string, props: Record<string, any>) => {
  const {style, className, _componental, ...extraProps} = props;

  // Merge styles.
  let resultStyle: Record<string, any> | undefined = {...style, ..._componental?.wrapperProps?.style};
  if (Object.entries(resultStyle!).length === 0) { resultStyle = undefined; }

  // Merge classNames.
  const notNull = (a: any) => a != null;
  let resultClassName: string | undefined = [className, _componental?.wrapperProps?.className].filter(notNull).join("").trim();
  if (resultClassName.length === 0) { resultClassName = undefined; }

  // Merge props.
  let resultProps: Record<string, any> | undefined = {...extraProps, ..._componental?.props};
  // if (Object.entries(resultProps!).length === 0) { resultProps = undefined; }

  // Compose.
  const result: Partial<ComponentContext> = {};
  result.componentName = componentName;
  result.props = resultProps;
  result.wrapperProps = {
    ..._componental?.wrapperProps,
    style: resultStyle,
    className: resultClassName,
  };
  // @ts-ignore
  if (result.wrapperProps.style == null) { delete result.wrapperProps.style; }
  // @ts-ignore
  if (result.wrapperProps.className == null) { delete result.wrapperProps.className; }
  result.direction = _componental?.direction ?? "vertical";
  result.path = _componental?.path ?? [];

  return result as ComponentContext;
};

// const createGeneralComponent = (componentName: string, pipeline: Pipeline): React.FC<GeneralComponentProps> => {
//   const NewComp = (p: GeneralComponentProps) => {
//     // Create component-context.
//     const context: ComponentContext = createComponentContext(componentName, p);
//
//
//   };
// };
