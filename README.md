# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Installing

- to install the release app just go to the release folder and download the `.dmg` file
- you must still install ffmpeg by yourself

## Dev Setup

- follow instruction here https://tauri.app/v1/guides/getting-started/prerequisites/
  - install rust by command `curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh`
  - run `source "$HOME/.cargo/env"`
- install deps `pnpm install`
- run tauri dev env `pnpm tauri dev`
  - this will run the desktop debug app and provide url to debug in browser
  - since this is creating desktop app, care only using tauri API.
- to build run `pnpm tauri build`

## ffmpeg

- this application depends on `ffmpeg` for video compression.
- install ffmpeg, the easiest way is using brew `brew install ffmpeg`
- follow other way to install on their [site](https://ffmpeg.org/download.html)

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## gotcha

- in browser sometimes you got error `# window.__TAURI_IPC__ is not a function` thats because you run tauri window on browser, it will run ok on desktop app.
- in dev mode, when drag n drop, the compressed image or video might output twice. This because `useEffect` run twice in dev mode.
- in production build macios, there is no PATH in bundle (causing file not found error), see [here](https://tauri.app/v1/guides/building/macos/). to fix this use [tauri-fix-rs](https://github.com/tauri-apps/fix-path-env-rs).
  - in `src-tauri/cargo.toml` add
  ```toml
    [dependencies.fix-path-env]
    git = "https://github.com/tauri-apps/fix-path-env-rs"
    branch = "dev"
  ```
  - in `src-tauri/src/main.rs` add `fix_path_env::fix();` to init of `main` function
