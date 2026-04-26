# MoAI Hub — Willy's Multimodal AI Assistant
This is my project exploring the world of **AI Orchestration** using **n8n**, **Docker**, and **Ollama**. It features a custom-built web interface — **MoAI Hub** — that can not only chat but also **see and analyze images** using local AI models running on my own Apple Silicon hardware.

---

## How it Works

1. **Frontend:** A modern, cinematic HTML/CSS/JS interface featuring a dramatic intro screen, bubble-style chat, image upload support, prompt chips, typing indicators, and a separate idea submission form.
2. **Backend:** An [n8n](https://n8n.io/) workflow that acts as a traffic controller.
3. **Logic Gate:** The system automatically detects if an image is present.
   - **Text only?** Routes the request to **Qwen 2.5 7b** for intelligent conversation.
   - **Image included?** Routes the request to **LLaVA 7b** via a direct Ollama API call for visual analysis.
4. **Brain:** Both models run locally via Ollama on an Apple M3 Mac with 16GB unified memory.
5. **Submissions:** A dedicated form lets users submit ideas and improvements, which are logged directly to **Google Sheets** via n8n.
6. **Connection:** A Cloudflare Tunnel creates a secure bridge between the public internet and the local machine.

---

## Requirements for Live Demo

Because this project is hosted on a local machine rather than a 24/7 cloud server, the following must be true for the AI to respond:

* **Power:** My Mac must be turned on and awake.
* **The "Bridge":** The Cloudflare Tunnel terminal must be active.
* **The "Engine":** Docker and n8n must be running the published workflow.
* **The "Brains":** Ollama must be serving both Qwen 2.5 7b and LLaVA 7b.

*Note: If you get a "Connection Error," it likely means the local server is currently offline!*

---

## Key Features

- **Cinematic Intro** — Letterbox bars, logo reveal, light sweep, and wipe-in title animation on load.
- **Launcher Screen** — Animated entry screen to choose between the AI chat or the submission form.
- **Multimodal Chat** — Supports both text conversations and image analysis in the same interface.
- **Image Upload** — Attach photos directly in the chat; the system automatically routes to the vision model.
- **Prompt Chips** — Quick-start suggestion buttons on the welcome screen.
- **Typing Indicator** — Animated bouncing dots while the AI is thinking.
- **Timestamps** — Every message shows the time it was sent.
- **Markdown Rendering** — AI responses support bold, lists, and code blocks via marked.js.
- **Idea Submission Form** — Users can submit ideas and improvements which are saved to Google Sheets.
- **Toast Notifications** — Subtle slide-up confirmation after a successful submission.
- **Character Counter** — Live counter on the submission textarea with color warnings.
- **Mobile Responsive** — Fully adapted layout for phones and tablets.
- **Smooth Scroll & Animations** — Polished transitions throughout the UI.

---

## Tools Used

| Tool | Purpose |
|---|---|
| **n8n** | AI orchestration, webhook handling, and conditional routing (If/Else logic) |
| **Ollama** | Running **Qwen 2.5 7b** (text) and **LLaVA 7b** (vision) locally |
| **Docker** | Containerization for the n8n environment |
| **Cloudflare** | Secure tunneling to expose local webhooks to the internet |
| **Google Sheets API** | Logging user idea submissions |
| **Claude (Anthropic)** | AI assistant used during development for code review, debugging, and feature implementation |
| **Gemini (Google)** | Used for research, model comparison, and website construction during development |
| **marked.js** | Markdown parsing for AI response rendering in the frontend |

---

## Reflections & Evolution

This project evolved from a simple text bot into a polished multimodal AI hub. Key learnings include:

- **Binary Data Handling:** Learning how to pass base64-encoded image files from a browser through a webhook into a vision AI model via direct Ollama API calls.
- **Conditional Logic:** Implementing If Nodes in n8n to route requests to the correct AI model based on input type.
- **Webhook Architecture:** Understanding the difference between test and production webhooks, HTTP methods, and the "Respond to Webhook" node pattern in n8n.
- **Multimodal Orchestration:** Coordinating two specialized local models (text + vision) to work as one seamless assistant.
- **Model Selection:** Evaluating local LLMs for the balance between speed and quality on Apple Silicon hardware, ultimately landing on Qwen 2.5 7b and LLaVA 7b.
- **Debugging:** Tracing data flow through n8n execution logs to identify field name mismatches, misconfigured webhook response modes, and Docker networking issues.
