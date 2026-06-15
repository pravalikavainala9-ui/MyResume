import React, { useState } from "react";
import { GeneratedTailoredResume } from "../types";
import { CheckCircle2, AlertCircle, FileText, Check, Copy, Bookmark, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AnalysisDashboardProps {
  data: GeneratedTailoredResume;
  companyName: string;
  roleTitle: string;
}

export default function AnalysisDashboard({ data, companyName, roleTitle }: AnalysisDashboardProps) {
  const [copiedLetter, setCopiedLetter] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200 stroke-emerald-600";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200 stroke-amber-600";
    return "text-rose-600 bg-rose-50 border-rose-200 stroke-rose-600";
  };

  const getScoreCircleColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(data.tailoredCoverLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  // SVG parameters for radial progress circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.matchScore / 100) * circumference;

  return (
    <div id="analysis-dashboard-section" className="space-y-6">
      {/* Target summary bar with score widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Align Score Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-xs col-span-1">
          <div className="space-y-1.5 text-left">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
              ATS Match Rating
            </h3>
            <div className="text-slate-900 select-none">
              <span className="text-4xl font-extrabold tracking-tight">{data.matchScore}%</span>
              <span className="text-xs text-slate-400 font-bold ml-1">fit</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              Calculated keyword cross-resonance.
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center select-none shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-100 fill-none"
                strokeWidth="6"
              />
              {/* Foreground circle */}
              <circle
                cx="40"
                cy="40"
                r="34"
                className={`fill-none transition-all duration-1000 ease-out ${getScoreCircleColor(data.matchScore)}`}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 - (data.matchScore / 100) * (2 * Math.PI * 34)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-600 uppercase tracking-tight">
              {data.matchScore >= 80 ? "Exceeds" : data.matchScore >= 50 ? "Solid" : "Review"}
            </span>
          </div>
        </div>

        {/* Matched Keywords Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs col-span-1 flex flex-col justify-between">
          <div className="text-left">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 select-none animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              Integrated Keywords
            </h3>
            <p className="text-[11px] text-slate-400 mb-3 leading-normal">
              High density match parameters compiled to tailored copy.
            </p>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {data.matchedKeywords.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic font-medium">No matches.</span>
              ) : (
                data.matchedKeywords.map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-3 select-none">
            {data.matchedKeywords.length} keywords resolved.
          </div>
        </div>

        {/* Missing Gaps Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs col-span-1 flex flex-col justify-between">
          <div className="text-left">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 select-none">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              Identified Skill Gaps
            </h3>
            <p className="text-[11px] text-slate-400 mb-3 leading-normal">
              Requirements in target JD with missing core profile overlap.
            </p>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {data.missingKeywords.length === 0 ? (
                <span className="text-xs text-slate-600 bg-emerald-50/50 px-2.5 py-1 rounded-md font-semibold text-[10px]">
                  ✓ Ideal fit alignment.
                </span>
              ) : (
                data.missingKeywords.map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-3 select-none">
            Review missing parameters.
          </div>
        </div>

      </div>

      {/* Cover Letter Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 flex justify-between items-center bg-slate-50/50">
          <div className="text-left">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-blue-500 shrink-0" />
              Tailored Cover Letter Template
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Customized pitch targeting hiring manager at {companyName}.</p>
          </div>
          <button
            onClick={handleCopyLetter}
            className={`text-[10px] px-3.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              copiedLetter
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs"
            }`}
          >
            {copiedLetter ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied Pitch
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy Letter
              </>
            )}
          </button>
        </div>

        {/* Render letter head */}
        <div className="p-5 md:p-8 bg-slate-100 max-h-[450px] overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl p-6 md:p-8 font-sans text-xs text-slate-700 leading-relaxed text-left space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-3 text-[10px] text-slate-400 flex justify-between uppercase tracking-wider font-semibold">
              <div>
                <span className="font-bold text-slate-600 block">Applicant Snapshot Info</span>
                <span>Baseline contact credentials injected</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-slate-600">Company Addressee</span>
                <span>Hiring Team at {companyName}</span>
              </div>
            </div>

            <div className="markdown-body prose prose-sm text-slate-700 space-y-3 leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({node, ...props}) => <p className="mb-3 whitespace-pre-wrap" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-3" {...props} />,
                  li: ({node, ...props}) => <li className="text-[11px]" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                }}
              >
                {data.tailoredCoverLetter}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
