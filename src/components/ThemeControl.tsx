import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Pref = "system" | "light" | "dark";
const KEY = "arc-theme";

function apply(pref: Pref) {
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export const themeInitScript = `(function(){try{var p=localStorage.getItem('${KEY}')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export function ThemeControl() {
  const [ready, setReady] = useState(false);
  const [pref, setPref] = useState<Pref>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Pref | null;
      if (saved === "light" || saved === "dark") setPref(saved);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    apply(pref);
    try { localStorage.setItem(KEY, pref); } catch {}
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => apply("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [pref, ready]);

  const opts: { v: Pref; label: string; Icon: typeof Sun }[] = [
    { v: "system", label: "System", Icon: Monitor },
    { v: "light", label: "Light", Icon: Sun },
    { v: "dark", label: "Dark", Icon: Moon },
  ];
  return (
    <div role="radiogroup" aria-label="Color theme" className="seg">
      {opts.map(({ v, label, Icon }) => (
        <button key={v} type="button" role="radio" aria-checked={pref === v} onClick={() => setPref(v)} title={label} className="flex items-center gap-1.5 !px-2.5">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only sm:not-sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
