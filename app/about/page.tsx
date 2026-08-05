import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Cathedral Guesser",
  description:
    "Learn how Cathedral Guesser helps you identify famous cathedrals with images, hints, and score tracking.",
};

export default function AboutPage() {
  return (
    <div className="container about-page">
      <h1>About Cathedral Guesser</h1>
      <p>
        Cathedral Guesser is a lightweight photography quiz designed to help history and
        architecture fans recognize famous cathedrals from around the world.
      </p>
      <section>
        <h2>How it works</h2>
        <p>
          The quiz displays one cathedral image at a time and offers a single text field for your guess.
          You can submit an answer, ask for a hint, or reveal the correct name immediately.
          Incorrect guesses show the cathedral name and the game automatically moves on to the next image.
        </p>
      </section>
      <section>
        <h2>Features</h2>
        <ul>
          <li>Random image selection of famous cathedral landmarks</li>
          <li>Hint support that shows helpful clues</li>
          <li>Reveal button for immediate answers</li>
          <li>Progress tracking with correct, incorrect, skipped, and remaining counts</li>
          <li>Session persistence so refresh keeps your current round intact</li>
        </ul>
      </section>
      <section>
        <h2>Why this site exists</h2>
        <p>
          The goal is to combine visual recognition practice with a simple, user-friendly quiz
          experience. Cathedral Guesser is perfect for travelers, students, and church history
          lovers who want to test their knowledge of iconic European and British cathedrals.
        </p>
      </section>
    </div>
  );
}
