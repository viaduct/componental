import React from "react";
// @ts-ignore
import * as R from "ramda";
import entryTransMiddlewares from "./entry-trans-middlewares";
import fieldGenMiddlewares from "./field-gen-middlewares";
import componentGenMiddlewares from "./component-gen-middlewares";
import createGeneralComponentFactory from "./create-general-component-factory";
import GeneralComponent, {GeneralComponentProps} from "./last-try";

const r = R;




// const createGeneralComponent = createGeneralComponentFactory({
//   entryTransMiddlewares,
//   fieldGenMiddlewares,
//   componentGenMiddlewares,
// });

const createGeneralComponent = (componentName: string): GeneralComponent => {
  const lenses = {
    componentName: r.lensPath(["_componental", "componentName"]),
    entryTransMiddlewares: r.lensPath(["_componental", "entryTransMiddlewares"]),
    fieldGenMiddlewares: r.lensPath(["_componental", "fieldGenMiddlewares"]),
    componentGenMiddlewares: r.lensPath(["_componental", "componentGenMiddlewares"]),
  };

  return (props: GeneralComponentProps) => {
    return <GeneralComponent
      {
        ...r.pipe(
          r.set(lenses.componentName, componentName),
          r.set(lenses.entryTransMiddlewares, entryTransMiddlewares),
          r.set(lenses.fieldGenMiddlewares, fieldGenMiddlewares),
          r.set(lenses.componentGenMiddlewares, componentGenMiddlewares),
        )(props)
      }
    />;
  };
};

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
