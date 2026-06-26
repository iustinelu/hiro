import { describe, it, expect } from "vitest";
import { formatCurrency } from "./index";

describe("formatCurrency", () => {
  it("formats each supported currency with its symbol", () => {
    expect(formatCurrency(10, "EUR")).toBe("€10.00");
    expect(formatCurrency(10, "GBP")).toBe("£10.00");
    expect(formatCurrency(10, "USD")).toBe("$10.00");
    expect(formatCurrency(10, "RON")).toBe("lei 10.00");
  });

  it("always renders two decimal places", () => {
    expect(formatCurrency(0, "EUR")).toBe("€0.00");
    expect(formatCurrency(9.5, "EUR")).toBe("€9.50");
    expect(formatCurrency(1234.5, "USD")).toBe("$1234.50");
  });

  it("handles negative amounts", () => {
    expect(formatCurrency(-5, "EUR")).toBe("€-5.00");
  });
});
