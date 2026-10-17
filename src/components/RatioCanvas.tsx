import { useEffect, useRef } from "react";

const VW = 480;
const VH = 340;
const MAXW = 380;
const MAXH = 240;
const CX = VW / 2;
const CY = VH / 2 + 6;

type Props = {
  ratio: number | null; // width / height
  widthLabel: string;
  heightLabel: string;
  centerLabel: string;
  onDrag?: ((ratio: number) => void) | undefined;
};

export function RatioCanvas({ ratio, widthLabel, heightLabel, centerLabel, onDrag }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const frame = useRef<number | null>(null);
  const pending = useRef<number | null>(null);
  const latest = useRef(onDrag);
  latest.current = onDrag;
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  const finish = () => {
    dragging.current = false;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (pending.current !== null) latest.current?.(pending.current);
    pending.current = null;
  };
  const r = ratio && isFinite(ratio) ? Math.min(Math.max(ratio, 0.05), 20) : null;

  const limited = ratio !== null && (ratio < 0.05 || ratio > 20);
  let w = MAXW, h = MAXH;
  if (r) {
    if (r > MAXW / MAXH) { w = MAXW; h = MAXW / r; } else { h = MAXH; w = MAXH * r; }
  }
  const x = CX - w / 2, y = CY - h / 2;

  const fromPointer = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    const px = point.x, py = point.y;
    const hw = Math.max(8, Math.abs(px - CX));
    const hh = Math.max(8, Math.abs(py - CY));
    pending.current = Math.min(20, Math.max(0.05, hw / hh));
    if (frame.current === null) frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (pending.current !== null) latest.current?.(pending.current);
      pending.current = null;
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!r) return;
    const step = e.shiftKey ? 1.1 : 1.02;
    const map: Record<string, number> = { ArrowRight: step, ArrowUp: 1 / step, ArrowLeft: 1 / step, ArrowDown: step };
    if (map[e.key]) {
      e.preventDefault();
      // Right/Down widen, Left/Up narrow
      onDrag?.(e.key === "ArrowRight" || e.key === "ArrowDown" ? r * step : r / step);
    }
  };

  const s = { transition: "none" } as const;

  return (
    <div className="stage-grid relative h-full overflow-hidden rounded-2xl">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="h-full w-full touch-none select-none"
        role="img"
        aria-label={r ? `Preview frame, ${centerLabel}` : "Preview unavailable until inputs are valid"}
        onPointerMove={(e) => dragging.current && fromPointer(e)}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {r ? (
          <>
            {/* rulers */}
            <g className="text-signal" stroke="currentColor" strokeWidth="1">
              <line style={s} x1={x} x2={x + w} y1={y - 16} y2={y - 16} />
              <line style={s} x1={x} x2={x} y1={y - 21} y2={y - 11} />
              <line style={s} x1={x + w} x2={x + w} y1={y - 21} y2={y - 11} />
              <line style={s} x1={x - 16} x2={x - 16} y1={y} y2={y + h} />
              <line style={s} x1={x - 21} x2={x - 11} y1={y} y2={y} />
              <line style={s} x1={x - 21} x2={x - 11} y1={y + h} y2={y + h} />
            </g>
            <rect style={s} x={x} y={y} width={w} height={h} className="fill-frame-fill stroke-frame" strokeWidth="2" rx="3" />
            <line style={s} x1={x} y1={y} x2={x + w} y2={y + h} className="stroke-frame" strokeOpacity="0.35" strokeDasharray="3 5" />
            <line style={s} x1={x + w} y1={y} x2={x} y2={y + h} className="stroke-frame" strokeOpacity="0.35" strokeDasharray="3 5" />
            <text style={s} x={CX} y={y - 24} textAnchor="middle" className="num fill-signal" fontSize="13">{widthLabel}</text>
            <text style={s} x={x - 26} y={CY} textAnchor="middle" className="num fill-signal" fontSize="13" transform={`rotate(-90 ${x - 26} ${CY})`}>{heightLabel}</text>
            <text x={CX} y={CY + 9} textAnchor="middle" className="fill-frame" fontSize="28" fontWeight="700" style={{ fontFamily: "var(--font-display)" }}>{centerLabel}</text>
            {/* drag handle */}
            {onDrag && <g
              tabIndex={0}
              role="slider"
              aria-label="Drag to reshape the frame"
              aria-valuetext={centerLabel}
              aria-valuenow={Math.round(r * 100) / 100}
              aria-valuemin={0.05}
              aria-valuemax={20}
              onKeyDown={onKey}
              onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }}
              className="cursor-nwse-resize outline-none [&:focus-visible>circle:first-child]:stroke-signal"
            >
              <circle style={s} cx={x + w} cy={y + h} r="16" className="fill-transparent" stroke="transparent" strokeWidth="2" />
              <circle style={s} cx={x + w} cy={y + h} r="7" className="fill-frame stroke-stage" strokeWidth="3" />
            </g>}
          </>
        ) : (
          <rect x={CX - 120} y={CY - 70} width="240" height="140" rx="4" fill="none" className="stroke-stage-line" strokeWidth="2" strokeDasharray="6 6" />
        )}
      </svg>
      {limited && <p role="status" className="absolute bottom-2 left-3 right-3 rounded bg-stage p-2 text-center text-xs text-signal">Preview compressed for visibility. Calculations use the exact ratio.</p>}
    </div>
  );
}
