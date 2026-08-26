# Ñkyel Database ERD

This Entity-Relationship Diagram represents the core domain models for the Ñkyel agentic platform.
Due to the sheer size of the schema (50+ tables), this diagram focuses on the most critical entities and relationships.

```mermaid
erDiagram
    USERS ||--o{ WORKSPACE_MEMBERS : "is member of"
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : "has"
    USERS {
        uuid id PK
        string clerk_user_id
        string primary_email
        string status
    }
    WORKSPACES {
        uuid id PK
        string name
        uuid owner_user_id FK
        string status
    }

    WORKSPACES ||--o{ PROJECTS : "contains"
    PROJECTS {
        uuid id PK
        uuid workspace_id FK
        string name
    }

    WORKSPACES ||--o{ MISSIONS : "contains"
    MISSIONS {
        uuid id PK
        uuid workspace_id FK
        uuid project_id FK
        string title
        string objective
        string status
    }

    MISSIONS ||--o{ RUNS : "executed as"
    RUNS {
        uuid id PK
        uuid mission_id FK
        int attempt_number
        string status
    }

    RUNS ||--o{ MISSION_EVENTS : "emits"
    MISSION_EVENTS {
        uuid id PK
        uuid run_id FK
        bigint sequence
        string event_type
        jsonb payload
    }

    RUNS ||--o{ CHECKPOINTS : "saves state as"
    CHECKPOINTS {
        uuid id PK
        uuid run_id FK
        bigint sequence
        jsonb state_snapshot
    }

    MISSIONS ||--o{ TASKS : "broken into"
    TASKS {
        uuid id PK
        uuid mission_id FK
        uuid parent_task_id FK
        string status
    }

    WORKSPACES ||--o{ ARTIFACTS : "owns"
    ARTIFACTS {
        uuid id PK
        uuid workspace_id FK
        string artifact_type
        string title
        string status
    }

    ARTIFACTS ||--o{ ARTIFACT_VERSIONS : "has versions"
    ARTIFACT_VERSIONS {
        uuid id PK
        uuid artifact_id FK
        int version
        string r2_key
    }

    WORKSPACES ||--o{ CONNECTIONS : "integrates via"
    CONNECTIONS {
        uuid id PK
        string provider_key
        string status
    }

    CONNECTIONS ||--o{ MCP_SERVERS : "provides"
    MCP_SERVERS {
        uuid id PK
        uuid connection_id FK
        string server_key
    }

    MISSIONS ||--o{ WORKGRAPH_NODES : "analyzes via"
    WORKGRAPH_NODES {
        uuid id PK
        uuid mission_id FK
        string node_type
        string label
    }

    WORKGRAPH_NODES ||--o{ WORKGRAPH_EDGES : "connected by"
    WORKGRAPH_EDGES {
        uuid id PK
        uuid source_node_id FK
        uuid target_node_id FK
        string relation_type
    }

    WORKSPACES ||--o{ AGENTS : "contains"
    AGENTS {
        uuid id PK
        string name
        string status
    }

    AGENTS ||--o{ AGENT_VERSIONS : "versioned as"
    AGENT_VERSIONS {
        uuid id PK
        uuid agent_id FK
        int version
    }

    MISSIONS ||--o{ SOURCES : "discovers"
    SOURCES {
        uuid id PK
        string source_type
        string url
    }

    SOURCES ||--o{ EVIDENCE : "provides"
    EVIDENCE {
        uuid id PK
        uuid source_id FK
        string claim
    }
```
