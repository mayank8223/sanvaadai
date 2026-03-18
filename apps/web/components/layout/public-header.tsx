import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const PublicHeader = () => (
  <header className="border-b border-border bg-background">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Link href="/" className="text-xl font-bold text-foreground">
        Sanvaadai
      </Link>
      <nav className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
      </nav>
    </div>
  </header>
);
