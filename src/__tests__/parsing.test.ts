import { describe, expect, it } from "vitest";
import { parseFormData } from "../parsing";
import Handlebars from "handlebars";

describe("parseFormData", () => {
  it("should map static text values when isTemplate is false", () => {
    const input = { name: "Alice" };
    const formData = {
      greeting: { value: "Hello", isTemplate: false },
    };
    expect(parseFormData(input, formData)).toEqual({
      greeting: "Hello",
    });
  });

  it("should map static text values when isTemplate is true but not a template", () => {
    const input = { name: "Alice" };
    const formData = {
      greeting: { value: "Hello", isTemplate: true },
    };
    expect(parseFormData(input, formData)).toEqual({
      greeting: "Hello",
    });
  });

  it("should interpolate a simple Handlebars template", () => {
    const input = { name: "Alice" };
    const formData = {
      greeting: { value: "Hello, {{name}}!", isTemplate: true },
    };
    expect(parseFormData(input, formData)).toEqual({
      greeting: "Hello, Alice!",
    });
  });

  it("should handle boolean values", () => {
    const input = { isActive: true };
    const formData = {
      status: {
        value: "{{#if isActive}}Active{{else}}Inactive{{/if}}",
        isTemplate: true,
      },
    };
    expect(parseFormData(input, formData)).toEqual({
      status: "Active",
    });
  });

  it("can handle Handlebar helpers registered", () => {
    const input = { a: 5, b: 3 };
    const formData = {
      sum: { value: "{{a}} + {{b}} = {{add a b}}", isTemplate: true },
    };
    // Register add helper for Handlebars
    Handlebars.registerHelper("add", (a, b) => a + b);
    expect(parseFormData(input, formData)).toEqual({
      sum: "5 + 3 = 8",
    });
  });

  it("should handle comparison operators", () => {
    const input = { score: 85 };
    const formData = {
      result: {
        value: "{{#if (gte score 60)}}Pass{{else}}Fail{{/if}}",
        isTemplate: true,
      },
    };
    // Register gte helper for Handlebars
    Handlebars.registerHelper("gte", (a, b) => a >= b);
    expect(parseFormData(input, formData)).toEqual({
      result: "Pass",
    });
  });

  it("should handle nested path access", () => {
    const input = { user: { profile: { email: "alice@example.com" } } };
    const formData = {
      email: { value: "{{user.profile.email}}", isTemplate: true },
    };
    expect(parseFormData(input, formData)).toEqual({
      email: "alice@example.com",
    });
  });

  it("should handle invalid template gracefully", () => {
    const input = { name: "Alice" };
    const formData = {
      broken: { value: "{{#if name}}Hello", isTemplate: true },
    };
    expect(parseFormData(input, formData)).toHaveProperty("broken");
  });

  it("should handle multiple fields with mixed templates and static values", () => {
    const input = { name: "Bob", age: 30, isAdmin: false };
    const formData = {
      welcome: { value: "Welcome, {{name}}!", isTemplate: true },
      age: { value: "{{age}}", isTemplate: true },
      admin: {
        value: "{{#if isAdmin}}Admin{{else}}User{{/if}}",
        isTemplate: true,
      },
      staticField: { value: "static", isTemplate: false },
    };
    expect(parseFormData(input, formData)).toEqual({
      welcome: "Welcome, Bob!",
      age: "30",
      admin: "User",
      staticField: "static",
    });
  });
});
