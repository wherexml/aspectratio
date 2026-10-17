import { useEffect, useRef, useState } from "react";
import { approxNumber, parsePositive, simplifyRatio } from "@/lib/ratio";

type Props = { kind: "image" | "video"; width: string; height: string; onDimensions: (w: string, h: string) => void };
type Loaded = { url: string; name: string; width: number; height: number };

export function MediaPreview({ kind, width, height, onDimensions }: Props) {
  const [fit, setFit] = useState<"contain" | "cover">("contain");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const urls = useRef(new Set<string>());
  const pw = parsePositive(width), ph = parsePositive(height);
  const ratio = pw.ok && ph.ok ? approxNumber(pw.value) / approxNumber(ph.value) : null;
  const image = loaded && Number(width) === loaded.width && Number(height) === loaded.height ? loaded : null;

  useEffect(() => () => {
    generation.current++;
    urls.current.forEach(url => URL.revokeObjectURL(url));
    urls.current.clear();
  }, []);
  useEffect(() => () => { if (loaded) { URL.revokeObjectURL(loaded.url); urls.current.delete(loaded.url); } }, [loaded]);

  async function readFile(file?: File) {
    if (!file) return;
    const id = ++generation.current;
    setError(""); setLoaded(null); setBusy(false);
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type)) {
      setError("Choose a JPG, PNG, WebP, GIF or AVIF image."); return;
    }
    if (file.size > 20 * 1024 * 1024) { setError("Choose an image smaller than 20 MB."); return; }
    const url = URL.createObjectURL(file); urls.current.add(url); setBusy(true);
    try {
      const img = new Image(); img.src = url;
      await img.decode();
      if (id !== generation.current) { URL.revokeObjectURL(url); urls.current.delete(url); return; }
      if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 50_000_000) throw new Error("size");
      onDimensions(String(img.naturalWidth), String(img.naturalHeight));
      setLoaded({url, name:file.name, width:img.naturalWidth, height:img.naturalHeight});
    } catch (e) {
      URL.revokeObjectURL(url); urls.current.delete(url);
      if (id === generation.current) setError(e instanceof Error && e.message === "size" ? "Choose an image up to 50 megapixels." : "This image could not be read. Try another file.");
    } finally { if (id === generation.current) setBusy(false); }
  }

  const frames: [number, number, string][] = kind === "image"
    ? [[1,1,"Square"],[4,5,"Portrait post"],[9,16,"Story"],[16,9,"Widescreen"]]
    : [[16,9,"Widescreen display"],[9,16,"Vertical phone"]];

  return <section aria-labelledby="media-heading" className="mt-10 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="media-heading" className="font-display text-2xl font-bold">{kind === "image" ? "Image fit & crop preview" : "Video screen simulator"}</h2>
      <div role="radiogroup" aria-label="Frame fitting" className="seg">
        <button role="radio" aria-checked={fit === "contain"} onClick={() => setFit("contain")}>Fit · keep all</button>
        <button role="radio" aria-checked={fit === "cover"} onClick={() => setFit("cover")}>Fill · crop</button>
      </div>
    </div>
    {kind === "image" && <div className="mp-drop" onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); void readFile(e.dataTransfer.files[0]);}}>
      <label className="block text-sm font-semibold" htmlFor="image-file">Drop an image here, or choose a file</label>
      <input id="image-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border file:bg-card file:px-3 file:py-2" onChange={e => {void readFile(e.target.files?.[0]); e.target.value = "";}} />
      <p className="mt-2 text-xs text-muted-foreground">Read locally in your browser · up to 20 MB / 50 MP · animated images may show motion.</p>
      {busy && <p role="status" className="mt-2 text-sm">Reading image…</p>}
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      {loaded && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><span className="break-all">{loaded.name} · {loaded.width} × {loaded.height}</span><button className="underline" onClick={() => {generation.current++; setLoaded(null); setBusy(false);}}>Remove image</button></div>}
      {loaded && !image && <p className="mt-2 text-xs text-muted-foreground">Dimensions changed. The frames below use a diagram instead of your image.</p>}
    </div>}
    <div className="flex flex-wrap items-start gap-4" aria-label="Source dimensions">
      <label className="min-w-0 flex-1 text-sm">Width (px)<input className="field mt-2" inputMode="decimal" value={width} onChange={e=>onDimensions(e.target.value,height)} aria-label="Source width" aria-invalid={!pw.ok} /></label>
      <label className="min-w-0 flex-1 text-sm">Height (px)<input className="field mt-2" inputMode="decimal" value={height} onChange={e=>onDimensions(width,e.target.value)} aria-label="Source height" aria-invalid={!ph.ok} /></label>
      <div className="min-w-32 text-sm">Exact ratio<p className="num mt-2 break-all text-2xl font-bold text-primary">{pw.ok && ph.ok ? simplifyRatio(pw.value,ph.value).join(":") : "—"}</p></div>
    </div>
    <p className="text-sm text-muted-foreground" data-testid="media-source">{ratio ? `${width} × ${height} px · ${ratio === 1 ? "Square" : ratio > 1 ? "Landscape" : "Portrait"}` : "Enter valid dimensions to preview."}</p>
    <div className={`grid gap-4 ${kind === "image" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
      {frames.map(([w,h,name]) => {
        const target = w/h;
        const visible = ratio ? Math.min(ratio/target,target/ratio)*100 : 0;
        const isWide = ratio !== null && ratio > target;
        const cw = !ratio || (fit === "contain" ? isWide : !isWide) ? 100 : ratio/target*100;
        const ch = !ratio || (fit === "contain" ? !isWide : isWide) ? 100 : target/ratio*100;
        const device = kind === "video" ? (target < 1 ? "phone" : "monitor") : "plain";
        const base = device === "phone" ? 252 : device === "monitor" ? 400 : 232;
        const exact = pw.ok && ph.ok && pw.value.n * ph.value.d * BigInt(h) === ph.value.n * pw.value.d * BigInt(w);
        const empty = ratio && !exact && fit === "contain";
        const emptyPercent = (100 - (isWide ? ch : cw)) / 2;
        const summary = !ratio ? "No preview" : exact ? "Exact fit · no empty space or crop"
          : fit === "contain" ? `Whole ${kind} visible · ${isWide ? "space above & below" : "space on both sides"}`
          : `Fills screen · ${isWide ? "left & right" : "top & bottom"} cropped`;
        const detail = !ratio ? "Enter valid source dimensions."
          : exact ? "Source and frame have the same ratio."
          : fit === "contain" ? `No cropping · ${Math.min(99.9, visible).toFixed(1)}% of frame covered`
          : `${Math.min(99.9, visible).toFixed(1)}% of source area visible`;
        return <article key={name} className={`mp-card ${kind === "video" ? "mp-card--video" : "mp-card--image"}`} aria-label={`${name} ${w}:${h}`}>
          <header className="mp-card-head">
            <h3 className="text-sm font-semibold">{kind === "video" ? (target < 1 ? "Same video on a vertical phone" : "On a widescreen display") : name}</h3>
            <span className="mp-chip num">{w}:{h}</span>
          </header>
          <div className="mp-stage">
            <div className={`mp-device mp-device--${device}`} style={{maxWidth:"100%"}}>
              <div className="mp-frame" data-fit={fit} style={{width:Math.min(base,base*target),aspectRatio:`${w}/${h}`,maxWidth:"100%"}}>
                <div className="mp-screen" aria-label={`${w}:${h} frame: ${summary}`}>
                  {empty && [0, 1].map(side => <div key={side} className="mp-empty" aria-hidden="true" style={isWide
                    ? {left:0, right:0, height:`${emptyPercent}%`, ...(side ? {bottom:0} : {top:0})}
                    : {top:0, bottom:0, width:`${emptyPercent}%`, ...(side ? {right:0} : {left:0})}}>
                    {emptyPercent > 15 && <span>Empty space</span>}
                  </div>)}
                  {ratio && (image
                    ? <img src={image.url} alt={`${name} preview of ${image.name}`} title={`${fit === "contain" ? "Fit" : "Center crop"} to ${w}:${h}`} className="absolute inset-0 h-full w-full" style={{objectFit:fit}} />
                    : <div className="mp-source" style={{width:`${cw}%`,height:`${ch}%`}}>
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                          <path className="mp-thirds" d="M33.333 0V100M66.667 0V100M0 33.333H100M0 66.667H100" />
                          <path className="mp-diag" d="M0 0L100 100M100 0L0 100" />
                        </svg>
                        <span>Your {kind}</span>
                      </div>)}
                </div>
                
              </div>
            </div>
          </div>
          <div className="mp-readout">
            <p className="text-sm font-semibold">{summary}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
        </article>;
      })}
    </div>
    {kind === "video" && <p className="text-xs text-muted-foreground">Uses pixel dimensions with square pixels. No video upload or transcoding.</p>}
  </section>;
}
