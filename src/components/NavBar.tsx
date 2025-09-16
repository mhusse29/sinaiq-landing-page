import PillButton from "./ui/PillButton";

export default function NavBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 px-4 pt-5">
      <div className="mx-auto max-w-7xl bar">
        <div className="flex items-center justify-between px-4 py-2">
          <a href="#" className="text-lg md:text-xl font-semibold tracking-[0.14em] text-white">
            SIN<span className="bg-gradient-to-r from-[var(--ac-1)] to-[var(--ac-2)] bg-clip-text text-transparent">AI</span>Q
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a className="link-muted" href="#services">Services</a>
            <a className="link-muted" href="#about">About&nbsp;Us</a>
            <a className="link-muted" href="#faq">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <PillButton variant="outline" href="#signin">Sign in</PillButton>
            <PillButton variant="primary" href="#signup">Sign up</PillButton>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <PillButton variant="outline" href="#signin">Sign in</PillButton>
          </div>
        </div>
      </div>
    </header>
  );
}
