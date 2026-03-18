import Link from 'next/link';

export const PublicFooter = () => (
  <footer className="border-t border-border bg-background">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Sanvaadai. All rights reserved.
      </p>
      <nav className="flex gap-6">
        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
          About
        </Link>
        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
          Privacy
        </Link>
      </nav>
    </div>
  </footer>
);
