# CineBot 🎬

Een AI-agent die je helpt de perfecte film of serie te vinden. CineBot combineert live filmdata via de TMDB API met tactische kennis over genres, regisseurs en klassiekers.

**Gebouwd met:** Node.js · Express · LangChain · createAgent · MemorySaver · Vite · React

---

## Installatie en opstarten

### Vereisten
- Node.js v18 of hoger
- Azure OpenAI account met chat en embeddings deployment
- Gratis TMDB API key via [themoviedb.org](https://www.themoviedb.org)

Mocht je de applicatie willen testen, en je kan niet aan een TMDB Api key komen, stuur mij even een berichtje. 

### Stap 1 — Backend instellen

```bash
cd backend
npm install --legacy-peer-deps
```

Maak een `.env` bestand aan in de `backend` map:

```
AZURE_OPENAI_API_VERSION=2025-03-01-preview
AZURE_OPENAI_API_INSTANCE_NAME=jouw_instantie_naam
AZURE_OPENAI_API_KEY=jouw_azure_key
AZURE_OPENAI_API_DEPLOYMENT_NAME=gpt-4.1-mini
AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME=text-embedding-3-small
TMDB_API_KEY=jouw_tmdb_bearer_token
```

### Stap 2 — Vectorstore aanmaken (eenmalig)

```bash
cd backend
npm run create
```

### Stap 3 — Backend starten

```bash
cd backend
npm run dev
```

### Stap 4 — Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`

---

## Projectstructuur

```
cinebot/
├── backend/
│   ├── documents/        # Kennisdocumenten over genres, regisseurs, klassiekers
│   ├── vectorstore/      # Gegenereerde FAISS vectorstore (na npm run create)
│   ├── agent.js          # createAgent met MemorySaver en tools
│   ├── create.js         # Eenmalig script voor vectorstore
│   ├── embeddings.js     # Vectorstore laden en doorzoeken
│   ├── server.js         # Express server
│   ├── tools.js          # TMDB API tools
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx       # Chat interface met tool badges
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```
