# GitScout AI 🤖🚀
A smart, responsive web application built to analyze public GitHub repositories, evaluate their complexity, and generate clear architectural insights using AI. The tool efficiently gathers data from the GitHub API and uses LLM streaming to provide real-time feedback.

## 🛠️ Key Technical Features
Efficient Asynchronous Data Fetching: Powered by Python's FastAPI and HTTPX using asyncio.gather. The backend triggers concurrent requests to the GitHub API (fetching descriptions, README content, and language statistics) in parallel—reducing overall data acquisition latency from ~20s to <2s.

Real-Time AI Analysis Streaming (SSE): Implements a StreamingResponse (Server-Sent Events) pipeline to deliver granular repository assessments from Anthropic Claude 3.5 Sonnet chunk-by-chunk.

Responsive Frontend Client: Built with React and TailwindCSS. The UI features a live stream reader and a partial JSON parser to process and display evaluation cards on-the-fly as data arrives, avoiding any loading freezes.

Smart Edge-Case Handling: Built-in error handling for non-existent profiles, empty repositories, documentation-only projects, and missing README files.

---

## 🏗️ System Architecture
[Root]
├── backend/      # FastAPI Microservice (Async/HTTPX Architecture)
└── frontend/     # React SPA (TailwindCSS + Live SSE Stream Reader)

---

## ⚡ Quick Start

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* Anthropic API Key (Set as `ANTHROPIC_API_KEY` environment variable)

### 1. Spin up the Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080

2. Launch the Frontend (React + Vite)
cd ../frontend
npm install
npm run dev

Open http://localhost:5173 in your browser to run the application.

💻 Tech Stack
Backend: Python, FastAPI, HTTPX, Asyncio, Anthropic SDK, PartialJSON

Frontend: React, TailwindCSS, Vite, Web Streams API

## 🤖 How I Built It

I used **Gemini** and **Cursor AI Agent** as my main development partners throughout this project.

**Gemini** helped me think through the architecture — deciding on FastAPI + React, planning the async GitHub API integration, and structuring the RAG-inspired approach to repository analysis.

**Cursor's AI Agent (Composer)** handled a lot of the boilerplate scaffolding: setting up the FastAPI router structure, wiring CORS middleware, and generating the initial React component tree. I used it iteratively — reviewing every suggestion before accepting, and redirecting it when it went off course.

The main challenge was building a streaming SSE pipeline that renders repository cards live as Claude analyzes them, rather than waiting for the full response. Getting the partial JSON parser to work correctly mid-stream required several iterations.

The biggest non-code challenge was a Windows path issue with special characters (`&` in folder names) that broke Node.js CLI tools — solved by renaming the parent directory.