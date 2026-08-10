# GabomaGPT · Dockerfile (Rust RAG Engine)
# SmartANDJ AI Technologies · Constitution Zion Core

FROM rust:1.77-slim-bookworm AS builder

WORKDIR /app

# 1. On installe toutes les armes système d'un coup, proprement
RUN apt-get update && apt-get install -y --no-install-recommends \
    protobuf-compiler pkg-config libssl-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

# 2. Le système de Cache (Pré-compilation)
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo 'fn main() { println!("Dummy build"); }' > src/main.rs
RUN cargo build --release || true
RUN rm -rf src

# 3. On ramène le vrai code source de GabomaGPT
COPY . .

# 4. LA LIGNE MANQUANTE : On lance la VRAIE compilation !
RUN cargo build --release

# ==========================================
# PHASE 2 : L'image de production (Ultra légère)
# ==========================================
FROM debian:bookworm-slim

# On installe les certificats web et libssl (souvent requis par Rust pour les requêtes HTTP)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 5. L'astuce du wildcard (*) pour s'assurer que Docker trouve le fichier
COPY --from=builder /app/target/release/gabomagpt-rag* ./

EXPOSE 8002

# 6. Démarrage de l'engin
CMD ["./gabomagpt-rag"]
