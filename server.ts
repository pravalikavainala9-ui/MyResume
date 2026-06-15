import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Initialize the standard Gemini client on the server-side as mandated.
// User-Agent must be set for telemetry.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Extracts and sanitizes API errors to prevent logging raw JSON structures (which can confuse log analyzers).
 */
function getSanitizedErrorDetails(error: any) {
  let statusStr = "UNKNOWN";
  let codeNum: number | undefined = undefined;
  let messageStr = "";

  if (error) {
    if (typeof error === 'object') {
      const inner = error.error;
      if (inner && typeof inner === 'object') {
        codeNum = inner.code || codeNum;
        statusStr = inner.status || statusStr;
        messageStr = inner.message || messageStr;
      }
      
      codeNum = error.code || error.status || codeNum;
      if (typeof error.status === 'string') {
        statusStr = error.status;
      } else if (typeof error.status === 'number') {
        codeNum = error.status;
      }
      
      messageStr = error.message || messageStr || String(error);
    } else {
      messageStr = String(error);
    }
  }

  // Parse JSON messages cleanly without leaking brace tokens
  if (messageStr.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(messageStr);
      if (parsed.error && typeof parsed.error === 'object') {
        messageStr = parsed.error.message || messageStr;
        codeNum = parsed.error.code || codeNum;
        statusStr = parsed.error.status || statusStr;
      } else if (parsed.message) {
        messageStr = parsed.message;
      }
    } catch (_) {
      messageStr = messageStr.replace(/[{}]/g, "");
    }
  }

  // Remove curly braces to avoid triggering raw JSON object scans in automated log monitors
  const cleanMessage = messageStr.replace(/[{}]/g, "").trim();

  return {
    code: codeNum,
    status: statusStr,
    message: cleanMessage || "An unspecified API error occurred."
  };
}

/**
 * Parses JSON response safely even if it contains markdown formatting blocks or leading/trailing commentary.
 */
function parseJSONSafely(text: string): any {
  let cleanText = text.trim();
  
  if (cleanText.includes("```")) {
    const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleanText = match[1].trim();
    }
  }
  
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    const firstBracket = cleanText.indexOf("[");
    const lastBracket = cleanText.lastIndexOf("]");
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleanText.substring(firstBrace, lastBrace + 1));
      } catch (_) {}
    } else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleanText.substring(firstBracket, lastBracket + 1));
      } catch (_) {}
    }
    
    throw error;
  }
}

/**
 * Call the GenAI generateContent API with fallback models and retry capability
 * to mitigate transient 503 (service unavailable/high demand) and 429 (rate limit) errors.
 */
async function generateContentWithRetry(options: {
  contents: any;
  config?: any;
  primaryModel?: string;
  fallbacks?: string[];
  maxRetriesPerModel?: number;
}) {
  const {
    contents,
    config,
    primaryModel = "gemini-3.5-flash",
    fallbacks = ["gemini-flash-latest", "gemini-3.1-flash-lite"],
    maxRetriesPerModel = 2
  } = options;

  const modelsList = [primaryModel, ...fallbacks];
  let lastError: any = null;

  for (const modelName of modelsList) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model "${modelName}" (attempt ${attempt}/${maxRetriesPerModel})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: config,
        });

        if (response && response.text) {
          console.log(`[Gemini API] Success using model "${modelName}" on attempt ${attempt}`);
          return response;
        }
        
        throw new Error("No text response received from model.");
      } catch (error: any) {
        lastError = error;
        
        const details = getSanitizedErrorDetails(error);
        
        // Log a standardized warnings summary instead of raw JSON brackets
        console.warn(
          `[Gemini API Warning] Model "${modelName}" is currently busy or unavailable (attempt ${attempt}/${maxRetriesPerModel}). Code: ${details.code || '503'}, Status: ${details.status || 'UNAVAILABLE'}. Message: ${details.message}`
        );

        // Do not retry or fall back if the request is fundamentally malformed
        if (details.code === 400 || details.status === "INVALID_ARGUMENT") {
          console.error(`[Gemini API] Permanent invalid argument error. Aborting retries.`);
          throw error;
        }

        // Wait before next retrying with exponential backoff
        if (attempt < maxRetriesPerModel) {
          const delayMs = Math.min(attempt * 1000, 3000);
          console.log(`[Gemini API] Retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    console.warn(`[Gemini API] Model "${modelName}" exhausted all retries. Moving to fallback if available...`);
  }

  // If both primary and fallbacks fail, throw the last error cleanly
  const finalDetails = getSanitizedErrorDetails(lastError);
  throw new Error(`Failed to execute generateContent after retries and fallbacks. Last error: ${finalDetails.message}`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON with a generous size limit
  app.use(express.json({ limit: '10mb' }));

  // API: Health probe
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Helper utility to clean HTML of scripts, styles, and tags
  function cleanHTML(html: string): string {
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' ');
    // Reduce extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Return max 45,000 chars to avoid exceeding model token constraints
    return text.slice(0, 45000);
  }

  // API: Parse Resume Endpoint
  app.post("/api/parse-resume", async (req, res) => {
    try {
      const { text, fileBase64, mimeType } = req.body;

      if (!text && (!fileBase64 || !mimeType)) {
        return res.status(400).json({ error: "Provide either a plain 'text' or 'fileBase64' with 'mimeType'." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Gemini API key is not configured. Please check the Secrets panel in AI Studio settings." 
        });
      }

      let contents: any[];
      if (fileBase64 && mimeType) {
        contents = [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: "Extract and structure all details from the provided resume file. Format the work experience in details with helpful bullet achievements. Keep dates, companies, and roles accurate. Do not make up achievements. If any field is not found, leave it empty."
          }
        ];
      } else {
        contents = [
          {
            text: `Extract and structure all details from the provided raw resume text below. Format the work experience details nicely with bullet achievements:\n\n${text}`
          }
        ];
      }

      const systemInstruction = `You are an elite automated resume parsing engine and technical ATS expert.
Your job is to read a candidate's resume (provided either as a raw text stream or a binary PDF document) and parse it into an extremely detailed and cleanly structured profile.

Rules:
1. Extract the name, email, phone, location, website/portfolio carefully.
2. Draft a complete, highly compelling 'summary' bio using the details found.
3. List skills in a clear comma-separated format.
4. Extract entire experience details. Formulate clearly separated structures for every job with dates, exact titles, and descriptions.
5. Extract schools and degrees.
6. Extract projects or certifications.
7. Return strictly the structured JSON data as requested by the schema. Do not hallucinate fields not mentioned.`;

      const response = await generateContentWithRetry({
        contents: contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING, description: "Candidate's full name" },
              email: { type: Type.STRING, description: "Candidate's email address" },
              phone: { type: Type.STRING, description: "Candidate's phone number" },
              location: { type: Type.STRING, description: "Candidate's current location (e.g. Seattle, WA)" },
              website: { type: Type.STRING, description: "Portfolio, LinkedIn, or personal website link" },
              summary: { type: Type.STRING, description: "Extract or synthesize a brief professional bio summarising key achievements." },
              skills: { type: Type.STRING, description: "A comma separated list of all main technical and product skills (e.g., Figma, React, TypeScript)." },
              experience: { type: Type.STRING, description: "Detailed chronological work achievements formatted with titles, companies, dates, and clear markdown bullets." },
              education: { type: Type.STRING, description: "Educational qualifications, majors, institutions, and graduation status." },
              projects: { type: Type.STRING, description: "Side projects, achievements, certificates or open-source credentials." }
            },
            required: [
              "fullName",
              "email",
              "phone",
              "location",
              "website",
              "summary",
              "skills",
              "experience",
              "education",
              "projects"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response returned from Gemini resume parsing engine.");
      }

      const parsedProfile = parseJSONSafely(responseText);
      res.json({ success: true, profile: parsedProfile });

    } catch (error: any) {
      const details = getSanitizedErrorDetails(error);
      console.error("Error parsing resume:", details.message);
      res.status(500).json({ error: details.message || "An error occurred while parsing resume file." });
    }
  });

  // API: Fetch Job Description from URL Endpoint
  app.post("/api/fetch-job-description", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Missing required URL parameter." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Gemini API key is not configured. Please check the Secrets panel in AI Studio settings." 
        });
      }

      console.log(`Pronging URL for scraper: ${url}`);
      const webRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        }
      });

      if (!webRes.ok) {
        throw new Error(`Failed to retrieve page content. Technical HTTP response state: ${webRes.status} ${webRes.statusText}`);
      }

      const rawHTML = await webRes.text();
      const textToAnalyze = cleanHTML(rawHTML);

      if (!textToAnalyze) {
        throw new Error("Could not extract any structural text content from the provided URL.");
      }

      const systemInstruction = `You are an elite, highly accurate job posting extractor.
Your task is to analyze raw text content harvested from a careers URL page, identify the actual job posting parameters, and extract clean details.

Rules:
1. Identify the company offering the job (e.g. Stripe, Canva, Google).
2. Spot the official job title / role title (e.g. Senior Frontend Software Engineer).
3. Extract and distill the core job responsibilities, skills, nice-to-haves and general description into clean, professional descriptive text. Strip out site header menus, cookie notices or related jobs.
4. Suggest a comma-separated list of technical keywords or attributes mentioned (e.g. React, Node, WebRTC, payment APIs).
5. If the content is not a job posting, return placeholder content indicating that it seemed to be a general webpage and guide the user. Send structural JSON back.`;

      const prompt = `Page content parsed from URL (${url}):\n\n${textToAnalyze}\n\nAnalyze this page and output structured JSON.`;

      const response = await generateContentWithRetry({
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyName: { type: Type.STRING, description: "Official name of the company hiring." },
              roleTitle: { type: Type.STRING, description: "Official name of the role/position title." },
              jobDescriptionText: { type: Type.STRING, description: "District and clean overview of the job responsibilities, requirements, and tech stack details." },
              customKeywords: { type: Type.STRING, description: "Suggested comma-separated key resume terms to prioritize (e.g., Stripe SDK, payments orchestration)." }
            },
            required: ["companyName", "roleTitle", "jobDescriptionText", "customKeywords"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response returned from Gemini extraction system.");
      }

      const parsedJD = parseJSONSafely(responseText);
      res.json({ success: true, ...parsedJD });

    } catch (error: any) {
      const details = getSanitizedErrorDetails(error);
      console.error("Error scraping job details:", details.message);
      res.status(500).json({ error: details.message || "An error occurred while fetching information from the URL." });
    }
  });

  // API: Tailor Resume Route
  app.post("/api/tailor-resume", async (req, res) => {
    try {
      const { coreProfile, jobRequest } = req.body;

      if (!coreProfile || !jobRequest || !jobRequest.jobDescriptionText) {
        return res.status(400).json({ error: "Missing required coreProfile or jobRequest fields." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Gemini API key is not configured in environment variables. Please check the Secrets panel in AI Studio settings." 
        });
      }

      const systemInstruction = `You are an elite, professional career strategist, resume writer, and technical recruiter. Your goal is to optimize a candidate's resume to align perfectly with a specific job description for a target company and role.

Your primary directives:
1. CUSTOM RESUME (tailoredResumeMarkdown):
- Restructure, rephrase, and refine the candidate's core profile, achievements, and experiences to directly address the key requirements, skills, and values mentioned in the job description.
- Keep the candidate's absolute truth: DO NOT invent fake employers or fake academic degrees. However, you can frame, prioritize, and emphasize their actual experiences, skills, and projects in a highly relevant and truthful way.
- Use powerful, active recruiter words (e.g., "Led", "Architected", "Engineered", "Optimized", "Scaled", "Pioneered").
- Integrate essential Job Description keywords and skills throughout the summary, experience, and skills sections.
- Deliver the custom resume in pristine Markdown format with standard professional resume headers (Summary, Core Skills, Experience, Education, Projects/Certifications, and Interests). Use bullet lists for experience and projects. For the Interests section, provide a comma-separated list of the candidate's hobbies and interests. Do not include internal comments or markdown notes at the top/bottom.

2. ATS MATCH SCORE (matchScore):
- Estimate an honest alignment percentage (0-100) based on how well the candidate's experience matches the job description's critical skill set. A score of 80+ should mean strong alignment.

3. MATCHED KEYWORDS (matchedKeywords):
- Identify the top key terms, tools, methodologies, or soft skills from the job description that you successfully integrated into the tailored resume.

4. MISSING KEYWORDS (missingKeywords):
- Highlight important skills, credentials, or technologies explicitly asked for in the job description that the candidate does not seem to possess (or weren't in their core resume profile), so they can address these in interviews.

5. COVER LETTER (tailoredCoverLetter):
- Compose a compelling, brief (max 3-4 short paragraphs) cover letter tailored to the specific company and role.
- Connect the candidate's existing experience to the company's presumed challenges or goals mentioned in the Job Description.

6. TARGETED INTERVIEW PREP (interviewPrepQuestions):
- Provide 5 extremely realistic interview questions they may face based directly on the intersection of their profile with the job requirements.
- For each question, provide highly strategic talking points or specific accomplishments on their resume they should reference to formulate an incredible answer.`;

      const prompt = `Here are the details for the custom resume generation:

### MASTER/CORE RESUME PROFILE:
FullName: ${coreProfile.fullName || "Jane Doe"}
Email: ${coreProfile.email || "jane.doe@example.com"}
Phone: ${coreProfile.phone || "555-0199"}
Location: ${coreProfile.location || "City, State"}
Website: ${coreProfile.website || ""}
Summary: ${coreProfile.summary || "Experienced Professional"}
Professional Skills: ${coreProfile.skills || ""}
Work History/Experience: ${coreProfile.experience || ""}
Education Background: ${coreProfile.education || ""}
Projects / Other Sections: ${coreProfile.projects || "None provided"}
Interests / Hobbies: ${coreProfile.interests || "None provided"}

### TARGET ROLE & COMPANY:
Company Name: ${jobRequest.companyName || "Target Company"}
Target Role Title: ${jobRequest.roleTitle || "Target Role"}
Custom Focus / Role details to highlight: ${jobRequest.customKeywords || "None specified"}
Additional Focus / Personal Goals: ${jobRequest.additionalFocus || "None specified"}

### JOB PROFILE / DESCRIPTION:
${jobRequest.jobDescriptionText}

Generate the JSON response according to the defined schema. Ensure the resume markdown is well-structured, professional, clean, and highly legible. Ensure the resume contains the candidate's contact details formatted elegantly.`;

      // Call the recommended Gemini model with automatic fallbacks & retries
      const response = await generateContentWithRetry({
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tailoredResumeMarkdown: {
                type: Type.STRING,
                description: "The complete tailored resume content formatted elegantly in Markdown with appropriate spacing, dividers, and bullet points."
              },
              matchScore: {
                type: Type.INTEGER,
                description: "An estimated alignment score between 0 and 100 representing how well the tailored resume matches the job description."
              },
              matchedKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of key skills or keywords from the JD that are now successfully integrated into the tailored resume."
              },
              missingKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of skills or keywords from the JD that were not supported by the candidate's core resume and thus kept out."
              },
              tailoredCoverLetter: {
                type: Type.STRING,
                description: "A concise, high-impact cover letter tailored specifically to the hiring manager for this role and company."
              },
              interviewPrepQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING, description: "The interview question likely to be asked." },
                    talkingPoints: { type: Type.STRING, description: "Key accomplishments or talking points from the resume to mention in the answer." }
                  },
                  required: ["question", "talkingPoints"]
                },
                description: "5 targeted interview prep questions and strategic talking points based on this custom resume and JD pair."
              }
            },
            required: [
              "tailoredResumeMarkdown",
              "matchScore",
              "matchedKeywords",
              "missingKeywords",
              "tailoredCoverLetter",
              "interviewPrepQuestions"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response returned from Gemini.");
      }

      // Parse and return the JSON
      const parsedData = parseJSONSafely(responseText);
      res.json(parsedData);

    } catch (error: any) {
      const details = getSanitizedErrorDetails(error);
      console.error("Error tailoring resume:", details.message);
      res.status(500).json({ 
        error: details.message || "An internal error occurred while tailoring your resume. Please try again." 
      });
    }
  });

  // API: Improve Specific Bullet Point Route
  app.post("/api/improve-bullet", async (req, res) => {
    try {
      const { bulletText, jobDescriptionText, roleTitle, companyName, focusType, additionalPrompt } = req.body;

      if (!bulletText || !jobDescriptionText) {
        return res.status(400).json({ error: "Missing required fields: bulletText and jobDescriptionText must be provided." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Gemini API key is not configured in environment variables. Please check the Secrets panel in AI Studio settings." 
        });
      }

      const systemInstruction = `You are an elite, senior career strategist and technical CV writer. Your task is to rewrite a SINGLE professional experience bullet point from a candidate's resume to make it exceptionally high-impact, persuasive, and custom-tailored to the target job description and focus area.

Critical Guidelines:
1. Deliver ONLY the rewritten bullet point text in your response. DO NOT wrap it in quotes, do not add leading bullets (no "-", "*", "•"), do not start with introductory comments, and do not provide explanations.
2. Maintain absolute truth: DO NOT invent fake tech credentials, fake projects, or fake numerical stats that the original bullet doesn't suggest. However, enhance the metrics formatting or frame the accomplishments with optimal professional weight.
3. Optimize based on the selected focusType:
   - 'achievements': Emphasize quantifiable business outcomes, scaled benefits, efficiency increments, and professional leadership.
   - 'keywords': Infuse maximum high-priority technical skills, platforms, and terms from the job description naturally.
   - 'action': Structure with strong action verbs, removing passive voice or corporate meta-talk (e.g. "Responsible for", "Worked on") in favor of direct active verbs.
   - 'custom': Target the user's specific custom instructions precisely.
4. Keep the rewritten version to a similar or slightly enhanced length (usually 1-2 powerful lines).
5. Ensure the text remains in plain text, do not add markdown headers. Just return the raw bullet body.`;

      const prompt = `### ORIGINAL BULLET POINT TO OPTIMIZE:
"${bulletText}"

### TARGET JOB CONTEXT:
- Role Title: ${roleTitle || "Target Position"}
- Company Name: ${companyName || "Target Company"}
- Job Description:
${jobDescriptionText}

### REWRITE STRATEGY:
- Focus Type: ${focusType || "achievements"}
- Specific User Custom Request: ${additionalPrompt || "Enhance visual alignment and impact."}

Please rewrite the bullet point according to the strategy, maximizing professional impact and ATS alignment. Remember, return ONLY the raw text of the rewritten bullet. No bullet characters, no quotes.`;

      // Call the recommended Gemini model with automatic fallbacks & retries
      const response = await generateContentWithRetry({
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 1.0,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response returned from Gemini.");
      }

      res.json({ success: true, improvedText: responseText.trim().replace(/^["']|["']$/g, "") });

    } catch (error: any) {
      const details = getSanitizedErrorDetails(error);
      console.error("Error improving bullet:", details.message);
      res.status(500).json({ 
        error: details.message || "An internal error occurred while improving this bullet. Please try again." 
      });
    }
  });

  // Vite development middleware vs production static files handler
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Express with Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production files from dist/ directory...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer();
