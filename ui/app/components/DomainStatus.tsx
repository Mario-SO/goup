import { PingHistory } from "./PingHistory";

type DomainStatusProps = {
  domain: string;
  status: string;
  latency: number;
  lastError?: string;
  pingHistory: Array<{
    status: string;
    latency: number;
    timestamp?: string;
  }>;
};

function calculateUptime(history: DomainStatusProps['pingHistory']): number {
  if (history.length === 0) return 100;

  const successfulPings = history.filter(
    ping => ping.status === 'success' && ping.latency < 2000
  ).length;

  return Number(((successfulPings / history.length) * 100).toFixed(2));
}

export function DomainStatus({ 
  domain, 
  status, 
  latency, 
  lastError,
  pingHistory 
}: DomainStatusProps) {
  const uptime = calculateUptime(pingHistory);
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center px-3 py-2 text-sm">
        <span className={`inline-block w-2 h-2 rounded-full ${
          status === 'success' ? 'bg-green-500' :
          status === 'error' ? 'bg-red-500' : 'bg-gray-500'
        } mr-3`}></span>
        <span className="min-w-[200px]">
          <a 
            href={`https://${domain}`}
            className="text-gray-200 no-underline hover:underline"
            title={lastError}
          >
            {domain}
          </a>
        </span>
        <span className="text-gray-400 text-sm ml-4 min-w-[60px]">
          {latency}ms
        </span>
        <span className={`text-sm ml-auto ${
          uptime >= 99.9 ? 'text-green-400' :
          uptime >= 99 ? 'text-green-500' :
          uptime >= 95 ? 'text-orange-500' :
          'text-red-500'
        }`}>
          {uptime}%
        </span>
      </div>
      <PingHistory history={pingHistory} />
    </div>
  );
} 