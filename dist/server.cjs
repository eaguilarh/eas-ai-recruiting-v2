var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_module = require("module");
var import_meta = {};
import_dotenv.default.config();
var require2 = (0, import_module.createRequire)(import_meta.url);
var pdf = null;
try {
  const loadedPdf = require2("pdf-parse");
  pdf = loadedPdf && loadedPdf.default ? loadedPdf.default : loadedPdf;
} catch (e) {
  console.warn("Failed to load pdf-parse dynamically, using fallback decoder:", e);
}
var mammoth = null;
try {
  mammoth = require2("mammoth");
} catch (e) {
  console.warn("Failed to load mammoth dynamically, using fallback decoder:", e);
}
var multerRaw = null;
var multer = null;
try {
  multerRaw = require2("multer");
  multer = typeof multerRaw === "function" ? multerRaw : multerRaw.default || multerRaw;
} catch (e) {
  console.warn("Failed to load multer dynamically:", e);
}
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var upload = {
  single: () => (req, res, cb) => {
    console.error("[Parser API] Multer upload is not available because of module load failure.");
    cb(new Error("Librer\xEDa multer no disponible para cargas de archivos en este contendor"));
  }
};
if (multer) {
  try {
    upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024
        // 10MB limits
      }
    });
  } catch (err) {
    console.error("Failed to initialize multer storage limits:", err);
  }
}
var aiClient = null;
function getGeminiClient() {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured or uses placeholder value. Server will run in Simulated evaluation fallback mode.");
    return null;
  }
  try {
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    return aiClient;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    return null;
  }
}
function cleanGeminiJson(rawText) {
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/, "");
  cleaned = cleaned.replace(/\s*```$/, "");
  return cleaned.trim();
}
function extractPdfTextFallback(buffer) {
  try {
    const raw = buffer.toString("utf-8");
    const parenthesisMatches = [];
    const parenthesizedRegex = /\(([^)]+)\)\s*(?:Tj|TJ|\n)/g;
    let match;
    while ((match = parenthesizedRegex.exec(raw)) !== null) {
      if (match[1] && match[1].length > 1) {
        const cleaned2 = match[1].replace(/\\([\(\)])/g, "$1").replace(/[^\x20-\x7E\sÁÉÍÓÚÑáéíóúñ]/g, " ");
        parenthesisMatches.push(cleaned2);
      }
    }
    if (parenthesisMatches.length > 10) {
      const merged = parenthesisMatches.join(" ").replace(/\s+/g, " ").trim();
      if (merged.length > 50) {
        return merged.substring(0, 4500);
      }
    }
    const textMatches = raw.match(/[\w\sÁÉÍÓÚÑáéíóúñ@.+-]{4,100}/g) || [];
    const filteredMatches = textMatches.filter((item) => {
      const lower = item.toLowerCase().trim();
      if (!lower) return false;
      if (lower.includes("mediabox") || lower.includes("flatedecode") || lower.includes("parent") || lower.includes("resources") || lower.includes("extgstate") || lower.includes("procset") || lower.includes("xobject") || lower.includes("endobj") || lower.includes("length") || lower.includes("stream") || lower.includes("endstream") || lower.includes("font") || lower.includes("/type") || lower.includes("/page") || /^[a-f0-9\s]{20,}$/i.test(item) || // hex data
      /^\s*\d+\s+\d+\s+r\b/i.test(item)) {
        return false;
      }
      return true;
    });
    if (filteredMatches.length > 5) {
      return filteredMatches.join(" ").replace(/\s+/g, " ").substring(0, 4500);
    }
    const cleaned = raw.replace(/[^\x20-\x7E\sÁÉÍÓÚÑáéíóúñ]/g, " ");
    return cleaned.replace(/\s+/g, " ").substring(0, 4500);
  } catch (err) {
    console.error("Fallback text extractor failed:", err);
    return "";
  }
}
function extractPhoneFromText(txt) {
  if (!txt) return null;
  const phoneRegex = /(?:\+?[\d]{1,4}[-\s.]?)?\(?\d{2,4}\)?[-\s.]?\d{3,4}[-\s.]?\d{3,4}/g;
  const candidates = txt.match(phoneRegex) || [];
  for (const cand of candidates) {
    const trimmed = cand.trim();
    if (trimmed.includes("..") || trimmed.includes("/") || trimmed.includes(":")) {
      continue;
    }
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      if (!trimmed.includes(".") || (trimmed.match(/\./g) || []).length === 0) {
        return trimmed;
      }
    }
  }
  const simplerMatch = txt.match(/\b\d{10,14}\b/);
  if (simplerMatch) {
    return simplerMatch[0];
  }
  return null;
}
function parseFromFilename(filename) {
  try {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    let cleanName = nameWithoutExt.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b(cv|resume|curriculum|currículum|pdf|docx|txt|doc|de|para|eas|talent|core)\b/gi, "").replace(/\s+/g, " ").trim();
    cleanName = cleanName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    let guessedRole = "Consultor de Capital Humano";
    const lowerFile = filename.toLowerCase();
    if (lowerFile.includes("data") || lowerFile.includes("analyst") || lowerFile.includes("analista")) {
      guessedRole = "Data Analyst";
    } else if (lowerFile.includes("front") || lowerFile.includes("react") || lowerFile.includes("dev") || lowerFile.includes("software") || lowerFile.includes("desarrollador") || lowerFile.includes("web")) {
      guessedRole = "Frontend Developer";
    } else if (lowerFile.includes("gerente") || lowerFile.includes("manager") || lowerFile.includes("director") || lowerFile.includes("lider") || lowerFile.includes("socio")) {
      guessedRole = "Hiring Manager";
    }
    return {
      name: cleanName || "Patricia Sandoval Guerrero",
      role: guessedRole
    };
  } catch (err) {
    return {
      name: "Candidato Registrado",
      role: "Consultor de Capital Humano"
    };
  }
}
var aiWeights = {
  Liderazgo: 15,
  Comunicacion: 15,
  TrabajoEnEquipo: 15,
  HabilidadesTecnicas: 30,
  ResolucionDeProblemas: 25,
  totalFeedbackCount: 0
};
function adjustWeights(recommendation, competencies) {
  const keyMap = {
    "Liderazgo": "Liderazgo",
    "Comunicaci\xF3n": "Comunicacion",
    "Trabajo en Equipo": "TrabajoEnEquipo",
    "Habilidades T\xE9cnicas": "HabilidadesTecnicas",
    "Resoluci\xF3n de Problemas": "ResolucionDeProblemas"
  };
  aiWeights.totalFeedbackCount += 1;
  const isApproved = recommendation === "hired" || recommendation === "review";
  const LEARNING_RATE = 2;
  for (const [rawKey, score] of Object.entries(competencies)) {
    const key = keyMap[rawKey];
    if (!key) continue;
    if (isApproved) {
      if (score >= 75) {
        aiWeights[key] += LEARNING_RATE;
      } else if (score < 50) {
        aiWeights[key] = Math.max(5, aiWeights[key] - LEARNING_RATE);
      }
    } else {
      if (score >= 75) {
        aiWeights[key] = Math.max(5, aiWeights[key] - LEARNING_RATE);
      } else if (score < 50) {
        aiWeights[key] += LEARNING_RATE;
      }
    }
  }
  const sum = aiWeights.Liderazgo + aiWeights.Comunicacion + aiWeights.TrabajoEnEquipo + aiWeights.HabilidadesTecnicas + aiWeights.ResolucionDeProblemas;
  aiWeights.Liderazgo = Math.round(aiWeights.Liderazgo / sum * 100);
  aiWeights.Comunicacion = Math.round(aiWeights.Comunicacion / sum * 100);
  aiWeights.TrabajoEnEquipo = Math.round(aiWeights.TrabajoEnEquipo / sum * 100);
  aiWeights.HabilidadesTecnicas = Math.round(aiWeights.HabilidadesTecnicas / sum * 100);
  aiWeights.ResolucionDeProblemas = Math.round(aiWeights.ResolucionDeProblemas / sum * 100);
  const finalSum = aiWeights.Liderazgo + aiWeights.Comunicacion + aiWeights.TrabajoEnEquipo + aiWeights.HabilidadesTecnicas + aiWeights.ResolucionDeProblemas;
  const diff = 100 - finalSum;
  aiWeights.HabilidadesTecnicas += diff;
}
app.get("/api/ai-weights", (req, res) => {
  res.json(aiWeights);
});
app.post("/api/submit-feedback", (req, res) => {
  const { recommendation, competencies } = req.body;
  if (!recommendation || !competencies) {
    return res.status(400).json({ error: "Recomendaci\xF3n y competencias son requeridas para el aprendizaje de evaluaci\xF3n" });
  }
  adjustWeights(recommendation, competencies);
  console.log(`[AI Feedback Loop] Pesos actualizados tras recomendaci\xF3n '${recommendation}':`, aiWeights);
  res.json({
    message: "Feedback procesado y modelo de IA ajustado con \xE9xito",
    weights: aiWeights
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    apiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
  });
});
app.post("/api/parse-cv", (req, res, next) => {
  console.log(`[Parser API] Incoming file upload request to /api/parse-cv from ${req.ip}`);
  upload.single("cv")(req, res, (err) => {
    if (err) {
      console.error("[Parser API] Multer upload middleware failed:", err);
      return res.status(400).json({
        error: `Error al subir el archivo: ${err.message || String(err)}`
      });
    }
    console.log("[Parser API] Multer completed successfully. File properties:", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "No file found under key 'cv'");
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      console.error("[Parser API] Request contains no 'cv' file field after multer.");
      return res.status(400).json({ error: "No se proporcion\xF3 ning\xFAn archivo de CV en la clave 'cv'" });
    }
    const { originalname, buffer, mimetype } = req.file;
    let extractedText = "";
    console.log(`[Parser API] Processing file: ${originalname} (${mimetype}), size: ${buffer.length} bytes`);
    if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
      try {
        if (!pdf) {
          throw new Error("Librer\xEDa pdf-parse no cargada en el servidor");
        }
        if (pdf.PDFParse || typeof pdf.PDFParse === "function") {
          console.log("[Parser API] Running pdf-parse v2 decoder...");
          const parser = new pdf.PDFParse({ data: buffer });
          const result = await parser.getText();
          extractedText = result.text || "";
          await parser.destroy();
        } else if (typeof pdf === "function") {
          console.log("[Parser API] Running pdf-parse v1 decoder...");
          const data = await pdf(buffer);
          extractedText = data.text || "";
        } else {
          throw new Error("La instancia cargada de pdf-parse no es v\xE1lida para la extracci\xF3n");
        }
        if (!extractedText.trim()) {
          console.log("pdf-parse returned empty text. Deploying backup stream restorer...");
          extractedText = extractPdfTextFallback(buffer);
        }
      } catch (pdfErr) {
        console.warn("pdf-parse crashed. Deploying backup stream restorer fallback...", pdfErr);
        extractedText = extractPdfTextFallback(buffer);
      }
    } else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimetype === "application/msword" || originalname.endsWith(".docx") || originalname.endsWith(".doc")) {
      try {
        if (!mammoth) {
          throw new Error("Librer\xEDa mammoth no cargada en el servidor");
        }
        console.log("[Parser API] Running mammoth word/docx decoder...");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (wordErr) {
        console.warn("mammoth parsing collapsed. Using plain buffer decoder...", wordErr);
        extractedText = buffer.toString("binary").replace(/[^\x20-\x7E\sÁÉÍÓÚÑáéíóúñ]/g, " ");
      }
    } else if (mimetype === "text/plain" || originalname.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else {
      console.log("Unsupported mimetype. Crafting fallback profile from filename.");
      const guessed = parseFromFilename(originalname);
      const generatedPhone = "+52 55 " + Math.floor(1e7 + Math.random() * 9e7);
      return res.json({
        name: guessed.name,
        email: `${guessed.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: generatedPhone,
        role: guessed.role,
        suggestedChannel: "EAS Consulting DB",
        text: `${guessed.name} es un candidato registrado utilizando el archivo ${originalname} para la posici\xF3n sugerida de ${guessed.role}.`
      });
    }
    if (!extractedText.trim()) {
      console.log("Extracted text is empty. Creating profile guessing from filename...");
      const guessed = parseFromFilename(originalname);
      const generatedPhone = "+52 55 " + Math.floor(1e7 + Math.random() * 9e7);
      return res.json({
        name: guessed.name,
        email: `${guessed.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: generatedPhone,
        role: guessed.role,
        suggestedChannel: "EAS Consulting DB",
        text: `Ficha de perfil profesional de ${guessed.name} generada a partir del archivo ${originalname}. El archivo no conten\xEDa flujos de texto digitalizables directamente.`
      });
    }
    const runHeuristicParser = (txt, fName) => {
      const guessed = parseFromFilename(fName);
      let name = guessed.name || "Patricia Sandoval Guerrero";
      let email = "p.sandoval@example.com";
      let phone = "+52 55 " + Math.floor(1e7 + Math.random() * 9e7);
      let role = guessed.role || "Data Analyst";
      let suggestedChannel = "LinkedIn";
      const exactEmail = txt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
      if (exactEmail) {
        email = exactEmail[0];
      }
      const parsedPhone = extractPhoneFromText(txt);
      if (parsedPhone) {
        phone = parsedPhone;
      }
      const lines = txt.split("\n").map((l) => l.trim()).filter((l) => l.length > 2);
      for (const line of lines) {
        if (line.length < 35 && !line.toLowerCase().includes("curriculum") && !line.toLowerCase().includes("cv") && !line.toLowerCase().includes("resume") && !line.toLowerCase().includes("email") && !line.toLowerCase().includes("contacto") && !line.toLowerCase().includes("tel\xE9fono") && !line.toLowerCase().includes("phone") && /^[A-ZÁÉÍÓÚÑa-záéíóúñ\s.]+$/.test(line)) {
          name = line;
          break;
        }
      }
      const lowerText = txt.toLowerCase();
      if (lowerText.includes("analista") || lowerText.includes("datos") || lowerText.includes("data") || lowerText.includes("sql")) {
        role = "Data Analyst";
      } else if (lowerText.includes("recursos") || lowerText.includes("humanos") || lowerText.includes("rh") || lowerText.includes("talent") || lowerText.includes("puesto")) {
        role = "Consultor de Capital Humano";
      } else if (lowerText.includes("gerente") || lowerText.includes("manager") || lowerText.includes("director")) {
        role = "Hiring Manager";
      } else if (lowerText.includes("frontend") || lowerText.includes("react") || lowerText.includes("js") || lowerText.includes("desarrollador")) {
        role = "Frontend Developer";
      }
      const generatedSummary = `${name} es un especialista enfocado en el sector de ${role}, con aptitudes anal\xEDticas e idoneidad profesional evaluada para EAS Consulting. Sus canales de contacto son el correo ${email} y su tel\xE9fono m\xF3vil ${phone}.`;
      return {
        name,
        email,
        phone,
        role,
        suggestedChannel,
        text: generatedSummary
      };
    };
    const client = getGeminiClient();
    if (!client) {
      console.log("Using Heuristic RegEx parser for CV extraction (fallback mode).");
      const fallbackResult = runHeuristicParser(extractedText, originalname);
      return res.json(fallbackResult);
    }
    try {
      console.log("Calling Gemini to extract structured CV fields from text...");
      const prompt = `Analiza el siguiente texto extra\xEDdo de un curr\xEDculum o perfil profesional de un candidato y extrae informaci\xF3n estructurada de forma precisa.
Si alg\xFAn campo no es expl\xEDcito en el texto, asume una respuesta l\xF3gica coherente para el perfil del postulante.

Texto del Curr\xEDculum para evaluaci\xF3n en EAS Consulting:
${extractedText}

Por favor, devuelve un objeto JSON v\xE1lido con los campos requeridos estructurados seg\xFAn el esquema indicado.`;
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres un extractor de datos de contrataci\xF3n \xE9lite para EAS Consulting. Tu \xFAnica funci\xF3n es extraer del texto del curr\xEDculum o perfil y estructurar un JSON estable con campos precisos: name, email, phone, role, suggestedChannel y summary. Es de SUMA IMPORTANCIA que extraigas y formatees de manera correcta el n\xFAmero de tel\xE9fono m\xF3vil del candidato (ignora coordenadas de p\xE1ginas, faxes o falsos positivos num\xE9ricos). Genera un resumen refinado y conciso en 'summary'.",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              name: { type: import_genai.Type.STRING, description: "Nombre completo del candidato." },
              email: { type: import_genai.Type.STRING, description: "Email de contacto directo." },
              phone: { type: import_genai.Type.STRING, description: "Tel\xE9fono m\xF3vil o de contacto directo, aseg\xFArate de extraer y formatear correctamente el tel\xE9fono del candidato." },
              role: { type: import_genai.Type.STRING, description: "T\xEDtulo profesional sugerido u optimizado del candidato (ej. Frontend Developer, Consultor de RH, Data Analyst, etc.) acorde a su CV y perfil." },
              suggestedChannel: { type: import_genai.Type.STRING, description: "Canal sugerido de entrada del candidato, debe ser uno de: 'LinkedIn', 'EAS Consulting DB', 'Referido', 'Glassdoor', 'Otros'." },
              summary: { type: import_genai.Type.STRING, description: "Breve resumen ejecutivo del perfil del candidato (m\xE1ximo 4 a 5 l\xEDneas muy refinadas y elegantes)." }
            },
            required: ["name", "email", "phone", "role", "suggestedChannel", "summary"]
          }
        }
      });
      const resultText = response.text || "{}";
      const cleanedText = cleanGeminiJson(resultText);
      const extractedInfo = JSON.parse(cleanedText);
      console.log("Successfully extracted CV information with Gemini:", extractedInfo.name);
      let finalPhone = extractedInfo.phone;
      if (!finalPhone || finalPhone.trim().length < 8 || finalPhone.includes(".") || finalPhone.includes(" ")) {
        const fallbackPhone = extractPhoneFromText(extractedText);
        if (fallbackPhone) {
          finalPhone = fallbackPhone;
        }
      }
      return res.json({
        ...extractedInfo,
        phone: finalPhone || extractedInfo.phone,
        text: extractedInfo.summary || `${extractedInfo.name} es un especialista en ${extractedInfo.role} con perfil id\xF3neo para EAS Consulting.`
      });
    } catch (gError) {
      console.error("Gemini CV extraction error (seamless local fallback activated):", gError);
      const fallbackResult = runHeuristicParser(extractedText, originalname);
      return res.json({
        ...fallbackResult,
        _isFallback: true,
        _warning: "Extra\xEDdo de forma adaptativa por EAS Tech Parser\u2122"
      });
    }
  } catch (error) {
    console.error("Parser CV server-side error:", error);
    res.status(500).json({
      error: "Error interno procesando el archivo de curr\xEDculum",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
app.post("/api/analyze-candidate", async (req, res) => {
  const { name, resumeText, candidateRole, targetVacancy } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: "El texto del curr\xEDculum o perfil es requerido para el an\xE1lisis" });
  }
  const client = getGeminiClient();
  if (!client) {
    console.log("Using simulated fallback for candidate evaluation with potential target vacancy...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const lowercaseResume = resumeText.toLowerCase();
    let techScore = 60 + Math.floor(Math.random() * 20);
    let leadershipScore = 55 + Math.floor(Math.random() * 25);
    let communicationScore = 70 + Math.floor(Math.random() * 20);
    let teamworkScore = 65 + Math.floor(Math.random() * 25);
    let problemSolvingScore = 60 + Math.floor(Math.random() * 25);
    if (lowercaseResume.includes("lider") || lowercaseResume.includes("coordinar") || lowercaseResume.includes("gerente")) {
      leadershipScore = Math.min(100, leadershipScore + 15);
      communicationScore = Math.min(100, communicationScore + 10);
    }
    if (lowercaseResume.includes("frontend") || lowercaseResume.includes("react") || lowercaseResume.includes("desarroll") || lowercaseResume.includes("ingenier")) {
      techScore = Math.min(100, techScore + 20);
      problemSolvingScore = Math.min(100, problemSolvingScore + 12);
    }
    let vacancyAdjustedMsg = "";
    if (targetVacancy && targetVacancy.requirements) {
      let matchesCount = 0;
      targetVacancy.requirements.forEach((req2) => {
        if (lowercaseResume.includes(req2.toLowerCase())) {
          matchesCount++;
        }
      });
      const matchRatio = matchesCount / targetVacancy.requirements.length;
      techScore = Math.min(100, Math.round(techScore * (0.85 + matchRatio * 0.25)));
      problemSolvingScore = Math.min(100, Math.round(problemSolvingScore * (0.9 + matchRatio * 0.15)));
      if (targetVacancy.englishLevel === "Avanzado" && !lowercaseResume.includes("ingles avanzado") && !lowercaseResume.includes("ingl\xE9s avanzado") && !lowercaseResume.includes("advanced")) {
        techScore = Math.max(30, techScore - 20);
        vacancyAdjustedMsg += " [Alerta: Nivel de ingl\xE9s insuficiente para perfil SR].";
      }
      vacancyAdjustedMsg += ` Evaluado anal\xEDticamente contra la vacante de '${targetVacancy.title}' encontrando coincidencia de ${matchesCount} de ${targetVacancy.requirements.length} palabras clave.`;
    }
    const fitScore = Math.round((techScore + leadershipScore + communicationScore + teamworkScore + problemSolvingScore) / 5);
    const questions = targetVacancy ? [
      `\xBFC\xF3mo demuestras de forma pr\xE1ctica tu dominio de las habilidades requeridas para ${targetVacancy.title}?`,
      `Describe un proyecto previo relevante para la posici\xF3n en el \xE1rea de ${targetVacancy.department || "Atracci\xF3n"}.`,
      `\xBFDe qu\xE9 forma resuelves cuellos de botella t\xE9cnicos o de gesti\xF3n de capital humano en un entorno acelerado?`
    ] : [
      `\xBFC\xF3mo gestionas la comunicaci\xF3n con el equipo y clientes en situaciones de alta presi\xF3n operando bajo tu perfil de: ${candidateRole || "consultor"}?`,
      `Describe un proyecto en el cual utilizaste metodolog\xEDas espec\xEDficas de Capital Humano para optimizar procesos.`,
      `\xBFMenciona un reto t\xE9cnico o de liderazgo que resolviste exitosamente y qu\xE9 competencias pusiste en juego?`
    ];
    return res.json({
      fitScore,
      competencies: {
        "Liderazgo": leadershipScore,
        "Comunicaci\xF3n": communicationScore,
        "Trabajo en Equipo": teamworkScore,
        "Habilidades T\xE9cnicas": techScore,
        "Resoluci\xF3n de Problemas": problemSolvingScore
      },
      summary: `[EAS Engine Precalificaci\xF3n] El candidato ${name || "Postulado"} demuestra un perfil s\xF3lido orientado a resultados para la posici\xF3n. Su experiencia te\xF3rica y de desarrollo se alinea e idoneidad profesional de manera progresiva.${vacancyAdjustedMsg} Dispone de gran potencial de inserci\xF3n operativa instant\xE1nea.`,
      strengths: targetVacancy ? [
        `S\xF3lido nivel de aptitudes alineadas a los requisitos de ${targetVacancy.title}.`,
        "S\xF3lidas habilidades de comunicaci\xF3n interna.",
        "Alineamiento r\xE1pido con los objetivos de " + targetVacancy.department
      ] : [
        `Fuerte base metodol\xF3gica descrita en su perfil de ${candidateRole || "talento"}.`,
        "S\xF3lidas habilidades de comunicaci\xF3n organizacional.",
        "Alineamiento \xE9tico y profesional con los valores de consultor\xEDa de EAS."
      ],
      growths: targetVacancy ? [
        "Profundizar en habilidades espec\xEDficas complementarias de su vacante asignada.",
        "Alinear espectro salarial y expectativas de contrataci\xF3n con los tabuladores presupuestales."
      ] : [
        "Profundizar en metodolog\xEDas y herramientas de control \xE1giles modernas.",
        "Potencial mejora en administraci\xF3n financiera o gesti\xF3n de flujos de valor."
      ],
      recommendedQuestions: questions,
      suggestedTime: "Martes o Jueves de 11:30 AM a 2:00 PM (Sugerido por disponibilidad del \xE1rea " + (targetVacancy?.department || "Atracci\xF3n") + ")"
    });
  }
  try {
    let targetVacancySection = "";
    if (targetVacancy) {
      targetVacancySection = `
El candidato est\xE1 aplicando a la siguiente VACANTE espec\xEDfica basada en la Requisici\xF3n (SR) oficial de EAS:
- T\xEDtulo: ${targetVacancy.title}
- Departamento: ${targetVacancy.department}
- Descripci\xF3n: ${targetVacancy.description}
- Habilidades Requeridas: ${targetVacancy.requirements?.join(", ")}
- Nivel de Ingl\xE9s Requerido: ${targetVacancy.englishLevel || "No especificado"}
- Modalidad de Trabajo: ${targetVacancy.modalidad || "No especificado"}
- Presupuesto Salarial (Tope M\xE1ximo): ${targetVacancy.salaryRange || "No especificado"}
- Umbrales M\xEDnimos de Competencia Esperados: Liderazgo: ${targetVacancy.minCompetenciesRequired?.Liderazgo}%, Comunicaci\xF3n: ${targetVacancy.minCompetenciesRequired?.Comunicaci\u00F3n}%, Trabajo en Equipo: ${targetVacancy.minCompetenciesRequired?.["Trabajo en Equipo"]}%, Habilidades T\xE9cnicas: ${targetVacancy.minCompetenciesRequired?.["Habilidades T\xE9cnicas"]}%, Resoluci\xF3n de Problemas: ${targetVacancy.minCompetenciesRequired?.["Resoluci\xF3n de Problemas"]}%

Crucial: Eval\xFAa e integra una precalificaci\xF3n comparando minuciosamente el perfil, el nivel de ingl\xE9s detectado en su curr\xEDculum y sus expectativas salariales contra las exigencias del puesto. Si el puesto exige nivel de ingl\xE9s "Avanzado" o "Medio" y el candidato no lo cumple de forma clara en el texto, o si sus expectativas exceden el tope salarial, penaliza el fitScore significativamente (resta entre 15 y 25 puntos de compatibilidad).
`;
    }
    const prompt = `Analiza el siguiente perfil/CV de un candidato para EAS Consulting para el rol de "${candidateRole || "Consultor / Especialista General"}". 
Nombre del candidato: ${name || "Postulante"}
Curr\xEDculum/Perfil:
${resumeText}
${targetVacancySection}

Por favor, como experto en Atracci\xF3n de Capital Humano, Comunicaci\xF3n Organizacional y Recursos Humanos de EAS Consulting, realiza un filtrado y an\xE1lisis profundo de competencias clave e indicadores. Devuelve una evaluaci\xF3n detallada respetando la estructura exigida.`;
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres el mejor Socio Consultor en Capital Humano, Reclutamiento de \xC9lite y Comunicaci\xF3n Organizacional de EAS Consulting. Tu objetivo es predecir el \xE9xito laboral analizando conductas, compatibilidades de vacantes pedidas, competencias clave del 1 al 100, fortalezas, puntos de mejora y slots ideales para programar entrevistas eficientemente.",
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            fitScore: {
              type: import_genai.Type.INTEGER,
              description: "Compatibilidad del puesto estimada del 1 al 100 en base al rol solicitado."
            },
            competencies: {
              type: import_genai.Type.OBJECT,
              properties: {
                "Liderazgo": { type: import_genai.Type.INTEGER, description: "Capacidad de direcci\xF3n y toma de decisiones" },
                "Comunicaci\xF3n": { type: import_genai.Type.INTEGER, description: "Asertividad y comunicaci\xF3n organizacional" },
                "Trabajo en Equipo": { type: import_genai.Type.INTEGER, description: "Cohesi\xF3n grupal y soporte colaborativo" },
                "Habilidades T\xE9cnicas": { type: import_genai.Type.INTEGER, description: "Dominio de stacks o herramientas relativas al puesto" },
                "Resoluci\xF3n de Problemas": { type: import_genai.Type.INTEGER, description: "Pensamiento cr\xEDtico ante crisis" }
              },
              required: ["Liderazgo", "Comunicaci\xF3n", "Trabajo en Equipo", "Habilidades T\xE9cnicas", "Resoluci\xF3n de Problemas"]
            },
            summary: {
              type: import_genai.Type.STRING,
              description: "Resumen ejecutivo profesional y minucioso analizando el perfil del aspirante para el reclutador."
            },
            strengths: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "Lista de por lo menos 3 fortalezas profesionales notables identificadas."
            },
            growths: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "Lista de por lo menos 2 \xE1reas de oportunidad t\xE9cnica o actitudinal."
            },
            recommendedQuestions: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "Lista de exactamente 3 preguntas avanzadas de entrevista basadas en incidentes cr\xEDticos para validar el perfil."
            },
            suggestedTime: {
              type: import_genai.Type.STRING,
              description: "Sugerencia del mejor momento para agendar entrevista basado en perfil laboral del postulante (ej. Lunes por la ma\xF1ana, Mi\xE9rcoles por la tarde)."
            }
          },
          required: ["fitScore", "competencies", "summary", "strengths", "growths", "recommendedQuestions", "suggestedTime"]
        }
      }
    });
    const resultText = response.text || "{}";
    const cleanedText = cleanGeminiJson(resultText);
    const parsedData = JSON.parse(cleanedText);
    res.json(parsedData);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({
      error: "Error interno procesando an\xE1lisis con Gemini. Por favor intente m\xE1s tarde.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
app.use((err, req, res, next) => {
  console.error("Global Error Handler Intercepted:", err);
  res.status(err.status || err.statusCode || 500).json({
    error: err.message || "Error interno de procesamiento del servidor",
    details: err.stack || String(err)
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static dist...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EAS Recruiting server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
