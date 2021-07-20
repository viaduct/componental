import React from "react";

type RawEntry = {
  kind: "RAW";
  name: string;
  value: any;
};
type RawObject = RawEntry[];
type EditEntry = {
  kind: "EDIT";
  value: RawEntry;
  setter: RawEntry;
};
type Entry = RawEntry | EditEntry;

type Field = {kind: string;};

type EntryTransMiddlewareContext = {};
type FieldGenMiddlewareContext = {
  generateField: (entry: Field)=>Field;
};
type ComponentGenMiddlewareContext = {
  generateComponent: (field: Field)=>React.FC;
};

type EntryTransMiddleware = (entries: Entry[])=>Entry[];
type FieldGenMiddleware = (entry: Entry, generateField: (entry: Entry)=>Field)=>Field | undefined;
type ComponentGenMiddleware = (field: Field, generateComponent: (field: Field)=>React.FC)=>React.FC | undefined;

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
};
