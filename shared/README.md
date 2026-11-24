# Panda read-only chat connection

Uses Centrifuge 2.8.5 (MIT), pinned from the official npm package. License included.

Panda's public helper code uses /new-token/chat, JWT info.channel and Centrifuge v2 subscriptions. The adapter requests tokens only from https://api.pandahp.kr and subscribes only to the channel supplied in that token at wss://chat-ws.neolive.kr/connection/websocket. No chat publishing or broadcast start/stop requests are made.

Only server publication data.type values bj / manager / chatter are accepted. Commands receive broadcaster / manager / viewer roles derived from that field. Nickname text cannot grant privileges. Widget keys and chat tokens are not logged or persisted.

Validated with a user-provided live widget on 2026-11-24: subscription, ordinary chat delivery, avatar display, broadcaster notice command. No private widget key is part of this repository.
