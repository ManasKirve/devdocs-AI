# DevDocs AI

AI-powered developer documentation and codebase intelligence platform. Users connect a GitHub repository or upload technical documentation, and the system indexes the content so natural-language questions can be asked about it.

## Status

**Initial project structure only.** No application logic has been implemented yet. All folders are scaffolded as placeholders, and implementation will be added incrementally in upcoming milestones.

## Planned Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI, Pydantic
- **AI:** OpenAI LLM APIs, OpenAI Embeddings, RAG
- **Database:** PostgreSQL, pgvector
- **Infrastructure (later):** Docker, Docker Compose, GitHub Actions, cloud deployment

## Repository Layout

```
frontend/   React + TypeScript + Vite application
backend/    FastAPI application (API, AI, ingestion, database)
docs/       Architecture, API, AI, database, and development documentation
scripts/    Development, database, and utility scripts
tests/      Integration, e2e, and fixture tests
```

## Getting Started

Initialization commands will be documented here as the project is implemented.
