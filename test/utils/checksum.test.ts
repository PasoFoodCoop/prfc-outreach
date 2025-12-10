import { calculateChecksum } from "@/utils/checksum";

describe("calculateChecksum", () => {
  const sampleInput = "charlie.brown@gmail.comCharlieBrownREF001";

  it("is deterministic", () => {
    const first = calculateChecksum(sampleInput);
    const second = calculateChecksum(sampleInput);

    expect(first).toBe(second);
  });

  it("produces lowercase hex", () => {
    const result = calculateChecksum(sampleInput);

    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it("differs for different inputs", () => {
    const a = calculateChecksum("linus.vanpelt@outlook.comLinusVanPeltREF002");
    const b = calculateChecksum("sally.brown@icloud.comSallyBrownREF003");

    expect(a).not.toBe(b);
  });

  it("is order-sensitive", () => {
    expect(calculateChecksum("abc")).not.toBe(calculateChecksum("cba"));
  });
});
