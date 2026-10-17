import { describe, expect, it } from "vitest";
import { decimalString, parsePositive, roundFrac, simplifyRatio, solve, frac } from "@/lib/ratio";

const p = (s: string) => {
  const r = parsePositive(s);
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("ratio math", () => {
  it("16:9 width 1920 => 1080", () => {
    expect(decimalString(solve(p("16"), p("9"), p("1920"), "height"))).toBe("1080");
  });
  it("9:16 width 1080 => 1920", () => {
    expect(decimalString(solve(p("9"), p("16"), p("1080"), "height"))).toBe("1920");
  });
  it("16:9 width 1001 => 563.0625 exact, 563 rounded", () => {
    const h = solve(p("16"), p("9"), p("1001"), "height");
    expect(decimalString(h)).toBe("563.0625");
    expect(roundFrac(h)).toBe(563n);
  });
  it("3440x1440 => 43:18", () => {
    expect(simplifyRatio(p("3440"), p("1440"))).toEqual([43n, 18n]);
  });
  it("2560x1080 => 64:27", () => {
    expect(simplifyRatio(p("2560"), p("1080"))).toEqual([64n, 27n]);
  });
  it("repeating fractions", () => {
    expect(decimalString(frac(1000n, 3n))).toBe("333.(3)");
    expect(decimalString(frac(1n, 6n))).toBe("0.1(6)");
  });
  it("validation", () => {
    expect(parsePositive("").ok).toBe(false);
    expect(parsePositive("0").ok).toBe(false);
    expect(parsePositive("-5").ok).toBe(false);
    expect(parsePositive("1e3").ok).toBe(false);
    expect(parsePositive("1000000.000001").ok).toBe(false);
    expect(parsePositive("1000000").ok).toBe(true);
    expect(parsePositive("1.1234567").ok).toBe(false);
    expect(parsePositive("1.123456").ok).toBe(true);
  });
});
