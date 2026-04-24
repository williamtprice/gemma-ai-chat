# 🤖 Willy's Gemma 2 AI Chat

This is my very first project exploring the world of **AI Orchestration** using **n8n**, **Docker**, and **Ollama**. It features a custom-built web interface that communicates with a local AI model (Gemma 2) running on my own hardware.

## 🚀 How it Works
1. **Frontend:** A clean, responsive HTML/CSS/JS interface hosted on GitHub Pages.
2. **Backend:** An [n8n](https://n8n.io/) workflow running inside a Docker container on my Mac.
3. **Brain:** [Gemma 2](https://ollama.com/library/gemma2) running locally via Ollama.
4. **Database:** Google Sheets stores the chat history.
5. **Connection:** A Cloudflare Tunnel creates a secure bridge between the public internet and my local machine.

---

## ⚠️ Requirements for Live Demo
Because this project is hosted on my local machine rather than a 24/7 cloud server, the following must be true for the AI to respond:

* **Power:** My Mac must be turned on and awake.
* **The "Bridge":** The Cloudflare Tunnel terminal must be active.
* **The "Engine":** Docker and n8n must be running the published workflow.
* **The "Brain":** Ollama must be active to serve the Gemma 2 model.

*Note: If you get a "Connection Error," it likely means the local server is currently offline!*

---

## 🛠️ Tools Used
* **n8n:** To handle webhooks and logic.
* **Docker:** To keep the environment stable.
* **Ollama:** To run the LLM locally.
* **Cloudflare:** To safely expose the local webhook.
* **Google Sheets API:** For data logging.

---

## 📝 Reflections
This was a huge learning experience in:
- Connecting local hardware to the public web.
- Handling CORS and JSON parsing in JavaScript.
- Managing API webhooks and data flow.
