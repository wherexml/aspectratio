import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Check, ChevronDown, Copy, RotateCcw, Ratio, ImageIcon, Clapperboard, Monitor } from "lucide-react";
import { RatioCanvas } from "@/components/RatioCanvas";
import { ThemeControl } from "@/components/ThemeControl";
import { MediaPreview } from "@/components/MediaPreview";
import { approxNumber, decimalString, fmtInt, isInteger, parsePositive, roundFrac, simplifyRatio, solve, type Frac, type ParseResult } from "@/lib/ratio";
type Mode = "solve" | "ratio" | "resize";
type Side = "height" | "width";

const PRESETS: [string, string, string][] = [
  ["1", "1", "Square"],
  ["4", "3", "Classic"],
  ["3", "4", "Portrait"],
  ["3", "2", "Photo"],
  ["2", "3", "Portrait photo"],
  ["4", "5", "Social post"],
  ["16", "9", "Widescreen"],
  ["9", "16", "Vertical video"],
  ["16", "10", "Laptop"],
];

const ULTRAWIDE: [string, string, string][] = [
  ["21", "9", "Strict 21:9"], ["43", "18", "3440 × 1440"],
  ["64", "27", "2560 × 1080"], ["12", "5", "3840 × 1600"], ["64", "27", "5120 × 2160"],
];
const ULTRA_IDS = ["strict", "3440", "2560", "3840", "5120"];

const KNOWN: [number, number, string][] = [
  [16, 10, "16:10"], [16, 9, "16:9"], [9, 16, "9:16"], [4, 3, "4:3"], [3, 4, "3:4"], [3, 2, "3:2"], [2, 3, "2:3"], [1, 1, "1:1"], [21, 9, "21:9"], [4, 5, "4:5"], [2.39, 1, "2.39:1"],
];

const DEFAULTS = { ratioW: "16", ratioH: "9", known: "1920", side: "height" as Side, dimW: "3440", dimH: "1440" };

function Thumb({ w, h, active }: { w: number; h: number; active?: boolean }) {
  const r = w / h;
  const bw = r >= 1 ? 26 : 26 * r;
  const bh = r >= 1 ? 26 / r : 26;
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <rect x={16 - bw / 2} y={16 - bh / 2} width={bw} height={bh} rx="2"
        className={active ? "fill-primary stroke-primary" : "fill-transparent stroke-current"} strokeWidth="1.6" />
    </svg>
  );
}

function Field({ id, label, value, onChange, error, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string | undefined; hint?: string | undefined;
}) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </label>
      <input
        id={id} className="field" inputMode="decimal" autoComplete="off" spellCheck={false}
        value={value} onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
      />
      <p id={`${id}-err`} className="mt-1 min-h-4 text-xs font-medium text-destructive" aria-live="polite">
        {error ?? ""}{!error && hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </p>
    </div>
  );
}

// Presentation only: calculations and clipboard values retain exact fractions.
function compactDecimal(f: Frac): string {
  const scaled = roundFrac({ n: f.n * 100n, d: f.d });
  if (scaled === 0n && f.n > 0n) return "<0.01";
  const value = `${scaled / 100n}.${(scaled % 100n).toString().padStart(2, "0")}`.replace(/\.?0+$/, "");
  return `${scaled * f.d === f.n * 100n ? "" : "≈"}${value}`;
}

function canvasRatio(w: Frac, h: Frac): string {
  const [a, b] = simplifyRatio(w, h);
  if (["43:18", "64:27", "12:5"].includes(`${a}:${b}`)) return `${a}:${b}`;
  const exact = KNOWN.find(([x, y]) => a * BigInt(Math.round(y * 100)) === b * BigInt(Math.round(x * 100)));
  if (exact) return exact[2];
  const value = approxNumber({ n: a, d: b });
  const nearest = KNOWN.map(([x, y, label]) => ({ label, diff: Math.abs(value / (x / y) - 1) }))
    .sort((x, y) => x.diff - y.diff)[0]!;
  if (nearest.diff <= 0.03) return `Near ${nearest.label}`;
  if (a <= 100n && b <= 100n) return `${a}:${b}`;
  return `${compactDecimal({ n: a, d: b })}:1`;
}

const err = (p: ParseResult) => (p.ok ? undefined : p.error);

export function Calculator({ ultrawide = false, media }: { ultrawide?: boolean; media?: "image" | "video" }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const [ultraPreset, setUltraPreset] = useState("3440");
  const presets = ultrawide ? ULTRAWIDE : PRESETS;
  const originalSizes: Record<string, [string, string]> = { "3440": ["3440", "1440"], "2560": ["2560", "1080"], "3840": ["3840", "1600"], "5120": ["5120", "2160"] };
  const originalSize = originalSizes[ultraPreset];
  const [mode, setMode] = useState<Mode>(media ? "ratio" : "solve");
  const [ratioW, setRatioW] = useState(ultrawide ? "43" : DEFAULTS.ratioW);
  const [ratioH, setRatioH] = useState(ultrawide ? "18" : DEFAULTS.ratioH);
  const [solveKnown, setSolveKnown] = useState(ultrawide ? "3440" : DEFAULTS.known);
  const [solveSide, setSolveSide] = useState<Side>(DEFAULTS.side);
  const [dimW, setDimW] = useState(media ? "1920" : DEFAULTS.dimW);
  const [dimH, setDimH] = useState(media ? "1080" : DEFAULTS.dimH);
  const [resizeKnown, setResizeKnown] = useState(media ? "1920" : "3440");
  const [resizeSide, setResizeSide] = useState<Side>("height");
  const known = mode === "resize" ? resizeKnown : solveKnown;
  const side = mode === "resize" ? resizeSide : solveSide;
  const setKnown = mode === "resize" ? setResizeKnown : setSolveKnown;
  const setSide = mode === "resize" ? setResizeSide : setSolveSide;
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
  const resultRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const pRW = parsePositive(mode === "resize" ? dimW : ratioW), pRH = parsePositive(mode === "resize" ? dimH : ratioH), pK = parsePositive(known);
  const pDW = parsePositive(dimW), pDH = parsePositive(dimH);

  const result = useMemo(() => {
    if (mode !== "ratio") {
      if (!pRW.ok || !pRH.ok || !pK.ok) return null;
      const out = solve(pRW.value, pRH.value, pK.value, side);
      const rounded = roundFrac(out);
      const w = side === "height" ? pK.value : out;
      const h = side === "height" ? out : pK.value;
      const wTxt = side === "height" ? decimalString(pK.value) : rounded.toString();
      const hTxt = side === "height" ? rounded.toString() : decimalString(pK.value);
      return {
        kind: "solve" as const, out, rounded, exact: isInteger(out),
        subpixel: w.n < w.d || h.n < h.d,
        copy: `${wTxt} × ${hTxt}`, ratio: approxNumber(w) / approxNumber(h),
        wLabel: side === "height" ? decimalString(pK.value) : (out.n < out.d ? compactDecimal(out) : fmtInt(rounded)),
        hLabel: side === "height" ? (out.n < out.d ? compactDecimal(out) : fmtInt(rounded)) : decimalString(pK.value),
        center: canvasRatio(pRW.value, pRH.value),
        targetRatio: mode === "resize" ? `${dimW.trim()}:${dimH.trim()}` : `${ratioW.trim()}:${ratioH.trim()}`,
      };
    }
    if (!pDW.ok || !pDH.ok) return null;
    const [a, b] = simplifyRatio(pDW.value, pDH.value);
    const dec = { n: a, d: b };
    const v = approxNumber(dec);
    return {
      kind: "ratio" as const, a, b, dec,
      copy: `${a}:${b}`, ratio: v,
      wLabel: decimalString(pDW.value), hLabel: decimalString(pDH.value),
      center: canvasRatio(pDW.value, pDH.value),
    };
  }, [mode, ratioW, ratioH, known, side, dimW, dimH]); // eslint-disable-line react-hooks/exhaustive-deps

  const preview = result?.ratio ?? null;
  const copyAllowed = !!result && !(result.kind === "solve" && result.subpixel);

  const resetCopy = () => { window.clearTimeout(timer.current); setCopyState("idle"); };
  const touch = <T,>(fn: (v: T) => void) => (v: T) => { resetCopy(); fn(v); };

  async function copy() {
    if (!result || !copyAllowed) return;
    resetCopy();
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(result.copy);
      setCopyState("ok");
      timer.current = window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("fail");
      const el = resultRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }

  function swap() {
    resetCopy();
    if (mode === "solve") { setRatioW(ratioH); setRatioH(ratioW); }
    else { setDimW(dimH); setDimH(dimW); }
  }

  function reset() {
    resetCopy();
    setRatioW(ultrawide ? "43" : DEFAULTS.ratioW); setRatioH(ultrawide ? "18" : DEFAULTS.ratioH); setKnown(ultrawide ? "3440" : DEFAULTS.known); setUltraPreset("3440");
    setSolveKnown(ultrawide ? "3440" : DEFAULTS.known); setSolveSide(DEFAULTS.side); setResizeKnown(media ? "1920" : "3440"); setResizeSide("height"); setDimW(media ? "1920" : DEFAULTS.dimW); setDimH(media ? "1080" : DEFAULTS.dimH);
  }

  function onDrag(r: number) {
    resetCopy();
    if (mode === "solve") {
      setRatioW(Math.min(20, Math.max(0.05, r)).toFixed(4)); setRatioH("1");
    } else if (pDW.ok) {
      setDimH(String(Math.max(1, Math.round(approxNumber(pDW.value) / r))));
    }
  }

  const activePreset = pRW.ok && pRH.ok
    ? PRESETS.findIndex(([w, h]) => {
        const [a, b] = simplifyRatio(pRW.value, pRH.value);
        return a * BigInt(h) === b * BigInt(w);
      })
    : -1;

  function useRatio() {
    if (!pDW.ok || !pDH.ok) return;
    resetCopy(); setRatioW(dimW); setRatioH(dimH); setSolveKnown(dimW); setSolveSide("height"); setMode("solve");
  }
  function useSize() {
    if (!result || result.kind !== "solve" || result.subpixel) return;
    const [w, h] = result.copy.split(" × ");
    if (!parsePositive(w!).ok || !parsePositive(h!).ok) return;
    resetCopy(); setDimW(w!); setDimH(h!); setMode("ratio");
  }
  const ToolsShell = media ? "details" : "div";
  const transferable = result?.kind === "solve" && !result.subpixel && result.copy.split(" × ").every(v => parsePositive(v).ok);
  return (
    <div className="min-h-screen" data-ready={ready}>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-5 sm:px-6">
        <Link to="/" aria-label="Aspect Ratio Calculator home" className="flex shrink-0 items-center gap-2.5">
          <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden>
            <rect x="2" y="7" width="24" height="14" rx="2" className="fill-none stroke-foreground" strokeWidth="2" />
            <rect x="9" y="3" width="10" height="22" rx="2" className="fill-primary" />
          </svg>
          <span className="font-display text-sm font-bold tracking-tight">ratio/lab</span>
        </Link>
        <ThemeControl />

      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <nav aria-label="Calculators" className="calculator-nav mt-5 grid grid-cols-4 gap-2 text-sm sm:flex sm:flex-wrap">
          {[{to:"/",label:"All ratios",icon:Ratio}, {to:"/image-aspect-ratio",label:"Image",icon:ImageIcon}, {to:"/video-aspect-ratio",label:"Video",icon:Clapperboard}, {to:"/ultrawide-aspect-ratio-calculator",label:"Ultrawide",icon:Monitor}].map(({to,label,icon:Icon}) => <Link key={to} to={to} activeOptions={{exact:true}} activeProps={{className:"bg-accent text-accent-foreground"}} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 font-medium sm:flex-row sm:gap-2 sm:px-4"><Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" strokeWidth={2} /><span>{label}</span></Link>)}
        </nav>
        <h1 className="mt-6 font-display text-[2.1rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl">
          {ultrawide ? "Ultrawide Aspect Ratio" : media === "image" ? "Image Aspect Ratio" : media === "video" ? "Video Aspect Ratio" : "Aspect Ratio"} <span className="text-primary">Calculator</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          {ultrawide ? "Scale using your screen’s actual ratio, or choose strict 21:9." : media === "image" ? "Choose a local image to find its dimensions and ratio, then compare Fit and Fill." : media === "video" ? "Enter video dimensions to compare Fit and Fill on a widescreen display and a vertical phone." : "Solve a missing width or height, or reduce any dimensions to their exact ratio."}
        </p>

        {media && <MediaPreview kind={media} width={dimW} height={dimH} onDimensions={(w,h) => {resetCopy(); setDimW(w); setDimH(h); setMode("ratio");}} />}
        <ToolsShell className="numeric-tools">
          {media && <summary className="my-6 cursor-pointer text-sm font-semibold">Calculate or scale dimensions</summary>}
        <section inert={!ready} aria-label="Calculator" className={`calculator-layout mt-6 grid gap-4 lg:gap-6 ${media ? "media-numeric" : "lg:grid-cols-[1fr_400px]"}`}>
          {/* Controls + result */}
          <div className="calculator-controls order-2 rounded-2xl border bg-card p-4 shadow-[0_1px_0_var(--color-border),0_24px_48px_-32px_color-mix(in_oklab,var(--color-foreground)_35%,transparent)] sm:p-5 lg:order-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {ultrawide ? <span className="text-sm font-semibold">Scale your resolution</span> : <div role="tablist" aria-label="Calculation mode" className="seg">
                <button role="tab" aria-selected={mode === "solve"} onClick={() => { resetCopy(); setMode("solve"); }}>Find size</button>
                <button role="tab" aria-selected={mode === "ratio"} onClick={() => { resetCopy(); setMode("ratio"); }}>Find ratio</button>
                <button role="tab" aria-selected={mode === "resize"} onClick={() => { resetCopy(); setMode("resize"); }}>Resize</button>
              </div>}
              <div className="flex gap-1">
                {!ultrawide && <IconBtn label="Swap orientation" onClick={swap}><ArrowLeftRight className="h-4 w-4" /></IconBtn>}
                <IconBtn label="Reset" onClick={reset}><RotateCcw className="h-4 w-4" /></IconBtn>
              </div>
            </div>

            <div className="mode-fields" key={mode}>
            {mode === "solve" ? (
              <div className="mt-4">
                <div className={ultrawide ? "grid grid-cols-2 gap-2" : "preset-strip"} role="group" aria-label="Ratio presets">
                  {presets.map(([w, h, hint], i) => (
                    <button key={i} type="button" title={hint} aria-pressed={ultrawide ? ultraPreset === ULTRA_IDS[i] : activePreset === i}
                      onClick={() => { resetCopy(); setRatioW(w); setRatioH(h); if (ultrawide) setUltraPreset(ULTRA_IDS[i]!); }}
                      className={`${ultrawide && i === 0 ? "col-span-2 mb-2 border-b" : ""} group flex flex-col items-center gap-0.5 rounded-lg border border-transparent py-1.5 text-muted-foreground transition-colors hover:border-border hover:text-foreground aria-pressed:border-primary/40 aria-pressed:bg-accent aria-pressed:text-accent-foreground`}>
                      <Thumb w={+w} h={+h} active={ultrawide ? ultraPreset === ULTRA_IDS[i] : activePreset === i} />
                      <span className="num text-xs font-medium">{ultrawide ? hint : `${w}:${h}`}</span>
                      {!ultrawide && <span className="preset-label">{hint}</span>}
                      {ultrawide && <span className="text-xs">{i === 0 ? "Mathematical ratio · no source size" : `${w}:${h} exact ratio`}</span>}
                    </button>
                  ))}
                </div>
                {ultrawide ? <p className="mt-4 text-sm" data-testid="locked-ratio">Locked ratio <strong className="num">{ratioW}:{ratioH}</strong> · {ultraPreset === "strict" ? "Mathematical 21:9" : "Actual pixel ratio"}</p> : <div className="mt-4 flex items-start gap-2">
                  <Field id="rw" label="Ratio W" value={ratioW} onChange={touch(setRatioW)} error={err(pRW)} />
                  <span className="mt-9 font-display text-xl font-bold text-muted-foreground" aria-hidden>:</span>
                  <Field id="rh" label="Ratio H" value={ratioH} onChange={touch(setRatioH)} error={err(pRH)} />
                </div>}
                {ultrawide && originalSize && <button type="button" className="my-3 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-accent" onClick={() => { resetCopy(); setKnown(originalSize[side === "height" ? 0 : 1]); }}>Use original size <span className="num">{originalSize[0]} × {originalSize[1]}</span></button>}
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground" id="solve-lbl">I know the</span>
                  <div role="radiogroup" aria-labelledby="solve-lbl" className="seg">
                    <button role="radio" aria-checked={side === "height"} onClick={() => { resetCopy(); setSide("height"); }}>Width</button>
                    <button role="radio" aria-checked={side === "width"} onClick={() => { resetCopy(); setSide("width"); }}>Height</button>
                  </div>
                </div>
                <div className="mt-3">
                  <Field id="known" label={side === "height" ? "Width (px)" : "Height (px)"} value={known} onChange={touch(setKnown)} error={err(pK)} />
                </div>
              </div>
            ) : (
              <div>
              {mode === "resize" && <p className="mt-4 text-xs font-semibold text-muted-foreground">Original dimensions</p>}
              <div className="mt-4 flex items-start gap-2">
                <Field id="dw" label="Width (px)" value={dimW} onChange={touch(setDimW)} error={err(pDW)} />
                <span className="mt-9 font-display text-xl font-bold text-muted-foreground" aria-hidden>×</span>
                <Field id="dh" label="Height (px)" value={dimH} onChange={touch(setDimH)} error={err(pDH)} />
              </div>
              {mode === "resize" && <div className="my-3">
                <div role="radiogroup" aria-label="Target dimension" className="seg mb-3">
                  <button role="radio" aria-checked={side === "height"} onClick={() => {resetCopy(); setSide("height");}}>Target width</button>
                  <button role="radio" aria-checked={side === "width"} onClick={() => {resetCopy(); setSide("width");}}>Target height</button>
                </div>
                <Field id="target" label={side === "height" ? "Target width (px)" : "Target height (px)"} value={known} onChange={touch(setKnown)} error={err(pK)} />
              </div>}
              {mode === "ratio" && <button type="button" disabled={!pDW.ok || !pDH.ok} onClick={useRatio} className="mb-4 rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Use this ratio → Find size</button>}
              </div>
            )}

            {result?.kind === "solve" && !ultrawide && <button type="button" onClick={useSize} disabled={!transferable} className="mb-3 text-xs underline underline-offset-4 disabled:opacity-40">Use result → Find ratio</button>}
            </div>
            {/* Result */}
            <div className="calculator-result mt-2 rounded-xl bg-stage p-4 text-foreground" aria-live="polite">
              <div className="flex flex-col items-start gap-3">
                <div className="min-w-0">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-signal">
                    {result ? (result.kind === "solve" ? (result.exact ? `${side === "height" ? "Height" : "Width"} · exact` : `${side === "height" ? "Height" : "Width"} · rounded px`) : (result.center.startsWith("Near ") ? "Approximate ratio" : "Simplified ratio")) : "Result"}
                  </p>
                  <div ref={resultRef} data-testid="result-value" className="num mt-2 break-words text-2xl font-bold leading-tight sm:text-3xl">
                    {result ? (result.kind === "solve" ? (result.subpixel ? "Below 1 px" : `${result.copy} px`) : (result.center.startsWith("Near ") ? result.center : `${result.a}:${result.b}`)) : "—"}
                  </div>
                </div>
                <button type="button" onClick={copy} disabled={!copyAllowed}
                  aria-label={copyAllowed && result ? `Copy ${result.copy}` : "Copy unavailable"}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-semibold text-background transition hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-stage disabled:cursor-not-allowed disabled:opacity-40">
                  {copyState === "ok" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copyState === "ok" ? "Copied" : "Copy"}
                </button>
              </div>
              {result?.kind === "solve" && (
                <p className="num mt-3 text-sm opacity-90">
                  {result.exact ? "Whole pixels — no rounding needed." : "Rounded to the nearest whole pixel."}
                  
                </p>
              )}
              {result?.kind === "solve" && result.subpixel && <p role="alert" className="mt-2 text-sm text-signal">Both dimensions must be at least 1 px. Increase the known dimension to copy a usable size.</p>}
              {result?.kind === "ratio" && (
                <p className="num mt-3 text-sm opacity-90">
                  {result.center.startsWith("Near ") ? "Not exact. Copy uses the exact ratio in precision detail." : `${compactDecimal(result.dec)}:1`}
                </p>
              )}
              {!result && <p className="mt-3 text-sm opacity-70">Fix the highlighted fields to see a result.</p>}
              {copyState === "fail" && (
                <div role="alert" className="mt-2 text-sm text-signal"><p>Couldn’t access the clipboard. Select and copy this value:</p><input aria-label="Copy result manually" readOnly value={result?.copy ?? ""} onFocus={e => e.target.select()} className="mt-2 w-full rounded border p-2 text-foreground bg-card" /></div>
              )}
              {result && (
                <details className="group mt-3 border-t border-stage-line pt-2 text-sm">
                  <summary className="flex cursor-pointer list-none items-center gap-1 opacity-80 hover:opacity-100">
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" /> Precision detail
                  </summary>
                  <dl className="num mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 opacity-90">
                    {result.kind === "solve" ? <>
                      <dt className="opacity-60">Target ratio</dt><dd className="break-all">{result.targetRatio}</dd>
                      <dt className="opacity-60">Exact {side}</dt><dd className="break-all">{result.out.n.toString()}/{result.out.d.toString()} px</dd>
                      <dt className="opacity-60">Decimal</dt><dd className="break-all">{decimalString(result.out)} px</dd>
                      <dt className="opacity-60">Rounded</dt><dd>{fmtInt(result.rounded)} px (half up)</dd>
                    </> : <>
                      <dt className="opacity-60">Exact ratio</dt><dd className="break-all">{result.a.toString()}:{result.b.toString()}</dd>
                      <dt className="opacity-60">Decimal</dt><dd className="break-all">{decimalString(result.dec)}:1</dd>
                    </>}
                  </dl>
                  <p className="mt-2 text-xs opacity-70">Parentheses mark repeating digits; … marks a truncated decimal. Fractions are exact.</p>
                </details>
              )}
            </div>
          </div>

          {/* Canvas */}
          {!media && <div className="calculator-canvas order-1 flex flex-col lg:order-1">
            <div className="canvas-viewport">
              <RatioCanvas ratio={preview} widthLabel={result?.wLabel ?? ""} heightLabel={result?.hLabel ?? ""}
                centerLabel={result?.center ?? ""} onDrag={ultrawide || mode === "resize" ? undefined : onDrag} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{ultrawide || mode === "resize" ? "Ratio stays locked to your selection. Change the known dimension to scale." : "Drag the corner dot or use arrow keys. Near means a similar common ratio, not an exact match. Exact values are in precision detail."}</p>
          </div>}
        </section>
        </ToolsShell>

        
        {ultrawide && <section className="mt-10 space-y-4" aria-labelledby="real-ratios">
          <h2 id="real-ratios" className="font-display text-2xl font-bold">21:9 is a category, not every screen’s exact ratio</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">3440 × 1440 reduces to 43:18. Scaling it to 1720 pixels wide gives 720 pixels high. Strict 21:9 at 3440 wide gives approximately 1474.29 pixels high instead of 1440.</p>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Resolution</th><th>Exact ratio</th><th>Half-size example</th></tr></thead><tbody>{[["3440 × 1440","43:18","1720 × 720"],["2560 × 1080","64:27","1280 × 540"],["3840 × 1600","12:5","1920 × 800"],["5120 × 2160","64:27","2560 × 1080"]].map(row=><tr key={row[0]} className="border-t">{row.map(cell=><td key={cell} className="p-3 num">{cell}</td>)}</tr>)}</tbody></table></div>
          <p className="text-sm text-muted-foreground">Select a screen above, choose the side you know, then enter its new size. Selecting a different screen keeps your input and changes only the ratio. Rounded pixels may slightly change the final shape. This tool calculates dimensions; it does not change display settings or resize files.</p>
          <Link className="inline-block text-sm underline" to="/">Aspect ratio calculator — find the ratio of any other resolution</Link>
        </section>}
        <section className="mt-14 grid gap-10 md:grid-cols-2" aria-labelledby="how">
          <div>
            <h2 id="how" className="font-display text-2xl font-bold tracking-tight">How to use it</h2>
            <ol className="mt-4 space-y-3 text-sm">
              {(media ? [
                [media === "image" ? "Choose an image" : "Enter dimensions", media === "image" ? "Read a local image, or type its original width and height." : "Enter the video’s pixel width and height."],
                ["Compare", "Fit keeps the whole frame. Fill previews a centered crop."],
                ["Scale", "Open Calculate or scale dimensions to find a new size or copy an exact ratio."],
              ] : ultrawide ? [
                ["Choose a screen", "Select actual pixel dimensions or strict 21:9. The ratio stays locked."],
                ["Scale", "Choose the side you know and enter its new size."],
                ["Copy", "Copy the dimensions. Expand precision detail when the result is rounded."],
              ] : [
                ["Find size", "Pick a preset or type a ratio, choose the side you know, enter it. Decimals like 2.39:1 work."],
                ["Find ratio", "Enter dimensions, then use the exact ratio in Find size."],
                ["Resize", "Enter original dimensions and a target width or height."],
                ["Copy", "Copy the dimensions or ratio. Expand precision detail for exact values."],
              ]).map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{i + 1}</span>
                  <span><strong className="font-semibold">{t}.</strong> <span className="text-muted-foreground">{d}</span></span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">This tool calculates numbers only — it doesn’t resize or crop files.</p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">{ultrawide ? "Ultrawide examples" : "Examples"}</h2>
            <ul className="mt-4 divide-y text-sm">
              {(media === "image" ? [
                ["Photo 6000 × 4000", "3:2"], ["Portrait 3000 × 4000", "3:4"], ["Square 1080 × 1080", "1:1"], ["Portrait post 1080 × 1350", "4:5"],
              ] : media === "video" ? [
                ["Full HD 1920 × 1080", "16:9"], ["Vertical 1080 × 1920", "9:16"], ["4K 3840 × 2160", "16:9"], ["HD video → vertical Fill", "32% visible"],
              ] : ultrawide ? [
                ["3440 × 1440 → half size", "1720 × 720"],
                ["2560 × 1080 → half size", "1280 × 540"],
                ["3840 × 1600 → half size", "1920 × 800"],
                ["5120 × 2160 → half size", "2560 × 1080"],
                ["Strict 21:9 at 3440 wide", "3440 × 1474 px (rounded)"],
              ] : [
                ["16:9 at 1920 wide", "1920 × 1080"],
                ["9:16 at 1080 wide", "1080 × 1920"],
                ["16:9 at 1001 wide", "1001 × 563 px (rounded)"],
                ["3440 × 1440 ultrawide", "43:18 (not exactly 21:9)"],
                ["2560 × 1080", "64:27"],
              ]).map(([a, b]) => (
                <li key={a} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span className="text-muted-foreground">{!media && !ultrawide && a?.includes("ultrawide") ? <Link to="/ultrawide-aspect-ratio-calculator" className="underline underline-offset-4">{a}</Link> : a}</span>
                  <span className="num text-right font-medium">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <nav aria-label="Related calculators" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t pt-5 text-sm">
          {media ? <Link to="/" className="underline underline-offset-4">Aspect ratio calculator — find or scale dimensions</Link> : !ultrawide && <Link to="/image-aspect-ratio" className="underline underline-offset-4">Image aspect ratio — check a local photo</Link>}
          {media !== "video" && <Link to="/video-aspect-ratio" className="underline underline-offset-4">Video aspect ratio — compare screen fit</Link>}
          {media === "video" && <Link to="/image-aspect-ratio" className="underline underline-offset-4">Image aspect ratio — check a local photo</Link>}
        </nav>
      </main>
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
      {children}
    </button>
  );
}
