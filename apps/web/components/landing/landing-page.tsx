import Link from 'next/link';
import {
  Brain,
  Download,
  MapPin,
  Mic,
  Users,
  WifiOff,
} from 'lucide-react';

import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Form Generation',
    description: 'Describe your form in plain language and let AI build it for you.',
  },
  {
    icon: Mic,
    title: 'Voice Input',
    description: 'Speak your form requirements or fill responses with voice.',
  },
  {
    icon: WifiOff,
    title: 'Offline Collection',
    description: 'Collect data without internet. Sync when you\'re back online.',
  },
  {
    icon: MapPin,
    title: 'GPS Capture',
    description: 'Automatically capture location data with each submission.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Assign forms to collectors and manage your team\'s workflow.',
  },
  {
    icon: Download,
    title: 'Export & Analyze',
    description: 'Export submissions to CSV for analysis in your favorite tools.',
  },
] as const;

const STEPS = [
  {
    step: '1',
    title: 'Create Forms',
    description: 'Design forms manually or describe what you need and let AI generate them.',
  },
  {
    step: '2',
    title: 'Collect Data',
    description: 'Your team fills forms in the field - online or offline, with voice or text.',
  },
  {
    step: '3',
    title: 'Analyze Results',
    description: 'View submissions, track progress, and export data for deeper analysis.',
  },
] as const;

export const LandingPage = () => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <PublicHeader />

    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Collect Field Data with
          <br />
          AI-Powered Intelligence
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Transform how your team gathers data. Create smart forms with AI, collect responses
          offline, and analyze results - all in one platform.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for field data collection
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="mb-2 size-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your data collection?
          </h2>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>

    <PublicFooter />
  </div>
);
