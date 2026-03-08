'use client';

/* ----------------- Globals --------------- */
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/* ----------------- Types --------------- */
type SubmissionFlags = {
  location_missing: boolean;
  location_poor_accuracy: boolean;
  location_accuracy_unknown: boolean;
};

type SubmissionRow = {
  id: string;
  collector_user_id: string | null;
  collector: { full_name: string | null; email: string | null } | null;
  submitted_at: string;
  flags: SubmissionFlags;
};

type SubmissionsTableClientProps = {
  formId: string;
  formTitle: string;
  collectors: Array<{
    user_id: string;
    email: string | null;
    full_name: string | null;
  }>;
};

/* ----------------- Constants --------------- */
const PAGE_SIZE = 20;
const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
] as const;

/* ----------------- Helpers --------------- */
const formatSubmittedAt = (value: string): string =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const getCollectorDisplay = (row: SubmissionRow): string => {
  if (!row.collector) return '—';
  const name = row.collector.full_name?.trim();
  const email = row.collector.email ?? '';
  if (name) return `${name} (${email})`;
  return email || '—';
};

const getDateRangeParams = (
  range: (typeof DATE_RANGE_OPTIONS)[number]['value']
): { submittedAfter: string | null; submittedBefore: string | null } => {
  if (range === 'all') return { submittedAfter: null, submittedBefore: null };
  const now = new Date();
  const to = now.toISOString();
  const from = new Date(now);
  if (range === '7d') from.setDate(from.getDate() - 7);
  else if (range === '30d') from.setDate(from.getDate() - 30);
  else if (range === '90d') from.setDate(from.getDate() - 90);
  return { submittedAfter: from.toISOString(), submittedBefore: to };
};

/* ----------------- Component --------------- */
export const SubmissionsTableClient = ({
  formId,
  formTitle,
  collectors,
}: SubmissionsTableClientProps) => {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'submitted_at', desc: true },
  ]);
  const [collectorFilter, setCollectorFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<
    (typeof DATE_RANGE_OPTIONS)[number]['value']
  >('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      formId,
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    });

    if (collectorFilter !== 'all') {
      params.set('collectorUserId', collectorFilter);
    }

    const { submittedAfter, submittedBefore } = getDateRangeParams(dateRangeFilter);
    if (submittedAfter) params.set('submittedAfter', submittedAfter);
    if (submittedBefore) params.set('submittedBefore', submittedBefore);

    try {
      const response = await fetch(`/api/submissions?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        submissions?: SubmissionRow[];
        pagination?: { total: number };
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? 'Failed to load submissions');
        setSubmissions([]);
        setTotal(0);
        return;
      }

      setSubmissions(payload?.submissions ?? []);
      setTotal(payload?.pagination?.total ?? 0);
    } finally {
      setIsLoading(false);
    }
  }, [formId, page, collectorFilter, dateRangeFilter]);

  useEffect(() => {
    void fetchSubmissions();
  }, [fetchSubmissions]);

  const columns: ColumnDef<SubmissionRow>[] = [
    {
      accessorKey: 'collector',
      header: 'Collector',
      cell: ({ row }) => (
        <span className="text-foreground">{getCollectorDisplay(row.original)}</span>
      ),
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted at',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatSubmittedAt(row.original.submitted_at)}
        </span>
      ),
    },
    {
      id: 'flags',
      header: 'Flags',
      cell: ({ row }) => {
        const { flags } = row.original;
        const activeFlags: string[] = [];
        if (flags.location_missing) activeFlags.push('No location');
        if (flags.location_poor_accuracy) activeFlags.push('Poor accuracy');
        if (flags.location_accuracy_unknown) activeFlags.push('Accuracy unknown');

        if (activeFlags.length === 0) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {activeFlags.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button asChild variant="outline" size="sm">
            <a href={`/submissions/${row.original.id}`}>View</a>
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: submissions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / PAGE_SIZE),
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions</CardTitle>
        <CardDescription>
          Table of submissions for {formTitle}. Filter by collector, date range, and view flags.
        </CardDescription>
        <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Collector
            </label>
            <Select
              value={collectorFilter}
              onValueChange={(v) => {
                setCollectorFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All collectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All collectors</SelectItem>
                {collectors.map((c) => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {c.full_name ?? c.email ?? c.user_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Date range
            </label>
            <Select
              value={dateRangeFilter}
              onValueChange={(v) => {
                setDateRangeFilter(v as (typeof DATE_RANGE_OPTIONS)[number]['value']);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading submissions…</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No submissions found for the selected filters.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between gap-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of{' '}
                {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
