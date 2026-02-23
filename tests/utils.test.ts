import { describe, expect, it } from "vitest";
import { formatDuration } from "../lib/utils";

describe("formatDuration", () => {
  it("formats hh:mm:ss", () => {
    expect(formatDuration(3661)).toBe("01:01:01");
  });
});
