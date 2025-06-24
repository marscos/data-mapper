import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  ACESchema,
  ACEZodSchema as outputSchema,
  type ACEData,
  type ACESchemaEntries,
} from "@/ACESchema";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { parseFormData, type TemplateForm } from "@/parsing";

function ACEFieldMapper({
  inputData = {},
  onFormSubmit,
}: {
  inputData: object;
  onFormSubmit: (formData: ACEData) => void;
}) {
  const form = useForm({
    validators: {
      // TanStack Form currently does not consider Zod V4 ZodPipe objects as standard schemas for validation, but they work.
      // @ts-expect-error
      onSubmit: z.preprocess(
        (formValues) => buildOutput(formValues ?? {}),
        outputSchema
      ),
    },
    defaultValues: outputSchema.parse({}) as ACEData,
    onSubmit: ({ value }) => {
      onFormSubmit(outputSchema.parse(buildOutput(value)));
    },
  });

  const templateEnablers = useForm({});

  const buildOutput = (formValues: object): object => {
    const formData: TemplateForm = Object.entries(formValues).reduce(
      (formData, [key, value]) => {
        return {
          ...formData,
          [key]: { value, isTemplate: templateEnablers.getFieldValue(key) },
        };
      },
      {}
    );
    console.log(outputSchema.parse({}));
    return parseFormData(inputData, formData);
  };

  return (
    <div id="field-mapper" className="flex flex-col h-full gap-3">
      <ScrollArea className="border p-1 overflow-hidden">
        <form
          id="output-values"
          className="flex flex-col items-stretch gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(e);
          }}
        >
          {(Object.entries(ACESchema) as ACESchemaEntries).map(
            ([key, aCEField]) => (
              <fieldset
                className="border-b-1 border-accent p-1 pb-3 rounded-xs flex flex-col gap-1"
                key={key}
              >
                <form.Field
                  name={key}
                  children={(field) => (
                    <div
                      data-test="value-field"
                      className="flex flex-col gap-0.5 items-start"
                    >
                      <label htmlFor={`${key}-value`}>{aCEField.label}</label>
                      {(() => {
                        if (templateEnablers.getFieldValue(key)) {
                          return (
                            <Input
                              data-testid={key}
                              id={`${key}-value`}
                              type="text"
                              value={field.state.value as string}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                            />
                          );
                        }
                        switch (aCEField.type) {
                          case "YESORNO":
                            return (
                              <Switch
                                data-testid={key}
                                id={`${key}-value`}
                                checked={field.state.value === "true"}
                                onCheckedChange={(e) =>
                                  field.handleChange(e ? "true" : "false")
                                }
                              />
                            );
                          case "FLOAT":
                            return (
                              <Input
                                data-testid={key}
                                id={`${key}-value`}
                                type="number"
                                value={Number(field.state.value ?? 0)}
                                onChange={(e) =>
                                  field.handleChange(e.target.valueAsNumber)
                                }
                              />
                            );
                          case "TEXTAREA":
                            return (
                              <Textarea
                                data-testid={key}
                                id={`${key}-value`}
                                value={field.state.value as string}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                              />
                            );
                          case "PICKLIST":
                            return (
                              <Select onValueChange={field.handleChange}>
                                <SelectTrigger
                                  id={`${key}-value`}
                                  data-testid={key}
                                >
                                  <SelectValue placeholder={aCEField.label} />
                                </SelectTrigger>
                                <SelectContent>
                                  {aCEField.picklist.map((value) => (
                                    <SelectItem value={value} key={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          default:
                            return (
                              <Input
                                data-testid={key}
                                id={`${key}-value`}
                                type="text"
                                value={field.state.value as string}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                              />
                            );
                        }
                      })()}
                      {!field.state.meta.isValid && (
                        <em role="alert" className="text-red-600">
                          {field.state.meta.errorMap.onSubmit
                            // @ts-expect-error : See line #27
                            ?.map((val) => val.message)
                            .join(", ")}
                        </em>
                      )}
                    </div>
                  )}
                ></form.Field>
                <templateEnablers.Field
                  name={key}
                  defaultValue={false}
                  children={(field) => (
                    <span className="flex flex-row gap-1 items-center text-sm">
                      <label htmlFor={`${key}-enable-template`}>
                        Enable templating
                      </label>
                      <Switch
                        data-testid={`${key}-enable-template`}
                        id={`${key}-enable-template`}
                        checked={!!field.state.value}
                        onCheckedChange={field.handleChange}
                      ></Switch>
                    </span>
                  )}
                  listeners={{
                    onChange: () => {
                      form.setFieldValue(key, "");
                    },
                  }}
                ></templateEnablers.Field>
              </fieldset>
            )
          )}
        </form>
      </ScrollArea>
      <Button type="submit" form="output-values">
        Submit
      </Button>
    </div>
  );
}

export default ACEFieldMapper;
