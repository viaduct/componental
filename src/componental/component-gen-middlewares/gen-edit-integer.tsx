import {ComponentGenMiddleware, Field} from "../types";

const genEditInteger: ComponentGenMiddleware = (field: Field) => {
  if (field.kind !== "EDIT_INTEGER") { return; }

  return () => <input
    type={"number"}
    value={field.value.toString()}
    onChange={e => {
      const value = e.target.value;

      const numberValue = Number(value);

      if (Number.isNaN(numberValue))
      {
        field.setter(field.value);
        return;
      }

      field.setter(numberValue);
    }}
    placeholder={field.name}
  />;
};

export default genEditInteger;
