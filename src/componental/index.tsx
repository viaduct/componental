import React from "react";
// @ts-ignore
import entryTransMiddlewares from "./entry-trans-middlewares";
import fieldGenMiddlewares from "./field-gen-middlewares";
import componentGenMiddlewares from "./component-gen-middlewares";
import createGeneralComponentFactory from "./create-general-component-factory";


const createGeneralComponent = createGeneralComponentFactory({
  entryTransMiddlewares,
  fieldGenMiddlewares,
  componentGenMiddlewares,
});

// const GeneralComponent = createGeneralComponent;

const handler = {
  get: (obj: any, componentName: string) => {
    if (componentName in obj) { return obj[componentName]; }

    // Create component.
    const newComponent = createGeneralComponent(componentName);

    // Store to obj.
    obj[componentName] = newComponent;

    return newComponent;
  }
};

const GC = new Proxy({}, handler);

export default GC;
