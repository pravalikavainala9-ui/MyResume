import React from "react";
import { CoreProfile, GeneratedTailoredResume, JobDescriptionRequest } from "../types";
import { Phone, Mail, MapPin, Globe, Sparkles, Linkedin, Github } from "lucide-react";

interface SebastianTemplateProps {
  profile: CoreProfile;
  jobRequest: JobDescriptionRequest;
  tailoredData: GeneratedTailoredResume | null;
  selectedBulletText?: string | null;
  onSelectBullet?: (bulletText: string, role: string, company: string) => void;
}

interface StructuredEducation {
  institution: string;
  dates: string;
  degree: string;
}

interface StructuredExperience {
  role: string;
  company: string;
  dates: string;
  subtitle: string;
  bullets: string[];
}

interface StructuredAchievement {
  bracketText: string;
  title: string;
  description?: string;
}

// Helper to parse experience text into structured blocks
function parseExperienceText(text: string): StructuredExperience[] {
  if (!text) return [];
  const blocks = text.split(/\n\s*\n+/);
  const result: StructuredExperience[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    let dates = "";
    let role = "";
    let company = "";
    let subtitle = "";
    let bulletStartIndex = 1;

    // Check if second line is dates
    if (lines[1] && (
      lines[1].match(/(19|20)\d{2}/) || 
      lines[1].toLowerCase().includes("present") || 
      lines[1].toLowerCase().includes("current") ||
      lines[1].match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)
    )) {
      dates = lines[1];
      bulletStartIndex = 2;
    }

    // Check if there is client/area context in parenthesis on line 2 or 3
    for (let i = bulletStartIndex; i < Math.min(bulletStartIndex + 2, lines.length); i++) {
      if (lines[i] && lines[i].startsWith("(") && lines[i].endsWith(")")) {
        subtitle = lines[i];
        bulletStartIndex = i + 1;
        break;
      }
    }

    // Parse role vs company
    if (firstLine.includes("|")) {
      const parts = firstLine.split("|");
      role = parts[0]?.trim() || "";
      company = parts[1]?.trim() || "";
    } else if (firstLine.includes("-")) {
      const parts = firstLine.split("-");
      role = parts[0]?.trim() || "";
      company = parts[1]?.trim() || "";
    } else {
      role = firstLine;
      company = "";
    }

    const bullets = lines.slice(bulletStartIndex)
      .map(b => b.replace(/^[\s-•*]+/, "").trim())
      .filter(Boolean);

    result.push({
      role,
      company,
      dates,
      subtitle,
      bullets
    });
  }

  return result;
}

// Smart educational background parser
function parseEducationText(text: string): StructuredEducation[] {
  if (!text) return [];
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const results: StructuredEducation[] = [];

  for (const line of lines) {
    let dates = "";
    let institution = "";
    let degree = "";

    const dateMatch = line.match(/\(?(\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*Present|\d{4})\)?/i);
    if (dateMatch) {
      dates = dateMatch[1];
    }

    let cleanLine = line;
    if (dateMatch) {
      cleanLine = line.replace(dateMatch[0], "").trim();
      cleanLine = cleanLine.replace(/^[\s|,-]+|[\s|,-]+$/g, "").trim();
    }

    const separators = ["|", ",", " - "];
    let split = false;
    for (const sep of separators) {
      if (cleanLine.includes(sep)) {
        const parts = cleanLine.split(sep);
        degree = parts[0].trim();
        institution = parts.slice(1).join(sep).trim();
        split = true;
        break;
      }
    }

    if (!split) {
      if (cleanLine.toLowerCase().includes("university") || cleanLine.toLowerCase().includes("college") || cleanLine.toLowerCase().includes("school") || cleanLine.toLowerCase().includes("institute")) {
        institution = cleanLine;
      } else {
        degree = cleanLine;
      }
    }

    if (!institution && degree) {
      institution = degree;
      degree = "";
    }

    results.push({
      institution: institution || "Education Institution",
      dates: dates || "2020 - 2024",
      degree: degree || "Academic Program / Degree"
    });
  }
  return results;
}

// Helper to parse skills list
function parseSkillsText(text: string): string[] {
  if (!text) return [];
  if (text.includes(",")) {
    return text.split(",").map(s => s.trim()).filter(Boolean);
  }
  return text.split(/\n+/).map(s => s.replace(/^[\s-•*]+/, "").trim()).filter(Boolean);
}

// Parse achievements from custom text with bracket styling fallback
function parseAchievementsText(text: string, fullName?: string): StructuredAchievement[] {
  const isPrakhar = fullName?.toLowerCase().includes("prakhar");
  const isPravalika = fullName?.toLowerCase().includes("pravalika") || fullName?.toLowerCase().includes("vainala");
  
  const defaultPrakhar = [
    { bracketText: "JP MORGAN", title: "Teamwork and Leadership.", description: "Leading from the front." },
    { bracketText: "SAP", title: "Honor - Keep the promise", description: "Fixing the customer show stopper issue in short time." },
    { bracketText: "SAP", title: "Praise - Build bridges, not silos", description: "Cross-team help." },
    { bracketText: "SAP", title: "Honor - Stay curious", description: "Working on escalated issues." }
  ];
  
  const defaultPravalika = [
    { bracketText: "HONOR", title: "Bravo Award (September 2024)", description: "Successfully scheduled and executed SAP BASIS patching and upgrades across 50+ central systems for multiple banners under Massmart." },
    { bracketText: "VIGILANCE", title: "Operational Ownership", description: "Recognized for exceptional vigilance and operational ownership during critical system incidents, ensuring minimal business disruption." },
    { bracketText: "AUTOMATION", title: "Power Automate Workflows", description: "Programmed custom Power Automate workflows to save ~160 minutes per day, supplemented by Power BI dashboards for real-time alert visibility." },
    { bracketText: "COLLABORATOR", title: "Core Strengths", description: "Recognized as Collaborator, Fire Fighter, Inspirer, Learning Champion, and Supporter." }
  ];

  if (!text) {
    return isPrakhar ? defaultPrakhar : defaultPravalika;
  }

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const results: StructuredAchievement[] = [];
  
  // Check which format it is. If it has lines starting with "[" we can use the bracket-description parser.
  const hasBrackets = lines.some(line => /^\[[^\]]+\]/.test(line));
  
  if (hasBrackets) {
    let currentAch: StructuredAchievement | null = null;
    for (const line of lines) {
      if (line.toLowerCase().startsWith("interests:") || line.toLowerCase().startsWith("languages:") || line.toLowerCase().startsWith("professional qualities")) {
        continue;
      }
      
      const bracketMatch = line.match(/^\[([^\]]+)\]\s*(.*)/);
      if (bracketMatch) {
        if (currentAch) {
          results.push(currentAch);
        }
        currentAch = {
          bracketText: bracketMatch[1].toUpperCase(),
          title: bracketMatch[2].trim(),
          description: ""
        };
      } else {
        if (currentAch) {
          currentAch.description = line.replace(/^[-•*\s]+/, "").trim();
          results.push(currentAch);
          currentAch = null;
        } else {
          // dangling line
          results.push({
            bracketText: "HONOR",
            title: line.replace(/^[-•*\s]+/, "").trim(),
            description: ""
          });
        }
      }
    }
    if (currentAch) {
      results.push(currentAch);
    }
  } else {
    // Bullets / list format like Pravalika's
    let currentHeader = "";
    let currentHeaderBracket = "HONOR";
    let bullets: string[] = [];
    
    for (const line of lines) {
      const cleaned = line.replace(/^[-•*\s]+/, "").trim();
      if (!cleaned) continue;

      const lowerLine = line.toLowerCase();
      if (lowerLine.startsWith("interests:") || lowerLine.startsWith("languages:") || lowerLine.startsWith("professional qualities:")) {
        continue;
      }
      
      if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
        bullets.push(cleaned);
      } else {
        // It's a new header - flush previous
        if (currentHeader && bullets.length > 0) {
          bullets.forEach((bullet, bIdx) => {
            results.push({
              bracketText: bIdx === 0 ? currentHeaderBracket : "",
              title: bIdx === 0 ? currentHeader : bullet,
              description: bIdx === 0 ? bullet : ""
            });
          });
          bullets = [];
        } else if (currentHeader) {
          results.push({
            bracketText: currentHeaderBracket,
            title: currentHeader,
            description: ""
          });
        }
        
        currentHeader = cleaned;
        if (currentHeader.toLowerCase().includes("award")) {
          currentHeaderBracket = "AWARD";
        } else if (currentHeader.toLowerCase().includes("qualities") || currentHeader.toLowerCase().includes("credentials")) {
          currentHeaderBracket = "CREDENTIALS";
        } else {
          currentHeaderBracket = "HONOR";
        }
      }
    }
    
    // Flush last
    if (currentHeader && bullets.length > 0) {
      bullets.forEach((bullet, bIdx) => {
        results.push({
          bracketText: bIdx === 0 ? currentHeaderBracket : "",
          title: bIdx === 0 ? currentHeader : bullet,
          description: bIdx === 0 ? bullet : ""
        });
      });
    } else if (currentHeader) {
      results.push({
        bracketText: currentHeaderBracket,
        title: currentHeader,
        description: ""
      });
    }
  }
  
  if (results.length === 0) {
    return isPrakhar ? defaultPrakhar : defaultPravalika;
  }
  
  return results.slice(0, 5); // strict 5 limit to fit perfectly on A4!
}

interface StructuredLanguage {
  name: string;
  proficiency: string;
}

function parseLanguagesFromProjects(projectsText: string, fullName: string): StructuredLanguage[] {
  if (fullName.toLowerCase().includes("prakhar")) {
    return [
      { name: "English", proficiency: "Full Professional Proficiency" },
      { name: "Hindi", proficiency: "Native or Bilingual Proficiency" }
    ];
  }
  
  const defaultLangs: StructuredLanguage[] = [
    { name: "English", proficiency: "Full Professional Proficiency" },
    { name: "Hindi", proficiency: "Native or Bilingual Proficiency" },
    { name: "Telugu", proficiency: "Native or Bilingual Proficiency" }
  ];

  if (!projectsText) return defaultLangs;

  const match = projectsText.match(/languages?\s*:\s*([^\n]+)/i);
  if (!match) return defaultLangs;

  const parts = match[1].split(/[,;]/).map(p => p.trim()).filter(Boolean);
  const results: StructuredLanguage[] = [];

  for (const part of parts) {
    const parenMatch = part.match(/^([^(]+)\(([^)]+)\)/);
    if (parenMatch) {
      results.push({
        name: parenMatch[1].trim(),
        proficiency: parenMatch[2].trim()
      });
    } else {
      let prof = "Professional Working";
      const nameLower = part.toLowerCase();
      if (nameLower.includes("english")) {
        prof = "Full Professional Proficiency";
      } else if (nameLower.includes("hindi") || nameLower.includes("telugu") || nameLower.includes("telgu")) {
        prof = "Native or Bilingual Proficiency";
      }
      results.push({
        name: part,
        proficiency: prof
      });
    }
  }

  return results.length > 0 ? results : defaultLangs;
}

function parseInterestsFromProjects(projectsText: string, fullName: string, interestsDirect?: string): string[] {
  if (interestsDirect && interestsDirect.trim()) {
    const items = interestsDirect.split(/[,\n;]/)
      .map(i => i.replace(/^[- \t*•]*/, "").trim())
      .filter(Boolean);
    if (items.length > 0) return items;
  }

  if (fullName.toLowerCase().includes("prakhar")) {
    return ["TV Series", "Vlogging", "Trekking", "Badminton", "Counter Strike"];
  }

  const defaultInterests = ["Cloud Architecture", "Database Performance", "Process Automation", "System Scalability", "Continuous Development"];
  if (!projectsText) return defaultInterests;

  const match = projectsText.match(/interests?\s*:\s*([^\n]+)/i);
  if (match) {
    return match[1].split(/[,;]/).map(i => i.trim()).filter(Boolean);
  }

  const lines = projectsText.split("\n");
  for (const line of lines) {
    if (line.toLowerCase().startsWith("interests:") || line.toLowerCase().startsWith("- interests:")) {
      return line.replace(/^[- \t]*interests:\s*/i, "").split(/[,;]/).map(i => i.trim()).filter(Boolean);
    }
  }

  return defaultInterests;
}

// Robust Markdown Parser that extracts sections from the tailored resume markdown
function parseMarkdownToSections(markdown: string, fallbackProfile: CoreProfile) {
  const sections = {
    summary: fallbackProfile.summary,
    skills: parseSkillsText(fallbackProfile.skills),
    experience: parseExperienceText(fallbackProfile.experience),
    education: parseEducationText(fallbackProfile.education),
    projects: fallbackProfile.projects || "",
    interests: fallbackProfile.interests || ""
  };

  if (!markdown) return sections;

  // Split markdown by common main titles (##)
  const parts = markdown.split(/\n\s*##\s+/);
  
  for (const part of parts) {
    const lines = part.split("\n");
    const heading = lines[0]?.toLowerCase().trim() || "";
    const content = lines.slice(1).join("\n").trim();

    if (!content) continue;

    if (heading.includes("summary") || heading.includes("profile") || heading.includes("about")) {
      sections.summary = content.split("\n").map(l => l.trim()).filter(l => !l.startsWith("#")).join("\n");
    } else if (heading.includes("skills") || heading.includes("expertise") || heading.includes("technologies") || heading.includes("skills & tools") || heading.includes("skills & systems")) {
      sections.skills = parseSkillsText(content);
    } else if (heading.includes("experience") || heading.includes("history") || heading.includes("employment") || heading.includes("work") || heading.includes("professional experience")) {
      sections.experience = parseExperienceText(content);
    } else if (heading.includes("education") || heading.includes("academic") || heading.includes("school") || heading.includes("degrees")) {
      sections.education = parseEducationText(content);
    } else if (heading.includes("projects") || heading.includes("awards") || heading.includes("certifications") || heading.includes("credentials") || heading.includes("additional")) {
      sections.projects = content;
    } else if (heading.includes("interests") || heading.includes("hobbies")) {
      sections.interests = content;
    }
  }

  return sections;
}

export default function SebastianTemplate({ 
  profile, 
  jobRequest, 
  tailoredData,
  selectedBulletText = null,
  onSelectBullet
}: SebastianTemplateProps) {
  const isTailored = !!tailoredData;
  const resumeMarkdown = tailoredData?.tailoredResumeMarkdown || "";
  
  const parsed = isTailored 
    ? parseMarkdownToSections(resumeMarkdown, profile)
    : {
        summary: profile.summary,
        skills: parseSkillsText(profile.skills),
        experience: parseExperienceText(profile.experience),
        education: parseEducationText(profile.education),
        projects: profile.projects || "",
        interests: profile.interests || ""
      };

  // Extract contact fields cleanly
  const fullName = profile.fullName || "Prakhar Gupta";
  const email = profile.email || "prakhar13103608@gmail.com";
  const phone = profile.phone || "+91-9910368499";
  const location = profile.location || "Hyderabad, India";
  const website = profile.website || "linkedin.com/in/prakh2796";
  
  // Calculate display role
  const displayRole = isTailored 
    ? jobRequest.roleTitle 
    : (parsed.experience[0]?.role || "Software Development Engineer 2");

  // Determine standard skill items
  const skillsDisplay = parsed.skills.length > 0 ? parsed.skills : ["Java", "Azure", "Spring Boot", "Azure DevOps", "Python", "Web Development", "Generative AI", "Langchain", "LLM", "GPT", "Jira", "Maven", "MySQL", "Git", "C#", "CI/CD", ".Net", "CosmosDB", "Scrum Master"];

  // Parse achievements
  const achievements = parseAchievementsText(parsed.projects, fullName);

  // Parse languages
  const languagesDisplay = parseLanguagesFromProjects(parsed.projects, fullName);

  // Parse interests
  const interestsDisplay = parseInterestsFromProjects(parsed.projects, fullName, parsed.interests || profile.interests);

  // Internal helper to render markdown bold elements (e.g. **text**) inside bullets
  const renderBulletText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-extrabold text-slate-950 font-sans">{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div 
      className="a4-page bg-white text-slate-800 font-sans shadow-2xl border border-slate-200 rounded-none mx-auto select-text flex flex-col justify-between"
      style={{ 
        WebkitPrintColorAdjust: "exact", 
        colorAdjust: "exact", 
        boxSizing: "border-box",
        width: "210mm",
        height: "297mm",
        padding: "14mm 14mm 12mm 14mm"
      }}
    >
      {/* 1. HEADER SECTION (MATCHING SCREENSHOT) */}
      <div className="flex justify-between items-start gap-4 pb-2.5 border-b border-slate-300 text-left">
        {/* Left Side: Solid navy blue square next to Name & Title, and Summary paragraph below */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex gap-3 items-center">
            {/* Solid accent square block matching the dark blue square in image.png */}
            <div className="w-[40px] h-[40px] bg-[#319795] shrink-0 select-none" />
            
            <div className="min-w-0">
              <h1 className="text-[23px] font-bold text-slate-900 tracking-tight leading-none select-all font-sans">
                {fullName}
              </h1>
              <p className="text-[11.5px] text-[#319795] font-semibold mt-0.5 select-all font-sans">
                {displayRole}
              </p>
            </div>
          </div>
          
          {/* Professional Summary / Bio paragraph starting vertically aligned on the left margin */}
          {parsed.summary && (
            <p className="text-[10px] sm:text-[10.5px] text-slate-600 leading-relaxed font-medium font-sans text-justify select-text whitespace-pre-line mt-0.5 pr-2 max-w-[490px]">
              {parsed.summary}
            </p>
          )}
        </div>

        {/* Right Side: Stacked Contact list with perfectly right-aligned elements & rightmost icons */}
        <div className="shrink-0 text-right flex flex-col items-end gap-1 text-[8.5px] sm:text-[9px] font-semibold text-slate-700 tracking-wide font-sans mt-0.5">
          {email && (
            <div className="flex items-center gap-1.5 justify-end">
              <span className="select-all block whitespace-nowrap text-slate-600 font-medium">{email}</span>
              <div className="w-3 h-3 flex items-center justify-center shrink-0">
                <Mail className="h-2.5 w-2.5 text-slate-700" />
              </div>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1.5 justify-end">
              <span className="select-all block whitespace-nowrap text-slate-600 font-medium">{phone}</span>
              <div className="w-3 h-3 flex items-center justify-center shrink-0">
                <Phone className="h-2.5 w-2.5 text-slate-700" />
              </div>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5 justify-end">
              <span className="select-all block whitespace-nowrap text-slate-600 font-medium">{location}</span>
              <div className="w-3 h-3 flex items-center justify-center shrink-0">
                <MapPin className="h-2.5 w-2.5 text-slate-700" />
              </div>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-1.5 justify-end">
              <span className="select-all block whitespace-nowrap text-slate-600 font-medium">
                {website.includes("linkedin") ? website.replace(/^linkedin\.com\/in\//, "linkedin.com/in/") : website}
              </span>
              <div className="w-3 h-3 flex items-center justify-center shrink-0">
                <Linkedin className="h-2.5 w-2.5 text-slate-700" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5 justify-end">
            <span className="select-all block whitespace-nowrap text-slate-600 font-medium">
              {(() => {
                const rawGit = profile.github || (fullName.toLowerCase().includes("prakhar") ? "github.com/prakh2796" : "github.com/pravalika-v");
                return rawGit.replace(/^(https?:\/\/)?(www\.)?/, "");
              })()}
            </span>
            <div className="w-3 h-3 flex items-center justify-center shrink-0">
              <Github className="h-2.5 w-2.5 text-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT BODY (MATCHING TWO-COLUMN LAYOUT) */}
      <div className="flex flex-row mt-3 justify-between select-text flex-1">
        
        {/* LEFT COLUMN: ~62.5% width for Experience and Education */}
        <div 
          className="flex flex-col gap-[18px] text-left"
          style={{ width: "114mm", minWidth: "114mm" }}
        >
          
          {/* WORK EXPERIENCE */}
          <div className="space-y-1.5">
            <h3 className="text-xs sm:text-[11px] font-extrabold text-slate-950 tracking-[0.2em] uppercase border-b border-slate-200 pb-0.5 select-none font-sans">
              WORK EXPERIENCE
            </h3>
            
            <div className="space-y-2.5 pt-0.5">
              {parsed.experience.map((exp, idx) => (
                <div key={idx} className="flex gap-2.5 items-start select-text text-left">
                  {/* Cyan solid block accent next to Job title */}
                  <div className="w-[12px] h-[20px] bg-[#319795] shrink-0 mt-0.5 select-none" />
                  
                  <div className="flex-1 min-w-0 space-y-0.5">
                    {/* Job Title */}
                    <h4 className="text-xs sm:text-[12px] font-bold text-slate-950 leading-tight font-sans">
                      {exp.role}
                    </h4>
                    {/* Company name */}
                    <p className="text-[10.5px] font-semibold text-slate-700 font-sans">
                      {exp.company}
                    </p>
                    {/* Date on Left, Location on Right */}
                    <div className="flex justify-between items-baseline mt-0.5 pb-0.5 leading-none">
                      <span className="text-[9px] font-bold text-[#319795] font-mono whitespace-nowrap">
                        {exp.dates || "Current"}
                      </span>
                      <span className="text-[9px] font-bold text-[#319795] font-mono whitespace-nowrap">
                        {fullName.toLowerCase().includes("prakhar") 
                          ? (exp.company.toLowerCase().includes("microsoft") ? "Hyderabad, India" : "Bangalore, India") 
                          : location}
                      </span>
                    </div>

                    {/* Task Subtitle */}
                    <p className="text-[8.5px] text-[#319795] font-extrabold tracking-wide uppercase italic select-none mt-0.5">
                      Achievements/Tasks
                    </p>

                    {/* Experience Bullet points with Optimize capability */}
                    {exp.bullets.length > 0 && (
                      <ul className="space-y-1 mt-0.5 pl-0.5">
                        {exp.bullets.map((bullet, bIdx) => {
                          const isSelected = selectedBulletText === bullet.trim();
                          
                          return (
                            <li 
                              key={bIdx} 
                              onClick={() => {
                                  if (onSelectBullet) {
                                    onSelectBullet(bullet.trim(), exp.role, exp.company);
                                  }
                              }}
                              className={`text-[9.5px] sm:text-[10px] leading-normal flex items-start gap-1.5 cursor-pointer transition-all duration-150 py-0.5 px-0.5 rounded my-0.5 group/bullet ${
                                  isSelected 
                                    ? "bg-blue-100/80 border-l-2 border-blue-600 text-slate-950 font-bold px-1.5 scale-[1.01]" 
                                    : "text-slate-700 hover:bg-teal-50/50 hover:text-slate-950"
                              }`}
                            >
                              <span className="w-1.2 h-1.2 rounded-full bg-[#319795] shrink-0 mt-1.5 select-none opacity-80 group-hover/bullet:scale-125 transition-all" />
                              <span className="flex-1 text-slate-700 text-justify leading-normal block">
                                <span>
                                  {renderBulletText(bullet)}
                                </span>
                                <span className={`inline-flex items-center gap-0.5 ml-1.5 text-[7px] font-black uppercase px-1.5 py-0.5 rounded transition-all select-none align-middle ${
                                  isSelected 
                                    ? "bg-blue-600 text-white shadow-xs" 
                                    : "opacity-0 group-hover/bullet:opacity-100 bg-teal-100 text-[#1a7c8e] hover:bg-teal-200"
                                }`}>
                                  <Sparkles className="h-1.5 w-1.5" /> {isSelected ? "Selected" : "Optimize"}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EDUCATION */}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-[11px] font-extrabold text-slate-950 tracking-[0.2em] uppercase border-b border-slate-200 pb-0.5 select-none font-sans">
              EDUCATION
            </h3>

            <div className="space-y-1.5 pt-0.5">
              {parsed.education.map((edu, idx) => (
                <div key={idx} className="flex gap-2.5 items-start select-text text-left">
                  {/* Cyan solid block accent next to Education */}
                  <div className="w-[12px] h-[20px] bg-[#319795] shrink-0 mt-0.5 select-none" />
                  
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="text-xs sm:text-[11.5px] font-bold text-slate-950 leading-tight font-sans">
                      {edu.degree}
                    </h4>
                    <p className="text-[10.5px] text-slate-600 font-semibold font-sans">
                      {edu.institution}
                    </p>
                    <div className="flex justify-between items-center text-[9px] font-bold text-[#319795] font-mono mt-0.5 pb-0.5">
                      <span>{edu.dates}</span>
                      <span className="italic normal-case">
                        {fullName.toLowerCase().includes("prakhar") ? "7.2/10" : "Grade: 7.8/10"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ~34% width for Skills, Achievements, Languages, Interests */}
        <div 
          className="flex flex-col gap-[18px] text-left pl-3 pr-1.5"
          style={{ width: "62mm", minWidth: "62mm" }}
        >
          
          {/* SKILLS */}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-[11px] font-extrabold text-slate-950 tracking-[0.2em] uppercase border-b border-slate-200 pb-0.5 select-none font-sans">
              SKILLS
            </h3>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {skillsDisplay.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="bg-[#2d3748] text-white px-1.5 py-[2.5px] text-[8.5px] font-semibold rounded-xs tracking-wider uppercase shadow-2xs inline-block leading-tight transition-hover hover:bg-slate-700 max-w-full break-words"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* ACHIEVEMENTS */}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-[11px] font-extrabold text-slate-950 tracking-[0.2em] uppercase border-b border-slate-200 pb-0.5 select-none font-sans">
              ACHIEVEMENTS
            </h3>
            <div className="space-y-1.5 pt-0.5">
              {achievements.map((ach, idx) => (
                <div key={idx} className="space-y-0.5 select-text text-left leading-normal py-0.5">
                  <p className="text-[9.5px] sm:text-[10px] text-slate-800 font-sans">
                    {ach.bracketText && ach.bracketText.trim() !== "" && (
                      <span className="text-[#319795] font-medium mr-1">[{ach.bracketText}]</span>
                    )}
                    <span className="text-slate-800 font-normal">{ach.title}</span>
                  </p>
                  {ach.description && ach.description.trim() !== "" && (
                    <p className="text-[8.5px] text-slate-500 font-normal italic pl-1 leading-tight font-sans">
                      {ach.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* LANGUAGES */}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-[11px] font-extrabold text-slate-950 tracking-[0.2em] uppercase border-b border-slate-200 pb-0.5 select-none font-sans">
              LANGUAGES
            </h3>
            <div className="grid grid-cols-2 gap-2 pt-0.5 select-all font-sans">
              {languagesDisplay.map((lang, idx) => (
                <div key={idx} className="leading-tight">
                  <p className="font-extrabold text-slate-950 text-[10px] uppercase">{lang.name}</p>
                  <p className="text-[8.5px] text-[#319795] font-semibold italic mt-0.5">{lang.proficiency}</p>
                </div>
              ))}
            </div>
          </div>

          {/* INTERESTS */}
          <div className="space-y-1">
            <h3 className="text-xs sm:text-[11px] font-extrabold text-slate-950 tracking-[0.2em] uppercase border-b border-slate-200 pb-0.5 select-none font-sans">
              INTERESTS
            </h3>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {interestsDisplay.map((interest, idx) => (
                <span 
                  key={idx} 
                  className="border border-[#e2e8f0] text-slate-600 px-1.5 py-[2.5px] text-[8.5px] font-medium rounded-xs bg-white font-sans inline-block leading-tight max-w-full break-words"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
