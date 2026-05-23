import { describe, expect, it } from "vitest";
import { csvValue, toCsv } from "./report-csv";

describe("report CSV export", () => {
  it("escapes quotes and uses semicolon separators", () => {
    expect(toCsv([["Cuenta", "Nombre"], ["1.01", "Caja \"principal\""]])).toContain(
      "\"1.01\";\"Caja \"\"principal\"\"\""
    );
  });

  it("protects spreadsheet formula injection", () => {
    expect(csvValue("=IMPORTXML(\"http://example.test\")")).toBe(
      "\"'=IMPORTXML(\"\"http://example.test\"\")\""
    );
  });
});
