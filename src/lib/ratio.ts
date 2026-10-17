// Exact rational arithmetic with BigInt for aspect-ratio work.
export type Frac = { n: bigint; d: bigint };

export const MAX_VALUE = 1_000_000;
export const MAX_DECIMALS = 6;

const abs = (a: bigint) => (a < 0n ? -a : a);
export function gcd(a: bigint, b: bigint): bigint {
  a = abs(a);
  b = abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
export function frac(n: bigint, d: bigint = 1n): Frac {
  if (d === 0n) throw new Error("zero denominator");
  if (d < 0n) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}
export const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
export const div = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n);

export type ParseResult = { ok: true; value: Frac } | { ok: false; error: string };

export function parsePositive(raw: string): ParseResult {
  const s = raw.trim();
  if (s === "") return { ok: false, error: "Required" };
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return { ok: false, error: "Enter a number" };
  if (s.startsWith("-")) return { ok: false, error: "Must be positive" };
  const clean = s.replace(/^\+/, "");
  const [intPart, decPart = ""] = clean.split(".");
  if (decPart.length > MAX_DECIMALS) return { ok: false, error: `Max ${MAX_DECIMALS} decimals` };
  const n = BigInt((intPart || "0") + decPart);
  const d = 10n ** BigInt(decPart.length);
  const v = frac(n, d);
  if (v.n === 0n) return { ok: false, error: "Must be greater than 0" };
  if (v.n > BigInt(MAX_VALUE) * v.d) return { ok: false, error: "Max 1,000,000" };
  return { ok: true, value: v };
}

/** Simplified integer ratio a:b equal to x/y. */
export function simplifyRatio(x: Frac, y: Frac): [bigint, bigint] {
  const r = div(x, y);
  return [r.n, r.d];
}

/** Round half up to integer (positive values). */
export function roundFrac(f: Frac): bigint {
  return (2n * f.n + f.d) / (2n * f.d);
}

export type DecimalRepr = { int: string; nonRepeat: string; repeat: string; truncated: boolean };

/** Exact decimal expansion with repeating-cycle detection. */
export function toDecimal(f: Frac, maxDigits = 60): DecimalRepr {
  const int = f.n / f.d;
  let rem = f.n % f.d;
  const seen = new Map<string, number>();
  const digits: string[] = [];
  while (rem !== 0n && digits.length < maxDigits) {
    const key = rem.toString();
    if (seen.has(key)) {
      const i = seen.get(key)!;
      return { int: int.toString(), nonRepeat: digits.slice(0, i).join(""), repeat: digits.slice(i).join(""), truncated: false };
    }
    seen.set(key, digits.length);
    rem *= 10n;
    digits.push((rem / f.d).toString());
    rem %= f.d;
  }
  return { int: int.toString(), nonRepeat: digits.join(""), repeat: "", truncated: rem !== 0n };
}

export function decimalString(f: Frac): string {
  const r = toDecimal(f);
  const frac = r.nonRepeat + (r.repeat ? `(${r.repeat})` : "") + (r.truncated ? "…" : "");
  return frac ? `${r.int}.${frac}` : r.int;
}

export const isInteger = (f: Frac) => f.d === 1n;

export function approxNumber(f: Frac): number {
  return Number(f.n) / Number(f.d);
}

export function fmtInt(b: bigint): string {
  return b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Solve missing dimension: given ratio rw:rh and a known side. */
export function solve(rw: Frac, rh: Frac, known: Frac, solveFor: "height" | "width"): Frac {
  return solveFor === "height" ? div(mul(known, rh), rw) : div(mul(known, rw), rh);
}
