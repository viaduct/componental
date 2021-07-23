import React from "react";
import Field_ from "./field-types";

type WrapperProps = {
  style?: Record<string, any> | undefined;
  className?: string | undefined;
  [key: string]: any;
};
type ItemPayload = {
  props: Record<string, any>;
  entries: Entry[];
  wrapperProps: WrapperProps;
  direction: VHDirection;
};
type ItemChild = {
  kind: "CHILD";
  parent: Item;
} & ItemPayload;
type ItemFromClient = {
  kind: "FROM_CLIENT";
  // componentName: string;
} & ItemPayload;
type Item = ItemChild | ItemFromClient;

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

type BaseMiddlewareContext = {
  entryTransMiddlewares: EntryTransMiddleware[];
  fieldGenMiddlewares: FieldGenMiddleware[];
  componentGenMiddlewares: ComponentGenMiddleware[];
};
type EntryTransMiddlewareContext = BaseMiddlewareContext & {};
type FieldGenMiddlewareContext = BaseMiddlewareContext & {};
type ComponentGenMiddlewareContext = BaseMiddlewareContext & {
  generalComponent: React.FC<any>; // todo fix this.
  // generateComponent: (rawObject: EntryObject)=>React.FC;
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
  WrapperProps,
  ItemPayload,
  ItemChild,
  ItemFromClient,
  Item,
  GeneralComponentProps,
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
