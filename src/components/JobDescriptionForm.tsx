import React, { useState } from "react";
import { JobDescriptionRequest } from "../types";
import { Building2, Sparkles, FileText, Target, Plus, AlertCircle, Globe, Loader2, CheckCircle } from "lucide-react";

interface JobDescriptionFormProps {
  jobRequest: JobDescriptionRequest;
  onChange: (updated: JobDescriptionRequest) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

export default function JobDescriptionForm({ jobRequest, onChange, onSubmit, isGenerating }: JobDescriptionFormProps) {
  const [jobUrl, setJobUrl] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleFieldChange = (field: keyof JobDescriptionRequest, value: string) => {
    onChange({
      ...jobRequest,
      [field]: value,
    });
  };

  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl.trim()) return;

    setIsFetchingUrl(true);
    setFetchError(null);
    setFetchSuccess(false);

    try {
      const response = await fetch("/api/fetch-job-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: jobUrl.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch webpage details.");
      }

      const data = await response.json();
      if (data.success) {
        onChange({
          companyName: data.companyName || "",
          roleTitle: data.roleTitle || "",
          jobDescriptionText: data.jobDescriptionText || "",
          customKeywords: data.customKeywords || jobRequest.customKeywords || "",
          additionalFocus: jobRequest.additionalFocus || ""
        });
        setFetchSuccess(true);
        setJobUrl(""); // Reset url input
        setTimeout(() => setFetchSuccess(false), 4000);
      } else {
        throw new Error("Format returned from parser was unexpected.");
      }
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || "Unable to scrap this job link. Please paste raw description manually.");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleQuickLoad = () => {
    onChange({
      companyName: "Stripe",
      roleTitle: "Senior Software Engineer, Developer Experience",
      jobDescriptionText: `About Stripe:
Stripe is a financial infrastructure platform for the internet. Millions of companies—from the world’s largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.

The Role:
We are looking for a Senior Developer Experience Engineer to make building on Stripe a magical experience. You'll build, optimize, and maintain client libraries across multiple ecosystems (React, NodeJS, Go), devise clean API schemas, write robust documentation, and participate in direct developer feedback loops.

Requirements:
- 5+ years of software design and development experience.
- Expertise in TypeScript, modern React architecture, and node-based backend architectures.
- History of building developers tools, public APIs, or open-source libraries.
- Strong product sensibility and empathetic communication style.
- Passion for optimizing CI/CD, build tools, or package distribution pipelines.`,
      customKeywords: "Stripe SDK, developer empathy, payments orchestration, robust API testing",
      additionalFocus: "Emphasize my open source contributions and SDK designs in previous positions."
    });
  };

  const isFormValid = !!jobRequest.jobDescriptionText.trim();

  return (
    <div id="job-description-section" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5 flex flex-col flex-1">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-900 flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 text-blue-600" />
            2. Target Role & Company Context
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-normal font-sans">
            Specify target parameters or paste a Careers link to populate fields automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={handleQuickLoad}
          className="text-[10px] px-3 py-1.5 rounded-lg border border-blue-100 hover:border-blue-200 text-blue-600 hover:bg-blue-50/50 font-bold transition-all self-start sm:self-center bg-white cursor-pointer select-none shrink-0"
        >
          ✨ Load Stripe Demo Role
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">

        {/* AI URL Scraper Module */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 text-left select-none">
            ⚡ Import Directly from Careers URL
          </label>
          <form onSubmit={handleFetchUrl} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                <Globe className="h-3.5 w-3.5" />
              </span>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="e.g. https://careers.stripe.com/jobs/senior-dev-engineer"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-medium bg-white transition-all"
                disabled={isFetchingUrl}
              />
            </div>
            <button
              type="submit"
              disabled={isFetchingUrl || !jobUrl.trim()}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all select-none flex items-center gap-1.5 ${
                isFetchingUrl 
                  ? "bg-slate-400 cursor-not-allowed" 
                  : !jobUrl.trim() 
                    ? "bg-blue-300 opacity-80 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer text-white shadow-xs"
              }`}
            >
              {isFetchingUrl ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Reading Job...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  <span>Fetch Details</span>
                </>
              )}
            </button>
          </form>

          {fetchError && (
            <div className="mt-2 text-[10px] text-red-700 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              <span>{fetchError}</span>
            </div>
          )}

          {fetchSuccess && (
            <div className="mt-2 text-[10px] text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3" />
              <span>Job description fetched, cleaned, and processed successfully! Form updated.</span>
            </div>
          )}
        </div>
        
        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 text-left select-none">
              Target Company Name
            </label>
            <input
              type="text"
              value={jobRequest.companyName}
              onChange={(e) => handleFieldChange("companyName", e.target.value)}
              placeholder="e.g. Stripe, Acme Corp, Google"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-bold bg-slate-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 text-left select-none">
              Target Role Title
            </label>
            <input
              type="text"
              value={jobRequest.roleTitle}
              onChange={(e) => handleFieldChange("roleTitle", e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-bold bg-slate-50 transition-all"
            />
          </div>
        </div>

        {/* Big Job Paste Box */}
        <div>
          <div className="flex justify-between items-center mb-1.5 select-none">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-left">
              Raw Job Description (Copy-pasted) <span className="text-red-500">*</span>
            </label>
            <span className="text-[9px] text-slate-400 italic font-sans">Requirements & Responsibilities</span>
          </div>
          <textarea
            rows={7}
            value={jobRequest.jobDescriptionText}
            onChange={(e) => {
              handleFieldChange("jobDescriptionText", e.target.value);
              if (e.target.value.trim()) setAttemptedSubmit(false);
            }}
            placeholder="Paste raw text description directly from LinkedIn, Seek, or company career portal..."
            className={`w-full p-3.5 rounded-xl border focus:ring-2 outline-none text-xs text-slate-800 transition-all font-sans leading-relaxed ${
              attemptedSubmit && !jobRequest.jobDescriptionText.trim()
                ? "border-red-500 focus:border-red-500 focus:ring-red-100 bg-red-50/50"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100 bg-slate-50"
            }`}
          />
          {attemptedSubmit && !jobRequest.jobDescriptionText.trim() && (
            <p className="text-[10px] text-red-600 font-bold mt-1 text-left">Job Description is required.</p>
          )}
        </div>

        {/* Custom Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 text-left select-none">
              <Target className="h-3.5 w-3.5 text-slate-400" />
              Target Keywords to Prioritize
            </label>
            <input
              type="text"
              value={jobRequest.customKeywords || ""}
              onChange={(e) => handleFieldChange("customKeywords", e.target.value)}
              placeholder="e.g. Developer tools, high performance API"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 bg-slate-50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 text-left select-none">
              <Plus className="h-3.5 w-3.5 text-slate-400" />
              Directives / Custom Goals
            </label>
            <input
              type="text"
              value={jobRequest.additionalFocus || ""}
              onChange={(e) => handleFieldChange("additionalFocus", e.target.value)}
              placeholder="e.g. Highlight my leadership and open-source kit designs"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 bg-slate-50 transition-all"
            />
          </div>
        </div>

        {attemptedSubmit && !isFormValid && (
          <div className="mt-2 text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2 font-sans animate-bounce">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-bold">Missing required details: Please paste the Job Description.</span>
          </div>
        )}

      </div>

      {/* Button footer action area */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium leading-normal font-sans">
          <AlertCircle className="h-4 w-4 text-blue-500 shrink-0" />
          <span>Generates an optimized CV markdown, match analysis, and Q&A kit.</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isFormValid) {
              setAttemptedSubmit(true);
            } else {
              setAttemptedSubmit(false);
              onSubmit();
            }
          }}
          disabled={isGenerating}
          className={`px-5 py-3 rounded-xl font-extrabold text-white text-xs flex items-center justify-center gap-2 transition-all shadow-md select-none shrink-0 ${
            isGenerating 
              ? "bg-slate-400 cursor-not-allowed" 
              : !isFormValid 
                ? "bg-blue-500/80 hover:bg-blue-600 active:scale-[0.98] cursor-pointer hover:shadow-lg text-white" 
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] cursor-pointer hover:shadow-blue-100 hover:shadow-lg text-white"
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Architecting Resume...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Tailor Resume with Gemini
            </>
          )}
        </button>
      </div>
    </div>
  );
}
