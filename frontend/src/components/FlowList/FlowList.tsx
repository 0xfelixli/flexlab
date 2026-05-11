import { useMemo, useRef } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFlowStore } from "../../stores/flowStore";
import { formatBytes, formatDuration, methodColor, statusColor } from "./utils";
import type { FlowSummary } from "../../types/flow";

const col = createColumnHelper<FlowSummary>();

const columns = [
  col.accessor("method", {
    header: "Method",
    size: 72,
    cell: (info) => (
      <span
        className={`inline-flex min-w-12 justify-center rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold ${methodColor(info.getValue())}`}
      >
        {info.getValue()}
      </span>
    ),
  }),
  col.accessor("host", {
    header: "Host",
    size: 180,
    cell: (info) => (
      <span className="block truncate font-medium text-slate-200">{info.getValue()}</span>
    ),
  }),
  col.accessor("path", {
    header: "Path",
    size: 999, // flex-grow
    cell: (info) => (
      <span className="block truncate font-mono text-[11px] text-slate-500">
        {info.getValue()}
      </span>
    ),
  }),
  col.accessor("statusCode", {
    header: "Status",
    size: 56,
    cell: (info) => {
      const code = info.getValue();
      return (
        <span className={`font-mono text-[11px] font-medium ${statusColor(code)}`}>
          {code ?? "—"}
        </span>
      );
    },
  }),
  col.accessor("responseSize", {
    header: "Size",
    size: 72,
    cell: (info) => (
      <span className="text-[11px] tabular-nums text-slate-500">
        {formatBytes(info.getValue())}
      </span>
    ),
  }),
  col.accessor("duration", {
    header: "Time",
    size: 72,
    cell: (info) => (
      <span className="text-[11px] tabular-nums text-slate-500">
        {formatDuration(info.getValue())}
      </span>
    ),
  }),
];

const ROW_HEIGHT = 32;

export function FlowList() {
  const flows = useFlowStore((s) => s.flows);
  const selectedId = useFlowStore((s) => s.selectedId);
  const selectFlow = useFlowStore((s) => s.selectFlow);

  // Sort newest first
  const data = useMemo(
    () => Array.from(flows.values()).sort((a, b) => b.timestamp - a.timestamp),
    [flows],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  return (
    <div className="flex h-full flex-col overflow-hidden text-xs">
      <div className="flex h-10 flex-shrink-0 items-center border-b border-slate-800/80 bg-[#0f1622] px-3">
        <div>
          <div className="text-[12px] font-semibold text-slate-200">HTTP history</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
            captured traffic
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 border-b border-slate-800/80 bg-[#0b1018] text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {table.getFlatHeaders().map((header) => (
          <div
            key={header.id}
            className="flex-shrink-0 truncate px-2 py-2"
            style={{
              width:
                header.column.columnDef.size === 999
                  ? undefined
                  : header.column.columnDef.size,
              flex: header.column.columnDef.size === 999 ? "1 1 0" : undefined,
            }}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        ))}
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto bg-[#0d121b]">
        <div
          style={{
            height: rows.length === 0 ? "100%" : virtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {rows.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg border border-slate-700/70 bg-slate-900 text-[13px] font-semibold text-slate-400">
                HTTP
              </div>
              <div className="text-sm font-medium text-slate-300">No flows captured</div>
              <div className="mt-1 max-w-64 text-xs leading-5 text-slate-500">
                Start proxying traffic through mitmproxy and requests will appear here in real time.
              </div>
            </div>
          )}
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const row = rows[virtualItem.index];
            const flow = row.original;
            const isSelected = flow.id === selectedId;
            const isIntercepted = flow.intercepted;

            return (
              <div
                key={row.id}
                className={[
                  "absolute inset-x-0 flex cursor-pointer select-none items-center border-b border-slate-800/45 transition-colors",
                  isSelected
                    ? "bg-cyan-400/[0.09] border-l-2 border-l-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                    : isIntercepted
                      ? "bg-amber-400/[0.08] border-l-2 border-l-amber-300 hover:bg-amber-400/[0.12]"
                      : "border-l-2 border-l-transparent hover:bg-slate-800/55",
                ].join(" ")}
                style={{ top: virtualItem.start, height: ROW_HEIGHT }}
                onClick={() => selectFlow(flow.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className="flex-shrink-0 overflow-hidden px-2"
                    style={{
                      width:
                        cell.column.columnDef.size === 999
                          ? undefined
                          : cell.column.columnDef.size,
                      flex:
                        cell.column.columnDef.size === 999
                          ? "1 1 0"
                          : undefined,
                      minWidth: 0,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex h-7 flex-shrink-0 items-center justify-between border-t border-slate-800/80 bg-[#0b1018] px-3 text-[11px] text-slate-500">
        <span>
          <span className="font-mono text-slate-300">{flows.size}</span> flows
        </span>
        <span>newest first</span>
      </div>
    </div>
  );
}
