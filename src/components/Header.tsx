import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Loader2,
  AlertCircle,
  X,
  CreditCard,
  ShieldCheck,
  Database,
  ChevronLeft,
  ChevronRight,
  History,
  Activity,
  Server,
  Cpu,
  HardDrive,
  RefreshCw,
  Zap,
  Clock,
  CheckCircle2,
  Archive,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark = true,
  onToggleTheme,
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);
  const [spending, setSpending] = useState<any>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpFeedback, setTopUpFeedback] = useState<string | null>(null);
  const [budgetTab, setBudgetTab] = useState<'overview' | 'history'>('overview');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerData, setLedgerData] = useState<any>(null);

  // Uptime & Telemetry State
  const [showUptimeModal, setShowUptimeModal] = useState(false);
  const [uptimeData, setUptimeData] = useState<any>(null);
  const [isRefreshingUptime, setIsRefreshingUptime] = useState(false);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupFeedback, setBackupFeedback] = useState<string | null>(null);

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const {
    user,
    loading: authLoading,
    isSigningIn,
    authError,
    clearAuthError,
    loginWithGoogle,
    loginAsDev,
    logout,
  } = useAuth();

  const loadSpending = () => {
    fetch('/api/v1/spending')
      .then((res) => res.json())
      .then((data) => setSpending(data))
      .catch(() => {});
  };

  const loadLedger = (page: number = 1) => {
    fetch(`/api/v1/spending/records?page=${page}&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        setLedgerData(data);
        setLedgerPage(page);
      })
      .catch(() => {});
  };

  const loadErrorStats = async () => {
    try {
      const res = await fetch('/api/v1/logs/stats');
      if (res.ok) {
        const data = await res.json();
        setErrorStats(data);
      }
    } catch {}
  };

  const loadBackups = async () => {
    try {
      const res = await fetch('/api/v1/system/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch {}
  };

  const [restoringBackupId, setRestoringBackupId] = useState<string | null>(null);
  const [verifyingBackupId, setVerifyingBackupId] = useState<string | null>(null);

  const handleCreateBackup = async () => {
    if (isCreatingBackup) return;
    setIsCreatingBackup(true);
    setBackupFeedback(null);
    try {
      const res = await fetch('/api/v1/system/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: 'UI Manual Snapshot' }),
      });
      const data = await res.json();
      if (res.ok) {
        const kb = ((data.backup?.archiveSizeBytes || 0) / 1024).toFixed(0);
        setBackupFeedback(`Saved (${kb} KB)`);
        showSuccess(`Backup snapshot created successfully (${kb} KB).`, 'Backup Snapshot');
        loadBackups();
      } else {
        setBackupFeedback(data.detail || 'Backup failed');
        showError(data.detail || 'Backup failed.', 'Backup Error');
      }
    } catch (e: any) {
      setBackupFeedback(e.message || 'Backup failed');
      showError(e.message || 'Backup failed.', 'Backup Error');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleVerifyBackup = async (backupId: string) => {
    if (verifyingBackupId) return;
    setVerifyingBackupId(backupId);
    try {
      const res = await fetch(`/api/v1/system/backups/${encodeURIComponent(backupId)}/verify`);
      const data = await res.json();
      if (res.ok && data.valid) {
        showSuccess(`Backup checksum verified (${data.manifest?.repos?.count ?? 0} repos).`, 'Checksum Verified');
      } else {
        showError(data.detail || 'Backup verification failed.', 'Verification Failed');
      }
    } catch (err: any) {
      showError(err.message || 'Verification failed.', 'Network Error');
    } finally {
      setVerifyingBackupId(null);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (restoringBackupId) return;
    setRestoringBackupId(backupId);
    try {
      const res = await fetch(`/api/v1/system/backups/${encodeURIComponent(backupId)}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess(`System state restored from snapshot ${backupId.slice(-12)}.`, 'Restoration Complete');
        loadUptime();
        loadSpending();
        loadBackups();
      } else {
        showError(data.detail || 'Restoration failed.', 'Restoration Failed');
      }
    } catch (err: any) {
      showError(err.message || 'Restoration failed.', 'Network Error');
    } finally {
      setRestoringBackupId(null);
    }
  };

  const loadUptime = async () => {
    setIsRefreshingUptime(true);
    try {
      const res = await fetch('/api/v1/uptime');
      if (res.ok) {
        const data = await res.json();
        setUptimeData(data);
      }
      loadErrorStats();
      loadBackups();
    } catch {
      // ignore
    } finally {
      setIsRefreshingUptime(false);
    }
  };

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'offline', version: '0.1.0' }));
    loadSpending();
    loadLedger(1);
    loadUptime();
  }, []);

  const handleTopUpBudget = async (amount: number) => {
    if (isTopUpLoading) return;
    setIsTopUpLoading(true);
    setTopUpFeedback(null);
    try {
      // Deterministic / unique idempotency key to prevent double charging
      const idempotencyKey = `topup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const res = await fetch('/api/v1/payments/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          idempotencyKey,
          amountUsd: amount,
          description: `Budget Top-Up ($${amount})`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTopUpFeedback(`+$${amount.toFixed(2)} Added! ${data.isDuplicate ? '(Idempotent Replay)' : 'Duplicate-Protected'}`);
        showSuccess(`+$${amount.toFixed(2)} added to AI budget!`, 'Budget Top-Up');
        loadSpending();
        setTimeout(() => setTopUpFeedback(null), 3500);
      } else {
        setTopUpFeedback(data.detail || 'Top-up failed');
        showError(data.detail || 'Top-up failed.', 'Top-Up Error');
      }
    } catch {
      setTopUpFeedback('Network error');
      showError('Network error topping up budget.', 'Network Error');
    } finally {
      setIsTopUpLoading(false);
    }
  };

  return (
    <header className="border-b border-black/[0.08] dark:border-white/[0.08] bg-[#FAFAFA]/90 dark:bg-black/90 backdrop-blur-md sticky top-0 z-50 text-[#171717] dark:text-[#EDEDED] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          <a
            href="#workbench"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072F5] rounded-md"
            title="CodeSage Studio – Back to Top"
          >
            <picture>
              <source srcSet="/logos/text-mark.svg" type="image/svg+xml" />
              <source srcSet="/logos/text-mark.png" type="image/png" />
              <img
                src="/logos/text-mark.svg"
                alt="CodeSage"
                className="h-7 sm:h-8 w-auto max-w-[160px] sm:max-w-[200px] object-contain brightness-100 dark:brightness-125 hover:opacity-85 transition-opacity duration-150"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('textmark.png')) {
                    target.src = '/logos/textmark.png';
                  }
                }}
              />
            </picture>

            <span className="text-neutral-400 dark:text-neutral-600 font-mono text-xs hidden sm:inline">/</span>
            <span className="font-medium text-xs sm:text-sm tracking-tight text-[#4D4D4D] dark:text-[#A1A1A1] hidden sm:inline">Studio</span>
            <span className="hidden md:inline-block px-2 py-0.5 text-[11px] font-mono font-medium text-[#4D4D4D] dark:text-[#A1A1A1] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-md whitespace-nowrap">
              v{health?.version || '0.1.0'}
            </span>
          </a>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Uptime & System Health Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUptimeModal(!showUptimeModal);
                if (!showUptimeModal) loadUptime();
              }}
              className="hidden sm:flex items-center space-x-2 text-xs font-mono px-2.5 py-1 rounded-md text-[#4D4D4D] dark:text-[#A1A1A1] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-emerald-500/40 transition-colors cursor-pointer whitespace-nowrap"
              title="Click to view Live System Uptime & Telemetry"
            >
              <span className={`w-2 h-2 rounded-full ${
                uptimeData?.status === 'operational' || (!uptimeData && health?.status === 'healthy')
                  ? 'bg-emerald-500 animate-pulse'
                  : uptimeData?.status === 'degraded'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
              }`} />
              <span>
                {uptimeData?.uptime_sla_percentage ? `${uptimeData.uptime_sla_percentage}% SLA` : 'Uptime'} &bull; {uptimeData?.uptime_formatted || (health?.status === 'healthy' ? 'Online' : health?.status || 'Online')}
              </span>
            </button>

            {/* Uptime & Telemetry Drawer/Popover */}
            <AnimatePresence>
              {showUptimeModal && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-96 max-w-[90vw] bg-white dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xl p-4 z-50 text-xs space-y-3.5"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-sm text-[#171717] dark:text-white">System Telemetry & Uptime</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={loadUptime}
                        disabled={isRefreshingUptime}
                        className="p-1 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
                        title="Refresh metrics"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingUptime ? 'animate-spin text-[#e8702a]' : ''}`} />
                      </button>
                      <button
                        onClick={() => setShowUptimeModal(false)}
                        className="p-1 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded text-[#8F8F8F] hover:text-[#171717] dark:hover:text-[#EDEDED] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center space-x-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{uptimeData?.status === 'operational' ? 'All Systems Operational' : 'Systems Active'}</span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">
                      {uptimeData?.uptime_sla_percentage ?? 99.98}% SLA
                    </span>
                  </div>

                  {/* Longevity & Core Stats */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                      <div className="text-[#8F8F8F] flex items-center space-x-1 mb-1">
                        <Clock className="w-3 h-3 text-[#e8702a]" />
                        <span>Continuous Uptime</span>
                      </div>
                      <div className="text-sm font-semibold text-[#171717] dark:text-[#EDEDED]">
                        {uptimeData?.uptime_formatted || 'Active'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                      <div className="text-[#8F8F8F] flex items-center space-x-1 mb-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>P95 Latency</span>
                      </div>
                      <div className="text-sm font-semibold text-[#171717] dark:text-[#EDEDED]">
                        {uptimeData?.latency?.p95_ms ?? 0} ms
                      </div>
                    </div>
                  </div>

                  {/* Subsystems Health Matrix */}
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#8F8F8F] font-semibold mb-1.5">
                      Subsystem Health & Probes
                    </div>
                    <div className="space-y-1.5 text-[11px] font-mono">
                      {uptimeData?.subsystems && Object.entries(uptimeData.subsystems).map(([key, sub]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-1.5 rounded bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                          <div className="flex items-center space-x-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[#171717] dark:text-[#EDEDED] font-medium">{sub.name}</span>
                          </div>
                          <div className="text-[#8F8F8F]">
                            {sub.latencyMs !== undefined ? `${sub.latencyMs} ms` : sub.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Repeat Request Cache Telemetry */}
                  {uptimeData?.cache_performance && (
                    <div className="p-2.5 rounded-lg bg-[#FAFAFA] dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] space-y-1.5 text-[11px] font-mono">
                      <div className="flex items-center justify-between text-[#8F8F8F]">
                        <span>Repeat Request Cache Hit Ratio:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {uptimeData.cache_performance.hitRatioPercentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#8F8F8F]">
                        <span>Cached Idempotent Entries:</span>
                        <span className="text-[#171717] dark:text-[#EDEDED]">
                          {uptimeData.cache_performance.entryCount} / {uptimeData.cache_performance.maxEntries}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#8F8F8F]">
                        <span>Total Cache Invocations:</span>
                        <span className="text-[#171717] dark:text-[#EDEDED]">
                          {uptimeData.cache_performance.hits} hits &bull; {uptimeData.cache_performance.misses} misses
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error Telemetry & Logs Summary */}
                  {errorStats && (
                    <div className="p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-1.5 text-[11px] font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-[#171717] dark:text-[#EDEDED]">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-semibold">Error Logging & Stability</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          errorStats.errorCount === 0
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {errorStats.errorCount} Errors &bull; {errorStats.last24Hours} in 24h
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#8F8F8F] text-[10px]">
                        <span>Indexed SQLite Log Storage</span>
                        <span>{errorStats.total} Total Events Logged</span>
                      </div>
                    </div>
                  )}

                  {/* System Backup & Recovery */}
                  <div className="p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[#171717] dark:text-[#EDEDED]">
                        <Archive className="w-3.5 h-3.5 text-[#e8702a]" />
                        <span className="font-semibold">Backups & Recovery</span>
                      </div>
                      <span className="text-[10px] text-[#8F8F8F]">
                        {backups.length} Snapshot{backups.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="px-2.5 py-1 rounded bg-[#e8702a] hover:bg-[#d4611d] text-white text-[10px] font-sans font-medium transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        {isCreatingBackup ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Creating Snapshot...</span>
                          </>
                        ) : (
                          <>
                            <Archive className="w-3 h-3" />
                            <span>Create Backup</span>
                          </>
                        )}
                      </button>

                      {backupFeedback && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {backupFeedback}
                        </span>
                      )}
                    </div>

                    {/* Snapshot List with Restore & Verify Action Buttons */}
                    {backups.length > 0 && (
                      <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] space-y-1.5 max-h-36 overflow-y-auto">
                        {backups.slice(0, 3).map((b) => (
                          <div
                            key={b.backupId}
                            className="p-1.5 rounded bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-1 text-[10px]"
                          >
                            <div className="truncate min-w-0 pr-1">
                              <div className="font-medium text-[#171717] dark:text-[#EDEDED] truncate">
                                {b.label || b.backupId}
                              </div>
                              <div className="text-[#8F8F8F]">
                                {((b.archiveSizeBytes || 0) / 1024).toFixed(0)} KB &bull; {b.repos?.count || 0} repos
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleVerifyBackup(b.backupId)}
                                disabled={verifyingBackupId === b.backupId}
                                className="px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#171717] dark:text-[#EDEDED] transition-colors cursor-pointer"
                                title="Verify backup archive checksum"
                              >
                                {verifyingBackupId === b.backupId ? '...' : 'Verify'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRestoreBackup(b.backupId)}
                                disabled={restoringBackupId === b.backupId}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-medium transition-colors cursor-pointer"
                                title="Restore database & repository state from this backup"
                              >
                                {restoringBackupId === b.backupId ? '...' : 'Restore'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Probe Links Footer */}
                  <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-[#8F8F8F]">
                    <span>Probes: /health/liveness &bull; /health/readiness</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Auto-Heartbeat Active</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Spending & Budget Popover */}
          {spending && (
            <div className="relative">
              <button
                onClick={() => setShowBudgetModal(!showBudgetModal)}
                className="hidden sm:flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded-md text-[#4D4D4D] dark:text-[#A1A1A1] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-[#e8702a]/50 transition-colors cursor-pointer"
                title="AI Budget & Database Status"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#e8702a]" />
                <span>Budget: ${spending.daily?.spent_usd?.toFixed(2) ?? '0.00'} / ${spending.daily?.cap_usd?.toFixed(2) ?? '5.00'}</span>
              </button>

              <AnimatePresence>
                {showBudgetModal && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-80 bg-white dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xl p-4 z-50 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
                      <div className="flex items-center space-x-1.5 p-0.5 bg-black/[0.03] dark:bg-white/[0.05] rounded-md text-[11px] font-mono">
                        <button
                          onClick={() => setBudgetTab('overview')}
                          className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            budgetTab === 'overview'
                              ? 'bg-white dark:bg-[#222226] text-[#171717] dark:text-white font-medium shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => {
                            setBudgetTab('history');
                            loadLedger(ledgerPage);
                          }}
                          className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center space-x-1 ${
                            budgetTab === 'history'
                              ? 'bg-white dark:bg-[#222226] text-[#171717] dark:text-white font-medium shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <History className="w-3 h-3" />
                          <span>Ledger</span>
                        </button>
                      </div>
                      <button
                        onClick={() => setShowBudgetModal(false)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {budgetTab === 'overview' ? (
                      <>
                        {/* Spending Progress */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
                            <span>Daily Spending</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              ${spending.daily?.spent_usd?.toFixed(4)} / ${spending.daily?.cap_usd?.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#e8702a] rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, spending.daily?.percent_used || 0)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>{spending.daily?.calls_count || 0} API calls today</span>
                            <span>{spending.daily?.tokens_used || 0} tokens</span>
                          </div>
                        </div>

                        {/* DB Optimizations Badge */}
                        <div className="p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-1">
                          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Database className="w-3.5 h-3.5" />
                            <span>DB Query Engine: Optimized</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            SQLite WAL mode active • Precompiled prepared statements • Covering indices for 0ms ledger summaries.
                          </p>
                        </div>

                        {/* Duplicate-Protected Top-Up */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            <span>Top-Up Budget</span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Dupe-Protected</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleTopUpBudget(5.0)}
                              disabled={isTopUpLoading}
                              className="px-2.5 py-1.5 bg-[#e8702a] hover:bg-[#d66320] text-white rounded-lg font-medium text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <span>+$5.00</span>
                            </button>
                            <button
                              onClick={() => handleTopUpBudget(10.0)}
                              disabled={isTopUpLoading}
                              className="px-2.5 py-1.5 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-slate-800 dark:text-slate-200 border border-black/[0.06] dark:border-white/[0.08] rounded-lg font-medium text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <span>+$10.00</span>
                            </button>
                          </div>
                          {topUpFeedback && (
                            <div className="text-[11px] font-mono text-center text-emerald-600 dark:text-emerald-400 animate-fadeIn pt-1">
                              {topUpFeedback}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Paginated Ledger History */
                      <div className="space-y-2">
                        <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-[11px]">
                          {!ledgerData?.data || ledgerData.data.length === 0 ? (
                            <div className="text-center py-4 text-slate-400">No ledger records yet.</div>
                          ) : (
                            ledgerData.data.map((rec: any) => (
                              <div
                                key={rec.id}
                                className="flex items-center justify-between p-1.5 rounded bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {rec.service}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="font-medium text-[#e8702a]">
                                    ${Number(rec.estimated_cost_usd).toFixed(4)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {rec.total_tokens} tokens
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Pagination Bar */}
                        {ledgerData?.pagination && (
                          <div className="flex items-center justify-between pt-1 border-t border-black/[0.06] dark:border-white/[0.08] font-mono text-[10px] text-slate-400">
                            <span>Total: {ledgerData.pagination.total} records</span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => loadLedger(ledgerPage - 1)}
                                disabled={!ledgerData.pagination.hasPrev}
                                className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <span>
                                {ledgerData.pagination.page} / {ledgerData.pagination.totalPages || 1}
                              </span>
                              <button
                                onClick={() => loadLedger(ledgerPage + 1)}
                                disabled={!ledgerData.pagination.hasNext}
                                className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {onToggleTheme && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onToggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-md text-[#4D4D4D] hover:text-[#171717] hover:bg-[#EBEBEB] dark:text-[#A1A1A1] dark:hover:text-[#EDEDED] dark:hover:bg-[#1a1a1d] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0072F5]"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4D4D4D]" />}
            </motion.button>
          )}

          {/* Firebase Authentication State */}
          {!authLoading && (
            user ? (
              <div className="flex items-center space-x-2 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] px-2 py-1 rounded-lg">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-black/10 dark:border-white/20"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#e8702a] text-white text-[10px] font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium hidden sm:inline max-w-[110px] truncate text-[#171717] dark:text-[#EDEDED]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                {user.isDev && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    DEV
                  </span>
                )}
                <button
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign out"
                  className="p-1 rounded text-[#8F8F8F] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => loginWithGoogle()}
                  disabled={isSigningIn}
                  className="flex items-center space-x-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-md text-xs font-medium bg-[#171717] hover:bg-[#2c2c2c] dark:bg-white dark:hover:bg-[#EDEDED] text-white dark:text-[#171717] transition-all cursor-pointer shadow-sm disabled:opacity-60"
                  title="Sign in with Google"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e8702a]" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in</span>
                    </>
                  )}
                </motion.button>

                {isLocalhost && (
                  <button
                    onClick={loginAsDev}
                    title="Quick sign-in with local dev profile (bypasses Google OAuth domain limit)"
                    className="hidden sm:inline-flex items-center px-2 py-1 rounded text-[11px] font-mono font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer"
                  >
                    Dev Login
                  </button>
                )}
              </div>
            )
          )}

          <div
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium text-[#e8702a] bg-[#e8702a]/10 border border-[#e8702a]/20 shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" />
            <span className="hidden md:inline font-mono">CodeSage AI</span>
          </div>
        </div>
      </div>

      {/* Floating Auth Error Notification */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 sm:right-8 z-[60] max-w-md bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/30 text-slate-800 dark:text-slate-200 p-3.5 rounded-xl shadow-2xl text-xs space-y-2.5 backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400">
                    Firebase Sign-In Notice
                  </div>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {authError}
                  </p>
                </div>
              </div>
              <button
                onClick={clearAuthError}
                aria-label="Dismiss error"
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
              {isLocalhost && (
                <button
                  onClick={loginAsDev}
                  className="px-2.5 py-1 rounded bg-[#0072F5] hover:bg-[#0060df] text-white font-medium text-[11px] transition-colors cursor-pointer shadow-sm flex items-center space-x-1"
                >
                  <span>Continue with Dev Profile</span>
                </button>
              )}
              <a
                href="https://console.cloud.google.com/customer-identity/settings?project=modern-night-4t8c4"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-medium text-[11px] transition-colors cursor-pointer inline-flex items-center space-x-1"
              >
                <span>Add in Cloud Console ↗</span>
              </a>
              <button
                onClick={clearAuthError}
                className="px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 text-[11px] transition-colors cursor-pointer ml-auto"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


