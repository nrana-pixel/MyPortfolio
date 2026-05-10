"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { 
  Code2, 
  TerminalSquare, 
  Container, 
  Database, 
  Cloud, 
  Cpu, 
  ShieldCheck, 
  Wrench,
  Github,
  Globe
} from "lucide-react";

export default function PortfolioHome() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");
  const [isBooting, setIsBooting] = useState(true);
  const [bootText, setBootText] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    // Boot Sequence
    const sequence = [
      "INITIALIZING KERNEL...",
      "LOADING USER.APP...",
      "MOUNTING DATA VOLUMES...",
      "STARTING NETWORK INTERFACES... OK",
      "CONNECTING TO CLOUDFLARE EDGE... OK",
      "FETCHING USER PROFILE: NISHIT_RANA... OK",
      "DECRYPTING PORTFOLIO DATA... SUCCESS",
      "LAUNCHING SYSTEM UI..."
    ];
    
    let i = 0;
    const bootInterval = setInterval(() => {
      setBootText(prev => [...prev, sequence[i]]);
      i++;
      if (i >= sequence.length) {
        clearInterval(bootInterval);
        setTimeout(() => setIsBooting(false), 600);
      }
    }, 120);

    return () => {
      clearInterval(interval);
      clearInterval(bootInterval);
    };
  }, []);

  if (isBooting) {
    return (
      <main className="fixed inset-0 bg-[#0A0A0A] z-[99999] flex flex-col justify-end p-6 md:p-12 font-mono text-xs md:text-sm text-[#FF0000] uppercase pt-24 overflow-hidden">
        <div className="noise-overlay" />
        <div className="space-y-4 mb-24 max-w-2xl">
          {bootText.map((text, idx) => (
            <div key={idx}>{`> ${text}`}</div>
          ))}
          <div className="animate-pulse">{`> _`}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full overflow-hidden text-[#F5F5F5]">
      <div className="noise-overlay" />
      {/* Dot Matrix BG */}
      <div className="fixed inset-0 bg-dot-grid opacity-30 -z-10" />
      
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-12 border-b-[1px] border-white/20" id="hero">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-center">
          <div className="md:col-span-8 z-10">
            <div className="font-mono text-xs uppercase tracking-[0.3em] flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-8">
              <span className="text-[#FF0000]">[ SOFTWARE ENGINEER ]</span>
              {mounted && (
                <span className="text-[#F5F5F5]/60 animate-pulse">
                  SYSTEM.ONLINE — INDIA — {time}
                </span>
              )}
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-display text-[12vw] md:text-[9vw] leading-[0.85] tracking-tighter uppercase break-words glitch-hover"
            >
              NISHIT <br/> RANA.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-mono text-base md:text-lg mt-8 max-w-lg uppercase tracking-wider leading-relaxed border-l border-white/40 pl-6 mb-8"
            >
              Building scalable backend systems, edge <br/>
              platforms, and AI-driven workflows.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <a href="mailto:nrana4148@gmail.com" className="font-mono text-sm uppercase tracking-widest text-[#F5F5F5] hover:text-[#FF0000] transition-colors draw-underline">
                nrana4148@gmail.com
              </a>
              <span className="text-white/20 hidden sm:block">/</span>
              <a href="/resume.pdf" download="Nishit_Rana_Resume.pdf" className="font-mono text-sm uppercase tracking-widest text-[#F5F5F5] hover:text-[#FF0000] transition-colors flex items-center gap-2 group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="group-hover:translate-y-0.5 transition-transform">
                  <path d="M21 15v4h-18v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                DOWNLOAD RESUME
              </a>
            </motion.div>
          </div>
          <div className="md:col-span-4 relative h-[60vh] w-full mt-12 md:mt-0 flex justify-center items-center">
            {/* Tech stack orbit or brutalist shape */}
            <motion.div 
              initial={{ rotate: 10, scale: 0.9, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, type: "spring", stiffness: 50 }}
              className="relative w-full h-full flex justify-center items-center"
            >
               <div className="absolute inset-8 border border-white/20 border-dashed rounded-full animate-[spin_60s_linear_infinite]" />
               <div className="absolute inset-16 border border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
               <div className="w-32 h-32 bg-[#0A0A0A] border-[1px] border-[#FF0000] flex justify-center items-center glitch-hover">
                  <TerminalSquare className="w-12 h-12 text-[#FF0000]" />
               </div>
               <div className="absolute -bottom-6 -left-6 bg-[#0A0A0A] border-[1px] border-[#FF0000] text-[#FF0000] px-4 py-2 font-mono text-[10px] uppercase tracking-widest z-20">
                 FIG. 1 / INIT
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <section className="border-b-[1px] border-white/20 overflow-hidden whitespace-nowrap bg-[#F5F5F5] text-[#0A0A0A] py-3">
         <div className="animate-marquee flex gap-12 font-mono text-sm uppercase tracking-widest">
            <span>NODE.JS</span><span className="opacity-40">•</span>
            <span>PYTHON</span><span className="opacity-40">•</span>
            <span>TYPESCRIPT</span><span className="opacity-40">•</span>
            <span>DOCKER</span><span className="opacity-40">•</span>
            <span>KUBERNETES</span><span className="opacity-40">•</span>
            <span>CLOUDFLARE</span><span className="opacity-40">•</span>
            <span>VERTEX AI</span><span className="opacity-40">•</span>
            <span>NODE.JS</span><span className="opacity-40">•</span>
            <span>PYTHON</span><span className="opacity-40">•</span>
            <span>TYPESCRIPT</span><span className="opacity-40">•</span>
            <span>DOCKER</span><span className="opacity-40">•</span>
            <span>KUBERNETES</span><span className="opacity-40">•</span>
            <span>CLOUDFLARE</span><span className="opacity-40">•</span>
            <span>VERTEX AI</span><span className="opacity-40">•</span>
         </div>
      </section>

      {/* EXPERIENCE */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-[50vh] border-b-[1px] border-white/20" 
        id="experience"
      >
         <div className="grid grid-cols-1 md:grid-cols-12 bg-[#0A0A0A]">
            <div className="md:col-span-4 border-b-[1px] md:border-b-0 md:border-r-[1px] border-white/20 p-6 md:p-12 lg:p-24 relative overflow-hidden flex flex-col justify-center">
                 {/* Pattern overlay */}
                 <div className="absolute inset-0 bg-[#F5F5F5] opacity-[0.01] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,1)_25%,rgba(255,255,255,1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,1)_75%,rgba(255,255,255,1)_100%)] bg-[length:4px_4px]" />
                 <div className="relative z-10">
                   <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF0000] mb-12">
                      [ 01 / EXPERIENCE ]
                   </div>
                   <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tight text-[#F5F5F5] break-words">
                     Professional <br/> Background.
                   </h2>
                 </div>
            </div>
            <div className="md:col-span-8 p-6 md:p-12">
               <div className="border border-white/20 p-8 hover:bg-white/5 transition-colors cursor-crosshair group relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                 <div className="relative z-10">
                    <div className="flex justify-between items-start flex-col md:flex-row mb-6 mt-4 gap-4">
                       <div>
                          <h3 className="font-display text-3xl uppercase tracking-tight group-hover:text-[#FF0000] transition-colors">Backend Developer Intern</h3>
                          <p className="font-mono text-xs text-[#F5F5F5]/60 mt-2 tracking-widest">AUG 2024 — JAN 2025</p>
                       </div>
                    </div>
                    <ul className="font-mono text-base leading-relaxed tracking-wide space-y-4 text-[#F5F5F5]/80 list-disc pl-6 marker:text-[#FF0000]">
                       <li>Built scalable backend systems in Node.js and Python; developed and deployed REST APIs on production Linux servers with Nginx</li>
                       <li>Worked with n8n automation, Docker, Kubernetes, MongoDB, and RAG pipelines in a DevOps-oriented environment</li>
                    </ul>
                 </div>
               </div>
            </div>
         </div>
      </motion.section>

      {/* SKILLS */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="border-b-[1px] border-white/20" 
        id="skills"
      >
         <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[50vh]">
            <div className="lg:col-span-4 border-b-[1px] lg:border-b-0 lg:border-r-[1px] border-white/20 p-6 md:p-12 lg:p-24 flex flex-col justify-center bg-[#F5F5F5] text-[#0A0A0A]">
               <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF0000] mb-12">
                  [ 02 / CAPABILITIES ]
               </div>
               <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tight break-words">
                 Technical <br/> Arsenal.
               </h2>
            </div>
            <div className="lg:col-span-8">
               <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  {[
                     { name: "LANGUAGES", icon: Code2, items: "C/C++, Python, JavaScript, TypeScript, HTML, CSS" },
                     { name: "FRAMEWORKS", icon: Container, items: "Node.js, Express.js, Hono, Next.js, React, Vite, Django, EJS" },
                     { name: "DATABASES", icon: Database, items: "MongoDB, MySQL, Cloudflare D1 (SQLite)" },
                     { name: "CLOUD & INFRA", icon: Cloud, items: "Cloudflare Workers, KV, R2, Linux Server, Nginx, Docker, Kubernetes" },
                     { name: "AI & AGENTIC", icon: Cpu, items: "RAG Pipelines, MCP, Generative AI, Agentic AI, n8n, Google Vertex AI, Gemini API" },
                     { name: "SECURITY", icon: ShieldCheck, items: "JWT, bcrypt, AES-GCM, SHA-256, Web Crypto API" },
                     { name: "DEVELOPER TOOLS", icon: Wrench, items: "Git, GitHub, VS Code, Postman, Wrangler, Vitest" }
                  ].map((skill, i) => {
                     const Icon = skill.icon;
                     return (
                        <div key={i} className={`p-8 md:p-12 ${i % 2 === 0 ? 'md:border-r-[1px]' : ''} border-b-[1px] border-white/20 hover:bg-white/5 transition-colors group`}>
                           <div className="flex items-center gap-4 mb-6">
                              <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center bg-[#0A0A0A] group-hover:border-[#FF0000] group-hover:text-[#FF0000] transition-colors">
                                 <Icon className="w-5 h-5" />
                              </div>
                              <h3 className="font-display text-2xl uppercase tracking-tight">{skill.name}</h3>
                           </div>
                           <p className="font-mono text-base leading-relaxed text-[#F5F5F5]/70">
                              {skill.items}
                           </p>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </motion.section>

      {/* PROJECTS */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="border-b-[1px] border-white/20 bg-[#0A0A0A]" 
        id="projects"
      >
         <div className="p-6 md:p-12 lg:p-24 border-b border-white/20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
               <div>
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF0000] mb-6">
                     [ 03 / PORTFOLIO ]
                  </div>
                  <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tight max-w-2xl glitch-hover">
                    Featured Work.
                  </h2>
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto divide-y divide-white/20 border-x border-white/20">
            {[
               {
                  title: "Cloudflare Edge Delivery Platform (AGXP)",
                  tech: "TypeScript · Hono · CF Workers / D1 / KV · JWT · React · Vite · Tailwind · Vitest",
                  link: "https://github.com/nrana-pixel/agxp-cloudflare.git",
                  points: [
                     "Full-stack edge platform to deploy AI-optimized HTML variants on user-owned Cloudflare domains with JWT auth and analytics",
                     "Cloudflare Workers backend (Hono/TS) with modular routes for auth, deployments, variants, and API-key-based analytics ingestion",
                     "D1 (SQLite) schema for users, connections, deployments, variants, API keys, and AI request logs",
                     "AES-GCM encryption for CF API tokens; deployment orchestration: KV namespaces, Worker scripts, route attachment, health checks",
                     "Edge worker detects AI crawlers (GPTBot, ClaudeBot, Perplexity) and serves path-based KV variants, falling back to origin",
                     "AI-assisted variant generation via Firecrawl + OpenRouter (Gemini); React + Vite dashboard for one-click deploy and analytics"
                  ]
               },
               {
                  title: "Product-to-UGC AI Video Pipeline",
                  tech: "n8n · Google Vertex AI (Veo 3.0) · Gemini 2.5 · Cloudflare R2 · MongoDB · React",
                  points: [
                     "End-to-end n8n pipeline: webhook ingests product image → Gemini Vision creates UGC persona → 3 Veo-optimized 8-second ad scripts",
                     "Vertex AI Veo 3.0 with async polling, native audio, and negative prompts to eliminate abrupt endings and RAI filter blocks",
                     "Custom 9:16 first frame generated per script via Gemini image editing (720x1280) and passed as visual reference to Veo",
                     "Videos stored in Cloudflare R2 (CDN); metadata in MongoDB; React dashboard renders all 3 variants side-by-side for review",
                     "Multi-language: Hinglish, Punjabi, Tamil, Telugu, Marathi — each with region-specific persona, dialogue, and location context"
                  ]
               },
               {
                  title: "E-Commerce Backend",
                  tech: "Node.js · Express · MongoDB · JWT",
                  points: [
                     "RESTful API for product catalogue, cart, and order management with role-based access control using JWT middleware",
                     "MongoDB + Mongoose data modelling; secured all sensitive routes with authentication middleware"
                  ]
               }
            ].map((proj, i) => (
               <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.015, y: -4, boxShadow: "6px 6px 0px 0px rgba(255, 0, 0, 0.4)" }}
                  transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                  className="p-8 md:p-12 bg-[#0A0A0A] transition-colors cursor-crosshair group relative hover:z-10"
               >
                  <div className="absolute right-8 top-8 opacity-0 group-hover:opacity-100 transition-opacity">
                     {proj.link ? <a href={proj.link} className="hover:text-[#FF0000]"><Github className="w-6 h-6" /></a> : <Globe className="w-6 h-6 text-white/20" />}
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl uppercase tracking-tight mb-4 group-hover:text-[#FF0000] transition-colors pr-12">
                     {proj.title}
                  </h3>
                  <div className="font-mono text-[10px] text-[#F5F5F5]/50 tracking-widest mb-8 border border-white/20 w-fit px-3 py-1">
                     {proj.tech}
                  </div>
                  <ul className="font-mono text-base leading-relaxed tracking-wide space-y-3 text-[#F5F5F5]/80 list-disc pl-6 marker:text-white/20 group-hover:marker:text-[#FF0000] transition-colors max-w-4xl">
                     {proj.points.map((pt, j) => (
                        <li key={j}>{pt}</li>
                     ))}
                  </ul>
               </motion.div>
            ))}
         </div>
      </motion.section>

      {/* EDUCATION & ACHIEVEMENTS */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-[50vh] border-b-[1px] border-white/20 flex flex-col md:flex-row" 
        id="education"
      >
         <div className="w-full md:w-1/2 border-b-[1px] md:border-b-0 md:border-r-[1px] border-white/20 p-8 md:p-16 lg:p-24 bg-[#0A0A0A]">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF0000] mb-12">
               [ 04 / EDUCATION ]
            </div>
            <div className="space-y-12">
               <div>
                  <h3 className="font-display text-2xl uppercase tracking-tight">Bachelor of Computer Application</h3>
                  <p className="font-mono text-xs text-[#F5F5F5]/60 mt-2 tracking-widest">2022 — 2025</p>
                  <p className="font-mono text-base mt-4 text-[#F5F5F5]/80 mt-2">Arya College Ludhiana, Punjab</p>
               </div>
               <div>
                  <h3 className="font-display text-2xl uppercase tracking-tight">Class 10th and 12th</h3>
                  <p className="font-mono text-xs text-[#F5F5F5]/60 mt-2 tracking-widest">2020 — 2022</p>
                  <p className="font-mono text-base mt-4 text-[#F5F5F5]/80 mt-2">Amrit Indo Canadian Academy Ludhiana, Punjab</p>
               </div>
            </div>
         </div>
         <div className="w-full md:w-1/2 p-8 md:p-16 lg:p-24 bg-[#0A0A0A]">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF0000] mb-12">
               [ 05 / ACHIEVEMENTS ]
            </div>
            <ul className="font-mono text-base leading-relaxed tracking-wide space-y-6 text-[#F5F5F5]/80 list-disc pl-6 marker:text-[#FF0000]">
               <li><span className="text-white">First Prize</span> – Swift Surfer, Technothan 2022 (PG Dept. of CS, Guru Nanak Khalsa College)</li>
               <li><span className="text-white">Third Prize</span> – Web Surfing, Tech Disha 2023 (Arya College, Ludhiana)</li>
               <li><span className="text-white">Third Prize</span> – Web Surfing, Tech Disha 2024 (Arya College, Ludhiana)</li>
            </ul>
         </div>
      </motion.section>

      {/* CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 md:py-32 flex justify-center items-center flex-col px-6 border-b-[1px] border-white/20 relative" 
        id="contact"
      >
         <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF0000] mb-8 z-10">
            [ / END ]
         </div>
         <h2 className="font-display text-5xl md:text-7xl lg:text-[7rem] tracking-tighter uppercase text-center max-w-4xl leading-[0.9] z-10 glitch-hover">
            LET&apos;S BUILD <br/> SOMETHING
         </h2>
         <p className="font-mono text-base md:text-lg mt-8 text-center max-w-2xl opacity-80 uppercase z-10">
            Available for new opportunities. Email me directly to discuss backend infrastructure, AI agentic pipelines, or anything else.
         </p>
         <div className="mt-16 flex flex-col sm:flex-row flex-wrap justify-center gap-6 z-10">
            <a href="mailto:nrana4148@gmail.com" className="border-[1px] border-[#F5F5F5] bg-[#F5F5F5] text-[#0A0A0A] px-12 py-4 font-bold tracking-widest uppercase hover:bg-[#FF0000] hover:text-[#F5F5F5] hover:border-[#FF0000] transition-all cursor-crosshair text-center">
               GET IN TOUCH
            </a>
            <a href="https://linkedin.com/in/NishitRana" target="_blank" rel="noopener noreferrer" className="border-[1px] border-[#F5F5F5] px-12 py-4 font-bold tracking-widest uppercase hover:bg-[#F5F5F5] hover:text-[#0A0A0A] transition-all cursor-crosshair text-center">
               LINKEDIN
            </a>
            <a href="/resume.pdf" download="Nishit_Rana_Resume.pdf" className="border-[1px] border-[#F5F5F5] px-12 py-4 font-bold tracking-widest uppercase hover:bg-[#F5F5F5] hover:text-[#0A0A0A] transition-all cursor-crosshair text-center">
               DOWNLOAD RESUME
            </a>
            <a href="https://github.com/nrana-pixel" target="_blank" rel="noopener noreferrer" className="border-[1px] border-[#F5F5F5] px-12 py-4 font-bold tracking-widest uppercase hover:bg-[#F5F5F5] hover:text-[#0A0A0A] transition-all cursor-crosshair text-center">
               GITHUB
            </a>
         </div>
      </motion.section>
    </main>
  );
}
