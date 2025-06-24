import { test, expect, type Locator } from "@playwright/test";

test.describe("App e2e", () => {
  const inputData = {
    name: "Alice",
    age: 30,
    isAdmin: true,
    country: {
      name: "Canada",
      value: "canada",
    },
  };
  let dataInput: Locator,
    textInput: Locator,
    textInputName: string | null,
    numberInput: Locator,
    numberInputName: string | null,
    booleanInput: Locator,
    booleanInputName: string | null,
    picklistInput: Locator,
    picklistInputName: string | null,
    submitButton: Locator,
    outputData: Locator,
    error: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
    dataInput = page.getByLabel("Input data");
    textInput = page.locator('#field-mapper input[type="text"]').nth(0);
    numberInput = page.locator('#field-mapper input[type="number"]').nth(0);
    booleanInput = page
      .locator('#field-mapper *[data-test="value-field"]')
      .getByRole("switch")
      .nth(0);
    picklistInput = page.getByRole("combobox").nth(0);
    textInputName = await textInput.getAttribute("data-testid");
    numberInputName = await numberInput.getAttribute("data-testid");
    booleanInputName = await booleanInput.getAttribute("data-testid");
    picklistInputName = await picklistInput.getAttribute("data-testid");
    submitButton = page.getByRole("button", { name: /submit/i });
    outputData = page.getByLabel("Output data");
    error = page.getByRole("alert");
    await dataInput.fill(JSON.stringify(inputData));
    await dataInput.blur();
  });

  test("shows error for invalid JSON input", async () => {
    await dataInput.fill("{invalid:}");
    await dataInput.blur();
    await expect(error).toBeVisible();
  });

  test("maps static values for all field types", async ({ page }) => {
    await textInput.fill("Hello");

    await numberInput.fill("42");

    await booleanInput.click();

    await picklistInput.click();
    const option = page.getByRole("option", { name: "Canada" });
    const optionValue = (await option.innerText()).trim();
    await option.click();

    await submitButton.click();

    await expect(outputData).toContainText(
      new RegExp(`"${textInputName}":\\s+"Hello"`)
    );
    await expect(outputData).toContainText(
      new RegExp(`"${numberInputName}":\\s+[ˆ"]?42[ˆ"]?`)
    );
    await expect(outputData).toContainText(
      new RegExp(`"${booleanInputName}":\\s+[ˆ"]?true[ˆ"]?`)
    );
    await expect(outputData).toContainText(
      new RegExp(`"${picklistInputName}":\\s+"${optionValue}"`)
    );
  });

  test("maps Handlebars expressions", async ({ page }) => {
    await page.getByTestId(`${textInputName}-enable-template`).click();

    await textInput.fill("{{name}}");

    await submitButton.click();

    await expect(outputData).toContainText(
      new RegExp(`"${textInputName}":\\s+"${inputData.name}"`)
    );
  });

  test("updates input data", async ({ page }) => {
    await page.getByTestId(`${textInputName}-enable-template`).click();

    await textInput.fill("{{name}}");

    await submitButton.click();

    await expect(outputData).toContainText(
      new RegExp(`"${textInputName}":\\s+"${inputData.name}"`)
    );

    await dataInput.fill(JSON.stringify({ name: "Bob" }));

    await submitButton.click();

    await expect(outputData).toContainText(
      new RegExp(`"${textInputName}":\\s+"Bob"`)
    );
  });

  test("shows error for number type mismatch in output", async ({ page }) => {
    await page.getByTestId(`${numberInputName}-enable-template`).click();
    await page.getByTestId(numberInputName ?? "").fill("notanumber");

    await submitButton.click();

    await expect(error).toBeVisible();
    await expect(outputData).not.toContainText(
      new RegExp(`"${numberInputName}": "notanumber"`)
    );
  });

  test("shows error for picklist type mismatch in output", async ({ page }) => {
    await page.getByTestId(`${picklistInputName}-enable-template`).click();
    await page.getByTestId(picklistInputName ?? "").fill("notonpicklist");

    await submitButton.click();

    await expect(error).toBeVisible();
    await expect(outputData).not.toContainText(
      new RegExp(`"${picklistInputName}": "notonpicklist"`)
    );
  });

  test("shows error for boolean type mismatch in output", async ({ page }) => {
    await page.getByTestId(`${booleanInputName}-enable-template`).click();
    await page.getByTestId(booleanInputName ?? "").fill("notaboolean");

    await submitButton.click();

    await expect(error).toBeVisible();
    await expect(outputData).not.toContainText(
      `"${booleanInputName}": "notaboolean"`
    );
  });

  test("does not show error for empty fields", async ({ page }) => {
    await submitButton.click();

    await expect(page.getByRole("alert")).toBeHidden();
  });

  test("handles toggling template mode and clearing fields", async ({
    page,
  }) => {
    await textInput.fill("This should be cleared");
    await page.getByTestId(`${textInputName}-enable-template`).click();
    await expect(textInput).toHaveValue("");
    await page.getByTestId(`${textInputName}-enable-template`).click();
    await expect(textInput).toHaveValue("");
  });
});
