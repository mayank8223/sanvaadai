import type { Metadata } from 'next';

import { LandingPage } from '@/components/landing/landing-page';
import { getCurrentUser } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'Sanvaadai - AI-Powered Field Data Collection',
  description:
    'Create smart forms with AI, collect data offline, and analyze results. The modern platform for field research and data collection.',
};

const HomePage = async () => {
  const user = await getCurrentUser();
  return <LandingPage isAuthenticated={!!user} />;
};

export default HomePage;
