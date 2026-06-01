import App from "@/components/brutalist/app";

// `App` is a Client Component ("use client"), but rendering it from this
// Server Component means Next.js server-renders its markup (hero copy,
// experience, skills, projects, manifesto, etc.) into the initial HTML for
// SEO / link previews, then hydrates it on the client. All interactive bits
// (WebGL, GSAP, live time, GitHub data) initialise to stable defaults and
// only update inside effects, so there are no hydration mismatches.
export default function Page() {
  return <App />;
}
