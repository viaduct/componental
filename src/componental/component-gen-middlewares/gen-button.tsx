import {ComponentGenMiddleware, Field} from "../types";

const genButton: ComponentGenMiddleware = (field: Field) => {
  if (field.kind !== "BUTTON") { return; }

  return () => <input
    type={"button"}
    onClick={field.event}
    value={field.name}
  />;
};

export default genButton;
