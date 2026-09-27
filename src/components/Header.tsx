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
  isDark = false,
  onToggleTheme,
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);

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
    loadUptime();
  }, []);

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

          {/* Clerk & Dev Authentication State */}
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
                  title="Sign in with Clerk"
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
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                        />
                      </svg>
                      <span>Sign in</span>
                    </>
                  )}
                </motion.button>

                {isLocalhost && (
                  <button
                    onClick={loginAsDev}
                    title="Quick sign-in with local dev profile"
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

      {/* Floating Auth Notification */}
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
                    Authentication Notice
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
                href="https://dashboard.clerk.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-medium text-[11px] transition-colors cursor-pointer inline-flex items-center space-x-1"
              >
                <span>Clerk Dashboard ↗</span>
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


