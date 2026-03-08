use tauri::{AppHandle, Emitter, Manager};

fn handle_second_instance(app: &AppHandle, args: Vec<String>) {
    // Extract the .acx file path from the second instance arguments
    let file_path = args.into_iter().skip(1).find(|a| a.ends_with(".acx"));

    if let Some(path) = file_path {
        let _ = app.emit("open-file", path);
    }

    // Bring the existing window to the foreground
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_focus();
    }
}

#[tauri::command]
fn get_cli_file() -> Option<String> {
    std::env::args().skip(1).find(|a| a.ends_with(".acx"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Register tauri_plugin_single_instance plugin so any number of .acx files
        // are opened in the same app instance
        .plugin(
            tauri_plugin_single_instance::init(|app, args, _cwd| {
                handle_second_instance(app, args);
            }),
        )
        // Register opener plugin to allow open files and URLs
        .plugin(tauri_plugin_opener::init())
        // Expose get_cli_file command to the frontend so it can retrieve
        // the file path passed as CLI argument on startup
        .invoke_handler(tauri::generate_handler![get_cli_file])
        // Run with context tauri.conf.json
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}