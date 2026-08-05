"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "revealDelaySeconds";

export default function RevealSlider() {
  const [value, setValue] = useState<number>(3);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const n = Number(raw);
      if (!Number.isNaN(n)) setValue(n);
    } else {
      localStorage.setItem(STORAGE_KEY, String(3));
    }
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Math.round(Number(e.target.value));
    setValue(n);
    localStorage.setItem(STORAGE_KEY, String(n));
  }

  return (
    <div className="reveal-slider">
      <label className="reveal-slider-label">Reveal Delay Duration</label>
      <div className="reveal-slider-row">
        <input
          aria-label="Reveal delay seconds"
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={onChange}
          className="reveal-range"
        />
        <div className="reveal-value">{value}s</div>
      </div>
    </div>
  );
}
