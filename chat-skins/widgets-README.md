# Chat widgets

Notice, countdown, Korean clock and OBS streaming duration belong to the chat-skin page, not the avatar studio. Each has six styles and off/top/bottom placement. Resize reserves space around the chat feed.

CSS exports style the native Panda chat only; they cannot execute widget commands. Separate widget URLs are provided for OBS. Without a private source fragment they are explicitly labeled demos. With a source they subscribe to real chat and accept commands only from server-authenticated bj/manager role metadata. The editor's synthetic role picker is disabled in live mode.

Confirmed live: real chat reception and broadcaster !공지 command. OBS duration uses authenticated local OBS WebSocket GetStreamStatus, read-only. Actual live OBS duration has not been verified; protocol/state handling is tested with mocks.

Tests: node chat-skins/widget-runtime.test.cjs
