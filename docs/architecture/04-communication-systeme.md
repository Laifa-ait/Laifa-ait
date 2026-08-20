# Communication entre Frontend, Backend, Firebase et BDD

Ce diagramme explique comment les différentes parties du système communiquent de manière sécurisée.

```mermaid
flowchart LR
    subgraph Client [Navigateur / Iframe]
        UI[React UI]
        SDK[Firebase Client SDK]
    end

    subgraph Server [Serveur Cloud Run]
        API[Express App (Port 3000)]
        Admin[Firebase Admin SDK]
    end

    subgraph Google [Google Cloud / Firebase]
        Auth[(Firebase Auth)]
        DB[(Firestore DB)]
        Storage[(Cloud Storage)]
    end

    %% Client to Firebase directly (Auth & Public Read if needed)
    UI -->|1. Auth requests| SDK
    SDK <-->|2. JWT & Sessions| Auth

    %% Client to Backend
    UI -->|3. API Calls avec Header Bearer JWT| API
    
    %% Backend to Firebase Admin
    API -->|4. Utilise| Admin
    Admin <-->|5. Verify Token & RBAC| Auth
    Admin <-->|6. CRUD & ACID Transactions| DB
    Admin <-->|7. Sign URLs / Manage files| Storage

    %% Styles
    style Client fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Server fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style Google fill:#fff3e0,stroke:#e65100,stroke-width:2px
```
