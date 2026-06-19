export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-neutral-100/70 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <a href="#" className="text-xl font-bold tracking-tight">JOS.</a>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#about" className="transition-opacity hover:opacity-60">About</a>
          <a href="#projects" className="transition-opacity hover:opacity-60">Projects</a>
          <a href="#experience" className="transition-opacity hover:opacity-60">Experience</a>
          <a href="#contact" className="rounded-lg bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-800">Contact</a>
        </div>
      </nav>
    </header>
  )
}