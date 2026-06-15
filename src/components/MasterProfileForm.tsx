import React, { useState, useRef } from "react";
import { CoreProfile, SavedProfile } from "../types";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FileText, 
  CheckCircle,
  Upload, 
  Trash2, 
  Plus, 
  Settings, 
  FolderClosed, 
  ChevronsUpDown, 
  Check, 
  ChevronDown,
  Loader2,
  AlertCircle,
  Github
} from "lucide-react";

interface MasterProfileFormProps {
  profile: CoreProfile;
  onChange: (updated: CoreProfile) => void;
  profiles?: SavedProfile[];
  activeProfileId?: string;
  onSwitchProfile?: (id: string) => void;
  onSaveProfileAs?: (name: string, fields: CoreProfile) => void;
  onDeleteProfile?: (id: string) => void;
  onRenameProfile?: (id: string, name: string) => void;
}

export default function MasterProfileForm({ 
  profile, 
  onChange,
  profiles = [],
  activeProfileId = "default-id",
  onSwitchProfile,
  onSaveProfileAs,
  onDeleteProfile,
  onRenameProfile
}: MasterProfileFormProps) {
  const [activeTab, setActiveTab] = useState<"contact" | "summary" | "experience" | "education">("contact");
  const [savedFeedback, setSavedFeedback] = useState(false);
  
  // Profile management states
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isRenamingActive, setIsRenamingActive] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Resume file parser states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProfileObj = profiles.find(p => p.id === activeProfileId) || { id: "default-id", name: "Standard Dev Profile" };

  const handleFieldChange = (field: keyof CoreProfile, value: string) => {
    onChange({
      ...profile,
      [field]: value,
    });
    // Visual auto-save pulse indicator
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1200);
  };

  // Convert files to base64, send to API parsed
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(true);

    const fileReader = new FileReader();
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'json' || fileExt === 'txt' || fileExt === 'md') {
      fileReader.onload = async (e) => {
        try {
          const rawText = e.target?.result as string;
          if (fileExt === 'json') {
            try {
              const parsed = JSON.parse(rawText);
              if (parsed.profile) {
                onChange(parsed.profile);
                setIsUploading(false);
                setUploadSuccess(true);
                setTimeout(() => setUploadSuccess(false), 3000);
                return;
              } else if (parsed.fullName !== undefined) {
                onChange(parsed);
                setIsUploading(false);
                setUploadSuccess(true);
                setTimeout(() => setUploadSuccess(false), 3000);
                return;
              }
            } catch (err) {
              // ignore and try to parse using AI as text
            }
          }
          await parseResumeWithAI({ text: rawText });
        } catch (err: any) {
          setUploadError(err.message || "Failed to process text file.");
          setIsUploading(false);
        }
      };
      fileReader.readAsText(file);
    } else if (fileExt === 'pdf' || file.type === "application/pdf") {
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Data = window.btoa(binary);
          await parseResumeWithAI({ fileBase64: base64Data, mimeType: "application/pdf" });
        } catch (err: any) {
          setUploadError(err.message || "Failed to parse PDF data.");
          setIsUploading(false);
        }
      };
      fileReader.readAsArrayBuffer(file);
    } else {
      setUploadError("Format not supported. Please upload PDF, TXT, MD, or JSON resume files.");
      setIsUploading(false);
    }
  };

  const parseResumeWithAI = async (payload: { text?: string; fileBase64?: string; mimeType?: string }) => {
    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gemini parsing backend error.");
      }

      const data = await response.json();
      if (data.success && data.profile) {
        onChange(data.profile);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      } else {
        throw new Error("Incorrect response format from server.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Network issue parsing your file with Gemini.");
    } finally {
      setIsUploading(false);
    }
  };

  // Drag-and-drop triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Profile managers helper
  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim() || !onSaveProfileAs) return;
    onSaveProfileAs(newProfileName.trim(), { ...profile });
    setNewProfileName("");
    setIsCreatingProfile(false);
    setIsSelectorOpen(false);
  };

  const handleStartRename = () => {
    setRenameValue(activeProfileObj.name);
    setIsRenamingActive(true);
  };

  const handleSaveRename = () => {
    if (onRenameProfile && renameValue.trim()) {
      onRenameProfile(activeProfileId, renameValue.trim());
      setIsRenamingActive(false);
    }
  };

  return (
    <div id="master-profile-section" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
      
      {/* Upper Profile Switcher Bar */}
      <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap justify-between items-center gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FolderClosed className="h-4 w-4 text-blue-400 shrink-0" />
          <div className="relative">
            {isRenamingActive ? (
              <div className="flex items-center gap-1.5 font-sans">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 px-2 py-0.5 rounded text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button 
                  onClick={handleSaveRename} 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold"
                >
                  Save
                </button>
                <button 
                  onClick={() => setIsRenamingActive(false)} 
                  className="text-slate-400 hover:text-white text-[10px] px-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 font-sans">
                <button 
                  onClick={() => setIsSelectorOpen(!isSelectorOpen)} 
                  className="text-white hover:text-blue-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Click to switch saved profiles"
                >
                  <span>Active Profile: {activeProfileObj.name}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                <button 
                  onClick={handleStartRename} 
                  className="text-slate-400 hover:text-white text-[10px] ml-1.5 p-0.5" 
                  title="Rename active profile"
                >
                  ✍️
                </button>
              </div>
            )}

            {/* Profiles Dropdown list */}
            {isSelectorOpen && (
              <div className="absolute top-7 left-0 bg-white border border-slate-200 rounded-xl shadow-xl z-20 text-slate-800 w-64 p-2 font-sans font-medium text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1.5 select-none tracking-wider">
                  Switch Saved Profile
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {profiles.map(p => (
                    <div 
                      key={p.id}
                      className={`flex justify-between items-center px-2.5 py-1.5 rounded-lg cursor-pointer ${p.id === activeProfileId ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"}`}
                      onClick={() => {
                        if (onSwitchProfile) onSwitchProfile(p.id);
                        setIsSelectorOpen(false);
                      }}
                    >
                      <span className="truncate">{p.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {p.id === activeProfileId && <Check className="h-3 w-3 text-blue-600" />}
                        {profiles.length > 1 && onDeleteProfile && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete profile "${p.name}"?`)) {
                                onDeleteProfile(p.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Delete this profile"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2">
                  {!isCreatingProfile ? (
                    <button 
                      onClick={() => setIsCreatingProfile(true)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg font-bold"
                    >
                      <Plus className="h-3 w-3" /> Save current as new separate profile
                    </button>
                  ) : (
                    <form onSubmit={handleCreateProfileSubmit} className="p-1 space-y-1.5">
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        placeholder="e.g. Design Lead Resume"
                        className="w-full border border-slate-200 px-2 py-1 rounded text-xs outline-none"
                        autoFocus
                        required
                      />
                      <div className="flex gap-1">
                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1 rounded font-bold text-[10px]">
                          Save
                        </button>
                        <button type="button" onClick={() => setIsCreatingProfile(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 rounded font-bold text-[10px]">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-sans tracking-wide">
          {profiles.length} profiles saved
        </div>
      </div>

      {/* Form Header */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-900 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-blue-600" />
            1. Master Resume Profile Data
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-normal font-sans">
            Baseline general record. We rephrase and align these bullets based on your target job profile dynamically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedFeedback && (
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold transition-all flex items-center gap-1 animate-pulse">
              <CheckCircle className="h-3 w-3" /> Cached
            </span>
          )}
        </div>
      </div>

      {/* Multimodal Drag and Drop File Parser Section */}
      <div className="px-5 pt-4">
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging 
              ? "border-blue-500 bg-blue-50/40" 
              : "border-slate-200 bg-slate-50/40 hover:bg-slate-50/70 hover:border-slate-300"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.txt,.md,.json" 
            className="hidden" 
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <p className="text-xs font-bold text-slate-800">Auto-Extracting Fields with Gemini AI...</p>
              <p className="text-[10px] text-slate-400 font-sans leading-none">Scanning file structures, dates, and experience bullets</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1 font-sans">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
                <Upload className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                🚀 Upload & Auto-Parse Resume File
              </p>
              <p className="text-[10px] text-slate-400">
                Drag & Drop or click to upload **PDF, MD, TXT, or JSON** files
              </p>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="mt-2.5 bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-start gap-1.5 text-[11px] text-red-700 font-sans font-medium">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-2.5 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-start gap-1.5 text-[11px] text-emerald-700 font-sans font-bold">
            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
            <span>Success! Gemini AI analyzed, split, and auto-populated your profile sections successfully.</span>
          </div>
        )}
      </div>

      {/* Form Category Navigation */}
      <div className="flex border-b border-slate-200 bg-white text-[11px] font-bold overflow-x-auto select-none mt-4 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={`flex-1 min-w-[90px] py-3.5 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "contact"
              ? "border-blue-600 text-blue-600 bg-blue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Contact</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex-1 min-w-[90px] py-3.5 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "summary"
              ? "border-blue-600 text-blue-600 bg-blue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          <span>Skills</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`flex-1 min-w-[100px] py-3.5 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "experience"
              ? "border-blue-600 text-blue-600 bg-blue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Work History</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("education")}
          className={`flex-1 min-w-[100px] py-3.5 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "education"
              ? "border-blue-600 text-blue-600 bg-blue-50/10"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Education</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 flex-1 overflow-y-auto">
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 select-none text-left">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => handleFieldChange("fullName", e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-bold transition-all bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 select-none text-left">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="e.g. alex.rivera@design.com"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-bold transition-all bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 select-none text-left">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="e.g. (206) 555-0144"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-bold transition-all bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 select-none text-left">
                Location
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  placeholder="e.g. Seattle, WA"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-bold transition-all bg-slate-50"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 select-none text-left">
                Portfolio, Website or LinkedIn Link
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                  <Globe className="h-4 w-4" />
                </span>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => handleFieldChange("website", e.target.value)}
                  placeholder="e.g. alexrivera.design"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-bold transition-all bg-slate-50"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 select-none text-left">
                GitHub Profile URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                  <Github className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={profile.github || ""}
                  onChange={(e) => handleFieldChange("github", e.target.value)}
                  placeholder="e.g. github.com/username"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 font-bold transition-all bg-slate-50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 select-none text-left">
                Professional Bio / Summary
              </label>
              <textarea
                rows={5}
                value={profile.summary}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                placeholder="Explain who you are, primary achievements, and core drive..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 transition-all font-sans leading-relaxed bg-slate-50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 select-none">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-left">
                  Master Skills & Core Tools
                </label>
                <span className="text-[9px] text-slate-400 italic">Comma-separated</span>
              </div>
              <textarea
                rows={3}
                value={profile.skills}
                onChange={(e) => handleFieldChange("skills", e.target.value)}
                placeholder="e.g. Figma, React, Design Systems, TypeScript, Tailwind, Git..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 transition-all font-sans leading-relaxed bg-slate-50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 select-none">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-left">
                  Interests & Hobbies (User-defined)
                </label>
                <span className="text-[9px] text-slate-400 italic">Comma-separated</span>
              </div>
              <textarea
                rows={2}
                value={profile.interests || ""}
                onChange={(e) => handleFieldChange("interests", e.target.value)}
                placeholder="e.g. Cloud Architecture, Database Performance, Process Automation, Trekking, Badminton..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 transition-all font-sans leading-relaxed bg-slate-50"
              />
            </div>
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-4 text-left">
            <div>
              <div className="flex justify-between items-center select-none mb-1.5">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-left">
                  Complete Professional Work History
                </label>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal mb-2 font-sans">
                Paste your standard achievements and historical roles with basic dividers. Gemini will automatically rewrite, realign, and increase keywords density for your target applications.
              </p>
              <textarea
                rows={11}
                value={profile.experience}
                onChange={(e) => handleFieldChange("experience", e.target.value)}
                placeholder={`Role | Company (Dates)
- Bullet achievement details`}
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 transition-all font-mono leading-relaxed bg-slate-50"
              />
            </div>

            {/* Elegant visual experiences table/matrix representation */}
            {profile.fullName.toLowerCase().includes("pravalika") && (
              <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between select-none">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                    💼 Active Organization & Project Matrix Table
                  </span>
                  <span className="text-[9px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                    Active Profile Synchronised
                  </span>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="min-w-full divide-y divide-slate-100 font-sans text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[9px] border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left font-extrabold">Organization / Company</th>
                        <th className="px-3.5 py-2.5 text-left font-extrabold">Role / Focus</th>
                        <th className="px-3.5 py-2.5 text-left font-extrabold">Clients & Projects</th>
                        <th className="px-3.5 py-2.5 text-left font-extrabold">Key Outcomes & SLA Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {/* NTT DATA */}
                      <tr className="hover:bg-slate-50/50 transition-all">
                        <td className="px-3.5 py-3 text-left">
                          <span className="font-extrabold text-slate-900 block text-xs">NTT DATA Business Solutions</span>
                          <span className="text-[9px] text-slate-400 font-mono italic block mt-0.5">Feb 2026 - Present</span>
                        </td>
                        <td className="px-3.5 py-3 text-left">
                          <span className="font-bold text-slate-800">Consultant</span>
                          <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded mt-1 block w-max font-mono">SAP CAS ERP</span>
                        </td>
                        <td className="px-3.5 py-3 text-left">
                          <div className="text-[10px] font-bold text-slate-600 mb-1">Client: SAP (Cloud Support)</div>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {["Shionogi", "Fujikura", "Olympus", "UltraTech", "Weir"].map((c, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-left text-slate-500 leading-relaxed max-w-[240px]">
                          <div className="text-[10px] text-slate-600 font-bold mb-1">Delivered Scope:</div>
                          <ul className="list-disc pl-3 text-[10px] space-y-0.5 text-slate-500 text-left">
                            <li>Critical SAP Basis upgrading, performance support</li>
                            <li>Multi-client coordination with zero-downtime upgrades</li>
                            <li>High availability cloud application SLAs</li>
                          </ul>
                        </td>
                      </tr>

                      {/* Walmart */}
                      <tr className="hover:bg-slate-50/50 transition-all">
                        <td className="px-3.5 py-3 text-left">
                          <span className="font-extrabold text-slate-900 block text-xs">Walmart Global Tech India</span>
                          <span className="text-[9px] text-slate-400 font-mono italic block mt-0.5">Aug 2023 - Feb 2026</span>
                        </td>
                        <td className="px-3.5 py-3 text-left">
                          <span className="font-bold text-slate-800">System Administrator</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded mt-1 block w-max font-mono">L2 Support (24x7)</span>
                        </td>
                        <td className="px-3.5 py-3 text-left">
                          <div className="text-[10px] font-bold text-slate-600 mb-1">Massmart Project</div>
                          <span className="text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded">South Africa Ops</span>
                        </td>
                        <td className="px-3.5 py-3 text-left text-slate-500 leading-relaxed max-w-[240px]">
                          <div className="text-[10px] text-slate-600 font-bold mb-1">Delivered Scope:</div>
                          <ul className="list-disc pl-3 text-[10px] space-y-0.5 text-slate-500 text-left">
                            <li>ECC, BW, BO, ABAP/JAVA, HANA Database monitoring</li>
                            <li>STMS transports, secure SAP security patches, Notes</li>
                            <li>Incident routing (P1-P4) using ServiceNow dashboards</li>
                          </ul>
                        </td>
                      </tr>

                      {/* SCCL */}
                      <tr className="hover:bg-slate-50/50 transition-all">
                        <td className="px-3.5 py-3 text-left">
                          <span className="font-extrabold text-slate-900 block text-xs">Singareni Collieries (SCCL)</span>
                          <span className="text-[9px] text-slate-400 font-mono italic block mt-0.5">July 2019 - March 2020</span>
                        </td>
                        <td className="px-3.5 py-3 text-left">
                          <span className="font-bold text-slate-800">SAP Associate Consultant</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded mt-1 block w-max font-mono">Operations Support</span>
                        </td>
                        <td className="px-3.5 py-3 text-left">
                          <div className="text-[10px] font-bold text-slate-600 mb-1">General Operations</div>
                          <span className="text-[9px] text-slate-400 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded">Hyderabad HQ</span>
                        </td>
                        <td className="px-3.5 py-3 text-left text-slate-500 leading-relaxed max-w-[240px]">
                          <div className="text-[10px] text-slate-600 font-bold mb-1">Delivered Scope:</div>
                          <ul className="list-disc pl-3 text-[10px] space-y-0.5 text-slate-500 text-left">
                            <li>SAP system daily health checkups & cron process automation</li>
                            <li>User access management, roles & active locks</li>
                            <li>STMS transports and performance log analysis</li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 select-none text-left">
                Education Background
              </label>
              <textarea
                rows={4}
                value={profile.education}
                onChange={(e) => handleFieldChange("education", e.target.value)}
                placeholder="Degree, major, university, graduations dates..."
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 transition-all font-mono leading-relaxed bg-slate-50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 select-none">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-left">
                  Side Projects, Publications, or Certifications (Optional)
                </label>
              </div>
              <textarea
                rows={4}
                value={profile.projects || ""}
                onChange={(e) => handleFieldChange("projects", e.target.value)}
                placeholder="Open source, personal libraries, or professional standard certifications..."
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 transition-all font-mono leading-relaxed bg-slate-50"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50/50 p-3.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-blue-700 font-semibold shrink-0">
        <span className="flex items-center gap-1.5 font-sans">
          <Award className="h-3.5 w-3.5" /> High-fidelity profile synced with persistent local profiles.
        </span>
      </div>
    </div>
  );
}
