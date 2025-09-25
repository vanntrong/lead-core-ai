
"use client";

import { Card } from "@/components/ui/card";
import { ProxyLogStats } from "@/types/proxy_log";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ShieldAlert,
  Timer
} from "lucide-react";

interface ProxyLogStatsProps {
  stats?: ProxyLogStats;
  isLoading?: boolean;
}

export function ProxyLogStatsCards({ stats, isLoading }: ProxyLogStatsProps) {
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

      {/* Banned */}
      <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-600 text-sm">Banned</p>
            <p className="font-bold text-xl text-gray-900">{stats?.banned}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
            <ShieldAlert className="h-5 w-5 text-orange-600" />
          </div>
        </div>
      </Card>

      {/* Timeout */}
      <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-600 text-sm">Timeout</p>
            <p className="font-bold text-xl text-gray-900">{stats?.timeout}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
            <Timer className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </Card>

    </div>
  );
}
