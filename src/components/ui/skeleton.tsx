import React from "react";

export function Skeleton({ className = "", style = {}, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`}
      style={{ minHeight: 24, ...style }}
      {...props}
    />
  );
}
