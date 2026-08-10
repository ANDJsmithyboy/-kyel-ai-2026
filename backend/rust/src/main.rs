/* GabomaGPT · main.rs
   SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Point d'entrée du moteur RAG + Parser linguistique Rust */

use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use serde::{Deserialize, Serialize};
use tracing::info;

mod parser;
mod rag;

/// État partagé de l'application
pub struct AppState {
    pub parser: parser::LinguisticParser,
}

/// Réponse santé du service
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
    languages_supported: usize,
}

/// Route de santé
async fn health(data: web::Data<AppState>) -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        service: "gabomagpt-rag-engine".to_string(),
        version: "1.0.0".to_string(),
        languages_supported: data.parser.language_count(),
    })
}

/// Requête de parsing linguistique
#[derive(Deserialize)]
struct ParseRequest {
    text: String,
    source_lang: Option<String>,
    target_lang: Option<String>,
}

/// Route de parsing linguistique
async fn parse_text(
    data: web::Data<AppState>,
    body: web::Json<ParseRequest>,
) -> HttpResponse {
    let result = data.parser.parse(&body.text, body.source_lang.as_deref());
    HttpResponse::Ok().json(result)
}

/// Requête de recherche RAG
#[derive(Deserialize)]
struct SearchRequest {
    query: String,
    collection: Option<String>,
    top_k: Option<usize>,
}

/// Route de recherche RAG
async fn search(body: web::Json<SearchRequest>) -> HttpResponse {
    let top_k = body.top_k.unwrap_or(5);
    let collection = body.collection.as_deref().unwrap_or("default");

    let results = rag::search(&body.query, collection, top_k).await;
    HttpResponse::Ok().json(results)
}

/// Requête d'indexation de document
#[derive(Deserialize)]
struct IndexRequest {
    document_id: String,
    content: String,
    metadata: Option<serde_json::Value>,
    collection: Option<String>,
}

/// Route d'indexation de document
async fn index_document(body: web::Json<IndexRequest>) -> HttpResponse {
    let collection = body.collection.as_deref().unwrap_or("default");
    let result = rag::index_document(
        &body.document_id,
        &body.content,
        body.metadata.as_ref(),
        collection,
    ).await;
    HttpResponse::Ok().json(result)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Charger les variables d'environnement
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();

    // Initialiser le parser linguistique
    let parser = parser::LinguisticParser::new();
    info!(
        "🦀 GabomaGPT RAG Engine démarré — {} paires linguistiques chargées",
        parser.language_count()
    );

    let state = web::Data::new(AppState { parser });

    let port = std::env::var("RUST_PORT").unwrap_or_else(|_| "8002".to_string());
    let bind_addr = format!("0.0.0.0:{}", port);

    info!("🚀 Serveur Actix-web en écoute sur {}", bind_addr);

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(middleware::Logger::default())
            .route("/health", web::get().to(health))
            .service(
                web::scope("/api/v1/rag")
                    .route("/parse", web::post().to(parse_text))
                    .route("/search", web::post().to(search))
                    .route("/index", web::post().to(index_document))
            )
    })
    .bind(&bind_addr)?
    .run()
    .await
}
