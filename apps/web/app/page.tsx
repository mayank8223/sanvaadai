import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { APP_NAME } from '@/lib/constants';
import { CheckCircle2Icon } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background font-sans">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-16">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
        <p className="text-center text-muted-foreground">
          Admin interface and API host. API routes are available under{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">/api</code>.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <a href="/api/health">Check API health</a>
          </Button>
          <Button variant="outline" size="icon" aria-label="Health check">
            <CheckCircle2Icon />
          </Button>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>UI stack</CardTitle>
            <CardDescription>
              Tailwind CSS, shadcn/ui (Radix), and Lucide icons are configured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Sample input" readOnly aria-label="Sample" />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                Secondary
              </Button>
              <Button variant="outline" size="sm">
                Outline
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;
