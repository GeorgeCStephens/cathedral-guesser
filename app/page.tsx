"use client";

import { useEffect, useState, useRef } from "react";

type Item = { id: string; hints?: string[]; folder: string; images: string[] };

const STORAGE_KEY = "cathedralGuesserShown";

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
  const [imageIndex, setImageIndex] = useState(0);
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
  const [shown, setShown] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const hintTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const initialShown = raw ? JSON.parse(raw) : [];

    fetch("/api/cathedrals")
      .then((r) => r.json())
      .then((data: Item[]) => {
        setItems(data);
        const normalizedShown = Array.isArray(initialShown) ? initialShown : [];
        setShown(normalizedShown);

        if (!data.length) return;

        const remaining = data.filter((item) => !normalizedShown.includes(item.id));
        const first = remaining.length
          ? remaining[Math.floor(Math.random() * remaining.length)]
          : data[0];

        setCurrent(first);
        setImageIndex(first.images.length ? Math.floor(Math.random() * first.images.length) : 0);
        if (remaining.length === 0) {
          setComplete(true);
        } else if (!normalizedShown.includes(first.id)) {
          setShown((prev) => [...prev, first.id]);
        }
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shown));
  }, [shown]);

  function pickNew(exclude?: Item | null, shownOverride?: string[]) {
    if (!items.length) return;
    const seen = shownOverride ?? shown;
    const remaining = items.filter((item) => !seen.includes(item.id));
    if (remaining.length === 0) {
      setComplete(true);
      return;
    }
    const pool = remaining.filter((item) => !exclude || item.id !== exclude.id);
    const candidate = pool.length ? pool[Math.floor(Math.random() * pool.length)] : remaining[0];
    setCurrent(candidate);
    setImageIndex(candidate.images.length ? Math.floor(Math.random() * candidate.images.length) : 0);
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
    if (!seen.includes(candidate.id)) {
      setShown((prev) => {
        const next = shownOverride ? [...shownOverride, candidate.id] : [...prev, candidate.id];
        if (next.length === items.length) {
          setComplete(true);
        }
        return next;
      });
    }
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
      setRevealed(current.folder);
      if (!shown.includes(current.id)) {
        const nextShown = [...shown, current.id];
        setShown(nextShown);
        if (nextShown.length === items.length) {
          setComplete(true);
        }
        setTimeout(() => pickNew(current, nextShown), 900);
      } else {
        setTimeout(() => pickNew(current), 900);
      }
    }
  }

  function handleHint() {
    if (!current) return;
    const list = (current.hints || []).filter(Boolean);
    let chosen = "No hint available";
    if (list.length) {
      if (list.length === 1) {
        chosen = list[0];
      } else {
        const available = list.filter((hint) => hint !== hintText);
        chosen = available.length ? available[Math.floor(Math.random() * available.length)] : list[Math.floor(Math.random() * list.length)];
      }
    }
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

  function handlePlayAgain() {
    setShown([]);
    setComplete(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setHintsUsedCount(0);
    setSkippedCount(0);
    setCorrect(false);
    setIncorrect(false);
    setRevealed(null);
    setHintVisible(false);
    setHintText(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    if (items.length) {
      const first = items[Math.floor(Math.random() * items.length)];
      setCurrent(first);
      setImageIndex(first.images.length ? Math.floor(Math.random() * first.images.length) : 0);
      setShown([first.id]);
    }
  }

  return (
    <div className="container">
      {current ? (
        <>
          <div className="game-card">
            {complete && (
              <div className="quiz-complete banner">
                <div className="quiz-complete-text">Quiz Complete!</div>
                <div className="quiz-complete-subtext">
                  You’ve guessed all {items.length} cathedrals.
                </div>
                <button type="button" className="btn-submit btn-play-again" onClick={handlePlayAgain}>
                  Play Again
                </button>
              </div>
            )}

            <div className="image-wrap">
              {current.images.length > 1 && (
                <div className="image-navigation">
                  <button
                    type="button"
                    className="image-nav-button"
                    onClick={() => setImageIndex((prev) => (prev - 1 + current.images.length) % current.images.length)}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="image-nav-button"
                    onClick={() => setImageIndex((prev) => (prev + 1) % current.images.length)}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </div>
              )}
              <img src={current.images[imageIndex]} alt="cathedral" className="cathedral-img" />
            </div>

            {!complete && (
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
                      if (!shown.includes(current.id)) {
                        setShown((prev) => {
                          const next = [...prev, current.id];
                          if (next.length === items.length) {
                            setComplete(true);
                          }
                          return next;
                        });
                      }
                      const raw = typeof window !== "undefined" ? localStorage.getItem("revealDelaySeconds") : null;
                      const secs = raw ? Number(raw) : 3;
                      const ms = Number.isFinite(secs) && !Number.isNaN(secs) ? secs * 1000 : 3000;
                      setTimeout(() => pickNew(current), ms);
                    }}
                    disabled={!!revealed}
                  >
                    Reveal
                  </button>
                  <button type="button" className="btn-reveal btn-hint" onClick={handleHint}>
                    Hint
                  </button>
                </div>
              </div>
            )}
          </div>

          {!complete && (
            <>
              <div className="revealed-name" aria-hidden>
                {(revealed || incorrect) && <span className="status-reveal">{revealed ?? current?.folder}</span>}
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

              <div className="status">
                {correct && <span className="status-correct">Correct</span>}
                {incorrect && <span className="status-incorrect">Incorrect</span>}
              </div>
            </>
          )}

          <div className="stats">
            <div className="stat stat-correct">Correct: {correctCount}</div>
            <div className="stat stat-incorrect">Incorrect: {incorrectCount}</div>
            <div className="stat stat-hint">Hints: {hintsUsedCount}</div>
            <div className="stat stat-skip">Skipped: {skippedCount}</div>
          </div>

          <div className="remaining">Remaining cathedrals to guess: {Math.max(0, items.length - shown.length)}</div>
        </>
      ) : (
        <div className="loading">Loading…</div>
      )}
    </div>
  );
}
