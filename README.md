# MoAI Hub - Willy's Multimodal AI Assistant

MoAI Hub is my project exploring **AI orchestration** using **n8n**, **Docker**, **Ollama**, and a custom-built web interface.

The goal of MoAI is to connect a website, a local backend server, an n8n workflow, and local AI models into one assistant that can chat, analyze images, save conversations, and show system status.

---

## What MoAI Does

MoAI is a local AI assistant that runs on your computer.

It can:

- chat with a local AI model
- analyze uploaded images
- save conversations
- switch between Fast, Deep, and Image modes
- upload simple text files for context
- show a local admin/status page
- connect to n8n and Ollama

---

## Files Included

This project is uploaded as individual files instead of folders.

Keep every file in the same folder after downloading.

| File | What It Does |
| --- | --- |
| `index.html` | The main MoAI chat website. |
| `admin.html` | The admin/status page for checking if MoAI, n8n, and Ollama are online. |
| `server.js` | The local Node.js server that runs MoAI. |
| `package.json` | Lets you start the project with `npm start`. |
| `conversations.json` | Stores saved MoAI conversations. |
| `moai-logo.svg` | The MoAI logo used by the website. |
| `start.sh` | Optional Mac/Linux script to start MoAI. |
| `stop.sh` | Optional Mac/Linux script to stop MoAI. |
| `README.md` | The instructions for the project. |

---

## Important File Rule

All files must stay in the same folder.

Do not move these files into separate folders unless you also update the code.

Your folder should look like this:

```text
MoAI/
|-- README.md
|-- admin.html
|-- conversations.json
|-- index.html
|-- moai-logo.svg
|-- package.json
|-- server.js
|-- start.sh
`-- stop.sh
```

---

## Tools Used

| Tool | Purpose |
| --- | --- |
| **HTML/CSS/JavaScript** | Builds the MoAI website interface. |
| **Node.js** | Runs the local MoAI server. |
| **n8n** | Handles AI workflow routing and automation. |
| **Docker** | Runs n8n locally. |
| **Ollama** | Runs local AI models. |
| **marked.js** | Renders markdown in AI responses. |
| **Claude, Gemini, and Codex** | Used during development for research, debugging, and implementation help. |

---

## How It Works

1. You open MoAI in your browser.
2. The browser sends your message to `server.js`.
3. The local server sends the request to an n8n webhook.
4. n8n decides how to route the request.
5. Ollama runs the local AI model.
6. The response comes back through n8n.
7. MoAI displays the answer in the browser.

Basic flow:

```text
Browser
  |
  v
MoAI Server
  |
  v
n8n Workflow
  |
  v
Ollama AI Model
  |
  v
MoAI Website
```

---

## Requirements

Before running MoAI, you need:

- Node.js
- n8n
- Docker
- Ollama
- at least one Ollama model installed

---

## Step 1: Download The Files

Download all files from this repository.

Make sure all files are in the same folder:

```text
README.md
admin.html
conversations.json
index.html
moai-logo.svg
package.json
server.js
start.sh
stop.sh
```

---

## Step 2: Install Node.js

MoAI needs Node.js to run the local server.

Download Node.js here:

```text
https://nodejs.org/
```

Install the recommended LTS version.

To check if Node.js installed correctly, open Terminal and run:

```bash
node -v
```

You should see a version number.

---

## Step 3: Install Ollama

Download Ollama here:

```text
https://ollama.com/
```

After installing Ollama, install a model.

Example:

```bash
ollama pull qwen2.5:7b
```

If you want image analysis, install a vision model too.

Example:

```bash
ollama pull llava:7b
```

---

## Step 4: Start n8n

MoAI uses n8n as the workflow engine.

If you run n8n through Docker, start your n8n container.

Example:

```bash
docker start n8n-fresh
```

Then open n8n in your browser:

```text
http://localhost:5678
```

Make sure your MoAI workflow is active.

---

## Step 5: Create A `.env` File

Create a new file in the same folder called:

```text
.env
```

Add your local settings inside it:

```env
PORT=3000
N8N_CHAT_URL=your_n8n_chat_webhook_url_here
N8N_SUBMISSION_URL=your_n8n_submission_webhook_url_here
N8N_INTERNAL_API_KEY=your_private_api_key_here
OLLAMA_URL=http://127.0.0.1:11434
```

Replace the placeholder values with your real n8n webhook URLs and API key.

Do not upload your `.env` file publicly if it contains private information.

---

## Step 6: Open The Project Folder In Terminal

Open Terminal in the folder that contains the MoAI files.

On Mac, you can:

1. Open Finder.
2. Go to the MoAI folder.
3. Right-click the folder.
4. Click **New Terminal at Folder**.

If you do not see that option, open Terminal manually and use:

```bash
cd path/to/your/moai-folder
```

---

## Step 7: Start MoAI

Run:

```bash
npm start
```

If everything works, you should see something like:

```text
MoAI local server running on http://localhost:3000
```

---

## Step 8: Open MoAI

Open your browser and go to:

```text
http://localhost:3000
```

Do not double-click `index.html`.

MoAI needs the local server to work correctly.

---

## Step 9: Open The Admin Page

To check if everything is online, open:

```text
http://localhost:3000/admin
```

The admin page checks:

- MoAI Server
- n8n
- Ollama

If something shows offline, make sure that service is running.

---

## Optional: Use The Start Script

On Mac or Linux, you can start MoAI with:

```bash
./start.sh
```

If that does not work, give the scripts permission:

```bash
chmod +x start.sh stop.sh
```

Then try again:

```bash
./start.sh
```

---

## Optional: Stop MoAI

To stop MoAI, press:

```text
Control + C
```

in the Terminal window where MoAI is running.

Or use:

```bash
./stop.sh
```

---

## Troubleshooting

### MoAI will not open

Make sure the server is running.

Run:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

### MoAI says it cannot connect

Make sure these are running:

- MoAI server
- n8n
- Ollama

You can check the admin page:

```text
http://localhost:3000/admin
```

### n8n is offline

Start n8n with Docker:

```bash
docker start n8n-fresh
```

Then open:

```text
http://localhost:5678
```

### Ollama is offline

Start Ollama, then check:

```text
http://127.0.0.1:11434/api/tags
```

### The AI does not respond

Check that:

- your n8n workflow is active
- your webhook URL is correct
- your `.env` file has the correct values
- Ollama has the model installed
- Docker is running

---

## Key Features

- **Custom Chat Interface** - A polished browser-based AI assistant UI.
- **Local AI Models** - Runs through Ollama instead of relying only on cloud APIs.
- **n8n Workflow Routing** - Uses n8n as the automation and routing layer.
- **Image Upload Support** - Sends image prompts to a vision-capable model.
- **Saved Conversations** - Stores chat history locally in `conversations.json`.
- **Mode Buttons** - Switch between Fast, Deep, and Image modes.
- **File Upload Support** - Supports TXT, MD, CSV, and JSON files.
- **Admin Page** - Shows whether MoAI, n8n, and Ollama are online.
- **Mobile Responsive Design** - Works on desktop and smaller screens.

---

## Notes

This project is meant to be run locally.

That means the AI will only respond if your computer is on and the required services are running.

Required services:

- MoAI local server
- n8n
- Ollama
- Docker, if using Docker for n8n

---

## What I Learned

This project helped me learn:

- how to build a custom AI frontend
- how to use n8n webhooks
- how to connect a website to a local backend
- how to run local AI models with Ollama
- how to route different requests through workflows
- how to debug Docker, n8n, Node.js, and browser issues
- how to organize a project so other people can understand it

MoAI started as a simple chatbot idea and became a full local AI assistant hub.

---

## Built By

Built by Willy as a first AI orchestration project using n8n, Docker, Ollama, and a custom web interface.
