# Daily Task Automator

A cross-platform GUI application built with React, Vite, and Tauri to help you manage daily tasks, automate workflows with n8n, and leverage AI suggestions via Ollama.

## Features

- **Task Management**: Collect and organize your daily tasks.
- **AI Integration**: Get task suggestions and summaries using local LLMs via Ollama.
- **Automation**: Trigger workflows in n8n based on your tasks.
- **Cross-Platform**: Runs on macOS, Windows, and Linux.

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://www.docker.com/) & Docker Compose
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri development)

### 1. Start Backend Services

We use Docker Compose to run n8n and Ollama locally.

```bash
docker-compose up -d
```

This will start:
- **n8n** at `http://localhost:5678`
- **Ollama** at `http://localhost:11434`

*Note: For Ollama, you may need to pull a model first if you haven't already:*
```bash
docker exec -it ollama ollama pull llama3
```

### 2. Environment Variables

Create a `.env` file in the root directory. You can copy the example below:

```env
# Supabase Configuration (if used)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# n8n Integration
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/your-webhook-id

# Ollama Integration
VITE_OLLAMA_API_ENDPOINT=http://localhost:11434
VITE_OLLAMA_MODEL=llama3
```

### 3. Run the Application

Install dependencies and start the development server:

```bash
npm install
npm run tauri dev
```

## Use Cases

### 1. Intelligent Task Suggestions
The application connects to a local Ollama instance to analyze your current task list and suggest actionable follow-up items. This keeps your workflow fluid and helps you remember forgotten steps.

### 2. Automated Workflows
Send your daily task summary to n8n to trigger complex automations, such as:
- syncing tasks to Jira or ClickUp.
- sending daily reports to Slack or Microsoft Teams.
- updating a Google Sheet with your progress.

### 3. Daily Summaries
Generate a concise summary of your day's work using the "Summarize" feature, powered by Ollama, ready to be shared with your team or manager.
