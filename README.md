# 🤖 Willy's Multimodal AI Chat (Gemma 2 + Vision)

This is my project exploring the world of **AI Orchestration** using **n8n**, **Docker**, and **Ollama**. It features a custom-built web interface that can not only chat but also **see and analyze images** using local AI models running on my own hardware.

## 🚀 How it Works
1. **Frontend:** A modern, bubble-style HTML/CSS/JS interface that supports text and file/photo uploads.
2. **Backend:** An [n8n](https://n8n.io/) workflow that acts as a traffic controller.
3. **Logic Gate:** The system automatically detects if an image is present. 
    - **Text only?** It routes the request to **Gemma 2**.
    - **Image included?** It routes the request to **Llava** for visual analysis.
4. **Brain:** Models running locally via Ollama.
5. **Database:** Google Sheets stores the chat history.
6. **Connection:** A Cloudflare Tunnel creates a secure bridge between the public internet and my local machine.

---

## ⚠️ Requirements for Live Demo
Because this project is hosted on my local machine rather than a 24/7 cloud server, the following must be true for the AI to respond:

* **Power:** My Mac must be turned on and awake.
* **The "Bridge":** The Cloudflare Tunnel terminal must be active.
* **The "Engine":** Docker and n8n must be running the published workflow.
* **The "Brains":** Ollama must be serving both Gemma 2 and Llava.

*Note: If you get a "Connection Error," it likely means the local server is currently offline!*

---

## 🛠️ Tools Used
* **n8n:** AI orchestration and conditional routing (If/Else logic).
* **Ollama:** To run **Gemma 2** (Text) and **Llava** (Vision) locally.
* **Docker:** Containerization for the n8n environment.
* **Cloudflare:** Secure tunneling to expose local webhooks.
* **Google Sheets API:** Persistent memory and data logging.

---

## 📝 Reflections & Evolution
This project evolved from a simple text bot into a complex multimodal system. Key learnings include:
- **Binary Data Handling:** Learning how to pass image files from a browser through a webhook into an AI model.
- **Conditional Logic:** Implementing "If Nodes" to choose the correct AI model based on user input type.
- **UI/UX Design:** Building a "bubble-style" chat interface with image previews, typewriter effects, and dynamic attachment menus.
- **Multimodal Orchestration:** Coordinating different specialized models to work as one seamless assistant.
