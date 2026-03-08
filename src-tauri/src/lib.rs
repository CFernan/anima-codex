use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Register tauri_plugin_single_instance plugin so any number of .acx files
        // are opened in the same app instance
        .plugin(
            tauri_plugin_single_instance::init(|app, args, _cwd| {
                // A second instance was launched — extract the file path
                // from its arguments and notify the frontend.
                let file_path = args.into_iter().skip(1).find(|a| a.ends_with(".acx"));

                if let Some(path) = file_path {
                    let _ = app.emit("open-file", path);
                }
            }),
        )
        // Register opener plugin to allow open files and URLs
        .plugin(tauri_plugin_opener::init())
        // Register callback executed only once during initialization
        .setup(|app| {
            // First instance — check if a .acx file was passed as a CLI argument.
            let file_path = std::env::args().skip(1).find(|a| a.ends_with(".acx"));

            if let Some(path) = file_path {
                app.emit("open-file", path)?;
            }

            Ok(())
        })
        // Run with context tauri.conf.json
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}