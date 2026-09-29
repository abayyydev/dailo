'use client';

import React, { useState, useEffect } from 'react';
import { Server, Database, RefreshCw, CheckCircle2, AlertCircle, Clock3 } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  database: {
    type: string;
    name: string;
    host: string;
    port: number;
    status: string;
    latencyMs?: number;
    error?: string;
  };
}

export function HealthStatusCard() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${apiUrl}/api/health`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Server returned status HTTP ${response.status}`);
      }
      const json: HealthData = await response.json();
      setData(json);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to backend server');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Recheck every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds?: number) => {
    if (seconds === undefined) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m ${secs}s`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Backend & MySQL Connection</h2>
            <p className="text-xs text-slate-500">Live API Health Verification (/api/health)</p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && !data && !error && (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          <p className="text-xs">Memeriksa koneksi backend & database...</p>
        </div>
      )}

      {error && (
        <div className="mt-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-900">Koneksi Backend Terputus</p>
            <p>{error}</p>
            <p className="text-rose-600">
              Pastikan backend Express berjalan di port 5000 (`npm run dev:backend`).
            </p>
          </div>
        </div>
      )}

      {data && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Backend Express Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Express API Service</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ONLINE (200 OK)
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Environment:</span>
                <span className="font-mono font-medium text-slate-700">{data.environment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Server Uptime:</span>
                <span className="font-mono font-medium text-slate-700">{formatUptime(data.uptimeSeconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Port:</span>
                <span className="font-mono font-medium text-slate-700">5000</span>
              </div>
            </div>
          </div>

          {/* MySQL Database Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-medium text-slate-600">MySQL Database</span>
              </div>
              {data.database.status === 'connected' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  CONNECTED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  DISCONNECTED
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Database Name:</span>
                <span className="font-mono font-medium text-indigo-600">{data.database.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Host / Port:</span>
                <span className="font-mono font-medium text-slate-700">
                  {data.database.host}:{data.database.port}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Query Ping Latency:</span>
                <span className="font-mono font-medium text-emerald-600">
                  {data.database.latencyMs !== undefined ? `${data.database.latencyMs} ms` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {lastChecked && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Clock3 className="w-3 h-3" />
            <span>Terakhir diperiksa: {lastChecked.toLocaleTimeString('id-ID')}</span>
          </div>
          <span>Status auto-refresh setiap 30 detik</span>
        </div>
      )}
    </div>
  );
}
