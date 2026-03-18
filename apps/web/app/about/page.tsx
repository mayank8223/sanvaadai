import type { Metadata } from 'next';
import Link from 'next/link';
import { Brain, CheckCircle, Mic, WifiOff } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `About | ${APP_NAME}`,
  description:
    'Learn about Sanvaadai - the AI-powered field data collection platform',
};

const features = [
  {
    icon: Brain,
    title: 'AI-First Design',
    description:
      'Describe your data collection needs in plain language. Our AI builds the forms, so you can focus on your research.',
  },
  {
    icon: WifiOff,
    title: 'Offline by Default',
    description:
      'Every feature works without internet. Data syncs automatically when connectivity returns.',
  },
  {
    icon: Mic,
    title: 'Voice-Powered',
    description:
      'Create forms and fill responses using voice input - essential for field workers with their hands full.',
  },
] as const;

const differentiators = [
  'Smart form generation from natural language descriptions',
  'GPS-tagged submissions for spatial data accuracy',
  'Role-based team management (admins create, collectors fill)',
  'Cross-platform: web dashboard + mobile app for the field',
  'CSV export for integration with existing analysis tools',
] as const;

const AboutPage = () => (
  <div className="flex min-h-screen flex-col">
    {/* Header */}
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Sanvaadai
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Log in
          </Link>
        </nav>
      </div>
    </header>

    {/* Main content */}
    <main className="mx-auto w-full max-w-4xl flex-1 px-6">
      {/* Hero / Mission */}
      <section className="py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About Sanvaadai</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          We&apos;re building the future of field data collection. Sanvaadai combines artificial
          intelligence with practical offline-first design to help research teams, NGOs, and
          organizations gather accurate data - anywhere in the world.
        </p>
      </section>

      {/* Problem */}
      <section className="space-y-4 pb-16">
        <h2 className="text-2xl font-semibold tracking-tight">The Problem</h2>
        <p className="text-muted-foreground">
          Field data collection is hard. Teams working in remote areas face unreliable internet,
          complex paper forms, and tedious data entry. Traditional digital tools still require
          connectivity and technical expertise to set up, leaving many organizations stuck with
          outdated processes.
        </p>
      </section>

      {/* Our Approach */}
      <section className="space-y-6 pb-16">
        <h2 className="text-2xl font-semibold tracking-tight">Our Approach</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-5 text-secondary-foreground" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="space-y-6 pb-16">
        <h2 className="text-2xl font-semibold tracking-tight">What Makes Us Different</h2>
        <ul className="space-y-3">
          {differentiators.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>

    {/* Footer */}
    <footer className="border-t border-border">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-6 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Sanvaadai</span>
        <nav className="flex items-center gap-4">
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  </div>
);

export default AboutPage;
