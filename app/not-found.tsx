/* Gridline Velocity: the fallback keeps the portfolio’s carbon, paper, and signal-red visual language. */
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "var(--pad-x)", background: "var(--bg)", color: "var(--fg)" }}>
      <section style={{ maxWidth: 680, width: "100%", borderTop: "1px solid var(--hairline)", paddingTop: 22 }}>
        <p className="eyebrow"><span className="red">[ ROUTE.NOT_FOUND ]</span></p>
        <h1 className="d-section" style={{ marginTop: 12 }}>Wrong<br /><span className="red">turn.</span></h1>
        <p className="body-l" style={{ marginTop: 20, maxWidth: "44ch" }}>That endpoint is not on the map. The portfolio route remains online.</p>
        <Link href="/" className="hero-btn hero-btn-primary" style={{ display: "inline-flex", marginTop: 30 }}>
          <span>RETURN HOME</span>
        </Link>
      </section>
    </main>
  );
}
