# MoAI Hub — Willy's Multimodal AI Assistant

MoAI Hub is my project exploring the world of **AI orchestration** using **n8n**, **Docker**, and **Ollama**.

It features a custom-built web interface that can chat, route requests through an n8n workflow, and analyze images using local AI models running on my own Apple Silicon hardware.

---

## How It Works

1. **Frontend:** A custom HTML/CSS/JavaScript interface with a cinematic intro, chat UI, image upload support, prompt chips, typing indicators, saved conversations, and an admin/status page.

2. **Local Server:** A Node.js server connects the frontend to n8n, manages saved conversations, handles file context, and keeps private settings out of the browser.

3. **Backend Workflow:** An n8n workflow acts as the traffic controller for incoming requests.

4. **Routing Logic:** The system can route requests based on the selected mode and input type.
   - **Fast mode:** Optimized for quicker everyday responses.
   - **Deep mode:** Used for more thoughtful answers.
   - **Image mode:** Sends image-based prompts to a vision-capable local model.

5. **Local AI Models:** Models run locally through Ollama on an Apple M3 Mac with 16GB unified memory.

6. **Admin Page:** A local status page checks whether MoAI, n8n, and Ollama are online.

---

## Requirements for Local Demo

Because this project runs locally instead of on a 24/7 cloud server, the following must be running for the AI to respond:

- **MoAI Server:** The local Node.js server must be running.
- **n8n:** Docker and the published n8n workflow must be active.
- **Ollama:** Ollama must be running with the required local models installed.
- **Browser:** Open the app at `http://localhost:3000`.

If you get a connection error, one of the local services is probably offline.

---

## Key Features

- **Cinematic Intro** — Animated intro screen with logo reveal and title transition.
- **Launcher Screen** — Entry screen for opening the assistant experience.
- **Multimodal Chat** — Supports both normal text chat and image-based prompts.
- **Image Upload** — Attach images directly in the chat.
- **Mode Buttons** — Switch between Fast, Deep, and Image modes.
- **Saved Conversations** — Sidebar for returning to previous chats.
- **Prompt Chips** — Quick-start suggestion buttons on the welcome screen.
- **Thinking States** — Shows what the assistant is doing while processing.
- **Streaming-Style Responses** — Responses appear in a smoother, more active way.
- **Timestamps** — Messages show when they were sent.
- **Markdown Rendering** — AI responses support bold text, lists, and code blocks.
- **File Uploads** — Supports text-based files like TXT, MD, CSV, and JSON.
- **Admin/Status Page** — Shows whether MoAI, n8n, and Ollama are online.
- **Mobile Responsive** — Layout adapts for phones and tablets.
- **Smooth Animations** — Polished transitions throughout the interface.

---

## Tools Used

| Tool | Purpose |
|---|---|
| **n8n** | AI orchestration, webhook handling, and conditional routing |
| **Ollama** | Running local AI models |
| **Docker** | Running the local n8n environment |
| **Node.js** | Local server between the frontend and n8n |
| **HTML/CSS/JavaScript** | Custom frontend interface |
| **marked.js** | Markdown rendering for AI responses |
| **Claude** | Used during development for planning, debugging, and code review |
| **Gemini** | Used during development for research and model comparison |
| **Codex** | Used during development for implementation, cleanup, and debugging |

---

## Reflections & Evolution

This project started as a simple AI chatbot and slowly turned into a local multimodal AI hub.

Some of the biggest things I learned were:

- **AI Orchestration:** Using n8n to connect different parts of an AI system together.
- **Webhook Architecture:** Understanding test vs production webhooks, HTTP methods, and response nodes.
- **Local AI Models:** Running models locally through Ollama instead of depending only on cloud AI tools.
- **Multimodal Inputs:** Sending both text and images through the same assistant interface.
- **Conditional Routing:** Using n8n logic to send different kinds of requests to different AI paths.
- **Debugging Local Services:** Troubleshooting Node.js, Docker, n8n, Ollama, browser errors, and networking issues.
- **Project Cleanup:** Learning how important folder structure and simple setup instructions are once a project grows.

MoAI Hub became a hands-on way for me to learn how modern AI apps are actually connected behind the scenes.
