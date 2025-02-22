import { useEffect, useState } from "react";

type PingHistoryProps = {
  status: string;
  latency: number;
  timestamp?: string;
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

function formatLatency(latency: number): string {
  if (latency >= 1000) {
    return `${(latency / 1000).toFixed(1)}s`;
  }
  return `${latency}ms`;
}

export function PingHistory({ history }: { history: PingHistoryProps[] }) {
  return (
    <div className="flex items-end h-12 gap-[1px] w-full">
      {/* Fill empty space with gray pills on the left */}
      {Array.from({ length: Math.max(0, 30 - history.length) }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="flex-1 h-4 bg-gray-700 rounded-t"
        />
      ))}
      
      {/* Show history with newest items on the right */}
      {[...history].map((ping, index) => {
        let bgColor = 'bg-gray-500';
        let statusEmoji = '⚫️';
        if (ping.status === 'success') {
          bgColor = ping.latency < 200 ? 'bg-green-500' : 'bg-orange-500';
          statusEmoji = ping.latency < 200 ? '⚡️' : '🟡';
        } else if (ping.status === 'error') {
          bgColor = 'bg-red-500';
          statusEmoji = '❌';
        }

        const tooltipContent = [
          `${statusEmoji} ${formatLatency(ping.latency)}`,
          ping.timestamp ? `🕒 ${formatTime(ping.timestamp)}` : ''
        ].filter(Boolean).join('\n');

        return (
          <div
            key={index}
            className={`flex-1 rounded-t hover:opacity-75 cursor-pointer transition-all ${bgColor}`}
            style={{ 
              height: `${Math.min(100, Math.max(20, ping.latency / 10))}%`,
            }}
            title={tooltipContent}
          />
        );
      })}
    </div>
  );
} 