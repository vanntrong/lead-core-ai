"use client";

import { Badge } from "@/components/ui/badge";
import { HighlightText } from "@/components/ui/highlight-text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leadSourceColorConfig } from "@/constants/saas-source";
import { ScraperLog } from "@/types/scraper_log";
import { formatDate, formatDuration } from "@/utils/helper";
import {
  Calendar,
  Link
} from "lucide-react";
import React from "react";

interface ScraperLogTableProps {
  logs: ScraperLog[];
  searchTerms?: string;
  showSummary?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  success: {
    label: "Success",
    color: "bg-green-50 text-green-800 border-green-100",
    dot: "bg-green-400",
  },
  fail: {
    label: "Failed",
    color: "bg-red-50 text-red-800 border-red-100",
    dot: "bg-red-400",
  },
  pending: {
    label: "Pending",
    color: "bg-gray-50 text-gray-800 border-gray-100",
    dot: "bg-gray-300",
  },
};

export function ScraperLogTable({ logs, searchTerms, showSummary = true }: ScraperLogTableProps) {
  const highlightTerms = searchTerms ? [searchTerms] : [];

  // Summary statistics
  const summaryStats = React.useMemo(() => {
    const total = logs.length;
    const success = logs.filter((l) => l.status === "success").length;
    const failed = logs.filter((l) => l.status === "fail").length;
    return { total, success, failed };
  }, [logs]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 border-b-2 bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm text-center">Source</TableHead>
            <TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm">URL</TableHead>
            <TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm text-center">Status</TableHead>
            <TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm text-center">Duration (ms)</TableHead>
            <TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm text-center">Error</TableHead>
            <TableHead className="h-12 px-4 font-semibold text-gray-900 text-sm text-center">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <ScraperLogRow key={log.id} log={log} highlightTerms={highlightTerms} />
          ))}
        </TableBody>
      </Table>
      {showSummary && logs.length > 0 && (
        <div className="border-gray-200 border-t bg-gray-50/50 px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6 text-gray-600">
              <span className="font-medium">{summaryStats.total} Total Logs</span>
              <span className="flex items-center space-x-1">
                <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
                {summaryStats.success} Success
              </span>
              <span className="flex items-center space-x-1">
                <div className="mr-1 h-2 w-2 rounded-full bg-red-500" />
                {summaryStats.failed} Failed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ScraperLogRow = ({ log, highlightTerms }: { log: ScraperLog; highlightTerms: string[] }) => {
  const statusInfo = statusConfig[log.status] || {
    label: log.status || "N/A",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    dot: "bg-gray-400",
  };
  const sourceInfo = leadSourceColorConfig[log.source] || {
    label: log.source,
    badge: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <TableRow className="group cursor-pointer transition-colors hover:bg-indigo-50/50" key={log.id} aria-label={`Scraper log ${log.url}`}>
      {/* Source */}
      <TableCell className="py-3 text-center align-middle">
        <Badge className={sourceInfo.badge + " gap-1 px-2 py-1 font-semibold border rounded"}>
          {sourceInfo.label}
        </Badge>
      </TableCell>
      {/* URL */}
      <TableCell className="py-3 pl-4 align-middle max-w-[270px]">
        <div className="font-medium max-w-[270px] text-gray-900 text-sm">
          <div className="flex items-center gap-1">
            <a
              href={log.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
              title={log.url}
              aria-label="Open link"
            >
              <Link className="h-3 w-3" aria-hidden="true" />
            </a>
            <div className="truncate max-w-[270px] gap-1">
              <HighlightText
                highlightClassName="bg-yellow-200 text-yellow-900 px-1 rounded"
                highlightTerms={highlightTerms}
                text={log.url}
              />
            </div>
          </div>
        </div>
      </TableCell>
      {/* Status */}
      <TableCell className="py-3 text-center align-middle">
        <Badge className={statusInfo.color + " inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border rounded mb-1"}>
          <div className={`mr-1.5 h-2 w-2 rounded-full ${statusInfo.dot}`} />
          {statusInfo.label}
        </Badge>
      </TableCell>
      {/* Duration */}
      <TableCell className="py-3 text-center align-middle">
        <span className="text-sm text-gray-700">{formatDuration(log.duration)}</span>
      </TableCell>
      {/* Error */}
      <TableCell className="py-3 text-center align-middle max-w-[270px]">
        {log.error ? (
          <span
            className="text-sm text-red-600 block truncate max-w-[240px] cursor-help"
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={log.error}
          >
            {log.error}
          </span>
        ) : (
          <span className="text-sm text-gray-400">None</span>
        )}
      </TableCell>
      {/* Timestamp */}
      <TableCell className="py-3 text-center align-middle">
        <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <time dateTime={log.timestamp}>{formatDate(log.timestamp)}</time>
        </div>
      </TableCell>
    </TableRow>
  );
};
