"use client";

import { useEffect, useState, useRef } from "react";

type Item = { hints?: string[]; folder: string; image: string };

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

function extractSignificantWords(s: string) {
  const stop = new Set(["cathedral", "anglican", "st"]);
  return normalize(s)
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w && !stop.has(w));
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [current, setCurrent] = useState<Item | null>(null);
  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState(false);
  const [incorrect, setIncorrect] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const hintTimerRef = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/cathedrals")
      .then((r) => r.json())
      .then((data: Item[]) => {
        setItems(data);
        if (data.length) setCurrent(data[Math.floor(Math.random() * data.length)]);
      });
  }, []);

  function pickNew(exclude?: Item | null) {
    if (!items.length) return;
    let candidate: Item | null = null;
    if (items.length === 1) candidate = items[0];
    else {
      while (!candidate) {
        const c = items[Math.floor(Math.random() * items.length)];
        if (!exclude || c.image !== exclude.image) candidate = c;
      }
    }
    setCurrent(candidate);
    setCorrect(false);
    setIncorrect(false);
    setRevealed(null);
    setInput("");
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current as unknown as number);
      hintTimerRef.current = null;
    }
    setHintVisible(false);
    setHintText(null);
  }

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!current) return;
    const guessWords = extractSignificantWords(input);
    const targetWords = extractSignificantWords(current.folder);
    const isCorrect = guessWords.some((g) => targetWords.includes(g));
    if (isCorrect) {
      setCorrect(true);
      setCorrectCount((c) => c + 1);
      setTimeout(() => pickNew(current), 900);
    } else {
      setIncorrect(true);
      setIncorrectCount((c) => c + 1);
    }
  }

  function handleHint() {
    if (!current) return;
    const list = (current.hints || []).filter(Boolean);
    const chosen = list.length ? list[Math.floor(Math.random() * list.length)] : "No hint available";
    setHintText(chosen);
    setHintVisible(true);
    setHintsUsedCount((c) => c + 1);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current as unknown as number);
      hintTimerRef.current = null;
    }
    const id = window.setTimeout(() => {
      setHintVisible(false);
      setHintText(null);
      hintTimerRef.current = null;
    }, 3000);
    hintTimerRef.current = id as unknown as number;
  }

  return (
    <div className="container">
      {current ? (
        <>
          <div className="game-card">
            <div className="image-wrap">
              <img src={current.image} alt="cathedral" className="cathedral-img" />
            </div>

            <div className="card-actions">
              <div className="buttons">
                <button type="submit" form="guess-form" className="btn-submit" disabled={!!revealed}>
                  Submit
                </button>
                <button
                  type="button"
                  className="btn-reveal btn-reveal-bold"
                  onClick={() => {
                    if (!current) return;
                    if (hintTimerRef.current) {
                      clearTimeout(hintTimerRef.current as unknown as number);
                      hintTimerRef.current = null;
                    }
                    setHintVisible(false);
                    setHintText(null);
                    setRevealed(current.folder);
                    setSkippedCount((c) => c + 1);
                    const raw = typeof window !== "undefined" ? localStorage.getItem("revealDelaySeconds") : null;
                    const secs = raw ? Number(raw) : 3;
                    const ms = Number.isFinite(secs) && !Number.isNaN(secs) ? secs * 1000 : 3000;
                    setTimeout(() => pickNew(current), ms);
                  }}
                  disabled={!!revealed}
                >
                  Reveal
                </button>
                <button type="button" className="btn-reveal btn-hint" onClick={handleHint} disabled={!!hintVisible}>
                  Hint
                </button>
              </div>
            </div>
          </div>

          <div className="revealed-name" aria-hidden>
            {revealed && <span className="status-reveal">{revealed}</span>}
            {hintVisible && (
              <div className="hint-region">
                <span className="status-hint">{hintText ?? "No hint available"}</span>
              </div>
            )}
          </div>

          <form id="guess-form" onSubmit={handleSubmit} className="controls">
            <input
              placeholder="What Cathedral Is This?"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setIncorrect(false);
                setCorrect(false);
              }}
              className="guess-input"
              aria-label="Cathedral guess"
              disabled={!!revealed}
            />
          </form>

          <div className="stats">
            <div className="stat stat-correct">Correct: {correctCount}</div>
            <div className="stat stat-incorrect">Incorrect: {incorrectCount}</div>
            <div className="stat stat-hint">Hints: {hintsUsedCount}</div>
            <div className="stat stat-skip">Skipped: {skippedCount}</div>
          </div>

          <div className="status">
            {correct && <span className="status-correct">Correct</span>}
            {incorrect && <span className="status-incorrect">Incorrect</span>}
          </div>
        </>
      ) : (
        <div className="loading">Loading…</div>
      )}
    </div>
  );
}
