"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProxyLogStats } from "@/types/proxy_log";
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Server,
  Shield
} from "lucide-react";

interface ProxyHealthPanelProps {
  stats?: ProxyLogStats;
  isLoading?: boolean;
}

export function ProxyHealthPanel({ stats, isLoading }: ProxyHealthPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900 text-lg">Proxy Health Status</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`health-loading-${i}`} className="animate-pulse">
              <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
              <div className="h-8 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate proxy pool metrics
  const totalProxies = stats.host_breakdown?.length || 0;
  const activeProxies = stats.host_breakdown?.filter(host => host.success_rate > 0).length || 0;
  const bannedCount = stats.banned || 0;
  const timeoutCount = stats.timeout || 0;
  const healthyProxies = stats.host_breakdown?.filter(host => host.success_rate >= 80).length || 0;

  // Calculate overall health percentage
  const overallHealth = totalProxies > 0 ? (stats.success / stats.total) * 100 : 0;

  // Get rotation rate (based on recent activity)
  const rotationRate = stats.total > 0 ? ((stats.success + stats.failed) / stats.total * 100).toFixed(1) : "0";

  const getHealthColor = (rate: number) => {
    if (rate >= 80) return "text-green-600 bg-green-50";
    if (rate >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card className="border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900 text-lg">Proxy Health Status</h3>
        </div>
        <Badge
          className={`px-3 py-1 font-medium ${getHealthColor(overallHealth)}`}
        >
          {overallHealth.toFixed(1)}% Healthy
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Current Pool Status */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-gray-500" />
            <h4 className="font-medium text-gray-700 text-sm">Current Pool</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Total Proxies</span>
              <span className="font-semibold text-gray-900">{totalProxies}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Active</span>
              <span className="font-semibold text-green-600">{activeProxies}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Healthy (≥80%)</span>
              <span className="font-semibold text-blue-600">{healthyProxies}</span>
            </div>
          </div>
        </div>

        {/* Ban Status */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h4 className="font-medium text-gray-700 text-sm">Issues & Bans</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Banned</span>
              <Badge className="bg-red-50 text-red-700 px-2 py-0.5 text-xs">
                {bannedCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Timeouts</span>
              <Badge className="bg-gray-50 text-gray-700 px-2 py-0.5 text-xs">
                {timeoutCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Failed Requests</span>
              <Badge className="bg-red-50 text-red-700 px-2 py-0.5 text-xs">
                {stats.failed}
              </Badge>
            </div>
          </div>
        </div>

        {/* Rotation Metrics */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-gray-700 text-sm">Rotation Status</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Activity Rate</span>
              <span className="font-semibold text-blue-600">{rotationRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Success Rate</span>
              <span className={`font-semibold ${overallHealth >= 80 ? 'text-green-600' : overallHealth >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {overallHealth.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Total Requests</span>
              <span className="font-semibold text-gray-900">{stats.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Proxies */}
      {stats.host_breakdown && stats.host_breakdown.length > 0 && (
        <div className="mt-6 border-gray-200 border-t pt-4">
          <div className="mb-3 flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-500" />
            <h4 className="font-medium text-gray-700 text-sm">Top Performing Proxies</h4>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stats.host_breakdown
              .sort((a, b) => b.success_rate - a.success_rate)
              .slice(0, 3)
              .map((host, index) => (
                <div key={host.proxy_host} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${host.success_rate >= 80 ? 'bg-green-400' : host.success_rate >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                    <span className="font-medium text-gray-900 text-sm truncate max-w-[120px]" title={host.proxy_host}>
                      {host.proxy_host}
                    </span>
                  </div>
                  <Badge className={`text-xs ${getHealthColor(host.success_rate)}`}>
                    {host.success_rate.toFixed(0)}%
                  </Badge>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </Card>
  );
}