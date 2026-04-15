import React, { useState, useEffect } from 'react';
import ProgressCircle from "./Reusables/radial_progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReportModal from './Report';
import AnalysisReport from './analysisReport';
import { 
  ArrowUpRight, 
  Shield, 
  AlertTriangle, 
  Globe, 
  Cookie, 
  Network, 
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";


export default function SecurityDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [scanError, setScanError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('url') || 'https://example.com';

    fetch('http://127.0.0.1:8000/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl })
    }).then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Scan result:', data);
        setScanResult(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Scan error:', error);
        setScanError(error.message);
        setIsLoading(false);
      });
  }, []);

  const contentRisk   = Math.round((scanResult?.result?.content?.risk ?? 0) * 100);
  const redirectScore = scanResult?.result?.redirects?.score ?? 0;
  const networkScore  = scanResult?.result?.network?.score  ?? 0;
  const cookieScore   = scanResult?.result?.cookies?.score ?? 0 ;

  // Overall score: weighted average of sub-scores
  let overallScore  = Math.round((contentRisk * 0.3) + (redirectScore * 0.4) + (networkScore * 0.3) + (cookieScore * 0.4));
  if (redirectScore >= 80) {
    overallScore = 95; // force high risk
  }
  const getRiskLevel = (value) => {
    if (value >= 90) return { level: 'Critical Risk',  color: '#FF5A5F', badge: 'critical' };
    if (value >= 75) return { level: 'High Risk',      color: '#F4B740', badge: 'high'     };
    if (value >= 45) return { level: 'Moderate Risk',  color: '#5AD7FF', badge: 'medium'   };
    return             { level: 'Low Risk',       color: '#2ECC71', badge: 'low'      };
  };

  const risk = getRiskLevel(overallScore);

  const getMessage = (value) => {
    if (value >= 90) return "Critical threats detected. We strongly advise against visiting this website.";
    if (value >= 75) return "Serious security issues found. Proceed only with extreme caution.";
    if (value >= 45) return "Some security concerns identified. Review the details before continuing.";
    return "No major threats detected. This URL appears to be safe.";
  };


  const handelReport = async () => {
    setReportOpen(true);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#EEF5FF] via-[#F8FBFF] via-[#FFF9F5] to-[#F5FFFA]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-300/35 to-cyan-300/35 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-10 right-10 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-br from-teal-300/28 to-emerald-300/28 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-orange-300/25 to-amber-300/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="rounded-3xl p-12 max-w-md mx-auto bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F8CFF] to-[#5AD7FF] rounded-full opacity-20 animate-ping" />
                  <div className="relative bg-gradient-to-br from-[#4F8CFF] to-[#5AD7FF] p-8 rounded-full flex items-center justify-center">
                    <Shield className="w-12 h-12 text-white" strokeWidth={2} />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#1E2A38] mb-3 tracking-tight">Scanning URL</h1>
              <p className="text-base text-[#5F6C7B] mb-8">Checking for threats and vulnerabilities…</p>
              <div className="flex justify-center gap-2">
                {[0, 150, 300].map((delay) => (
                  <div key={delay} className="w-2.5 h-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#5AD7FF] rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (scanError || !scanResult) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#EEF5FF] to-[#F5FFFA]">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-12 max-w-md shadow-2xl border border-red-100">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1E2A38] mb-2">Scan Failed</h1>
          <p className="text-[#5F6C7B] mb-6">{scanError || 'Unable to retrieve scan results. Please try again.'}</p>
          <Button onClick={() => window.history.back()} className="bg-gradient-to-r from-[#4F8CFF] to-[#5AD7FF] text-white rounded-xl px-6 h-12">
            Go Back
          </Button>
        </div>
      </div>
    );
  }


  const scannedUrl = scanResult?.result?.url || new URLSearchParams(window.location.search).get('url') || '';

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#EEF5FF] via-[#F8FBFF] via-[#FFF9F5] to-[#F5FFFA]">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-purple-300/25 to-pink-300/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-0 w-[480px] h-[480px] bg-gradient-to-br from-teal-300/28 to-emerald-300/28 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-gradient-to-br from-orange-300/22 to-amber-300/22 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-[#4F8CFF]" strokeWidth={2} />
            <h1 className="text-5xl font-bold text-[#1E2A38] tracking-tight">Threat Intelligence Report</h1>
          </div>
          <p className="text-lg text-[#5F6C7B] font-medium">Deep URL Security Evaluation</p>
          {scannedUrl && (
            <p className="mt-2 text-sm text-[#98A2B3] font-mono truncate max-w-xl mx-auto">{scannedUrl}</p>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 max-w-[1800px] mx-auto">
          
          {/* Left: Risk Score */}
          <div className="xl:col-span-2">
            <div className="rounded-3xl p-10 bg-white/75 backdrop-blur-xl shadow-xl border border-white/60 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-3xl font-bold text-[#1E2A38] mb-8 text-center tracking-tight">Overall Threat Score</h2>
              
              <div className="flex justify-center mb-8">
                <ProgressCircle WnH={"w-64 h-64"} value={overallScore} />
              </div>

              <div className="flex justify-center mb-6">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
                  risk.badge === 'critical' ? 'bg-red-50 border border-red-200' :
                  risk.badge === 'high'     ? 'bg-amber-50 border border-amber-200' :
                  risk.badge === 'medium'   ? 'bg-cyan-50 border border-cyan-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  {overallScore >= 75 ? <XCircle className="w-5 h-5" style={{ color: risk.color }} /> : 
                   overallScore >= 45 ? <AlertTriangle className="w-5 h-5" style={{ color: risk.color }} /> :
                   <CheckCircle2 className="w-5 h-5" style={{ color: risk.color }} />}
                  <span className="font-bold text-lg" style={{ color: risk.color }}>{risk.level}</span>
                </div>
              </div>

              <p className="text-center text-[#1E2A38] text-base leading-relaxed mb-8 px-4">
                {getMessage(overallScore)}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.open(scannedUrl, '_blank', 'noopener,noreferrer')}
                  className="w-full h-14 text-xl font-semibold bg-gradient-to-r from-[#4F8CFF] to-[#5AD7FF] hover:from-[#3D7AE6] hover:to-[#48C6EC] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Continue Anyway
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handelReport}
                    variant="outline"
                    className="h-12 text-lg font-semibold border-red-200 text-white bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 hover:text-white rounded-xl transition-all duration-300"
                  >
                    Get analysis report 
                  </Button>
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="h-12 text-medium font-semibold border-[#4F8CFF]/30 text-[#4F8CFF] hover:bg-blue-50 rounded-xl transition-all duration-300 bg-white/60 backdrop-blur"
                  >
                    Take Me Back
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Analysis Cards */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Content Analysis */}
            <AnalysisCard
              icon={<FileText className="w-6 h-6" />}
              title="Content Analysis"
              value={contentRisk}
              tags={scanResult?.result?.content?.category ?? []}
              description={
                Array.isArray(scanResult?.result?.content?.reason)
                  ? scanResult.result.content.reason.join('. ')
                  : scanResult?.result?.content?.reason ?? 'No content data available.'
              }
              onViewReport={() => setReportOpen(true)}
            />

            {/* Redirect Chain */}
            <AnalysisCard
              icon={<Globe className="w-6 h-6" />}
              title="Redirect Chain"
              value={redirectScore}
              tags={scanResult?.result?.redirects?.tags ?? []}
              description={scanResult?.result?.redirects?.redirect_len ?? 'No redirects detected.'}
              onViewReport={() => setReportOpen(true)}
            />

            {/* Network Activity */}
            <AnalysisCard
              icon={<Network className="w-6 h-6" />}
              title="Network Activity"
              value={networkScore}
              tags={[
                `${scanResult?.result?.network?.external_count ?? 0} External Requests`,
                `${scanResult?.result?.network?.post_requests  ?? 0} POST Calls`,
                scanResult?.result?.network?.ip_count > 0 ? `${scanResult.result.network.ip_count} IP Requests` : 'No IP Requests',
              ]}
              description={
                networkScore >= 45
                  ? `Elevated network activity detected — ${scanResult?.result?.network?.external_count ?? 0} external connections observed.`
                  : 'Network behaviour looks normal. No suspicious outbound traffic found.'
              }
              onViewReport={() => setReportOpen(true)}
            />

            {/* Cookie Safety */}
            <AnalysisCard
              icon={<Cookie className="w-6 h-6" />}
              title="Cookie Analysis"
              value={cookieScore}
              tags={
                (scanResult?.result?.cookies?.Cookie_Stealing?.length ?? 0) > 0
                  ? ['Session Theft Risk', 'Suspicious Cookies']
                  : ['No Suspicious Cookies']
              }
              description={
                (scanResult?.result?.cookies?.length ?? 0) > 0
                  ? `${scanResult.result.cookies.length} potentially dangerous cookie(s) found. Review before proceeding.`
                  : 'No harmful cookies detected. Cookie behaviour appears safe.'
              }
              onViewReport={() => setReportOpen(true)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-[#5F6C7B] text-sm">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Powered by Advanced Threat Intelligence</span>
          </div>
        </div>
      </div>

      <AnalysisReport isOpen={reportOpen} data={scanResult} onClose={() => setReportOpen(false)} />
    </div>
  );
}

// ── Reusable Analysis Card ────────────────────────────────────────────────────
function AnalysisCard({ icon, title, value, tags, description, onViewReport }) {
  const getRiskColor = (val) => {
    if (val >= 90) return { bg: 'from-red-400/20 to-red-500/20',   text: '#FF5A5F', border: 'border-red-200',   cardBg: 'from-white/70 via-white/65 to-red-50/30'   };
    if (val >= 75) return { bg: 'from-amber-400/20 to-amber-500/20', text: '#F4B740', border: 'border-amber-200', cardBg: 'from-white/70 via-white/65 to-amber-50/30' };
    if (val >= 45) return { bg: 'from-cyan-400/20 to-cyan-500/20',  text: '#5AD7FF', border: 'border-cyan-200',  cardBg: 'from-white/70 via-white/65 to-cyan-50/30'  };
    return           { bg: 'from-green-400/20 to-green-500/20', text: '#2ECC71', border: 'border-green-200', cardBg: 'from-white/70 via-white/65 to-green-50/30' };
  };

  const risk = getRiskColor(value);

  return (
    <div className={`rounded-2xl p-6 bg-gradient-to-br ${risk.cardBg} backdrop-blur-xl border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${risk.bg} ${risk.border} border`}>
          <div style={{ color: risk.text }}>{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-[#1E2A38] tracking-tight">{title}</h3>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0">
          <ProgressCircle WnH={"w-25 h-25"} value={value} />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {(tags ?? []).slice(0, 3).map((tag, idx) => (
            <Badge 
              key={idx}
              variant="secondary" 
              className="text-[15px] px-3 py-1 bg-white/20 border border-[#98A2B3]/20 text-[#5F6C7B] font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <p className="text-medium text-red-700 leading-relaxed mb-4">{description}</p>

      {/* <button
        onClick={onViewReport}
        className="text-sm font-semibold text-[#4F8CFF] hover:text-[#3D7AE6] transition-colors duration-200 flex items-center gap-1 group-hover:gap-2"
      >
        View Full Report
        <ArrowUpRight className="w-4 h-4 transition-all duration-200" />
      </button> */}
    </div>
  );
}