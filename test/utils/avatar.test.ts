import { getInitials, getAvatarColor } from "@/utils/avatar";

describe("getInitials", () => {
  it("returns two initials from first and last name", () => {
    expect(getInitials("John Smith")).toBe("JS");
  });

  it("returns single initial for single name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns first and last initials for three-part name", () => {
    expect(getInitials("Mary Jane Watson")).toBe("MW");
  });

  it("handles extra whitespace", () => {
    expect(getInitials("  Bob  Lee  ")).toBe("BL");
  });

  it("returns ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("returns ? for whitespace-only string", () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("uppercases lowercase input", () => {
    expect(getInitials("john smith")).toBe("JS");
  });

  it("handles accented characters", () => {
    expect(getInitials("José García")).toBe("JG");
  });

  it("handles names with apostrophes", () => {
    expect(getInitials("O'Brien Smith")).toBe("OS");
  });

  it("handles hyphenated names as single parts", () => {
    expect(getInitials("Mary-Jane Watson")).toBe("MW");
  });
});

describe("getAvatarColor", () => {
  it("is deterministic", () => {
    const color1 = getAvatarColor("Kermit");
    const color2 = getAvatarColor("Kermit");
    expect(color1).toBe(color2);
  });

  it("returns a valid hex color", () => {
    expect(getAvatarColor("Kermit")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("returns a color from the palette for empty string", () => {
    expect(getAvatarColor("")).toMatch(/^#[0-9a-f]{6}$/);
  });
});
