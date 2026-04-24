Willy's Gemma 2 AI Chat
This is my first project using n8n, Docker, and Ollama. I built a chat website that talks to an AI model called Gemma 2 that runs directly on my Mac instead of in the cloud.
How it works
The website (frontend) is just HTML and CSS hosted here on GitHub Pages. When you send a message, it travels through a Cloudflare Tunnel to my laptop at home. My n8n workflow then takes that message, sends it to Gemma 2 to get an answer, saves everything in a Google Sheet so I have a history of the chat, and then sends the answer back to the site.
Why it might be offline
Since I'm hosting this on my own computer and not paying for a big server, there are a few reasons why the AI might not respond:
•	My Mac has to be turned on and awake.
•	I have to have the Terminal open running the Cloudflare Tunnel.
•	Docker and n8n need to be running.
•	Ollama needs to be active so Gemma 2 can "think."
If you get a connection error, it just means my laptop is probably closed or I'm not running the tunnel right now.
Tools I used
•	n8n - For the logic and webhooks.
•	Docker - To run n8n.
•	Ollama - To run the Gemma 2 model locally.
•	Cloudflare - To let the internet talk to my local machine safely.
•	Google Sheets - To keep track of all the messages.
What I learned
I learned a lot about how webhooks work and how to get different programs to talk to each other. It was also pretty cool figuring out how to use a tunnel to make a local project accessible to my friends.
