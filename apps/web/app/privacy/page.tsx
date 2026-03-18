import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sanvaadai',
  description: 'Privacy policy for the Sanvaadai data collection platform.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    {children}
  </section>
);

const PrivacyPage = () => (
  <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12">
    <header className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
    </header>

    <Section title="Introduction">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Sanvaadai is an AI-enabled data collection platform that helps organizations create, manage,
        and analyze forms and submissions. We are committed to protecting your privacy and handling
        your data responsibly. This policy explains what information we collect, how we use it, and
        your rights regarding your data.
      </p>
    </Section>

    <Section title="Information We Collect">
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">Account information</span> - Email address
          and name provided during registration.
        </li>
        <li>
          <span className="font-medium text-foreground">Form data</span> - Form definitions,
          questions, and configurations created by users.
        </li>
        <li>
          <span className="font-medium text-foreground">Submission data</span> - Responses collected
          through forms, including text, uploaded files, and GPS coordinates when location capture
          is enabled.
        </li>
        <li>
          <span className="font-medium text-foreground">Organization and team data</span> -
          Organization details, team memberships, and role assignments.
        </li>
        <li>
          <span className="font-medium text-foreground">Usage data</span> - Page views and feature
          usage to help us improve the service.
        </li>
        <li>
          <span className="font-medium text-foreground">Audio data</span> - Voice recordings
          captured via your browser for transcription purposes. Audio is processed in real time and
          is not stored permanently.
        </li>
      </ul>
    </Section>

    <Section title="How We Use Your Information">
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>Providing, maintaining, and improving the platform.</li>
        <li>
          AI-powered form generation - form descriptions are sent to AI service providers to
          generate form structures. Submission data is not shared with AI providers.
        </li>
        <li>Processing voice input for transcription to populate form fields.</li>
        <li>Sending service-related notifications such as invitations and status updates.</li>
        <li>Personalizing and improving your experience on the platform.</li>
      </ul>
    </Section>

    <Section title="Data Storage & Security">
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>
          All data is stored on Supabase infrastructure backed by cloud-hosted PostgreSQL databases.
        </li>
        <li>Data is encrypted in transit via HTTPS and encrypted at rest on the storage layer.</li>
        <li>
          Access to data is governed by role-based permissions within organizations. Only authorized
          team members can view or manage submissions.
        </li>
      </ul>
    </Section>

    <Section title="Third-Party Services">
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">Supabase</span> - Used for authentication,
          database hosting, and file storage.
        </li>
        <li>
          <span className="font-medium text-foreground">AI service providers</span> - Used for form
          generation. Only form descriptions are shared - your submission data is never sent to AI
          providers.
        </li>
        <li>
          <span className="font-medium text-foreground">Google and GitHub</span> - Available as
          OAuth authentication providers, if you choose to sign in with them.
        </li>
      </ul>
    </Section>

    <Section title="Data Retention">
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>Account data is retained for as long as your account remains active.</li>
        <li>
          Submission data is retained for as long as the owning organization exists on the platform.
        </li>
        <li>You may request deletion of your data at any time by contacting us.</li>
      </ul>
    </Section>

    <Section title="Your Rights">
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate or incomplete data.</li>
        <li>Request deletion of your account and associated data.</li>
        <li>Export your submission data using the built-in CSV export feature.</li>
      </ul>
    </Section>

    <Section title="Contact">
      <p className="text-sm leading-relaxed text-muted-foreground">
        If you have questions about this privacy policy or wish to exercise your data rights,
        contact us at{' '}
        <a
          href="mailto:privacy@sanvaadai.com"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          privacy@sanvaadai.com
        </a>
        .
      </p>
    </Section>
  </main>
);

export default PrivacyPage;
