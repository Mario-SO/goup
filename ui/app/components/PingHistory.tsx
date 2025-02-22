import { useEffect, useState } from "react";

type PingHistoryProps = {
  status: string;
  latency: number;
  timestamp?: string;
};

export function PingHistory({ history }: { history: PingHistoryProps[] }) {
  return (
    <div className="flex items-end h-12 gap-[1px] w-full">
      {history.map((ping, index) => {
        let bgColor = 'bg-gray-500';
        if (ping.status === 'success') {
          bgColor = ping.latency < 200 ? 'bg-green-500' : 'bg-orange-500';
        } else if (ping.status === 'error') {
          bgColor = 'bg-red-500';
        }

        return (
          <div
            key={index}
            className={`flex-1 rounded-t hover:opacity-75 cursor-pointer transition-all ${bgColor}`}
            style={{ 
              height: `${Math.min(100, Math.max(20, ping.latency / 10))}%`,
            }}
            title={`Status: ${ping.status}
Latency: ${ping.latency}ms
Time: ${ping.timestamp || 'N/A'}`}
          />
        );
      })}
      {/* Fill empty space with gray pills */}
      {Array.from({ length: Math.max(0, 30 - history.length) }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="flex-1 h-4 bg-gray-700 rounded-t"
        />
      ))}
    </div>
  );
} 