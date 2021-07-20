import {ComponentGenMiddleware, Field} from "../types";

const genRenderString: ComponentGenMiddleware = (field: Field) => {
  if (field.kind !== "RENDER_STRING") { return; }

  return () => <span>{field.value}</span>;
};

export default genRenderString;
