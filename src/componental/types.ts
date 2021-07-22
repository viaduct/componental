import React from "react";
import Field_ from "./field-types";

type WrapperProps = Record<string, any> & {
  style?: Record<string, any> | undefined;
  className?: string | undefined;
}
type ItemChild = {
  kind: "CHILD";
  client: ItemFromClient;
  
};
type ItemFromClient = {
  kind: "FROM_CLIENT";
  props: Record<string, any>;
  entries: Entry[];
  wrapperProps: WrapperProps;
  direction: VHDirection;
};
type Item = ItemChild | ItemFromClient;

type VHDirection = "horizontal" | "vertical";
type RawEntry = {
  kind: "RAW";
  name: string;
  value: any;
};
type EntryObject = {
  direction: VHDirection;
  entries: Entry[];
};
type EditEntry = {
  kind: "EDIT";
  value: RawEntry;
  setter: RawEntry;
};
type Entry = RawEntry | EditEntry;

type Field = Field_;

// type BaseMiddlewareContext = {
//   entryTransMiddlewares: EntryTransMiddleware[];
//   fieldGenMiddlewares: FieldGenMiddleware[];
//   componentGenMiddlewares: ComponentGenMiddleware[];
// };
type EntryTransMiddlewareContext = {};
type FieldGenMiddlewareContext = {
  parentObject: EntryObject;
};
type ComponentGenMiddlewareContext = {
  generateComponent: (rawObject: EntryObject)=>React.FC;
};

type EntryTransMiddleware = (entries: Entry[], context: EntryTransMiddlewareContext)=>Entry[];
type FieldGenMiddleware = (entry: Entry, context: FieldGenMiddlewareContext)=>Field | undefined;
type ComponentGenMiddleware = (field: Field, context: ComponentGenMiddlewareContext)=>React.FC | undefined;

type CreateGeneralComponentFactoryParams = {
  entryTransMiddlewares: EntryTransMiddleware[];
  fieldGenMiddlewares: FieldGenMiddleware[];
  componentGenMiddlewares: ComponentGenMiddleware[];
};

type CreateGeneralComponent = (componentName: string)=>React.FC;

export type {
  VHDirection,
  RawEntry,
  EntryObject,
  EditEntry,
  Entry,
  Field,
  EntryTransMiddlewareContext,
  FieldGenMiddlewareContext,
  ComponentGenMiddlewareContext,
  EntryTransMiddleware,
  FieldGenMiddleware,
  ComponentGenMiddleware,
  CreateGeneralComponentFactoryParams,
  CreateGeneralComponent,
};
