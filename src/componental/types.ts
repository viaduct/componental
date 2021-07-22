import React from "react";
import Field_ from "./field-types";

// type ItemChild = {
//   kind: "CHILD";
// };
// type ItemFromClient = {
//   kind: "FROM_CLIENT";
// };
// type Item = ItemChild | ItemFromClient;

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
