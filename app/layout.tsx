import "./globals.css";
import RevealSlider from "./components/RevealSlider";

export const metadata = {
  title: "Cathedral Guesser",
  description: "Guess the cathedral from the image",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col">
        <nav className="site-nav">
          <div className="nav-inner">
            <a className="nav-link nav-left" href="https://github.com/GeorgeCStephens/cathedral-guesser" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg className="nav-github" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path fillRule="evenodd" clipRule="evenodd" d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.93 3.19 9.11 7.61 10.58.56.1.76-.24.76-.54 0-.27-.01-1.01-.02-1.98-3.09.67-3.74-1.49-3.74-1.49-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1 1.67.75 2.07 1.02.06-.8.39-1.35.71-1.66-2.47-.28-5.07-1.23-5.07-5.47 0-1.21.43-2.2 1.14-2.98-.12-.28-.5-1.4.11-2.92 0 0 .93-.3 3.05 1.13.89-.25 1.84-.38 2.79-.39.95.01 1.9.14 2.79.39 2.12-1.43 3.05-1.13 3.05-1.13.61 1.52.23 2.64.11 2.92.71.78 1.14 1.77 1.14 2.98 0 4.25-2.61 5.19-5.09 5.46.4.35.75 1.04.75 2.1 0 1.52-.01 2.75-.01 3.12 0 .3.2.66.77.55C19.06 20.86 22.25 16.68 22.25 11.75 22.25 5.48 17.27.5 12 .5z" fill="currentColor"/>
              </svg>
            </a>
            <div className="nav-title">Cathedral Guesser</div>
            <div className="nav-right">
              <RevealSlider />
            </div>
          </div>
        </nav>
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
