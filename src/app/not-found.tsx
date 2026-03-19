import Link from "next/link";
import { Geist_Mono, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import "@/styles/tron-style.css";

// This page renders when a route like `/unknown.txt` is requested.
// In this case, the [locale]/layout.tsx receives an invalid locale
// and calls `notFound()`, or when no route at all matches.
// Must include <html> and <body> since the root layout is minimal.

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const themeInitScript = `
(function() {
  try {
    var themes = ['tron','ares','clu','athena','aphrodite','poseidon'];
    var intensities = ['none','light','medium','heavy'];
    var theme = localStorage.getItem('project-ares-theme');
    var intensity = localStorage.getItem('project-ares-theme-intensity');
    theme = themes.indexOf(theme) > -1 ? theme : 'tron';
    intensity = intensities.indexOf(intensity) > -1 ? intensity : 'medium';
    document.documentElement.setAttribute('data-theme', theme);
    if (intensity !== 'none') {
      document.documentElement.setAttribute('data-tron-intensity', intensity);
    }
  } catch(e) {}
})();
`;

export default function NotFound() {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${rajdhani.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
          <div className="mb-6 font-mono text-[10px] tracking-widest text-foreground/50">
            [ SIGNAL LOST ]
          </div>
          <h1 className="font-display text-6xl font-bold tracking-wider text-primary md:text-8xl [text-shadow:0_0_40px_oklch(from_var(--primary)_l_c_h/0.4)]">
            404
          </h1>
          <p className="mt-4 font-display text-lg tracking-wider text-foreground/80">
            This sector does not exist on The Grid
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="border border-primary/30 bg-primary/10 px-6 py-2 font-mono text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
