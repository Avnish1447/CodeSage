import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  ArrowLeft,
  Printer,
  Sparkles,
  ExternalLink,
  Lock,
  Eye,
  Server,
  Globe,
  Clock,
  UserCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Share2,
  Mail,
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  initialTab?: 'privacy' | 'terms';
  onNavigateHome?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  initialTab = 'privacy',
  onNavigateHome,
  isDark = false,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('terms')) return 'terms';
      const path = window.location.pathname.toLowerCase();
      if (path.includes('terms')) return 'terms';
    }
    return initialTab;
  });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    document.title = activeTab === 'privacy' 
      ? 'Privacy Policy – CodeSage AI Stratigraphy Engine'
      : 'Terms & Conditions – CodeSage AI Stratigraphy Engine';
  }, [activeTab]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const navigateToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDark ? 'dark bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'}`}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a
              href="/"
              onClick={navigateToHome}
              className="inline-flex items-center space-x-2 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to CodeSage</span>
            </a>
            <span className="text-neutral-300 dark:text-neutral-700">/</span>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-[#e8702a]/10 border border-[#e8702a]/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#e8702a]" />
              </div>
              <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-white">
                Legal &amp; Compliance
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy link to document"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Print document"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title="Toggle Theme"
                className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-[#e8702a] bg-[#e8702a]/10 border border-[#e8702a]/20 mb-4">
            <Shield className="w-3.5 h-3.5 text-[#e8702a]" />
            <span>Transparency &amp; Trust Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            CodeSage Legal &amp; Privacy Center
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Clear, transparent policies detailing how CodeSage collects, processes, and protects your data, and the terms governing your use of our platform.
          </p>

          <div className="mt-4 flex items-center justify-center space-x-3 text-xs text-neutral-500 font-mono">
            <span>Last Updated: September 29, 2026</span>
            <span>&bull;</span>
            <span>Effective Date: September 29, 2026</span>
          </div>

          {/* Document Switcher Tabs */}
          <div className="mt-8 inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('privacy');
                window.history.replaceState(null, '', '/privacypolicy#privacy');
              }}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-[#e8702a]" />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('terms');
                window.history.replaceState(null, '', '/privacypolicy#terms');
              }}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-[#0072F5]" />
              <span>Terms &amp; Conditions</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {activeTab === 'privacy' ? <PrivacyPolicySection /> : <TermsAndConditionsSection />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-8 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; {new Date().getFullYear()} CodeSage Technologies. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:underline cursor-pointer"
            >
              Terms of Service
            </button>
            <span>&bull;</span>
            <a
              href="mailto:privacy@thecodesage.com"
              className="hover:underline flex items-center space-x-1"
            >
              <Mail className="w-3 h-3" />
              <span>privacy@thecodesage.com</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* =========================================================================
 * 1) PRIVACY POLICY COMPONENT
 * ========================================================================= */
const PrivacyPolicySection: React.FC = () => {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
      {/* Review Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start space-x-3">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Legal Notice &amp; Disclaimer</strong>
          This document is provided for transparency and informational purposes only and does not constitute formal legal counsel. It reflects our current technical architecture and data processing practices across our services at <a href="https://thecodesage.vercel.app" className="underline font-mono">https://thecodesage.vercel.app</a>.
        </div>
      </div>

      {/* Introduction & Who We Are */}
      <section id="introduction" className="space-y-3">
        <div className="flex items-center space-x-2 text-neutral-900 dark:text-white">
          <Globe className="w-5 h-5 text-[#e8702a]" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight m-0">Introduction &amp; Who We Are</h2>
        </div>
        <p>
          Welcome to <strong>CodeSage</strong> (&ldquo;CodeSage&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We operate the developer platform accessible at <a href="https://thecodesage.vercel.app" className="text-[#0072F5] hover:underline font-mono">https://thecodesage.vercel.app</a> (the &ldquo;Platform&rdquo;), providing intelligent codebase stratigraphy, Abstract Syntax Tree (AST) parsing, architectural summaries, and grounded Retrieval-Augmented Generation (RAG) through Google Gemini AI.
        </p>
        <p>
          We respect your privacy and are committed to protecting your personal data. This Privacy Policy informs you about how we handle your personal data when you visit our Platform, log in, or analyze code repositories, and describes your privacy rights under applicable data protection laws including the General Data Protection Regulation (<strong>GDPR</strong>), the UK GDPR, and the California Consumer Privacy Act as amended by the California Privacy Rights Act (<strong>CCPA/CPRA</strong>).
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <em>[Note for CodeSage Team: If you establish a dedicated legal entity or register a Data Protection Officer (DPO), update the legal entity name and primary registered office address here.]</em>
        </p>
      </section>

      {/* Personal Data We Collect */}
      <section id="data-collected" className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center space-x-2 text-neutral-900 dark:text-white">
          <Eye className="w-5 h-5 text-[#0072F5]" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight m-0">Personal Data We Collect (by Category)</h2>
        </div>
        <p>
          We collect and process personal data only when strictly necessary to deliver, safeguard, and improve our services. The categories of personal data collected include:
        </p>
        <div className="grid gap-3 sm:grid-cols-2 not-prose my-4">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center space-x-1.5 mb-1.5">
              <UserCheck className="w-4 h-4 text-[#e8702a]" />
              <span>1. Account &amp; Identity Data</span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              When authenticating via Google OAuth or Supabase Cloud Auth: your user ID, full name, email address, profile avatar URL, and authentication timestamps.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center space-x-1.5 mb-1.5">
              <Server className="w-4 h-4 text-[#0072F5]" />
              <span>2. Repository &amp; Analysis Data</span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Public GitHub repository URLs you submit, branch names, file tree structures, file counts, detected languages, and cached architectural summaries. We do <strong>not</strong> permanently store private source code on persistent servers.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center space-x-1.5 mb-1.5">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>3. Technical &amp; Device Telemetry</span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              IP addresses (anonymized for rate limiting and fraud protection), browser type, operating system, request latency, API error statistics, and server health telemetry.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white flex items-center space-x-1.5 mb-1.5">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>4. Client-Side Storage &amp; Cache</span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              IndexedDB local database caches and LocalStorage keys (e.g., <code>codesage_theme_v2</code>, <code>codesage_history</code>) stored locally in your browser for instant 0ms reload speeds.
            </p>
          </div>
        </div>
      </section>

      {/* How We Use Data */}
      <section id="how-we-use-data" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          How We Use Data (Purposes &amp; Legal Bases)
        </h2>
        <p>
          Under the GDPR and UK GDPR, we only process your personal data where we have a lawful legal basis:
        </p>
        <div className="overflow-x-auto my-3 not-prose">
          <table className="w-full text-xs text-left border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Purpose / Activity</th>
                <th className="p-3">Data Categories</th>
                <th className="p-3">Lawful Basis (GDPR / UK GDPR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              <tr>
                <td className="p-3 font-medium text-neutral-900 dark:text-white">User authentication &amp; session persistence</td>
                <td className="p-3 text-neutral-600 dark:text-neutral-400">Account &amp; Identity Data</td>
                <td className="p-3 text-neutral-600 dark:text-neutral-400">Performance of a contract (Terms of Service)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-neutral-900 dark:text-white">Generating AST stratigraphy, prompts &amp; AI chat</td>
                <td className="p-3 text-neutral-600 dark:text-neutral-400">Repository &amp; Query Data</td>
                <td className="p-3 text-neutral-600 dark:text-neutral-400">Performance of a contract; Legitimate interests</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-neutral-900 dark:text-white">Abuse prevention, rate-limiting &amp; security verification</td>
                <td className="p-3 text-neutral-600 dark:text-neutral-400">Technical &amp; Telemetry Data</td>
                <td className="p-3 text-neutral-600 dark:text-neutral-400">Legitimate interests (protecting platform integrity)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-neutral-900 dark:text-white">Cloud synchronization of recent repository history</td>
                <td className="p-3 text-neutral-600 dark:text-neutral-400">Account ID &amp; Repo Metadata</td>
                <td className="p-3 text-neutral-600 dark:text-neutral-400">Consent (user-initiated history sync in Supabase)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sharing & Processors */}
      <section id="sharing-processors" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Sharing &amp; Data Processors
        </h2>
        <p>
          We do not sell, rent, or trade your personal data. We disclose information solely to vetted service providers acting as our data processors under strict confidentiality and security terms:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Supabase Inc.:</strong> Cloud database and authentication infrastructure. Houses your user profile and synced repository ledger under Row-Level Security (RLS) enforcement.
          </li>
          <li>
            <strong>Google LLC (Google Cloud &amp; Google AI):</strong> Provides Google OAuth 2.0 identity verification and Google Gemini AI API endpoints for processing AST summaries and natural language codebase queries.
          </li>
          <li>
            <strong>Vercel Inc.:</strong> Hosting provider, edge DNS routing, serverless function compute, and content distribution network (CDN).
          </li>
          <li>
            <strong>GitHub / Microsoft Corp.:</strong> We query public GitHub REST and Git Trees APIs to fetch repository structure on your command.
          </li>
        </ul>
      </section>

      {/* International Transfers */}
      <section id="international-transfers" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
          Cross-Border Transfers (EU / UK / Global)
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          International Transfers
        </h2>
        <p>
          CodeSage and its processors operate globally. When transferring personal data originating in the European Economic Area (EEA) or UK to countries not recognized as providing an adequate level of data protection, we implement standard contractual safeguards, including the European Commission’s Standard Contractual Clauses (<strong>SCCs</strong>) and the UK International Data Transfer Addendum.
        </p>
      </section>

      {/* Data Retention */}
      <section id="data-retention" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Data Retention
        </h2>
        <p>
          We retain your personal data only as long as necessary to fulfill the purposes for which it was collected:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>User Account &amp; Profile Data:</strong> Retained while your account remains active. If you delete your account or request erasure, your records in Supabase are purged within 30 days.
          </li>
          <li>
            <strong>Repository Cache &amp; Tree Data:</strong> Ingested repository files are cached in ephemeral memory/local storage to serve your immediate analysis and purged automatically.
          </li>
          <li>
            <strong>Telemetry &amp; Audit Logs:</strong> Security logs and rate-limiting counters are retained on a rolling window of up to 90 days.
          </li>
        </ul>
      </section>

      {/* Your Rights */}
      <section id="your-rights" className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Your Rights &amp; Choices
        </h2>

        {/* GDPR Subsection */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#0072F5]">
            [EU / UK Residents – GDPR &amp; UK GDPR]
          </span>
          <p className="text-xs sm:text-sm">You have the following statutory rights:</p>
          <ul className="text-xs sm:text-sm list-disc pl-5 space-y-1">
            <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
            <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your personal data.</li>
            <li><strong>Right to Restriction &amp; Objection:</strong> Object to or restrict certain processing activities.</li>
            <li><strong>Right to Data Portability:</strong> Obtain your data in a structured, machine-readable format.</li>
            <li><strong>Right to Lodge a Complaint:</strong> File a grievance with your national data protection supervisory authority.</li>
          </ul>
        </div>

        {/* CCPA/CPRA Subsection */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#e8702a]">
            [California Residents – CCPA / CPRA]
          </span>
          <p className="text-xs sm:text-sm">Under the California Consumer Privacy Act:</p>
          <ul className="text-xs sm:text-sm list-disc pl-5 space-y-1">
            <li><strong>Right to Know:</strong> Request disclosure of categories and specific pieces of personal information collected.</li>
            <li><strong>Right to Delete:</strong> Request deletion of personal information collected from you.</li>
            <li><strong>Right to Opt-Out of Sale / Sharing:</strong> We do <strong>not</strong> sell your personal information or share it for cross-context behavioral advertising.</li>
            <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights.</li>
          </ul>
        </div>

        <p className="text-xs">
          To exercise any of these rights, email us at <a href="mailto:privacy@thecodesage.com" className="text-[#0072F5] underline font-medium">privacy@thecodesage.com</a>. We will verify your identity and respond within the statutory timeframe (normally 30 days).
        </p>
      </section>

      {/* Cookies & Local Storage */}
      <section id="cookies" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Cookies &amp; Local Storage
        </h2>
        <p>
          CodeSage uses essential local storage mechanisms to provide a seamless user experience:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Authentication Tokens:</strong> Secure session cookies and Supabase tokens to maintain your login session.</li>
          <li><strong>Client-Side Preferences:</strong> LocalStorage keys (e.g. <code>codesage_theme_v2</code>) to remember your chosen theme (light/dark mode).</li>
          <li><strong>IndexedDB Analysis Cache:</strong> Offline repository analysis snapshots saved locally on your device for rapid navigation without re-fetching from GitHub.</li>
        </ul>
        <p>
          We do not deploy intrusive third-party cross-site tracking cookies. You may clear your browser cookies and storage at any time through your browser settings.
        </p>
      </section>

      {/* Security Measures */}
      <section id="security" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Security Measures
        </h2>
        <p>
          We implement rigorous technical and organizational measures to safeguard your data against accidental loss, unauthorized access, or alteration:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>End-to-End TLS 1.3 Encryption:</strong> All data in transit across our edge servers, APIs, and client browsers is encrypted using strong HTTPS/TLS protocols.</li>
          <li><strong>Row-Level Security (RLS):</strong> User history and records in our Supabase PostgreSQL database are partitioned using strict cryptographic user identity policies.</li>
          <li><strong>Least Privilege &amp; Token Limiting:</strong> Server-side AI processing uses scoped Gemini API keys with atomic spending reservations to prevent abuse.</li>
        </ul>
      </section>

      {/* Children's Privacy */}
      <section id="children" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Children&rsquo;s Privacy
        </h2>
        <p>
          CodeSage is designed for professional developers and technology enthusiasts. It is not intended for use by children under the age of 13 (or under 16 in the EEA/UK). We do not knowingly collect personal data from children. If you become aware that a child has provided us with personal data, please contact us at <a href="mailto:privacy@thecodesage.com" className="text-[#0072F5] underline font-medium">privacy@thecodesage.com</a> so we can delete it immediately.
        </p>
      </section>

      {/* Changes to This Policy */}
      <section id="changes" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time to reflect evolving technical, legal, or business practices. When changes are made, we will revise the &ldquo;Last Updated&rdquo; date at the top of this document. Material changes will be accompanied by prominent notice on our website or through an in-app banner.
        </p>
      </section>

      {/* Contact Information */}
      <section id="contact" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Contact Information
        </h2>
        <p>
          If you have questions, comments, or requests regarding this Privacy Policy or our data protection practices, please contact our privacy team:
        </p>
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 not-prose space-y-1 font-mono text-xs">
          <div><strong>Entity:</strong> CodeSage Technologies</div>
          <div><strong>Website:</strong> <a href="https://thecodesage.vercel.app" className="text-[#0072F5]">https://thecodesage.vercel.app</a></div>
          <div><strong>Privacy &amp; Data Rights Email:</strong> <a href="mailto:privacy@thecodesage.com" className="text-[#0072F5]">privacy@thecodesage.com</a></div>
          <div><strong>General Support:</strong> <a href="mailto:support@thecodesage.com" className="text-[#0072F5]">support@thecodesage.com</a></div>
        </div>
      </section>
    </article>
  );
};

/* =========================================================================
 * 2) TERMS & CONDITIONS COMPONENT
 * ========================================================================= */
const TermsAndConditionsSection: React.FC = () => {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
      {/* Review Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-900 dark:text-blue-200 text-xs sm:text-sm flex items-start space-x-3">
        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Non-Legal-Advice Review Notice</strong>
          These Terms &amp; Conditions govern the use of CodeSage services. This draft is provided in plain language for commercial clarity. Users must review and agree to these terms before utilizing our codebase analysis, stratigraphy, and AI RAG features.
        </div>
      </div>

      {/* Acceptance of Terms */}
      <section id="acceptance" className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using the CodeSage platform at <a href="https://thecodesage.vercel.app" className="text-[#0072F5] hover:underline font-mono">https://thecodesage.vercel.app</a> (the &ldquo;Service&rdquo;), you agree to be legally bound by these Terms &amp; Conditions (&ldquo;Terms&rdquo;). If you do not agree to all of these Terms, you must not access or use the Service.
        </p>
      </section>

      {/* Eligibility & Accounts */}
      <section id="eligibility" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          2. Eligibility &amp; Accounts
        </h2>
        <p>
          You must be at least 13 years old (or 16 in the EEA/UK) to access the Service. By creating an account or authenticating via Google OAuth or Supabase, you represent and warrant that:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The account information you provide is accurate, current, and complete.</li>
          <li>You are responsible for maintaining the confidentiality of your session credentials.</li>
          <li>You will notify us immediately of any unauthorized use or security compromise of your account.</li>
        </ul>
      </section>

      {/* Subscriptions, Billing, and Refunds */}
      <section id="billing" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          3. Subscriptions, Billing, and Refunds
        </h2>
        <p>
          CodeSage currently provides free community access with daily token and query rate limits. We reserve the right to introduce optional premium subscription tiers, enterprise API quotas, and advanced features in the future.
        </p>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <em>[Note for CodeSage Team: If you integrate payment gateways like Stripe or LemonSqueezy, specify billing cycles (monthly/annual), price change notices, and your refund policy window (e.g., 14-day statutory EU withdrawal period or 7-day money-back guarantee).]</em>
        </div>
      </section>

      {/* Acceptable Use */}
      <section id="acceptable-use" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          4. Acceptable Use Policy
        </h2>
        <p>
          You agree to use CodeSage exclusively for lawful software engineering, educational, and architectural analysis purposes. You agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Submit repository URLs or source code that infringe third-party copyrights, trade secrets, or licensing terms.</li>
          <li>Use the platform to ingest, compile, distribute, or analyze malware, spyware, ransomware, or malicious exploits.</li>
          <li>Bypass or attempt to circumvent API rate limiters, token spend caps, or authentication guards.</li>
          <li>Scrape, reverse engineer, decompile, or copy the proprietary algorithms of the CodeSage stratigraphy engine.</li>
          <li>Use automated bots or crawlers that place an unreasonable or disproportionately heavy load on our infrastructure.</li>
        </ul>
      </section>

      {/* Intellectual Property */}
      <section id="intellectual-property" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          5. Intellectual Property
        </h2>
        <p>
          <strong>Your Code &amp; Repositories:</strong> You retain all ownership, copyright, and intellectual property rights in the repositories you analyze. CodeSage does not claim ownership over your source code, your project files, or the repository outputs you generate.
        </p>
        <p>
          <strong>CodeSage IP:</strong> The platform design, logos, brand assets, user interface, AST parsing pipelines, and proprietary algorithms are the exclusive property of CodeSage and its licensors, protected by intellectual property laws. Open-source client code released under the MIT License is governed by its respective LICENSE file.
        </p>
      </section>

      {/* Third-Party Services */}
      <section id="third-party-services" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          6. Third-Party Services
        </h2>
        <p>
          The Service interfaces with third-party APIs and platforms, including Google Gemini, Supabase, Vercel, and GitHub. Your use of these services is subject to their respective terms and privacy policies. We are not responsible for the availability, uptime, or behavior of external third-party services.
        </p>
      </section>

      {/* Disclaimers & Limitation of Liability */}
      <section id="disclaimers" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          7. Disclaimers &amp; Limitation of Liability
        </h2>
        <p className="uppercase text-xs font-semibold tracking-wider text-neutral-500">
          Please read this section carefully as it limits our liability.
        </p>
        <p>
          THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ACCURACY.
        </p>
        <p>
          AI-generated architectural stratigraphy, code summaries, and RAG chat responses are generated probabilistically by large language models (Google Gemini) and may occasionally contain inaccuracies, hallucinations, or incomplete architectural assumptions. You are solely responsible for reviewing and verifying any code or architectural decisions before deploying them to production.
        </p>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CODESAGE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, DATA, OR REPUTATION ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO CODESAGE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM (OR $100 USD IF YOU HAVE USED ONLY FREE SERVICES).
        </p>
      </section>

      {/* Indemnification */}
      <section id="indemnification" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          8. Indemnification
        </h2>
        <p>
          You agree to defend, indemnify, and hold harmless CodeSage, its maintainers, contributors, officers, and contractors from and against any claims, damages, obligations, liabilities, and expenses (including attorney&rsquo;s fees) arising from your violation of these Terms or your infringement of any third-party intellectual property rights.
        </p>
      </section>

      {/* Governing Law & Venue */}
      <section id="governing-law" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          9. Governing Law &amp; Dispute Resolution
        </h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of your applicable jurisdiction, without regard to its conflict of law provisions.
        </p>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <em>[Note for CodeSage Team: Insert chosen legal jurisdiction e.g., State of California, United States, or England &amp; Wales, or the jurisdiction of your incorporation, and whether disputes are resolved via binding arbitration or courts.]</em>
        </div>
      </section>

      {/* Termination */}
      <section id="termination" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          10. Termination
        </h2>
        <p>
          We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, if you breach these Terms or engage in conduct that harms the platform, other users, or third parties. You may stop using the Service at any time by ceasing access or requesting account deletion.
        </p>
      </section>

      {/* Changes to Terms */}
      <section id="changes-terms" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          11. Changes to Terms
        </h2>
        <p>
          We may modify these Terms at any time. When modifications occur, we will update the &ldquo;Last Updated&rdquo; date at the top of this document. Continued use of the Service following the posting of revised Terms constitutes your acceptance of the changes.
        </p>
      </section>

      {/* Contact Information */}
      <section id="contact-terms" className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          12. Contact Information
        </h2>
        <p>
          If you have questions regarding these Terms &amp; Conditions, please reach out to:
        </p>
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 not-prose space-y-1 font-mono text-xs">
          <div><strong>CodeSage Legal Team</strong></div>
          <div><strong>Email:</strong> <a href="mailto:support@thecodesage.com" className="text-[#0072F5]">support@thecodesage.com</a></div>
          <div><strong>Website:</strong> <a href="https://thecodesage.vercel.app" className="text-[#0072F5]">https://thecodesage.vercel.app</a></div>
        </div>
      </section>
    </article>
  );
};
