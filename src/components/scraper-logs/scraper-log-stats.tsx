"use client";

import { Card } from "@/components/ui/card";
import { ScraperLogStats } from "@/types/scraper_log";
import { formatDuration } from "@/utils/helper";
import { leadSourceColorConfig } from "@/constants/saas-source";
import {
  BarChart3,
  AlertCircle,
  Timer,
  CheckCircle2
} from "lucide-react";

interface ScraperLogStatsProps {
  stats?: ScraperLogStats;
  isLoading?: boolean;
}

export function ScraperLogStatsCards({ stats, isLoading }: ScraperLogStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow" key={`loading-${i}`}>
            <div className="flex items-center justify-between animate-pulse">
              <div>
                <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
                <div className="h-7 w-16 rounded bg-gray-200" />
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <div className="h-5 w-5 rounded bg-gray-300" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {/* Total Logs */}
      <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-600 text-sm">Total Logs</p>
            <p className="font-bold text-xl text-gray-900">{stats?.total}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </Card>

      {/* Success */}
      <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-600 text-sm">Success</p>
            <p className="font-bold text-xl text-gray-900">{stats?.success}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Failed */}
      <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-600 text-sm">Failed</p>
            <p className="font-bold text-xl text-gray-900">{stats?.failed}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
        </div>
      </Card>

      {/* Average Duration */}
      <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-600 text-sm">Avg Duration</p>
            <p className="font-bold text-xl text-gray-900">{stats?.average_duration ? `${formatDuration(stats.average_duration)} s` : '-'}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Timer className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Top Source (by success rate) */}
      <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-600 text-sm">Top Source</p>
            <p className="font-bold text-xl text-gray-900" title={(() => {
              if (stats?.top_sources && stats.top_sources.length > 0) {
                const topSource = stats.top_sources[0].source;
                const label = leadSourceColorConfig[topSource]?.label || topSource;
                return `${label} (${stats.top_sources[0].percent.toFixed(0)}%)`;
              }
              return "-";
            })()}>
              {(() => {
                if (stats?.top_sources && stats.top_sources.length > 0) {
                  const topSource = stats.top_sources[0].source;
                  const label = leadSourceColorConfig[topSource]?.label || topSource;
                  return (
                    <>
                      <span className="truncate max-w-[70px] inline-block align-bottom" title={label}>{label}</span>
                      {` (${stats.top_sources[0].percent.toFixed(0)}%)`}
                    </>
                  );
                }
                return "-";
              })()}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
