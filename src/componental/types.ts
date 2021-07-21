import React from "react";
import Field_ from "./field-types";

type RawEntry = {
  kind: "RAW";
  name: string;
  value: any;
};
type EntryObject = {
  direction: "horizontal" | "vertical";
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

type PipelineParams = {
  entryTransMiddlewares: EntryTransMiddleware[];
  fieldGenMiddlewares: FieldGenMiddleware[];
  componentGenMiddlewares: ComponentGenMiddleware[];
};

type Pipeline = {
  generalComponent: React.FC;
};

export type {
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
  PipelineParams,
  Pipeline,
};
