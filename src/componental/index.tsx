import React from "react";
// @ts-ignore
import entryTransMiddlewares from "./entry-trans-middlewares";
import fieldGenMiddlewares from "./field-gen-middlewares";
import componentGenMiddlewares from "./component-gen-middlewares";
import createPipeline from "./create-pipeline";


const pipeline = createPipeline({
  entryTransMiddlewares,
  fieldGenMiddlewares,
  componentGenMiddlewares,
});

const GeneralComponent = pipeline.generalComponent;

const handler = {
  get: (obj: any, componentName: string) => {
    if (componentName in obj) { return obj[componentName]; }

    return GeneralComponent;
  }
};

const GC = new Proxy({}, handler);

export default GC;
