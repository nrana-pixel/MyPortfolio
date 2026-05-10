export function Footer() {
  return (
    <footer className="w-full bg-[#0A0A0A] border-t-[1px] border-white/20 text-[#A0A0A0] font-mono text-xs uppercase tracking-widest pt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 p-6 md:p-12 border-b-[1px] border-white/20">
        <div className="flex flex-col gap-4">
           <span className="text-[#F5F5F5] mb-4 border-b border-white/20 pb-2">LINKS</span>
           <a href="#experience" className="hover:text-[#FF0000] draw-underline transition-colors w-fit">EXPERIENCE</a>
           <a href="#projects" className="hover:text-[#FF0000] draw-underline transition-colors w-fit">PROJECTS</a>
           <a href="#skills" className="hover:text-[#FF0000] draw-underline transition-colors w-fit">SKILLS</a>
           <a href="#education" className="hover:text-[#FF0000] draw-underline transition-colors w-fit">EDUCATION</a>
        </div>
        <div className="flex flex-col gap-4">
           <span className="text-[#F5F5F5] mb-4 border-b border-white/20 pb-2">SOCIAL</span>
           <a href="https://linkedin.com/in/NishitRana" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] draw-underline transition-colors w-fit">LINKEDIN</a>
           <a href="https://github.com/nrana-pixel" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] draw-underline transition-colors w-fit">GITHUB</a>
        </div>
        <div className="flex flex-col gap-4">
           <span className="text-[#F5F5F5] mb-4 border-b border-white/20 pb-2">CONTACT</span>
           <a href="mailto:nrana4148@gmail.com" className="hover:text-[#FF0000] draw-underline transition-colors w-fit lowercase">nrana4148@gmail.com</a>
           <span className="w-fit">+91 7009959067</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between p-6 md:p-12 items-center">
        <div className="text-center md:text-left text-[10px]">
           © {new Date().getFullYear()} NISHIT RANA. <br/>
           PORTFOLIO.
        </div>
        <div className="mt-8 md:mt-0 text-[#FF0000] flex items-center gap-2 text-[10px]">
           <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] animate-pulse"></span>
           [ OPEN TO WORK ]
        </div>
      </div>
    </footer>
  );
}
