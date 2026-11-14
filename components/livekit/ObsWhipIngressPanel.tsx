"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Video,
  Copy,
  Check,
  Eye,
  EyeOff,
  Radio,
  RefreshCw,
  ExternalLink,
  Shield,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ObsWhipIngressPanelProps {
  session: { access_token: string } | null;
}

export default function ObsWhipIngressPanel({ session }: ObsWhipIngressPanelProps) {
  const [whipUrl, setWhipUrl] = useState<string>("");
  const [streamKey, setStreamKey] = useState<string>("");
  const [ingressId, setIngressId] = useState<string>("");
  const [isObsStreaming, setIsObsStreaming] = useState<boolean>(false);
  const [obsParticipant, setObsParticipant] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const fetchIngressState = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/admin/ingress", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (data.ok) {
        if (data.activeIngress) {
          setWhipUrl(data.activeIngress.url || "");
          setStreamKey(data.activeIngress.streamKey || "");
          setIngressId(data.activeIngress.ingressId || "");
        }
        setIsObsStreaming(!!data.isObsStreaming);
        setObsParticipant(data.obsParticipant || null);
      }
    } catch (e) {
      console.warn("Failed to fetch ingress state:", e);
    }
  }, [session]);

  useEffect(() => {
    fetchIngressState();
    const interval = setInterval(fetchIngressState, 5000);
    return () => clearInterval(interval);
  }, [fetchIngressState]);

  const generateWhipCredentials = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/ingress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to generate WHIP stream endpoint.");
      }
      setWhipUrl(data.url);
      setStreamKey(data.streamKey);
      setIngressId(data.ingressId);
      setMessage(data.reused ? "Active OBS WHIP endpoint loaded." : "New OBS WHIP endpoint generated!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to generate WHIP endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-5 sm:p-6 shadow-[5px_5px_0px_#292929] mb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b-2 border-[#292929] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded border-2 border-[#292929] bg-[#FF8A32] shadow-[2px_2px_0px_#292929] flex items-center justify-center shrink-0">
            <Tv size={22} className="text-white" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-[#FF8A32] font-black tracking-widest uppercase">
              STUDIO UPLINK // WEBRTC INGRESS
            </div>
            <h2 className="font-digital text-base font-black text-[#292929] tracking-wider uppercase flex items-center gap-2">
              OBS STUDIO DIRECT WHIP INTEGRATION
            </h2>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isObsStreaming ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#bbf7d0] border-2 border-[#292929] shadow-[2px_2px_0px_#292929] font-mono text-xs font-black text-[#15803d]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse"></span>
              <span>OBS LIVE ON TRACK</span>
            </div>
          ) : whipUrl ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#fef08a] border-2 border-[#292929] shadow-[2px_2px_0px_#292929] font-mono text-xs font-black text-[#854d0e]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ca8a04]"></span>
              <span>WHIP ENDPOINT READY</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#f5f5f5] border-2 border-[#292929] shadow-[2px_2px_0px_#292929] font-mono text-xs font-bold text-[#737373]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a3a3a3]"></span>
              <span>WHIP NOT CONFIGURED</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchIngressState}
            className="border-2 border-[#292929] bg-white text-[#292929] shadow-[2px_2px_0px_#292929] hover:bg-[#FFF9F3] text-xs h-8 px-2.5"
            title="Refresh Ingress status"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <p className="font-mono text-xs text-[#525252] mb-5 leading-relaxed">
        Connect professional studio cameras, multi-angle switchers, and graphics overlays directly from{" "}
        <strong className="text-[#292929]">OBS Studio</strong> into the live arena via ultra-low-latency{" "}
        <strong className="text-[#292929]">WebRTC (WHIP)</strong> with automated 3-layer server-side simulcast.
      </p>

      {/* Main Action or Credentials Card */}
      {!whipUrl ? (
        <div className="bg-[#FFF9F3] border-2 border-dashed border-[#292929] rounded p-6 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <Radio size={32} className="mx-auto text-[#FF8A32]" />
            <h3 className="font-digital text-sm font-black text-[#292929] uppercase">
              GENERATE DEDICATED OBS WHIP ENDPOINT
            </h3>
            <p className="font-mono text-xs text-[#525252]">
              Generates a secure, single-use WHIP endpoint linked to the active race room{" "}
              <code className="bg-[#E8E8E8] px-1.5 py-0.5 rounded font-bold text-[#292929]">track-vision-live</code>.
            </p>
            <Button
              variant="racing"
              size="lg"
              onClick={generateWhipCredentials}
              disabled={loading}
              className="mt-2 font-mono text-xs font-black shadow-[3px_3px_0px_#292929]"
            >
              {loading ? "INITIALIZING INGRESS..." : "⚡ GENERATE OBS WHIP STREAM KEY"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Server URL Field */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#292929] mb-1 uppercase tracking-wider">
              1. OBS WHIP SERVER URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={whipUrl}
                className="w-full bg-[#FFF9F3] border-2 border-[#292929] rounded px-3.5 py-2 font-mono text-xs text-[#292929] shadow-[2px_2px_0px_#292929] select-all font-bold"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(whipUrl, "url")}
                className="shrink-0 border-2 border-[#292929] bg-white text-[#292929] shadow-[2px_2px_0px_#292929] hover:bg-[#FF8A32] hover:text-white font-mono text-xs font-bold"
              >
                {copiedField === "url" ? (
                  <>
                    <Check size={14} className="mr-1 text-[#15803d]" /> COPIED!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" /> COPY URL
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stream Key / Bearer Token Field */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-[#292929] mb-1 uppercase tracking-wider">
              2. BEARER TOKEN / STREAM KEY
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                readOnly
                value={streamKey}
                className="w-full bg-[#FFF9F3] border-2 border-[#292929] rounded px-3.5 py-2 font-mono text-xs text-[#292929] shadow-[2px_2px_0px_#292929] select-all font-bold"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="border-2 border-[#292929] bg-white text-[#292929] shadow-[2px_2px_0px_#292929] hover:bg-[#FFF9F3] px-3"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(streamKey, "key")}
                className="shrink-0 border-2 border-[#292929] bg-white text-[#292929] shadow-[2px_2px_0px_#292929] hover:bg-[#FF8A32] hover:text-white font-mono text-xs font-bold"
              >
                {copiedField === "key" ? (
                  <>
                    <Check size={14} className="mr-1 text-[#15803d]" /> COPIED!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" /> COPY KEY
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick 3-Step Setup Instructions */}
          <div className="mt-4 bg-[#FFF9F3] border-2 border-[#292929] rounded p-4 shadow-[2px_2px_0px_#292929]">
            <div className="font-mono text-[10px] font-black text-[#FF8A32] uppercase tracking-wider mb-2">
              QUICK OBS STUDIO CONFIGURATION GUIDE (3 STEPS)
            </div>
            <ol className="font-mono text-xs text-[#292929] space-y-1.5 list-decimal list-inside">
              <li>
                In OBS Studio, navigate to <strong className="font-bold">Settings &gt; Stream</strong>.
              </li>
              <li>
                Select <strong className="font-bold">Service: WHIP</strong> (or Custom WHIP).
              </li>
              <li>
                Paste the <strong className="font-bold">Server URL</strong> and the <strong className="font-bold">Stream Key</strong>, then click <strong className="text-[#FF8A32] font-bold">Start Streaming</strong>.
              </li>
            </ol>
          </div>

          {/* Dual-path Fallback Callout */}
          <div className="flex items-start gap-2.5 p-3 rounded bg-[#eff6ff] border-2 border-[#292929] shadow-[2px_2px_0px_#292929] font-mono text-[11px] text-[#1e40af]">
            <Shield size={16} className="shrink-0 mt-0.5 text-[#2563eb]" />
            <div>
              <strong className="font-bold">Dual-Path Broadcaster Architecture:</strong> OBS Studio provides studio-grade multi-camera switching and overlays. If your OBS machine loses connection, the browser-based camera broadcaster below serves as an instant zero-downtime backup.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
