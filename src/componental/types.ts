import React from "react";
import Field_ from "./field-types";

type RawEntry = {
  kind: "RAW";
  name: string;
  value: any;
};
type RawObject = {
  direction: "horizontal" | "vertical";
  entries: RawEntry[];
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
  parentObject: RawObject;
};
type ComponentGenMiddlewareContext = {
  generateComponent: (rawObject: RawObject)=>React.FC;
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
  RawObject,
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
