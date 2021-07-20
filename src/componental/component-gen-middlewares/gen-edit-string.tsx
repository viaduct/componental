import {ComponentGenMiddleware, Field} from "../types";

const genEditString: ComponentGenMiddleware = (field: Field) => {
  if (field.kind !== "EDIT_STRING") { return; }

  return () => <input
    type={"text"}
    value={field.value}
    onChange={e => { field.setter(e.target.value); }}
    placeholder={field.name}
  />;
};

export default genEditString;
