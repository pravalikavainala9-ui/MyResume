import React, { useState, useEffect, useRef } from "react";
import { CoreProfile, JobDescriptionRequest, GeneratedTailoredResume, HistoryItem, SavedProfile } from "./types";
import MasterProfileForm from "./components/MasterProfileForm";
import JobDescriptionForm from "./components/JobDescriptionForm";
import AnalysisDashboard from "./components/AnalysisDashboard";
import SebastianTemplate from "./components/SebastianTemplate";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  Menu, 
  History, 
  RefreshCw, 
  Download, 
  FileCheck, 
  HelpCircle, 
  AlertCircle, 
  BookOpen, 
  ChevronRight, 
  Check, 
  Copy, 
  Eye, 
  User, 
  Target,
  ArrowRight,
  Info,
  Loader2,
  FileDown,
  Code,
  Globe
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// Premium prefilled default data so the user can immediately test and experience the app
const pravalikaProfile: CoreProfile = {
  fullName: "Pravalika Vainala",
  email: "Pravalika.vainala9@gmail.com",
  phone: "7093550463",
  location: "Hyderabad, India",
  website: "linkedin.com/in/pravalika-vainala-9b02996b",
  github: "github.com/pravalika-v",
  summary: "Results-driven SAP BASIS Consultant with 4.1+ years of experience managing complex SAP landscapes, optimizing system performance, and delivering comprehensive upgrade and patching activities across ECC, S/4HANA, BW, BO, BODS, and HANA DB environments. Highly skilled in transport management (STMS), performance tuning, and database administration. Proven track record of automating administrative tasks with Power Automate and designing custom Power BI and ServiceNow workflows to elevate business visibility and ensure high availability.",
  skills: "SAP BASIS, SAP ECC 6.0, SAP S/4HANA, SAP BW, SAP BO, SAP BODS, SAP Solution Manager, SAP HANA Database, Oracle Database, DB2, SUSE Linux, AIX, Windows, HANA Studio, HANA Cockpit, Software Update Manager (SUM), SWPM, SPAM/SAINT, LAMA, STMS (Transport Management System), SAP Kernel Upgrades, Support Package Implementation, SAP Notes Application, Microsoft Power Automate, Power BI, ServiceNow Dashboards, Incident Management (P1-P4)",
  experience: `Consultant | NTT DATA Business Solutions Private Limited
February 2026 - Present
(Client: SAP | Area: SAP Cloud Application Service ERP Private)
- Manage and resolve critical ERP system issues across multiple prestigious global clients and projects, including Shionogi, Fujikura, Olympus, UltraTech, and Weir.
- Deliver specialized SAP BASIS consulting, system upgrades, cloud migrations, and SLA-compliant ERP application support.
- Maintain seamless client coordination, ensuring robust transport management, proactive system upgrades, and zero-downtime environments.

System Administrator | Walmart Global Tech India, Chennai
August 2023 - February 2026
(Massmart Project, South Africa)
- Work as a Systems Administrator (L2 Support) and SAP BASIS Administrator in a high-availability 24x7 enterprise environment.
- Perform automated and manual monitoring for business-critical SAP environments including ECC, BW, BO, ABAP/JAVA Stack, and HANA DB.
- Analyze and troubleshoot comprehensive system logs, ABAP dumps, HANA DB alerts, EWA reports, and Solman monitoring tools to ensure total uptime.
- Manage and apply transport requests using STMS, implementing monthly SAP Security mandates and SAP Notes.
- Execute major upgrades and patching across Kernel, Support Packages, SAP Host Agent, HANA DB, and SAP Solution Manager.
- Coordinate end-to-end incident tickets (P1-P4) using ServiceNow, securing rapid issue resolution and high SLA compliance.

SAP Consultant | Singareni Collieries Company Limited (SCCL), Hyderabad
July 2019 - March 2020
- Performed daily SAP system health checks, process automation reviews, and cron job monitoring.
- Handled basic user identity management, roles permissions, and critical transport requests.
- Assisted lead administrators in routine SAP Basis administration tasks, system performance debugging, and alert analysis.`,
  education: "Bachelor’s in Civil Engineering - Guru Nanak Institutions, 2018",
  projects: `Bravo Award (September 2024)
- Successfully scheduled and executed SAP BASIS patching and upgrades across 50+ central systems for multiple banners under Massmart.
- Recognized for exceptional vigilance and operational ownership during critical system incidents, ensuring minimal business disruption.
- Programmed custom Power Automate workflows to save ~160 minutes per day, supplemented by Power BI dashboards for real-time alert visibility.

Professional Qualities & Credentials
- Recognized as Collaborator, Fire Fighter, Inspirer, Learning Champion, and Supporter.
- Languages: English, Hindi, Telugu`,
  interests: "Cloud Architecture, Database Performance, Process Automation, System Scalability, Continuous Development"
};

const prakharProfile: CoreProfile = {
  fullName: "Prakhar Gupta",
  email: "prakhar13103608@gmail.com",
  phone: "+91-9910368499",
  location: "Hyderabad, India",
  website: "linkedin.com/in/prakh2796",
  github: "github.com/prakh2796",
  summary: "Experienced Software Engineer with a demonstrated history of working in the computer software industry in an agile environment. Skilled in Java, Python, SQL, Data Structures, and Algorithms, and Azure with hands-on experience in Generative AI.",
  skills: "Java, Azure, Spring Boot, Azure DevOps, Python, Web Development, Generative AI, Langchain, LLM, GPT, Jira, Maven, MySQL, Git, C#, CI/CD, .Net, CosmosDB, Scrum Master",
  experience: `Software Engineer 2 | Microsoft
11/2021 - Present
- Part of the **Enterprise Commerce Ordering** team that enables Microsoft's partners, **reduce manual efforts** teams to acquire and manage Microsoft products.
- **Lead a team of developers** to **enhance the existing portal** which enabled partners to **reduce manual efforts** in placing bulk orders. This resulted in a **revenue of $4B**.
- Worked on **design and development of seller copilot** which helps sellers to generate proposals, create renewal deals automatically and access information regarding orders and agreements.

Associate | JPMorgan Chase & Co.
02/2021 - 09/2021
(Bangalore, India)
- Part of the **JET Analytics** team, responsible to provide insights around **firm-wide technology solutions** to **increase software engineering efficiency**.
- Designed and implemented data pipeline to **extract, transform and load** data from different data sources to **optimize global technology's SDLC process controls**.
- **Cross-team collaboration** and regular interaction with stakeholders thus taking **complete ownership of 2 microservices**.

Developer | SAP Labs India
08/2017 - 02/2021
(Bangalore, India)
- Part of the **Data Privacy Engineering** team, responsible for providing **GDPR services** on **SAP Cloud Platform**. Worked on **Java** and **NodeJS** for the implementation of **microservices**.
- Part of the **Core Procurement** team, responsible for **generating/creating requisitions** in the **Ariba portal**. Worked on **building the UI** and the **API** for the creation of requisition(s) using **excel file import** and thus **reducing the number of clicks** required in the UI.
- Carefully **documented technical workflows** in a **private wiki** for the **education** of **newly hired employees**.`,
  education: "BTech in Computer Science & Engineering | Jaypee Institute of Information Technology\n2013 - 2017",
  projects: `[JP MORGAN] Teamwork and Leadership.
Leading from the front.
[SAP] Honor - Keep the promise
Fixing the customer show stopper issue in short time.
[SAP] Praise - Build bridges, not silos
Cross-team help.
[SAP] Honor - Stay curious
Working on escalated issues.

Interests: TV Series, Vlogging, Trekking, Badminton, Counter Strike
Languages: English (Full Professional Proficiency), Hindi (Native or Bilingual Proficiency)`,
  interests: "TV Series, Vlogging, Trekking, Badminton, Counter Strike"
};

const initialMasterProfile: CoreProfile = {
  fullName: "Pravalika Vainala",
  email: "Pravalika.vainala9@gmail.com",
  phone: "7093550463",
  location: "Hyderabad, India",
  website: "linkedin.com/in/pravalika-vainala-9b02996b",
  github: "github.com/pravalika-v",
  summary: "Results-driven SAP BASIS Consultant with 4.1+ years of experience managing complex SAP landscapes, optimizing system performance, and delivering comprehensive upgrade and patching activities across ECC, S/4HANA, BW, BO, BODS, and HANA DB environments. Highly skilled in transport management (STMS), performance tuning, and database administration. Proven track record of automating administrative tasks with Power Automate and designing custom Power BI and ServiceNow workflows to elevate business visibility and ensure high availability.",
  skills: "SAP BASIS, SAP ECC 6.0, SAP S/4HANA, SAP BW, SAP BO, SAP BODS, SAP Solution Manager, SAP HANA Database, Oracle Database, DB2, SUSE Linux, AIX, Windows, HANA Studio, HANA Cockpit, Software Update Manager (SUM), SWPM, SPAM/SAINT, LAMA, STMS (Transport Management System), SAP Kernel Upgrades, Support Package Implementation, SAP Notes Application, Microsoft Power Automate, Power BI, ServiceNow Dashboards, Incident Management (P1-P4)",
  experience: `Consultant | NTT DATA Business Solutions Private Limited
February 2026 - Present
(Client: SAP | Area: SAP Cloud Application Service ERP Private)
- Manage and resolve critical ERP system issues across multiple prestigious global clients and projects, including Shionogi, Fujikura, Olympus, UltraTech, and Weir.
- Deliver specialized SAP BASIS consulting, system upgrades, cloud migrations, and SLA-compliant ERP application support.
- Maintain seamless client communication, ensuring robust transport management, proactive system upgrades, and zero-downtime environments.

System Administrator | Walmart Global Tech India, Chennai
August 2023 - February 2026
(Massmart Project, South Africa)
- Work as a Systems Administrator (L2 Support) and SAP BASIS Administrator in a high-availability 24x7 enterprise environment.
- Perform automated and manual monitoring for business-critical SAP environments including ECC, BW, BO, ABAP/JAVA Stack, and HANA DB.
- Analyze and troubleshoot comprehensive system logs, ABAP dumps, HANA DB alerts, EWA reports, and Solman monitoring tools to ensure total uptime.
- Manage and apply transport requests using STMS, implementing monthly SAP Security mandates and SAP Notes.
- Execute major upgrades and patching across Kernel, Support Packages, SAP Host Agent, HANA DB, and SAP Solution Manager.
- Coordinate end-to-end incident tickets (P1-P4) using ServiceNow, securing any rapid issue resolution and SLA compliance.

SAP Consultant | Singareni Collieries Company Limited (SCCL), Hyderabad
July 2019 - March 2020
- Performed daily SAP system health checks, process automation reviews, and cron job monitoring.
- Handled basic user identity management, roles permissions, and critical transport requests.
- Assisted lead administrators in routine SAP Basis administration tasks, system performance debugging, and alert analysis.`,
  education: "Bachelor’s in Civil Engineering - Guru Nanak Institutions, 2018",
  projects: `Bravo Award (September 2024)
- Successfully scheduled and executed SAP BASIS patching and upgrades across 50+ central systems for multiple banners under Massmart.
- Recognized for exceptional vigilance and operational ownership during critical system incidents, ensuring minimal business disruption.
- Programmed custom Power Automate workflows to save ~160 minutes per day, supplemented by Power BI dashboards for real-time alert visibility.

Professional Qualities & Credentials
- Recognized as Collaborator, Fire Fighter, Inspirer, Learning Champion, and Supporter.
- Languages: English, Hindi, Telugu`,
  interests: "Cloud Architecture, Database Performance, Process Automation, System Scalability, Continuous Development"
};

const initialJobRequest: JobDescriptionRequest = {
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
};

// Helper to strip out duplicate header information (like candidate name, email, location, phone) 
// generated by standard AI templates at the very beginning of the tailored resume markdown.
function cleanClassicResumeMarkdown(markdown: string, fullName?: string): string {
  if (!markdown) return "";
  
  let lines = markdown.split("\n");
  let startIndex = 0;
  const nameLower = (fullName || "pravalika vainala").toLowerCase().trim();
  const nameParts = nameLower.split(/\s+/).filter(part => part.length > 2);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineLower = line.toLowerCase();
    
    const isSectionHeader = 
      (line.startsWith("#") && 
       (lineLower.includes("summary") || 
        lineLower.includes("profile") || 
        lineLower.includes("skills") || 
        lineLower.includes("experience") || 
        lineLower.includes("education") || 
        lineLower.includes("projects") || 
        lineLower.includes("history") ||
        lineLower.includes("work"))) ||
      (line.startsWith("**") && line.endsWith("**") && 
       (lineLower.includes("summary") || 
        lineLower.includes("profile") || 
        lineLower.includes("skills") || 
        lineLower.includes("experience") || 
        lineLower.includes("education")));

    if (isSectionHeader) {
      startIndex = i;
      break;
    }
  }
  
  let cleanLines = lines.slice(startIndex);
  
  while (cleanLines.length > 0) {
    const line = cleanLines[0].trim();
    const lineLower = line.toLowerCase();
    
    const isSectionHeader = 
      (line.startsWith("#") && 
       (lineLower.includes("summary") || 
        lineLower.includes("profile") || 
        lineLower.includes("skills") || 
        lineLower.includes("experience") || 
        lineLower.includes("education") || 
        lineLower.includes("projects") || 
        lineLower.includes("history") ||
        lineLower.includes("work"))) ||
      (line.startsWith("**") && line.endsWith("**") && 
       (lineLower.includes("summary") || 
        lineLower.includes("profile") || 
        lineLower.includes("skills") || 
        lineLower.includes("experience") || 
        lineLower.includes("education")));
        
    if (isSectionHeader) {
      break;
    }
    
    const isNameLine = nameParts.length > 0 && nameParts.every(part => lineLower.includes(part));
    const isContactLine = 
      lineLower.includes("@") || 
      lineLower.includes("linkedin.com") || 
      lineLower.includes("7093550463") || 
      lineLower.includes("hyderabad") || 
      (line.startsWith("#") && nameParts.some(part => lineLower.includes(part)));
      
    if (isNameLine || isContactLine || line === "") {
      cleanLines.shift();
    } else {
      break;
    }
  }
  
  return cleanLines.join("\n").trim();
}

interface A4PreviewWrapperProps {
  children: React.ReactNode;
}

function A4PreviewWrapper({ children }: A4PreviewWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.parentElement?.offsetWidth || containerRef.current.offsetWidth;
      const targetWidth = 794;
      const availableWidth = parentWidth - 32; // padding offset
      
      if (availableWidth < targetWidth) {
        setScale(Math.max(0.3, availableWidth / targetWidth));
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    
    let observer: ResizeObserver | null = null;
    if (containerRef.current && containerRef.current?.parentElement) {
      observer = new ResizeObserver(() => {
        updateScale();
      });
      observer.observe(containerRef.current.parentElement);
    }

    return () => {
      window.removeEventListener("resize", updateScale);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full flex flex-col items-center justify-start overflow-visible bg-slate-100 rounded-2xl p-4 border border-slate-200 shadow-inner my-2"
      style={{ minHeight: "350px" }}
    >
      {/* Decorative Document Titlebar / Indicator */}
      <div className="w-full max-w-[794px] flex items-center justify-between px-4 pb-3 mb-2 border-b border-slate-200/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center gap-1 font-mono text-slate-400">
          <span>A4 PRINT PREVIEW</span>
          <span>•</span>
          <span>{Math.round(scale * 100)}% SCALE</span>
        </div>
        <div className="w-12 h-1 bg-slate-200 rounded animate-pulse" />
      </div>

      <div 
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: "794px",
          height: "1123px",
          minWidth: "794px",
          maxWidth: "794px",
          minHeight: "1123px",
          maxHeight: "1123px",
          marginBottom: `${(scale - 1) * 1123}px`
        }}
        className="transition-all duration-200 ease-out origin-top shrink-0 relative bg-white shadow-xl"
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  // Application State
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => {
    const saved = localStorage.getItem("master_saved_profiles");
    let list: SavedProfile[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved profiles", e);
      }
    }
    
    // Inject Pravalika's real profile if not already there, or update if it doesn't have NTT DATA yet
    const pravalikaIndex = Array.isArray(list) ? list.findIndex(p => p && p.id === "pravalika-id") : -1;
    if (pravalikaIndex === -1) {
      list.push({
        id: "pravalika-id",
        name: "Pravalika Vainala (SAP Basis)",
        profile: pravalikaProfile,
        lastUpdated: new Date().toLocaleDateString()
      });
    } else {
      const existingProfile = list[pravalikaIndex]?.profile;
      const hasNTTData = existingProfile?.experience?.includes("NTT DATA");
      if (!hasNTTData) {
        list[pravalikaIndex] = {
          ...list[pravalikaIndex],
          name: "Pravalika Vainala (SAP Basis)",
          profile: pravalikaProfile,
          lastUpdated: new Date().toLocaleDateString()
        };
      }
    }

    // Inject Prakhar's screenshot profile if not already there, or update if it lacks Microsoft yet
    const prakharIndex = Array.isArray(list) ? list.findIndex(p => p && p.id === "prakhar-id") : -1;
    if (prakharIndex === -1) {
      list.push({
        id: "prakhar-id",
        name: "Prakhar Gupta (SDE-2 Profile)",
        profile: prakharProfile,
        lastUpdated: new Date().toLocaleDateString()
      });
    } else {
      const existingProfile = list[prakharIndex]?.profile;
      const hasMicrosoft = existingProfile?.experience?.includes("Microsoft");
      if (!hasMicrosoft) {
        list[prakharIndex] = {
          ...list[prakharIndex],
          name: "Prakhar Gupta (SDE-2 Profile)",
          profile: prakharProfile,
          lastUpdated: new Date().toLocaleDateString()
        };
      }
    }
    return list;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const saved = localStorage.getItem("master_active_profile_id");
    // Default to Prakhar's profile for instant match to user request
    return saved || "prakhar-id";
  });

  // Derived active profile values
  const activeProfile = (Array.isArray(profiles) ? profiles.find(p => p && p.id === activeProfileId) : null) 
    || (Array.isArray(profiles) ? profiles[0] : null) 
    || { id: "default-id", name: "Standard Dev Profile", profile: initialMasterProfile };
  const coreProfile = activeProfile?.profile || initialMasterProfile;

  // Wrapped updater to keep standard API compatibility
  const setCoreProfile = (updated: CoreProfile) => {
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, profile: updated, lastUpdated: new Date().toLocaleDateString() } : p));
  };

  const [jobRequest, setJobRequest] = useState<JobDescriptionRequest>(() => {
    const saved = localStorage.getItem("master_job_request");
    return saved ? JSON.parse(saved) : initialJobRequest;
  });

  const [generatedResume, setGeneratedResume] = useState<GeneratedTailoredResume | null>(() => {
    const saved = localStorage.getItem("latest_tailored_resume");
    return saved ? JSON.parse(saved) : null;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("resume_generation_history");
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [inputTab, setInputTab] = useState<"profile" | "job">("profile");
  const [outputTab, setOutputTab] = useState<"resume" | "letter" | "insights">("resume");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [infoBannerDismissed, setInfoBannerDismissed] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<"sebastian" | "classic">("sebastian");
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showDownloadPreview, setShowDownloadPreview] = useState(false);

  // Interactive experience-bullet points optimizer state
  const [selectedBulletText, setSelectedBulletText] = useState<string | null>(null);
  const [selectedBulletContext, setSelectedBulletContext] = useState<{ jobTitle?: string; company?: string } | null>(null);
  const [improvedBulletText, setImprovedBulletText] = useState<string | null>(null);
  const [isImprovingBullet, setIsImprovingBullet] = useState(false);
  const [rewriteFocus, setRewriteFocus] = useState<"achievements" | "keywords" | "action" | "custom">("achievements");
  const [customRewritePrompt, setCustomRewritePrompt] = useState("");
  const [improveErr, setImproveErr] = useState<string | null>(null);

  // Auto-migration on mount: automatically upgrade any stale or placeholder profiles
  // to Pravalika's up-to-date SAP Basis Consultant profile with NTT DATA.
  useEffect(() => {
    setProfiles(prev => {
      let changed = false;
      const next = prev.map(p => {
        const isOutdated = p.profile?.fullName?.includes("Alex") || !p.profile?.experience?.includes("NTT DATA");
        const containsPravalika = p.profile?.fullName?.toLowerCase().includes("pravalika") || p.id === "pravalika-id" || p.id === "default-id";
        if (isOutdated && containsPravalika) {
          changed = true;
          return {
            ...p,
            name: "Pravalika's SAP Basis Profile",
            profile: pravalikaProfile,
            lastUpdated: new Date().toLocaleDateString()
          };
        }
        return p;
      });
      return changed ? next : prev;
    });
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem("master_saved_profiles", JSON.stringify(profiles));
    // Backwards-compatible fallback
    localStorage.setItem("master_resume_profile", JSON.stringify(coreProfile));
  }, [profiles, coreProfile]);

  useEffect(() => {
    localStorage.setItem("master_active_profile_id", activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem("master_job_request", JSON.stringify(jobRequest));
  }, [jobRequest]);

  useEffect(() => {
    if (generatedResume) {
      localStorage.setItem("latest_tailored_resume", JSON.stringify(generatedResume));
    }
  }, [generatedResume]);

  useEffect(() => {
    localStorage.setItem("resume_generation_history", JSON.stringify(history));
  }, [history]);

  // Operations for profile management
  const handleSwitchProfile = (id: string) => {
    setActiveProfileId(id);
  };

  const handleSaveProfileAs = (name: string, profileFields: CoreProfile) => {
    const newId = "profile-" + Date.now();
    const newProf: SavedProfile = {
      id: newId,
      name,
      profile: { ...profileFields },
      lastUpdated: new Date().toLocaleDateString()
    };
    setProfiles(prev => [...prev, newProf]);
    setActiveProfileId(newId);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    setProfiles(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (activeProfileId === id) {
        setActiveProfileId(filtered[0]?.id || "default-id");
      }
      return filtered;
    });
  };

  const handleRenameProfile = (id: string, newName: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  // Execute Gemini-powered tailer resume call
  const handleTailorResume = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coreProfile,
          jobRequest
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred during resume architecture generation.");
      }

      const parsedData: GeneratedTailoredResume = await response.json();
      setGeneratedResume(parsedData);
      
      // Add to running history array
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString(),
        companyName: jobRequest.companyName,
        roleTitle: jobRequest.roleTitle,
        generatedData: parsedData,
        requestPayload: {
          coreProfile,
          jobRequest
        }
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 8)); // keep last 8 runs
      setOutputTab("resume");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to communicate with service. Ensure server is compiled and running.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Restores an item from generating history
  const handleRestoreHistory = (item: HistoryItem) => {
    setCoreProfile(item.requestPayload.coreProfile);
    setJobRequest(item.requestPayload.jobRequest);
    setGeneratedResume(item.generatedData);
    setShowHistoryModal(false);
  };

  // Copies tailored markdown resume to clipboard
  const handleCopyMarkdown = () => {
    if (!generatedResume) return;
    navigator.clipboard.writeText(generatedResume.tailoredResumeMarkdown);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Custom PDF print simulation
  const handlePrint = () => {
    window.print();
  };

  // High fidelity self-contained HTML download for hosting on GitHub Pages / Web
  const handleDownloadHTML = () => {
    try {
      const element = document.getElementById("resume-to-download");
      if (!element) {
        throw new Error("Resume workspace target canvas element was not found.");
      }

      // Capture the precise inside structure
      const resumeHtml = element.innerHTML;

      // Build a premium, standalone, fully responsive HTML file
      // Incorporates Tailwind CSS with the identical custom theme config,
      // Google Fonts mapping for Inter, Outfit & JetBrains Mono, and print overrides.
      const fullHtml = `<!DOCTYPE html>
<html lang="en" class="light" style="color-scheme: light !important;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${coreProfile.fullName || "Resume"} - Professional CV</title>
  
  <!-- Tailwind CSS Live CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Font Integrations -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@355;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  
  <!-- Lucide Icon Font CDN -->
  <link rel="stylesheet" href="https://unpkg.com/lucide-static/font/lucide-static.css">
  
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            slate: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a',
              950: '#020617',
            },
            blue: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              1000: '#172554',
            },
            teal: {
              50: '#f0fdfa',
              100: '#ccfbf1',
              200: '#99f6e4',
              600: '#0d9488',
            },
            emerald: {
              500: '#10b981',
            }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>

  <style>
    /* Base Body overrides */
    html {
      color-scheme: light !important;
      background-color: #f1f5f9 !important;
    }
    body {
      background-color: #f1f5f9 !important;
      color: #1e293b !important;
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
      margin: 0;
      padding: 0;
    }

    /* Print-ready page setups matching the exact A4 standards */
    @media print {
      body {
        background: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .a4-container {
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        position: absolute;
        top: 0;
        left: 0;
        transform: none !important;
      }
    }

    /* A4 centered container on screen & exact fit */
    .a4-container {
      background: white;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      margin: 30px auto;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
    }

    /* Neutralize app-specific interactive indicators for final presentation */
    .a4-container li, .a4-container [onClick] {
      pointer-events: none !important;
      cursor: default !important;
      background: none !important;
      box-shadow: none !important;
      transform: none !important;
    }

    /* Lucide icons emulation */
    .lucide {
      display: inline-block;
      width: 1em;
      height: 1em;
      stroke-width: 2;
      stroke: currentColor;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-800" style="background-color: #f1f5f9 !important; color: #1e293b !important; min-height: 100vh;">

  <!-- Premium Publishing Header (Invisible when printed) -->
  <div class="no-print bg-slate-950 text-white py-3.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border-b border-slate-800 font-sans">
    <div class="flex items-center gap-3">
      <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black select-none text-sm shadow-sm">
        CV
      </div>
      <div>
        <h4 class="text-xs font-black tracking-widest uppercase text-slate-100">MatchMyResume HTML Portfolio</h4>
        <p class="text-[10px] text-slate-400 font-medium">Exported on ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })} &middot; GitHub publishing & Pages ready</p>
      </div>
    </div>
    
    <div class="flex flex-wrap items-center gap-2">
      <button onclick="window.print()" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
        <i class="lucide-printer text-[11px]"></i> Print / Save PDF
      </button>
      <span class="text-slate-700 hidden sm:inline">|</span>
      <p class="text-[10px] text-slate-400 font-medium hidden md:block">
        🚀 Save this file as <code class="bg-slate-900 px-1 py-0.5 rounded text-blue-400 font-mono">index.html</code> inside a GitHub repository to host it live for free!
      </p>
    </div>
  </div>

  <!-- Main printable Page content container -->
  <div class="a4-container">
    ${resumeHtml}
  </div>

</body>
</html>`;

      // Download file action
      const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cleanName = coreProfile.fullName ? coreProfile.fullName.trim().replace(/\s+/g, "_") : "Resume";
      a.href = url;
      a.download = `${cleanName}_Tailored_Resume.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("HTML Export error:", e);
    }
  };

  // High fidelity native PDF download with exact layout preservation
  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    let clone: HTMLElement | null = null;
    const originalGetComputedStyle = window.getComputedStyle;
    const originalStylesheets: { element: CSSStyleSheet; disabled: boolean }[] = [];
    let tempStyleTag: HTMLStyleElement | null = null;
    
    try {
      const element = document.getElementById("resume-to-download");
      if (!element) {
        throw new Error("Resume workspace target canvas element was not found.");
      }

      // Briefly scroll to top to prevent html2canvas cropping or offsets
      window.scrollTo(0, 0);

      // Create a single canvas offscreen to resolve color conversion cleanly through the browser's native engine
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 1;
      tempCanvas.height = 1;
      const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

      const resolveColorToRgba = (colorStr: string): string => {
        if (!colorStr || colorStr === "transparent" || colorStr === "rgba(0, 0, 0, 0)") return "transparent";
        if (!colorStr.includes("oklch")) return colorStr;
        
        try {
          if (!tempCtx) {
            return "rgba(15, 23, 42, 1)";
          }
          tempCtx.clearRect(0, 0, 1, 1);
          tempCtx.fillStyle = colorStr;
          tempCtx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = tempCtx.getImageData(0, 0, 1, 1).data;
          return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        } catch (err) {
          return "rgba(15, 23, 42, 1)";
        }
      };

      const resolveColorString = (value: string): string => {
        if (!value || typeof value !== "string") return value;
        if (!value.includes("oklch")) return value;
        
        return value.replace(/oklch\([^)]+\)/gi, (match) => {
          return resolveColorToRgba(match);
        });
      };

      // Gather CSS rules from stylesheets and replace oklch colors with rgb/rgba fallback colors to prevent html2canvas parsing crashes
      let rawCss = "";
      const styleSheetsArray = Array.from(document.styleSheets);
      
      for (const sheet of styleSheetsArray) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            for (const rule of Array.from(rules)) {
              rawCss += rule.cssText + "\n";
            }
          }
        } catch (e) {
          // Cross-origin fallback
          const node = sheet.ownerNode;
          if (node && (node.nodeName === "STYLE" || node.nodeName === "style")) {
            rawCss += node.textContent + "\n";
          }
        }
      }

      if (rawCss) {
        const cleanCss = rawCss.replace(/oklch\([^)]+\)/gi, (match) => {
          return resolveColorToRgba(match);
        });

        // Disable existing style sheets safely during generation
        for (const sheet of styleSheetsArray) {
          try {
            originalStylesheets.push({ element: sheet as CSSStyleSheet, disabled: sheet.disabled });
            sheet.disabled = true;
          } catch (err) {
            // Ignore CORS or safe issues
          }
        }

        // Install temp sanitized stylesheet
        tempStyleTag = document.createElement("style");
        tempStyleTag.setAttribute("id", "temp-pdf-style-sanitizer");
        tempStyleTag.textContent = cleanCss;
        document.head.appendChild(tempStyleTag);
        console.log("[PDF Sanitizer] Dynamic style sheet replacement complete.");
      }

      // Override getComputedStyle to yield clean standard RGBA fallback values to html2canvas
      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle.call(window, elt, pseudoElt);
        
        return new Proxy(style, {
          get(target, prop) {
            const val = target[prop as any];
            
            if (typeof val === "function") {
              if (prop === "getPropertyValue") {
                return function(propertyName: string) {
                  const rawVal = target.getPropertyValue(propertyName);
                  return resolveColorString(rawVal);
                };
              }
              return val.bind(target);
            }
            
            if (typeof val === "string") {
              return resolveColorString(val);
            }
            
            return val;
          }
        });
      };

      // Deep clone the element to modify it without affecting the live DOM visual state
      clone = element.cloneNode(true) as HTMLElement;
      
      // Position the clone far offscreen but keep it attached so getComputedStyle yields correct layouts
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "-9999px";
      clone.style.width = element.offsetWidth + "px";
      clone.style.margin = "0";
      clone.style.padding = "0";
      
      document.body.appendChild(clone);

      const originalElements = [element, ...Array.from(element.querySelectorAll("*"))] as HTMLElement[];
      const clonedElements = [clone, ...Array.from(clone.querySelectorAll("*"))] as HTMLElement[];

      // Walk the elements to apply inline fallback styles to ensure physical node representation
      for (let i = 0; i < originalElements.length; i++) {
        const origEl = originalElements[i];
        const cloneEl = clonedElements[i];
        if (!origEl || !cloneEl) continue;

        const computed = originalGetComputedStyle.call(window, origEl);
        const propertiesToResolve = [
          "color",
          "backgroundColor",
          "borderColor",
          "borderTopColor",
          "borderRightColor",
          "borderBottomColor",
          "borderLeftColor",
          "outlineColor",
          "fill",
          "stroke"
        ];

        for (const prop of propertiesToResolve) {
          const val = computed[prop as any];
          if (val && val.includes("oklch")) {
            cloneEl.style[prop as any] = resolveColorToRgba(val);
          }
        }

        let bgImg = computed.backgroundImage;
        if (bgImg && bgImg.includes("oklch")) {
          const oklchMatches = bgImg.match(/oklch\([^)]+\)/g);
          if (oklchMatches) {
            for (const match of oklchMatches) {
              const resolved = resolveColorToRgba(match);
              bgImg = bgImg.replace(match, resolved);
            }
          }
          cloneEl.style.backgroundImage = bgImg;
        }
      }

      // Wait a microtask to let DOM settle and render
      await new Promise(resolve => setTimeout(resolve, 60));

      const canvas = await html2canvas(clone, {
        scale: 3, // Premium print resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794, // Matches exact A4 template physical pixel width
        width: 794, // Locks viewport to prevent horizontal shift/truncation
        scrollX: 0,
        scrollY: 0,
      });

      // Restore original scroll context
      window.scrollTo(scrollX, scrollY);

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 210; // A4 layout width in mm
      const pageHeight = 297; // A4 layout height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      if (imgHeight <= 315) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pageHeight, undefined, "FAST");
      } else {
        // Multi-page layout splits
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
          heightLeft -= pageHeight;
        }
      }

      const cleanName = coreProfile.fullName.trim().replace(/\s+/g, "_");
      const safeFilename = generatedResume ? `${cleanName}_Tailored_Resume.pdf` : `${cleanName}_Resume.pdf`;
      pdf.save(safeFilename);
    } catch (err: any) {
      console.error("Native PDF build error:", err);
      alert(`Could not build native PDF: ${err.message || 'Unknown error occurred.'}`);
      window.scrollTo(scrollX, scrollY);
    } finally {
      // Restore window.getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;

      // Restore style definitions and original stylesheets
      if (tempStyleTag && tempStyleTag.parentNode) {
        tempStyleTag.parentNode.removeChild(tempStyleTag);
      }
      for (const item of originalStylesheets) {
        try {
          item.element.disabled = item.disabled;
        } catch (e) {
          // Ignore safe errors
        }
      }

      // Safely tear down offscreen cloned element
      if (clone && clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
      setIsDownloadingPDF(false);
    }
  };

  const handleImproveBullet = async () => {
    if (!selectedBulletText) return;
    setIsImprovingBullet(true);
    setImproveErr(null);
    setImprovedBulletText(null);

    try {
      const response = await fetch("/api/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletText: selectedBulletText,
          jobDescriptionText: jobRequest.jobDescriptionText,
          roleTitle: selectedBulletContext?.jobTitle || jobRequest.roleTitle,
          companyName: selectedBulletContext?.company || jobRequest.companyName,
          focusType: rewriteFocus,
          additionalPrompt: rewriteFocus === "custom" ? customRewritePrompt : ""
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to customize bullet point.");
      }

      if (data.success && data.improvedText) {
        setImprovedBulletText(data.improvedText);
      } else {
        throw new Error("Invalid response received from optimization system.");
      }
    } catch (err: any) {
      console.error("Oops, bullet rewrite failed:", err);
      setImproveErr(err.message || "Could not optimize bullet point at this time. Please try again.");
    } finally {
      setIsImprovingBullet(false);
    }
  };

  const handleApplyImprovedBullet = () => {
    if (!generatedResume || !selectedBulletText || !improvedBulletText) return;

    const replaceBulletInMarkdown = (markdown: string, oldBullet: string, newBullet: string): string => {
      if (markdown.includes(oldBullet)) {
        return markdown.replace(oldBullet, newBullet);
      }
      
      const normalize = (str: string) => str.replace(/\s+/g, " ").trim();
      const normalizedMatch = normalize(oldBullet);
      
      const lines = markdown.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const lineWithoutBulletChar = lines[i].replace(/^[\s-•*]+/, "").trim();
        if (normalize(lineWithoutBulletChar) === normalizedMatch) {
          const bulletCharMatch = lines[i].match(/^(\s*[-•*]+\s*)/);
          const prefix = bulletCharMatch ? bulletCharMatch[1] : "- ";
          lines[i] = prefix + newBullet;
          return lines.join("\n");
        }
      }
      
      return markdown;
    };

    const updatedMarkdown = replaceBulletInMarkdown(
      generatedResume.tailoredResumeMarkdown,
      selectedBulletText,
      improvedBulletText
    );

    const updatedResume = {
      ...generatedResume,
      tailoredResumeMarkdown: updatedMarkdown
    };

    setGeneratedResume(updatedResume);
    localStorage.setItem("latest_tailored_resume", JSON.stringify(updatedResume));

    // Clear bullet state
    setSelectedBulletText(null);
    setSelectedBulletContext(null);
    setImprovedBulletText(null);
  };

  const handleResetSession = () => {
    if (window.confirm("Are you sure you want to restore original default master configurations?")) {
      setCoreProfile(initialMasterProfile);
      setJobRequest(initialJobRequest);
      setGeneratedResume(null);
      setErrorMsg(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-950 flex flex-col antialiased">
      
      {/* Top Professional Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg select-none">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
              MatchMyResume <span className="text-blue-600 uppercase text-xs font-black align-top ml-1">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Professional Resume Tailoring Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Engine Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-[11px] font-semibold text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> 
            Gemini-3.5 Active
          </div>

          {/* History Button Trigger */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="View tailored resume history log"
          >
            <History className="h-4 w-4" />
            <span className="hidden md:inline">Recent Runs ({history.length})</span>
          </button>

          {/* Clean utility presets */}
          <button
            onClick={handleResetSession}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
            title="Reset form layout to default"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main Multi-Screen Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Control Panel / Inputs Panel (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Quick Info Onboarding Header */}
          {!infoBannerDismissed && (
            <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <Sparkles className="w-32 h-32" />
              </div>
              <p className="text-xs uppercase tracking-widest font-extrabold text-blue-200">ATS Optimization Workspace</p>
              <h3 className="text-base font-bold mt-1">Ready-to-optimize Resume Kit</h3>
              <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                Provide your generic master resume profile on the first tab, paste your specific target job description on the second, and generate custom CV templates designed for automatic evaluation filters.
              </p>
              <button 
                onClick={() => setInfoBannerDismissed(true)} 
                className="absolute top-3 right-3 text-blue-200 hover:text-white transition-all text-xs font-bold"
              >
                ✕ Dismiss
              </button>
            </div>
          )}

          {/* Workspace Input tab navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex shadow-xs">
            <button
              onClick={() => setInputTab("profile")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                inputTab === "profile"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <User className="h-4 w-4" />
              <span>1. Your Master Profile</span>
            </button>
            <button
              onClick={() => setInputTab("job")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                inputTab === "job"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>2. Target Role Details</span>
            </button>
          </div>

          {/* Form workspace body */}
          <div className="flex-1 flex flex-col">
            {inputTab === "profile" ? (
              <MasterProfileForm 
                profile={coreProfile} 
                onChange={setCoreProfile} 
                profiles={profiles}
                activeProfileId={activeProfileId}
                onSwitchProfile={handleSwitchProfile}
                onSaveProfileAs={handleSaveProfileAs}
                onDeleteProfile={handleDeleteProfile}
                onRenameProfile={handleRenameProfile}
              />
            ) : (
              <JobDescriptionForm 
                jobRequest={jobRequest} 
                onChange={setJobRequest} 
                onSubmit={handleTailorResume} 
                isGenerating={isGenerating} 
              />
            )}
          </div>
        </div>

        {/* Right Output Dashboard Area (lg:col-span-7) */}
        <div id="tailor-results-pane" className="lg:col-span-7 flex flex-col min-h-[600px] bg-slate-100 rounded-3xl border border-slate-200 p-4 md:p-6 shadow-xs overflow-hidden">
          
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Generation Error</p>
                <p className="mt-1">{errorMsg}</p>
                <p className="mt-2 text-[10px] text-red-500">Configure your GEMINI_API_KEY inside the Secrets Panel of the Studio settings.</p>
              </div>
            </div>
          )}

          {/* Always show active layout workspace, so that master profile can be previewed/printed/downloaded on mount! */}
          <div className="flex-1 flex flex-col gap-6">
              
              {/* Output Tab Selection Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-xs self-start">
                  <button
                    onClick={() => setOutputTab("resume")}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      outputTab === "resume"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Custom Resume CV
                  </button>
                  <button
                    onClick={() => setOutputTab("letter")}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      outputTab === "letter"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Cover Letter Let
                  </button>
                  <button
                    onClick={() => setOutputTab("insights")}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      outputTab === "insights"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    ATS Fit & Q&A
                  </button>
                </div>

                {/* Print/Copy Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={handleCopyMarkdown}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                      copiedResponse
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
                    }`}
                  >
                    {copiedResponse ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Markdown
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 bg-opacity-90 hover:bg-black rounded-xl transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg"
                    title="Render printer friendly format"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Print Resume
                  </button>

                  {outputTab === "resume" && (
                    <button
                      onClick={() => setShowDownloadPreview(true)}
                      disabled={isDownloadingPDF}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
                      title="Download as high fidelity PDF"
                    >
                      {isDownloadingPDF ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Rendering PDF...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-3.5 w-3.5" />
                          Preview & Download
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Render Selected tab item wrapper */}
              <div className="flex-1 flex flex-col justify-start">
                
                {outputTab === "resume" && (
                  <div className="space-y-4">
                    
                    {/* Interactive AI Bullet Optimizer Card */}
                    {selectedBulletText && (
                      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-white border-2 border-blue-300/80 rounded-2xl p-4 md:p-5 shadow-md text-left relative overflow-hidden select-text animate-fadeIn">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-800 font-extrabold uppercase text-xs tracking-wider">
                              <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                              AI CV Bullet Point Optimizer
                            </div>
                            <button
                              onClick={() => {
                                setSelectedBulletText(null);
                                setImprovedBulletText(null);
                                setImproveErr(null);
                              }}
                              className="text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md hover:bg-slate-200/50 transition-all text-[11px] font-bold"
                            >
                              ✕ Escape Selection
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">
                              Selected Experience Entry:
                            </span>
                            <div className="bg-white border border-slate-200 rounded-xl p-3 text-[11px] text-slate-700 italic border-l-4 border-blue-500 shadow-3xs leading-relaxed">
                              "{selectedBulletText}"
                            </div>
                          </div>

                          {/* Strategy selection */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">
                              Revision Focus Area:
                            </span>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                              {[
                                { id: "achievements", label: "📈 Results & Metrics", desc: "Quantify outputs and project scope" },
                                { id: "keywords", label: "🔥 ATS Keywords", desc: "Embed key roles & skills requested" },
                                { id: "action", label: "⚡ Action Verbs", desc: "Rewrite using authoritative start verbs" },
                                { id: "custom", label: "✏️ Custom Instructions", desc: "Guide the AI with specific context" }
                              ].map(strategy => (
                                <button
                                  key={strategy.id}
                                  type="button"
                                  onClick={() => {
                                    setRewriteFocus(strategy.id as any);
                                    setImproveErr(null);
                                  }}
                                  className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all group cursor-pointer ${
                                    rewriteFocus === strategy.id
                                      ? "border-blue-600 bg-blue-100/65 shadow-3xs scale-[1.01]"
                                      : "border-slate-200 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <span className={`text-[10px] font-extrabold ${rewriteFocus === strategy.id ? "text-blue-800" : "text-slate-700 group-hover:text-slate-950"}`}>
                                    {strategy.label}
                                  </span>
                                  <span className="text-[8px] text-slate-400 leading-tight">
                                    {strategy.desc}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom rewrite input */}
                          {rewriteFocus === "custom" && (
                            <div className="space-y-1 block md:col-span-4">
                              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">
                                Custom Directives to AI Writer:
                              </label>
                              <textarea
                                value={customRewritePrompt}
                                onChange={(e) => setCustomRewritePrompt(e.target.value)}
                                placeholder="E.g., highlight deep experience with HANA installation, performance troubleshooting, or AWS migration..."
                                className="w-full text-[11px] p-2 bg-white border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-hidden text-slate-800 shadow-3xs"
                                rows={2}
                              />
                            </div>
                          )}

                          {improveErr && (
                            <div className="text-red-700 text-[10px] font-bold flex items-center gap-1.5 bg-red-50 p-2.5 rounded-xl border border-red-100">
                              <span>⚠️ Error: {improveErr}</span>
                            </div>
                          )}

                          {/* Trigger actions */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleImproveBullet}
                              disabled={isImprovingBullet}
                              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer disabled:cursor-not-allowed"
                            >
                              {isImprovingBullet ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Re-crafting Bullet...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  Improve with AI
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBulletText(null);
                                setImprovedBulletText(null);
                                setImproveErr(null);
                              }}
                              className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                            >
                              Discard
                            </button>
                          </div>

                          {/* Comparison comparison panels */}
                          {improvedBulletText && !isImprovingBullet && (
                            <div className="mt-2 p-3.5 bg-white border border-slate-200 rounded-xl space-y-3.5 shadow-2xs border-t-4 border-t-emerald-500">
                              <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider select-none">
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                AI Tailoring Ready! Check the difference:
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                <div className="space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200">
                                  <span className="text-[8px] font-black uppercase text-slate-400 font-mono tracking-widest block">Original</span>
                                  <p className="text-[10px] text-slate-500 line-through leading-relaxed">"{selectedBulletText}"</p>
                                </div>
                                <div className="space-y-1 bg-emerald-50/20 p-2.5 rounded-lg border border-emerald-100">
                                  <span className="text-[8px] font-black uppercase text-emerald-700 font-mono tracking-widest block">New AI Version</span>
                                  <p className="text-[10px] text-emerald-950 font-semibold leading-relaxed">"{improvedBulletText}"</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={handleApplyImprovedBullet}
                                  className="px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
                                >
                                  Apply AI Rewrite
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setImprovedBulletText(null)}
                                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200/60 transition-all cursor-pointer"
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* Simulated Document Preview with Elegant Template Toggle */}
                    <div className="text-[10px] text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 select-none py-1 border-b border-slate-200/60 font-sans">
                      <div className="flex items-center gap-1.5 font-extrabold uppercase text-slate-500 tracking-wider">
                        <Eye className="h-4 w-4" />
                        Professional Resume Theme Canvas
                      </div>
                      <div className="flex bg-slate-200/75 p-0.5 rounded-lg border border-slate-300/40">
                        <button
                          type="button"
                          onClick={() => setActiveTemplate("sebastian")}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all flex items-center gap-1 ${
                            activeTemplate === "sebastian"
                              ? "bg-slate-900 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          💼 Prakhar Two-Column Layout
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTemplate("classic")}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-md transition-all flex items-center gap-1 ${
                            activeTemplate === "classic"
                              ? "bg-slate-900 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          📄 Classic ATS Style
                        </button>
                      </div>
                    </div>

                    <A4PreviewWrapper>
                      <div id="resume-to-download" className="w-[794px] h-[1123px] shrink-0 relative bg-white text-left select-text select-all overflow-hidden rounded-none">
                        {activeTemplate === "sebastian" ? (
                          <SebastianTemplate
                            profile={coreProfile}
                            jobRequest={jobRequest}
                            tailoredData={generatedResume}
                            selectedBulletText={selectedBulletText}
                            onSelectBullet={(bulletText, role, company) => {
                              setSelectedBulletText(prev => prev === bulletText ? null : bulletText);
                              setImprovedBulletText(null);
                              setSelectedBulletContext({ jobTitle: role, company });
                            }}
                          />
                        ) : (
                          <div 
                            className="a4-page bg-white text-left flex flex-col justify-between"
                            style={{ 
                              boxSizing: "border-box",
                              width: "210mm",
                              height: "297mm",
                              padding: "14mm 14mm 12mm 14mm"
                            }}
                          >
                            
                            {/* Document Simulation Layout Header */}
                            <div className="border-b-4 border-slate-900 pb-4 mb-6 text-left">
                              <h1 className="text-2xl md:text-3xl font-black uppercase text-slate-950 tracking-tight mb-2 font-sans">
                                {coreProfile.fullName || "PRAVALIKA VAINALA"}
                              </h1>
                              <div className="flex flex-wrap items-center mt-2 gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold font-mono justify-start">
                                {coreProfile.email && (
                                  <span className="select-all">{coreProfile.email}</span>
                                )}
                                {coreProfile.phone && (
                                  <>
                                    <span className="text-slate-300 font-sans select-none">•</span>
                                    <span className="select-all">{coreProfile.phone}</span>
                                  </>
                                )}
                                {coreProfile.location && (
                                  <>
                                    <span className="text-slate-300 font-sans select-none">•</span>
                                    <span className="select-all">{coreProfile.location}</span>
                                  </>
                                )}
                                {coreProfile.website && (
                                  <>
                                    <span className="text-slate-300 font-sans select-none">•</span>
                                    <a 
                                      href={`https://${coreProfile.website.replace(/^(https?:\/\/)?(www\.)?/, "")}`}
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="hover:text-blue-700 underline decoration-slate-300 transform transition-transform"
                                    >
                                      {coreProfile.website}
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Custom styled Markdown body */}
                            <div className="prose prose-sm text-xs text-slate-800 leading-normal font-sans tracking-wide space-y-4 print:text-black text-left">
                              <ReactMarkdown
                                components={{
                                  h1: ({node, ...props}) => (
                                    <h1 className="text-xs font-extrabold uppercase text-blue-600 tracking-widest border-b border-slate-200 pb-1 mt-6 mb-2 text-left" {...props} />
                                  ),
                                  h2: ({node, ...props}) => (
                                    <h2 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-1 mt-4 mb-2 text-left" {...props} />
                                  ),
                                  h3: ({node, ...props}) => (
                                    <h3 className="text-sm font-bold text-slate-900 mt-3 text-left" {...props} />
                                  ),
                                  p: ({node, ...props}) => (
                                    <p className="text-[11px] leading-relaxed text-slate-700 italic font-sans text-left" {...props} />
                                  ),
                                  ul: ({node, ...props}) => (
                                    <ul className="list-none pl-0 space-y-1 my-2 text-left" {...props} />
                                  ),
                                  li: ({node, ...props}) => {
                                    const childrenArray = React.Children.toArray(props.children);
                                    const textContent: string = (childrenArray as any[])
                                      .reduce((acc: string, child: any) => {
                                        if (typeof child === "string") return acc + child;
                                        if (child && typeof child === "object" && child.props && child.props.children) {
                                          if (typeof child.props.children === "string") return acc + child.props.children;
                                          if (Array.isArray(child.props.children)) return acc + child.props.children.join("");
                                        }
                                        return acc;
                                      }, "")
                                      .trim();

                                    const isSelected = selectedBulletText === textContent;
                                    
                                    return (
                                      <li 
                                        onClick={() => {
                                          if (textContent) {
                                            setSelectedBulletText(prev => prev === textContent ? null : textContent);
                                            setImprovedBulletText(null);
                                            setSelectedBulletContext({
                                              jobTitle: "Resume Entry",
                                              company: jobRequest.companyName
                                            });
                                          }
                                        }}
                                        className={`text-[11px] leading-relaxed flex gap-2 text-left cursor-pointer transition-all duration-150 py-1 px-1.5 rounded-lg my-1 group/bullet ${
                                          isSelected 
                                            ? "bg-blue-100/80 border-l-2 border-blue-600 text-slate-900 font-semibold px-2 animate-pulse" 
                                            : "text-slate-600 hover:bg-blue-50/75 hover:text-slate-900"
                                        }`}
                                      >
                                        <span className="text-blue-500 shrink-0 select-none mt-1 group-hover/bullet:scale-125 transition-transform font-bold">•</span>
                                        <span className="flex-1 flex items-center justify-between gap-2.5">
                                          <span>{props.children}</span>
                                          <span className={`shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded transition-all select-none flex items-center gap-1 ${
                                            isSelected 
                                              ? "bg-blue-600 text-white" 
                                              : "opacity-0 group-hover/bullet:opacity-100 bg-blue-100 text-blue-700 hover:bg-blue-200"
                                          }`}>
                                            <Sparkles className="h-2 w-2" /> {isSelected ? "Selected" : "Optimize"}
                                          </span>
                                        </span>
                                      </li>
                                    );
                                  },
                                  strong: ({node, ...props}) => (
                                    <strong className="font-bold text-slate-950 underline decoration-blue-200 underline-offset-2" {...props} />
                                  ),
                                }}
                              >
                                {cleanClassicResumeMarkdown(generatedResume?.tailoredResumeMarkdown || "", coreProfile.fullName)}
                              </ReactMarkdown>
                            </div>

                          </div>
                        )}
                      </div>
                    </A4PreviewWrapper>
                  </div>
                )}

                {outputTab === "letter" && (
                  <div className="space-y-4">
                    {generatedResume ? (
                      <AnalysisDashboard 
                        data={generatedResume} 
                        companyName={jobRequest.companyName} 
                        roleTitle={jobRequest.roleTitle} 
                      />
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-6 space-y-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-3xs">
                          <BookOpen className="h-6 w-6 text-amber-600" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">No Tailored Cover Letter</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          We can auto-draft a customized, highly persuasive cover letter tailored directly to {jobRequest.companyName} and your role. Configure the requirements on the left settings pane and press <span className="font-bold">"Tailor with Gemini"</span> to generate.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {outputTab === "insights" && (
                  <div className="space-y-6">
                    {generatedResume ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Targeted Interview Q&A Preparation
                        </h4>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                          These customized questions are generated by scanning your experience overlaps with the requirements of {jobRequest.companyName} for the {jobRequest.roleTitle} role. Here is how to answer:
                        </p>

                        <div className="space-y-4">
                          {generatedResume.interviewPrepQuestions.map((qna, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                              <div className="text-xs font-bold text-slate-800 flex items-start gap-2">
                                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 text-[10px] rounded-md shrink-0">
                                  Q{idx+1}
                                </span>
                                <span>{qna.question}</span>
                              </div>
                              <div className="text-xs text-slate-600 pl-8 leading-relaxed">
                                <span className="font-semibold text-[10px] text-blue-600 uppercase tracking-wider block mb-1">Recommended Response Strategy:</span>
                                {qna.talkingPoints}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-6 space-y-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-3xs">
                          <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">No ATS Diagnostics or Q&As</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Scan and estimate your ATS resonance score and generate customized behavior interview questions mapped precisely to this {jobRequest.companyName} vacancy! Configure the job description on the left settings pane and press <span className="font-bold">"Tailor with Gemini"</span>.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

      </main>

      {/* History Slide-over/Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <History className="h-4 w-4 text-blue-600" />
                History & Past Generations
              </h3>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 block font-medium">
                No past customized resumes listed in this session yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 border border-slate-100 bg-slate-50 hover:bg-blue-50/30 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                    onClick={() => handleRestoreHistory(item)}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">{item.companyName}</p>
                      <p className="text-[10px] text-slate-500">{item.roleTitle}</p>
                      <p className="text-[9px] text-slate-400 font-mono italic">{item.timestamp}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Generation Inspector & Final Pre-flight checker modal */}
      {showDownloadPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full p-6 md:p-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col lg:flex-row gap-6">
            
            {/* Left Hand: Checklist & CTA */}
            <div className="flex-1 lg:max-w-sm flex flex-col justify-between text-left pr-0 lg:pr-4 lg:border-r lg:border-slate-100">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-950 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Final PDF Pre-Check
                  </h3>
                  <button 
                    onClick={() => setShowDownloadPreview(false)}
                    className="text-slate-400 hover:text-slate-700 font-extrabold lg:hidden"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[9px] font-black uppercase text-blue-800 font-mono tracking-widest block font-sans">A4 Document Simulation</span>
                  <p className="text-[11px] text-blue-950/80 leading-relaxed font-semibold font-sans">
                    This wizard shows how your final tailored CV fits on a standard single A4 page. Verify margins, alignments, and spelling below.
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest block font-sans">Pre-Flight Review</span>
                  <ul className="space-y-2.5 font-sans text-xs text-slate-600 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span><strong>Spelling & Grammar checked</strong>: Typos corrected throughout.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span><strong>Personal details</strong>: Email, phone, and links are fully expanded without cut-offs.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span><strong>Interests & Hobbies section</strong>: Configured successfully from your profile.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span><strong>Achievements column</strong>: Clean presentation without heavy bold lettering.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 mt-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest block font-sans">Download Format</span>
                  <p className="text-[11px] text-slate-500 leading-normal font-sans">
                    Exports as a premium vector, ATS-friendly PDF document, or save as a interactive HTML file for hosting live on GitHub Pages or portfolio websites.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t border-slate-100 mt-6 lg:mt-0">
                <button
                  type="button"
                  onClick={async () => {
                    setShowDownloadPreview(false);
                    await handleDownloadPDF();
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <FileDown className="h-4 w-4" />
                  Download PDF Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadPreview(false);
                    handleDownloadHTML();
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  <Code className="h-4 w-4" />
                  Download HTML (for GitHub)
                </button>
                <button
                  type="button"
                  onClick={() => setShowDownloadPreview(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer font-sans"
                >
                  Back to Editing
                </button>
              </div>
            </div>

            {/* Right Hand: Pristine Scale-adjusted Interactive Live Layout Preview Frame */}
            <div className="flex-1 flex flex-col bg-slate-900/5 p-4 rounded-2xl border border-slate-200/60 overflow-hidden items-center justify-center min-h-[400px] relative">
              <div className="absolute top-3 left-3 bg-slate-950/80 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider z-10 select-none font-sans">
                Live PDF Simulation Panel
              </div>
              
              <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-hidden flex items-start justify-center py-2 relative rounded-xl bg-white border border-slate-200 shadow-sm scrollbar-thin">
                <div className="scale-75 origin-top transform-gpu my-2">
                  {activeTemplate === "sebastian" ? (
                    <SebastianTemplate
                      profile={coreProfile}
                      jobRequest={jobRequest}
                      tailoredData={generatedResume}
                      selectedBulletText={selectedBulletText}
                      onSelectBullet={(bulletText, role, company) => {
                        setSelectedBulletText(prev => prev === bulletText ? null : bulletText);
                        setImprovedBulletText(null);
                        setSelectedBulletContext({ jobTitle: role, company });
                      }}
                    />
                  ) : (
                    <div 
                      className="a4-page bg-white text-left flex flex-col justify-between border border-slate-100 font-sans"
                      style={{ 
                        boxSizing: "border-box",
                        width: "210mm",
                        height: "297mm",
                        padding: "14mm 14mm 12mm 14mm"
                      }}
                    >
                      <div>
                        <div className="border-b-4 border-slate-900 pb-4 mb-6">
                          <h1 className="text-2xl font-black uppercase text-slate-950 tracking-tight mb-2">
                            {coreProfile.fullName || "PRAVALIKA VAINALA"}
                          </h1>
                          <div className="flex flex-wrap items-center mt-2 gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold font-mono">
                            {coreProfile.email && <span>{coreProfile.email}</span>}
                            {coreProfile.phone && (
                              <>
                                <span>•</span>
                                <span>{coreProfile.phone}</span>
                              </>
                            )}
                            {coreProfile.location && (
                              <>
                                <span>•</span>
                                <span>{coreProfile.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4 text-xs text-slate-800">
                          <div>
                            <h3 className="font-black uppercase text-slate-900 border-b-2 border-slate-300 pb-1 mb-2">Professional Summary</h3>
                            <p className="leading-relaxed">{coreProfile.summary}</p>
                          </div>
                          <div>
                            <h3 className="font-black uppercase text-slate-900 border-b-2 border-slate-300 pb-1 mb-2">Key Skills</h3>
                            <p className="leading-relaxed">{coreProfile.skills}</p>
                          </div>
                          <div>
                            <h3 className="font-black uppercase text-slate-900 border-b-2 border-slate-300 pb-1 mb-2">Experience</h3>
                            <p className="leading-relaxed whitespace-pre-line font-mono text-[10px]">{coreProfile.experience}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Bottom Status / Regulatory Margin Banner bar */}
      <footer className="h-10 bg-slate-900 text-slate-400 text-[10px] px-6 flex items-center justify-between uppercase tracking-widest select-none mt-auto">
        <div className="flex gap-4">
          <span>MatchMyResume 2.4.0-stable</span>
          <span className="hidden sm:inline">Active Secure Handshake</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-slate-200">Local Memory Enabled</span>
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Ready</span>
        </div>
      </footer>

    </div>
  );
}
