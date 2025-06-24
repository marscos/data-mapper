import Handlebars from "handlebars";

export type TemplateForm = {
  [key: string]: {
    value: string;
    isTemplate: boolean;
  };
};

export const parseFormData = (
  inputData: object,
  formData: TemplateForm
): object => {
  return Object.entries(formData).reduce((output, [key, field]) => {
    if (field && field.value && field.isTemplate) {
      try {
        const template = Handlebars.compile(field.value);
        return { ...output, [key]: template(inputData) };
      } catch {
        return { ...output, [key]: field.value };
      }
    } else {
      return { ...output, [key]: field.value };
    }
  }, {});
};
