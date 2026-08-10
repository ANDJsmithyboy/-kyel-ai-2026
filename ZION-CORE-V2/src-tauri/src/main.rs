#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
    // macOS App Store-style Native Menu Bar
    let new_piste = CustomMenuItem::new("new_piste".to_string(), "Nouvelle Piste").accelerator("CmdOrCtrl+Shift+N");
    let quick_switch = CustomMenuItem::new("quick_switch".to_string(), "Sélecteur Rapide").accelerator("CmdOrCtrl+K");
    let global_search = CustomMenuItem::new("global_search".to_string(), "Recherche Globale").accelerator("CmdOrCtrl+Shift+F");
    let export_pdf = CustomMenuItem::new("export_pdf".to_string(), "Exporter (PDF/MD)").accelerator("CmdOrCtrl+P");
    let open_settings = CustomMenuItem::new("open_settings".to_string(), "L'Antre (Paramètres)").accelerator("CmdOrCtrl+,");

    let file_menu = Submenu::new("Fichier", Menu::new()
        .add_item(new_piste)
        .add_item(quick_switch)
        .add_native_item(MenuItem::Separator)
        .add_item(export_pdf)
        .add_native_item(MenuItem::Separator)
        .add_item(open_settings)
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Quit)
    );

    let edit_menu = Submenu::new("Édition", Menu::new()
        .add_native_item(MenuItem::Undo)
        .add_native_item(MenuItem::Redo)
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Cut)
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Paste)
        .add_native_item(MenuItem::SelectAll)
        .add_native_item(MenuItem::Separator)
        .add_item(global_search)
    );
    
    let view_menu = Submenu::new("Affichage", Menu::new()
        .add_item(CustomMenuItem::new("toggle_sidebar".to_string(), "Basculer la Sidebar").accelerator("CmdOrCtrl+B"))
        .add_native_item(MenuItem::Separator)
        .add_item(CustomMenuItem::new("zoom_in".to_string(), "Zoom Avant").accelerator("CmdOrCtrl+="))
        .add_item(CustomMenuItem::new("zoom_out".to_string(), "Zoom Arrière").accelerator("CmdOrCtrl+-"))
        .add_item(CustomMenuItem::new("zoom_reset".to_string(), "Réinitialiser le Zoom").accelerator("CmdOrCtrl+0"))
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::EnterFullScreen)
    );

    let model_menu = Submenu::new("Modèles", Menu::new()
        .add_item(CustomMenuItem::new("model_aurata".to_string(), "Aurata").accelerator("CmdOrCtrl+1"))
        .add_item(CustomMenuItem::new("model_nkyel".to_string(), "Ñkyel").accelerator("CmdOrCtrl+2"))
        .add_item(CustomMenuItem::new("model_onyx".to_string(), "OnyxGris").accelerator("CmdOrCtrl+3"))
        .add_item(CustomMenuItem::new("model_panther".to_string(), "Black Panther").accelerator("CmdOrCtrl+4"))
        .add_item(CustomMenuItem::new("model_wandana".to_string(), "Wandana").accelerator("CmdOrCtrl+5"))
    );

    let window_menu = Submenu::new("Fenêtre", Menu::new()
        .add_native_item(MenuItem::Minimize)
        .add_item(CustomMenuItem::new("new_window".to_string(), "Nouvelle Fenêtre").accelerator("CmdOrCtrl+Shift+N"))
        .add_native_item(MenuItem::CloseWindow)
    );

    let help_menu = Submenu::new("Aide", Menu::new()
        .add_item(CustomMenuItem::new("help_shortcuts".to_string(), "Raccourcis Clavier").accelerator("CmdOrCtrl+/"))
    );

    let menu = Menu::new()
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(model_menu)
        .add_submenu(window_menu)
        .add_submenu(help_menu);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            // Forward native menu events to frontend JS
            let event_name = event.menu_item_id();
            let _ = event.window().emit("native-menu-event", event_name);
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
