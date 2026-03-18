import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FormsLoading() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-2 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>All forms</CardTitle>
          <CardDescription>Title, status, created date, and submission volume.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-2 py-3 font-medium">Title</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Created</th>
                  <th className="px-2 py-3 font-medium text-right">Submissions</th>
                  <th className="px-2 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-2 py-3"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-2 py-3"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-2 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-2 py-3 text-right"><Skeleton className="ml-auto h-4 w-8" /></td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-14" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
