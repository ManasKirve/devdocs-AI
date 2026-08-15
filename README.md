# DevDocs AI

AI-powered developer documentation and codebase intelligence platform. Point the app at a GitHub repository and it indexes the source into searchable, queryable chunks — then you can run semantic search over the code or ask natural-language questions that are answered strictly from the real source.

## Features

- **GitHub repository ingestion** — submit a GitHub repository URL and the backend fetches, filters, and indexes its source tree (HTTP(S) and SSH URLs supported).
- **Intelligent chunking** — files are split into logical, size-bounded chunks with overlap; language-aware boundaries for Python, JS/TS, brace-based languages, Markdown, JSON, YAML, XML, and plain text.
- **Semantic search** — ask for code "by intent" and get the most relevant indexed chunks ranked by cosine similarity.
- **Grounded Q&A (RAG)** — answers are generated from retrieved code snippets only; the model must cite sources as `file_path#start-end` and must not invent code.
- **Code-formatted answers** — RAG responses preserve fenced code blocks and report the detected language format.
- **Backend health monitoring** — the frontend polls `/api/v1/health` and shows an offline banner when the API is unreachable.
- **Polished single-page UI** — dark, engineering-first React frontend with a blue/white/dark design system, sticky navbar, repository analyzer, search panel, and Q&A section.

## How it works

```
GitHub repository URL
        │
        ▼
GitHub REST API ──► fetch repo metadata + recursive tree
        │
        ▼
File filtering ────► supported extensions, skip ignored dirs,
                     size caps (512 KB/file, 100 files/repo)
        │
        ▼
Chunking ──────────► language-aware logical blocks, ~1200 tokens
                     per chunk with ~150-token overlap
        │
        ▼
Embedding ─────────► local ONNX model (FastEmbed,
                     BAAI/bge-small-en-v1.5), batched (16/request)
        │
        ▼
In-memory stores ──► documents, chunks, embeddings, and a vector
                     index (brute-force cosine similarity)
        │
        ▼
Search / RAG ──────► embed query → top-k retrieval → Groq
                     generation grounded in the snippets
```

## Tech stack

**Frontend** (`frontend/`)

- React 18, TypeScript, Vite 5
- GSAP + ScrollTrigger for scroll-driven interactions
- Motion for animation
- Custom component library under `src/components/bits/`
- `VITE_API_BASE_URL` configurable API endpoint (defaults to `http://localhost:8000`)

**Backend** (`backend/`)

- Python 3, FastAPI, Uvicorn
- Pydantic + Pydantic Settings for schemas and configuration
- httpx for async HTTP clients (Groq + GitHub)
- Groq (`llama-3.3-70b-versatile`) for LLM generation (chat completions)
- Local embeddings via FastEmbed (ONNX Runtime) — `BAAI/bge-small-en-v1.5`
- In-memory storage and vector index (no external database)

## Repository structure

```
backend/
  app/
    main.py                 FastAPI application + router registration
    core/config.py          Settings (reads .env from the project root)
    api/
      routes/               health, ai, repositories, search, rag
      dependencies/         service construction per route
      errors.py             exception → HTTP response mapping
    ai/
      llm/                  Groq chat provider + output parsing
      embeddings/           local FastEmbed embedding provider
      rag/                  retrieval, cosine similarity, vector store, prompts
      prompts/              system prompts
    ingestion/
      github.py             GitHub REST API client + URL parsing
      filters.py            which files get indexed
      documents.py          in-memory Document model
      chunking/             language-aware chunking service
      store.py              in-memory document/chunk/embedding store
    schemas/                Pydantic request/response models
    services/               ai, embedding, rag, repository, search services
  tests/                    pytest suite (see Testing)
  requirements.txt          runtime dependencies
  requirements-dev.txt      test dependencies
frontend/
  src/
    components/             Navbar, Hero, Features, RepositoryAnalyzer,
                            SearchSection, CodebaseQA, Footer, ...
    services/               HTTP clients for the backend API
    hooks/useHealth.ts      backend health polling (every 30 s)
    config/index.ts         API base URL
    pages/HomePage.tsx      single-page app layout
  package.json              scripts: dev, build, preview, typecheck
  vercel.json               Vite static deployment configuration
  design/                   brand, visual, and UX architecture docs
scripts/                    placeholder (empty)
docs/                       placeholder (empty)
tests/                      placeholder (empty)
```

## Prerequisites

- Node.js 18+ and npm (frontend)
- Python 3.10+ (backend)
- A [Groq API key](https://console.groq.com/keys) (required for the AI and RAG endpoints; embeddings run locally and need no key)
- A GitHub Personal Access Token (recommended to raise rate limits during ingestion)

## Environment variables

Copy `.env.example` to `.env` in the project root. Both processes read this single file (the frontend Vite config uses `envDir: '..'`).

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | Yes | — | Groq API key used by the LLM and RAG providers |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Model for the general `/ai/generate` endpoint |
| `GROQ_RAG_MODEL` | No | `llama-3.3-70b-versatile` | Model used for grounded RAG answers |
| `EMBEDDING_MODEL` | No | `BAAI/bge-small-en-v1.5` | Local embedding model (FastEmbed/ONNX); no API key needed |
| `GITHUB_TOKEN` | No | — | GitHub token; raises the API rate limit during ingestion |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend URL used by the frontend |

## Installation

```bash
# 1. Clone and copy the environment file
git clone <repo-url>
cd devdocs-AI
cp .env.example .env
# edit .env and set GROQ_API_KEY (and GITHUB_TOKEN if you have one)
```

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Local development

Run two processes — the FastAPI backend and the Vite dev server.

### Backend

From the `backend/` directory (with the virtual environment active):

```bash
uvicorn app.main:app --reload --port 8000
```

The API is served at `http://localhost:8000`. Interactive docs are available at `http://localhost:8000/docs`.

### Frontend

From the `frontend/` directory:

```bash
npm run dev
```

Open `http://localhost:5173`. The frontend connects to the backend using `VITE_API_BASE_URL` (default `http://localhost:8000`).

Other frontend commands:

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run typecheck  # TypeScript check only
```

## Usage

1. Open the app and enter a GitHub repository URL (e.g. `https://github.com/octocat/Hello-World`) in the hero or analyzer section.
2. The backend fetches the repo, filters files, chunks them, and embeds the chunks. The response reports files processed/skipped, chunks, and embeddings created.
3. Use the **Search** section to run semantic searches over the indexed repository.
4. Use the **Q&A** section to ask natural-language questions; answers are generated only from retrieved code snippets and cite their sources.

Note: indexed data lives in process memory. Restarting the backend clears the index, so a repository must be re-ingested after a restart.

## API

All endpoints are prefixed with `/api/v1` and documented interactively at `/docs` when the backend is running.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Service status, name, and version |
| `POST` | `/ai/generate` | General LLM generation (`prompt`, optional `temperature`, `max_tokens`) |
| `POST` | `/repositories/ingest` | Ingest a GitHub repo (`repository_url`) |
| `POST` | `/search` | Semantic search over an indexed repo (`query`, optional `top_k`, `repository`) |
| `POST` | `/rag` | Grounded Q&A from retrieved snippets (`query`, optional `top_k`, `repository`) |

`top_k` is validated to be between 1 and 100 (default 5). `repository` is optional; when omitted, the most recently indexed repository is used.

## AI / RAG architecture

- **Providers** are abstract (`LLMProvider`, `EmbeddingProvider`) with a Groq implementation (`GroqProvider`) for generation and a local FastEmbed implementation (`LocalEmbeddingProvider`) behind them.
- **Retrieval** embeds the query, then does brute-force cosine similarity against the in-memory vector store, isolating results per repository and returning the top-k hits.
- **RAG prompt** instructs the model to answer strictly from the provided snippets, never to invent code, and to cite snippets as `file_path#start-end`. If no snippets are retrieved, the endpoint returns a `404`.
- **Output extraction** strips explanatory text and returns the last fenced code block together with its language label (`text` when there is no fence).

## GitHub ingestion workflow

1. Parse the URL (HTTPS, HTTP, or `git@github.com:owner/repo.git` SSH format).
2. Fetch repository metadata to resolve the default branch.
3. Fetch the recursive git tree (up to 5000 entries).
4. Filter files by supported extension, ignored directories (`node_modules`, `.git`, `dist`, etc.), a 512 KB size cap, and a 100-file process cap.
5. Fetch and decode each file's content from the GitHub contents API.
6. Chunk each document, embed the chunks in batches with a local ONNX model, then persist documents, chunks, embeddings, and vectors to the in-memory stores.

## Testing

The backend has a pytest suite in `backend/tests/` covering chunking, GitHub URL parsing and ingestion, embedding batching, the Groq provider, retrieval/similarity, the RAG service, and the API endpoints (via FastAPI `TestClient` and mocked HTTP transports).

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Deployment

A Vercel configuration (`frontend/vercel.json`) is provided for deploying the frontend as a static Vite site with SPA rewrites:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The backend currently has no Docker or container deployment configuration — `docker-compose.yml` is a placeholder and there is no CI/CD pipeline.

## Current status

Implemented and working:

- FastAPI backend with health, AI, repository ingestion, semantic search, and RAG endpoints
- GitHub repository ingestion with filtering, language-aware chunking, and local embeddings
- In-memory document store and vector index with brute-force cosine similarity
- Groq-powered general chat and grounded RAG answers
- React + TypeScript frontend with repository analysis, search, and Q&A sections
- Backend health polling and offline banner
- Backend test suite (pytest)

Not yet implemented:

- Persistent database (PostgreSQL / pgvector) — storage is currently in-memory only
- Documentation upload (manual file/PDF upload) — only GitHub ingestion exists
- Authentication and user accounts
- Docker/containerized deployment and CI/CD
- Rate limiting, job queueing, or background ingestion tasks (ingestion is synchronous)

## Future improvements

Natural next steps based on the current architecture: replace the in-memory stores with PostgreSQL + pgvector for persistence, add documentation-file upload alongside GitHub ingestion, run ingestion as an asynchronous background job with progress tracking, and add authentication before exposing the service publicly.