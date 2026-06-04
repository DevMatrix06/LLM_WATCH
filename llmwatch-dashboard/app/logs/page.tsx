import { LogTable } from '@/components/logs/log-table';

export default function LogsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-zinc-800/60 px-8 py-5">
        <h1 className="text-base font-semibold text-zinc-100">Request Logs</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          All intercepted LLM calls · Click a row to inspect
        </p>
      </div>
      <div className="flex flex-1 flex-col">
        <LogTable />
      </div>
    </div>
  );
}
