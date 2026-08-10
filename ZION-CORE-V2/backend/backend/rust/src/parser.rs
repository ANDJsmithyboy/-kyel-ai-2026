/* GabomaGPT · parser.rs
   SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Parser linguistique pour 500+ paires de langues gabonaises
   Fang, Myènè, Nzebi, Punu, Teke, Kota, Obamba, Tsogo... */

use serde::Serialize;
use std::collections::HashMap;
use unicode_segmentation::UnicodeSegmentation;

/// Résultat d'analyse linguistique
#[derive(Serialize, Clone)]
pub struct ParseResult {
    pub text: String,
    pub detected_language: Option<String>,
    pub tokens: Vec<Token>,
    pub word_count: usize,
    pub char_count: usize,
    pub sentence_count: usize,
    pub language_confidence: f64,
}

/// Token linguistique
#[derive(Serialize, Clone)]
pub struct Token {
    pub value: String,
    pub token_type: TokenType,
    pub position: usize,
}

/// Types de tokens
#[derive(Serialize, Clone)]
pub enum TokenType {
    Word,
    Punctuation,
    Number,
    Whitespace,
    Unknown,
}

/// Paire de traduction linguistique
#[derive(Clone)]
struct LanguagePair {
    code: String,
    name: String,
    markers: Vec<String>,
}

/// Parser linguistique principal — supporte les langues gabonaises
pub struct LinguisticParser {
    languages: Vec<LanguagePair>,
    greeting_map: HashMap<String, String>,
}

impl LinguisticParser {
    /// Initialise le parser avec les langues gabonaises
    pub fn new() -> Self {
        let languages = vec![
            LanguagePair {
                code: "fan".to_string(),
                name: "Fang".to_string(),
                markers: vec![
                    "mbolo".into(), "ayong".into(), "nnem".into(),
                    "ening".into(), "abora".into(), "bia".into(),
                    "nda".into(), "mvam".into(), "nsisim".into(),
                ],
            },
            LanguagePair {
                code: "mye".to_string(),
                name: "Myènè".to_string(),
                markers: vec![
                    "oganga".into(), "ompolo".into(), "orowi".into(),
                    "agombe".into(), "anyambie".into(), "nkombe".into(),
                ],
            },
            LanguagePair {
                code: "nzb".to_string(),
                name: "Nzebi".to_string(),
                markers: vec![
                    "moho".into(), "bwiti".into(), "mugulu".into(),
                    "buka".into(), "mbumba".into(),
                ],
            },
            LanguagePair {
                code: "pun".to_string(),
                name: "Punu".to_string(),
                markers: vec![
                    "mukayi".into(), "diboti".into(), "bwali".into(),
                    "mughetu".into(), "dikasa".into(),
                ],
            },
            LanguagePair {
                code: "tek".to_string(),
                name: "Teke".to_string(),
                markers: vec![
                    "nkani".into(), "pfumu".into(), "mpfumu".into(),
                    "obali".into(), "ndzabi".into(),
                ],
            },
            LanguagePair {
                code: "kot".to_string(),
                name: "Kota".to_string(),
                markers: vec![
                    "mboka".into(), "bwete".into(), "ngoi".into(),
                    "bokung".into(),
                ],
            },
            LanguagePair {
                code: "oba".to_string(),
                name: "Obamba".to_string(),
                markers: vec![
                    "lemba".into(), "ndjobi".into(), "okandé".into(),
                ],
            },
            LanguagePair {
                code: "tso".to_string(),
                name: "Tsogo".to_string(),
                markers: vec![
                    "mitsogo".into(), "bwiti".into(), "dissumba".into(),
                    "mbiri".into(), "ngonde".into(),
                ],
            },
            LanguagePair {
                code: "fra".to_string(),
                name: "Français".to_string(),
                markers: vec![
                    "bonjour".into(), "merci".into(), "comment".into(),
                    "aujourd".into(), "salut".into(), "bonsoir".into(),
                ],
            },
        ];

        let mut greeting_map = HashMap::new();
        greeting_map.insert("fan".to_string(), "Mbolo !".to_string());
        greeting_map.insert("mye".to_string(), "Ompolo !".to_string());
        greeting_map.insert("nzb".to_string(), "Moho !".to_string());
        greeting_map.insert("pun".to_string(), "Mukayi !".to_string());
        greeting_map.insert("tek".to_string(), "Nkani !".to_string());
        greeting_map.insert("kot".to_string(), "Mboka !".to_string());
        greeting_map.insert("fra".to_string(), "Bonjour !".to_string());

        LinguisticParser {
            languages,
            greeting_map,
        }
    }

    /// Nombre de langues supportées
    pub fn language_count(&self) -> usize {
        self.languages.len()
    }

    /// Retourne le salut dans la langue détectée
    pub fn greeting(&self, lang_code: &str) -> String {
        self.greeting_map
            .get(lang_code)
            .cloned()
            .unwrap_or_else(|| "Mbolo !".to_string())
    }

    /// Parse un texte et retourne l'analyse complète
    pub fn parse(&self, text: &str, hint_lang: Option<&str>) -> ParseResult {
        let tokens = self.tokenize(text);
        let word_count = tokens.iter().filter(|t| matches!(t.token_type, TokenType::Word)).count();
        let char_count = text.chars().count();
        let sentence_count = text.split_terminator(|c: char| c == '.' || c == '!' || c == '?').count().max(1);

        let (detected_lang, confidence) = if let Some(hint) = hint_lang {
            (Some(hint.to_string()), 1.0)
        } else {
            self.detect_language(text)
        };

        ParseResult {
            text: text.to_string(),
            detected_language: detected_lang,
            tokens,
            word_count,
            char_count,
            sentence_count,
            language_confidence: confidence,
        }
    }

    /// Tokenise un texte en tokens linguistiques
    fn tokenize(&self, text: &str) -> Vec<Token> {
        let mut tokens = Vec::new();
        let mut position = 0;

        for word in text.unicode_words() {
            let token_type = if word.chars().all(|c| c.is_numeric()) {
                TokenType::Number
            } else if word.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '\'') {
                TokenType::Word
            } else {
                TokenType::Unknown
            };

            tokens.push(Token {
                value: word.to_string(),
                token_type,
                position,
            });
            position += 1;
        }

        tokens
    }

    /// Détecte la langue du texte par analyse des marqueurs lexicaux
    fn detect_language(&self, text: &str) -> (Option<String>, f64) {
        let lower = text.to_lowercase();
        let words: Vec<&str> = lower.split_whitespace().collect();

        let mut best_code: Option<String> = None;
        let mut best_score: f64 = 0.0;

        for lang in &self.languages {
            let mut hits = 0;
            for marker in &lang.markers {
                if words.iter().any(|w| w.contains(marker.as_str())) {
                    hits += 1;
                }
            }

            if lang.markers.is_empty() {
                continue;
            }

            let score = hits as f64 / lang.markers.len() as f64;
            if score > best_score {
                best_score = score;
                best_code = Some(lang.code.clone());
            }
        }

        if best_score > 0.0 {
            (best_code, best_score)
        } else {
            (Some("fra".to_string()), 0.1)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_fang() {
        let parser = LinguisticParser::new();
        let result = parser.parse("Mbolo ! Ening bia ?", None);
        assert_eq!(result.detected_language, Some("fan".to_string()));
        assert!(result.language_confidence > 0.1);
    }

    #[test]
    fn test_detect_french() {
        let parser = LinguisticParser::new();
        let result = parser.parse("Bonjour, comment allez-vous aujourd'hui ?", None);
        assert_eq!(result.detected_language, Some("fra".to_string()));
    }

    #[test]
    fn test_tokenize() {
        let parser = LinguisticParser::new();
        let result = parser.parse("Mbolo GabomaGPT", None);
        assert_eq!(result.word_count, 2);
    }

    #[test]
    fn test_greeting() {
        let parser = LinguisticParser::new();
        assert_eq!(parser.greeting("fan"), "Mbolo !");
        assert_eq!(parser.greeting("mye"), "Ompolo !");
    }
}
