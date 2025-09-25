"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity, AlertCircle, Server } from "lucide-react";

interface ProxyStatus {
  host: string;
  port: number;
  status: "active" | "inactive" | "error";
  lastChecked?: string;
  responseTime?: number;
}

interface ProxyListProps {
  proxyStatuses?: ProxyStatus[];
  isLoading?: boolean;
}

export function ProxyList({ proxyStatuses, isLoading }: ProxyListProps) {
  const proxies = []
  // If no proxy statuses provided, use default proxies from config
  const proxiesWithStatus: ProxyStatus[] = proxyStatuses ||
    proxies.map((proxy, index) => ({
      ...proxy,
      status: index % 3 === 0 ? "active" : index % 3 === 1 ? "inactive" : "error",
      lastChecked: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
      responseTime: Math.floor(Math.random() * 500) + 100,
    }));

  const getStatusConfig = (status: ProxyStatus["status"]) => {
    switch (status) {
      case "active":
        return {
          color: "bg-green-50 text-green-800 border-green-200",
          icon: <Activity className="h-3 w-3 text-green-600" />,
          label: "Active",
        };
      case "inactive":
        return {
          color: "bg-gray-50 text-gray-800 border-gray-200",
          icon: <Server className="h-3 w-3 text-gray-600" />,
          label: "Inactive",
        };
      case "error":
        return {
          color: "bg-red-50 text-red-800 border-red-200",
          icon: <AlertCircle className="h-3 w-3 text-red-600" />,
          label: "Error",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-800 border-gray-200",
          icon: <Server className="h-3 w-3 text-gray-600" />,
          label: "Unknown",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between pt-2 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Proxies Status</h3>
          <div className="flex-1 border-t border-gray-200 ml-4" />
        </div>
        <div className="flex gap-2 text-sm mb-4">
          <span className="text-gray-600">Total: <span className="inline-block h-4 w-8 bg-gray-200 rounded align-middle" /></span>
          <span className="text-green-600">Active: <span className="inline-block h-4 w-8 bg-gray-200 rounded align-middle" /></span>
          <span className="text-gray-500">Inactive: <span className="inline-block h-4 w-8 bg-gray-200 rounded align-middle" /></span>
          <span className="text-red-600">Error: <span className="inline-block h-4 w-8 bg-gray-200 rounded align-middle" /></span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: proxiesWithStatus.length,
    active: proxiesWithStatus.filter(p => p.status === "active").length,
    inactive: proxiesWithStatus.filter(p => p.status === "inactive").length,
    error: proxiesWithStatus.filter(p => p.status === "error").length,
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between pt-2 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Proxies Status</h3>
        <div className="flex-1 border-t border-gray-200 ml-4" />
      </div>
      <div className="flex gap-2 text-sm mb-4">
        <span className="text-gray-600">Total: {stats.total}</span>
        <span className="text-green-600">Active: {stats.active}</span>
        <span className="text-gray-500">Inactive: {stats.inactive}</span>
        <span className="text-red-600">Error: {stats.error}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {proxiesWithStatus.map((proxy) => {
          const statusConfig = getStatusConfig(proxy.status);

          return (
            <Card key={`${proxy.host}:${proxy.port}`} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-gray-600" />
                  <span className="font-mono text-sm text-gray-900">
                    {proxy.host}:{proxy.port}
                  </span>
                </div>
                <Badge className={`${statusConfig.color} flex items-center gap-1 px-2 py-1 text-xs`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
                {proxy.lastChecked && (
                  <div>Last checked: {proxy.lastChecked}</div>
                )}
                {proxy.responseTime && proxy.status === "active" && (
                  <div>Response: {proxy.responseTime}ms</div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}