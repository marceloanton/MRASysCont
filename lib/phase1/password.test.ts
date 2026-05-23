import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a valid password", () => {
    const hash = hashPassword("MraSysCont2026!", "fixed-salt");

    expect(verifyPassword("MraSysCont2026!", hash)).toBe(true);
  });

  it("rejects an invalid password", () => {
    const hash = hashPassword("MraSysCont2026!", "fixed-salt");

    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });
});
