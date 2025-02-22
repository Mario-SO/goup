import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { DomainStatus } from "~/components/DomainStatus";

type PingResult = {
  domain: string;
  status: string;
  timestamp: string;
  error?: string;
  latencyMs: number;
};

type DomainStatusType = {
  status: string;
  latency: number;
  lastError?: string;
  pingHistory: Array<{
    status: string;
    latency: number;
    timestamp: string;
  }>;
};

type Domains = {
  [key: string]: DomainStatusType;
};

export const meta: MetaFunction = () => {
  return [
    { title: "Uptime" },
    { name: "description", content: "Uptime checker" },
  ];
};

const MAX_HISTORY = 30;

export default function Index() {
  const [domainStatus, setDomainStatus] = useState<Domains>({
    "prod.api.streameth.org": { 
      status: "unknown", 
      latency: 0, 
      pingHistory: []
    },
    "staging.api.streameth.org": { 
      status: "unknown", 
      latency: 0, 
      pingHistory: []
    },
  });

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('🔌 WebSocket Connected');
    };

    ws.onmessage = (event) => {
      const result: PingResult = JSON.parse(event.data);
      const emoji = result.error ? '❌' : '✅';
      const latencyEmoji = result.latencyMs < 200 ? '⚡️' : '🐢';
      
      console.log(
        `${emoji} ${result.domain}\n`,
        `${latencyEmoji} Latency: ${result.latencyMs}ms\n`,
        `🕒 Time: ${new Date(result.timestamp).toLocaleTimeString()}\n`,
        result.error ? `❗️ Error: ${result.error}` : '✨ Status: ' + result.status
      );

      setDomainStatus(prev => {
        const domain = prev[result.domain];
        const newHistory = [
          {
            status: result.error ? 'error' : 'success',
            latency: result.latencyMs,
            timestamp: result.timestamp
          },
          ...domain.pingHistory
        ].slice(0, MAX_HISTORY);

        return {
          ...prev,
          [result.domain]: {
            ...domain,
            status: result.error ? 'error' : 'success',
            latency: result.latencyMs,
            lastError: result.error,
            pingHistory: newHistory
          }
        };
      });
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket Disconnected');
    };

    return () => {
      console.log('🔌 Closing WebSocket connection...');
      ws.close();
    };
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 font-mono">
      <div className="w-full max-w-[900px] mx-auto p-4">
        <div className="mb-6 text-gray-400">
          <h1 className="text-lg uppercase tracking-wider font-normal">
            Streameth Uptime Monitor
          </h1>
        </div>

        <fieldset className="border border-gray-700 mb-4 bg-gray-800">
          <legend className="font-bold px-2 text-gray-400 uppercase text-sm tracking-wider">
            Production
          </legend>
          <DomainStatus 
            domain="prod.api.streameth.org"
            {...domainStatus["prod.api.streameth.org"]}
          />
        </fieldset>

        <fieldset className="border border-gray-700 mb-4 bg-gray-800">
          <legend className="font-bold px-2 text-gray-400 uppercase text-sm tracking-wider">
            Staging
          </legend>
          <DomainStatus 
            domain="staging.api.streameth.org"
            {...domainStatus["staging.api.streameth.org"]}
          />
        </fieldset>
      </div>
    </div>
  );
}
