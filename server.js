const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const CONVERSATIONS_FILE = path.join(DATA_DIR, "conversations.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT || 3000);
const CHAT_URL = process.env.N8N_CHAT_URL;
const SUBMISSION_URL = process.env.N8N_SUBMISSION_URL;
const INTERNAL_API_KEY = process.env.N8N_INTERNAL_API_KEY;
const N8N_BASE_URL = new URL(CHAT_URL || "http://127.0.0.1:5678").origin;
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const MAX_FILE_BYTES = 6 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 24_000;
const CHAT_MODES = {
  fast: {
    label: "Fast",
    instruction: "Use a concise, direct style. Prioritize speed, simple wording, and practical answers.",
  },
  deep: {
    label: "Deep",
    instruction: "Reason carefully before answering. Provide a more complete answer with useful structure, tradeoffs, and assumptions.",
  },
  image: {
    label: "Image",
    instruction: "Prioritize visual analysis. Be concrete about visible details and clearly separate observation from inference.",
  },
};

if (!CHAT_URL || !SUBMISSION_URL || !INTERNAL_API_KEY) {
  console.error("Missing required environment variables. Check .env against .env.example.");
  process.exit(1);
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(payload));
}

function readConversations() {
  if (!fs.existsSync(CONVERSATIONS_FILE)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(CONVERSATIONS_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeConversations(conversations) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2));
}

function conversationSummary(conversation) {
  return {
    id: conversation.id,
    title: conversation.title || "Untitled chat",
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messageCount: Array.isArray(conversation.messages) ? conversation.messages.length : 0,
  };
}

function normalizeMode(mode, hasImage) {
  if (hasImage) return "image";
  return Object.hasOwn(CHAT_MODES, mode) ? mode : "fast";
}

function buildChatPayload({ message, image, hasImage, mode, attachments }) {
  const selectedMode = normalizeMode(mode, Boolean(hasImage && image));
  const modeInfo = CHAT_MODES[selectedMode];
  const trimmedMessage = String(message || "").trim();
  const attachmentBlocks = Array.isArray(attachments)
    ? attachments
        .filter((attachment) => attachment && typeof attachment.text === "string" && attachment.text.trim())
        .slice(0, 4)
        .map((attachment) => {
          const name = typeof attachment.name === "string" ? attachment.name.slice(0, 120) : "Attached file";
          const text = attachment.text.slice(0, MAX_EXTRACTED_CHARS);
          return `File: ${name}\n${text}`;
        })
    : [];

  const sections = [
    `[MoAI mode: ${modeInfo.label}]\n${modeInfo.instruction}`,
    attachmentBlocks.length
      ? `The user attached the following file text. Use it as context when relevant:\n\n${attachmentBlocks.join("\n\n---\n\n")}`
      : "",
    `User request:\n${trimmedMessage || (hasImage ? "Please analyze the attached image." : "Please respond to the attached file.")}`,
  ].filter(Boolean);

  return {
    message: sections.join("\n\n"),
    image,
    hasImage: Boolean(hasImage && image),
    mode: selectedMode,
    attachments: attachmentBlocks.map((block) => block.slice(0, 500)),
  };
}

async function extractFileText({ name, type, data }) {
  if (typeof name !== "string" || typeof data !== "string") {
    const err = new Error("File name and data are required.");
    err.status = 400;
    throw err;
  }

  const buffer = Buffer.from(data, "base64");
  if (buffer.length > MAX_FILE_BYTES) {
    const err = new Error("File is too large. Please use a file under 6 MB.");
    err.status = 413;
    throw err;
  }

  const lowerName = name.toLowerCase();
  const fileType = String(type || "").toLowerCase();
  let text = "";

  if (
    fileType.startsWith("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".csv") ||
    lowerName.endsWith(".json")
  ) {
    text = buffer.toString("utf8");
  } else {
    const err = new Error("Unsupported file type. Please upload TXT, MD, CSV, or JSON.");
    err.status = 400;
    throw err;
  }

  text = text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (!text) {
    const err = new Error("Could not extract readable text from that file.");
    err.status = 400;
    throw err;
  }

  return {
    name: name.slice(0, 120),
    type: type || "application/octet-stream",
    size: buffer.length,
    text: text.slice(0, MAX_EXTRACTED_CHARS),
    truncated: text.length > MAX_EXTRACTED_CHARS,
  };
}

async function checkService(name, url, options = {}) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 2500);

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
    });

    return {
      name,
      ok: options.acceptStatuses ? options.acceptStatuses.includes(response.status) : response.ok,
      status: response.status,
      latencyMs: Date.now() - startedAt,
      url,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      status: null,
      latencyMs: Date.now() - startedAt,
      url,
      error: error.name === "AbortError" ? "Timed out" : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function sendStreamEvent(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

async function streamText(res, text) {
  const chunks = String(text || "").match(/\S+\s*/g) || [""];
  for (const chunk of chunks) {
    sendStreamEvent(res, "chunk", { text: chunk });
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => sendJson(res, 404, { error: "File not found." }));
  res.writeHead(200, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
  });
  stream.pipe(res);
}

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 8 * 1024 * 1024) {
      const err = new Error("Request body is too large.");
      err.status = 413;
      throw err;
    }
  }

  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch {
    const err = new Error("Invalid JSON body.");
    err.status = 400;
    throw err;
  }
}

async function forwardJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": INTERNAL_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : { output: await response.text() };

  if (!response.ok) {
    const message = data.error || data.output || data.text || `Upstream request failed (${response.status}).`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

function normalizeMoaiResponse(data) {
  if (!data || typeof data !== "object") return data;
  if (typeof data.output !== "string") return data;

  const trimmed = data.output.trim();
  if (!(trimmed.startsWith("{") && trimmed.endsWith("}"))) return data;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      return { ...data, ...parsed };
    }
  } catch {
    return data;
  }

  return data;
}

function resolveStaticPath(urlPath) {
  const requestPath = urlPath === "/" ? "/index.html" : urlPath === "/admin" ? "/admin.html" : urlPath;
  const cleanPath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  return path.join(PUBLIC_DIR, cleanPath);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/status") {
      const checkedAt = new Date().toISOString();
      const [n8n, ollama] = await Promise.all([
        checkService("n8n", `${N8N_BASE_URL}/`, {
          timeoutMs: 2500,
          acceptStatuses: [200],
        }),
        checkService("ollama", `${OLLAMA_BASE_URL}/api/tags`, { timeoutMs: 2500 }),
      ]);

      return sendJson(res, 200, {
        checkedAt,
        services: [
          {
            name: "MoAI Server",
            ok: true,
            status: 200,
            latencyMs: 0,
            url: `http://localhost:${PORT}`,
          },
          n8n,
          ollama,
        ],
      });
    }

    if (req.method === "GET" && url.pathname === "/api/conversations") {
      const conversations = readConversations()
        .map(conversationSummary)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return sendJson(res, 200, { conversations });
    }

    if (req.method === "POST" && url.pathname === "/api/conversations") {
      const { title = "New chat" } = await readJsonBody(req);
      const now = new Date().toISOString();
      const conversation = {
        id: crypto.randomUUID(),
        title: typeof title === "string" && title.trim() ? title.trim().slice(0, 80) : "New chat",
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      const conversations = readConversations();
      conversations.push(conversation);
      writeConversations(conversations);
      return sendJson(res, 201, { conversation });
    }

    if (url.pathname.startsWith("/api/conversations/")) {
      const id = decodeURIComponent(url.pathname.split("/").pop() || "");
      const conversations = readConversations();
      const index = conversations.findIndex((conversation) => conversation.id === id);

      if (index === -1) return sendJson(res, 404, { error: "Conversation not found." });

      if (req.method === "GET") {
        return sendJson(res, 200, { conversation: conversations[index] });
      }

      if (req.method === "PATCH") {
        const { title, messages } = await readJsonBody(req);
        if (typeof title === "string" && title.trim()) {
          conversations[index].title = title.trim().slice(0, 80);
        }
        if (Array.isArray(messages)) {
          conversations[index].messages = messages.slice(-100);
        }
        conversations[index].updatedAt = new Date().toISOString();
        writeConversations(conversations);
        return sendJson(res, 200, { conversation: conversations[index] });
      }

      if (req.method === "DELETE") {
        const [removed] = conversations.splice(index, 1);
        writeConversations(conversations);
        return sendJson(res, 200, { conversation: conversationSummary(removed) });
      }
    }

    if (req.method === "POST" && url.pathname === "/api/files/extract") {
      const file = await readJsonBody(req);
      const extracted = await extractFileText(file);
      return sendJson(res, 200, { file: extracted });
    }

    if (req.method === "POST" && url.pathname === "/api/chat-stream") {
      const { message = "", image = null, hasImage = false, mode = "fast", attachments = [] } = await readJsonBody(req);

      if (typeof message !== "string") return sendJson(res, 400, { error: "Message must be a string." });
      if (!message.trim() && !image && !attachments.length) return sendJson(res, 400, { error: "Message, image, or file is required." });
      if (image && typeof image !== "string") return sendJson(res, 400, { error: "Image payload must be a base64 string." });
      if (image && image.length > 7_000_000) return sendJson(res, 413, { error: "Image is too large." });
      if (!Array.isArray(attachments)) return sendJson(res, 400, { error: "Attachments must be an array." });

      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Content-Type-Options": "nosniff",
      });

      try {
        sendStreamEvent(res, "status", { text: "Preparing response" });
        await new Promise((resolve) => setTimeout(resolve, 250));
        sendStreamEvent(res, "status", { text: image ? "Reviewing image" : attachments.length ? "Reading attached file" : "Understanding request" });
        await new Promise((resolve) => setTimeout(resolve, 250));
        sendStreamEvent(res, "status", { text: "Composing response" });

        const data = normalizeMoaiResponse(await forwardJson(CHAT_URL, buildChatPayload({
          message,
          image,
          hasImage,
          mode,
          attachments,
        })));

        const responseText = data.output || data.text || "Message received.";
        sendStreamEvent(res, "status", { text: "Sending response" });
        await streamText(res, responseText);
        sendStreamEvent(res, "done", { ok: true });
      } catch (error) {
        sendStreamEvent(res, "error", { error: error.message || "Server error." });
      } finally {
        res.end();
      }
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
      const { message = "", image = null, hasImage = false, mode = "fast", attachments = [] } = await readJsonBody(req);

      if (typeof message !== "string") return sendJson(res, 400, { error: "Message must be a string." });
      if (!message.trim() && !image && !attachments.length) return sendJson(res, 400, { error: "Message, image, or file is required." });
      if (image && typeof image !== "string") return sendJson(res, 400, { error: "Image payload must be a base64 string." });
      if (image && image.length > 7_000_000) return sendJson(res, 413, { error: "Image is too large." });
      if (!Array.isArray(attachments)) return sendJson(res, 400, { error: "Attachments must be an array." });

      const data = normalizeMoaiResponse(await forwardJson(CHAT_URL, buildChatPayload({
        message,
        image,
        hasImage,
        mode,
        attachments,
      })));
      return sendJson(res, 200, data);
    }

    if (req.method === "POST" && url.pathname === "/api/submission") {
      const { Name = "", Idea = "" } = await readJsonBody(req);

      if (typeof Name !== "string" || !Name.trim()) return sendJson(res, 400, { error: "Name is required." });
      if (typeof Idea !== "string" || !Idea.trim()) return sendJson(res, 400, { error: "Idea is required." });
      if (Idea.length > 500) return sendJson(res, 400, { error: "Idea must be 500 characters or fewer." });

      const data = await forwardJson(SUBMISSION_URL, {
        Name: Name.trim(),
        Idea: Idea.trim(),
      });
      return sendJson(res, 200, data);
    }

    if (req.method === "GET") {
      const filePath = resolveStaticPath(url.pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return sendFile(res, filePath);
      }
      return sendJson(res, 404, { error: "Not found." });
    }

    return sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message || "Server error." });
  }
});

server.listen(PORT, () => {
  const envPath = path.join(ROOT, ".env");
  const envStatus = fs.existsSync(envPath) ? ".env loaded" : "create .env from .env.example";
  console.log(`MoAI local server running on http://localhost:${PORT} (${envStatus})`);
});
