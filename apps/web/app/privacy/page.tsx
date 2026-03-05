/* ----------------- Globals --------------- */
import { APP_NAME } from '@/lib/constants';

/* ----------------- Page --------------- */
const PrivacyPage = () => (
  <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-6 py-12">
    <h1 className="text-2xl font-semibold tracking-tight">Privacy</h1>
    <p className="text-sm text-muted-foreground">
      {APP_NAME} stores account, organization, and submission data for product functionality.
      Contact your workspace admin for data retention and deletion requests.
    </p>
  </main>
);

export default PrivacyPage;
