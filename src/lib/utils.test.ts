import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("p-4", "m-4")).toBe("p-4 m-4");
  });

  it("handles conditional class names", () => {
    expect(cn("p-4", false && "m-4", "text-center")).toBe("p-4 text-center");
    expect(cn("p-4", true && "m-4", "text-center")).toBe("p-4 m-4 text-center");
  });

  it("handles tailwind class conflicts", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles arrays and objects", () => {
    expect(cn(["p-4", "m-4"])).toBe("p-4 m-4");
    expect(cn({ "p-4": true, "m-4": false })).toBe("p-4");
  });
});
