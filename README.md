<div align="center">

<img src="media/icon.png" alt="Copilot2API logo" width="128" height="128">

# Copilot2API

Bring any OpenAI / OpenAI Responses / Anthropic / Gemini compatible model into the GitHub Copilot Chat model picker.

English | [简体中文](README.zh-CN.md)

[![CI](https://github.com/Equati0n/copilot2api/actions/workflows/ci.yml/badge.svg)](https://github.com/Equati0n/copilot2api/actions/workflows/ci.yml)
[![Release](https://github.com/Equati0n/copilot2api/actions/workflows/publish.yml/badge.svg)](https://github.com/Equati0n/copilot2api/actions/workflows/publish.yml)
[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/Equati0n.copilot2api?style=flat-square&label=Marketplace&logo=visualstudiocode&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=Equati0n.copilot2api)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea043?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

- **Multi-API support**: OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, and Google Gemini in a single extension.
- **Visual configuration UI**: Manage providers, API keys, and allowed models from the Activity Bar — no JSON editing required.
- **Auto model discovery**: Fetches `/models` (or the provider equivalent) and infers context length, vision, and tool-calling capabilities.
- **Token usage & auto-compression**: Reads real usage from the backend stream (falls back to local estimation when missing) and forwards it to the Copilot UI via `LanguageModelDataPart('usage')`, enabling its built-in context auto-compression. Default context lengths are tightened to safe values (e.g. 1M-class presets land at 400K, 200K-class at 160K) and can be overridden per model.
- **Connectivity probe**: Sends a minimal request to a chosen test model and reports latency directly in the side bar.
- **Reasoning controls**: First-class support for OpenAI `reasoning.effort` and Anthropic `thinking.budget_tokens`.
- **Tool calling streaming**: Parses both native `tool_calls` and text-form `<tool_call>` payloads emitted by some OpenAI-compatible gateways.
- **Vision proxying**: Automatically forwards image attachments through a vision-capable sibling model when the active model is text-only.
- **SecretStorage-only keys**: API keys never enter `settings.json`, workspace state, or logs.
- **Zero telemetry**: No analytics, no third-party proxy — traffic flows directly from VS Code to your Base URL.

## 📦 Requirements

- VS Code **1.116** or later
- GitHub Copilot Chat installed and signed in
- An OpenAI-, OpenAI Responses-, Anthropic-, or Gemini-compatible API endpoint
- Node.js **20+** (development only)

## ⚡ Quick Start

1. Install **Copilot2API** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Equati0n.copilot2api) (or the `.vsix` attached to each [GitHub Release](https://github.com/Equati0n/copilot2api/releases)).
2. Open the **Copilot2API** view in the Activity Bar and click **新建供应商**.
3. Pick a preset (OpenAI, Anthropic, DeepSeek, Gemini, xAI, Kimi, MiniMax, GLM, …) or enter a custom Base URL.
4. Paste your API key — it is written straight into VS Code SecretStorage.
5. Click **获取模型列表** to discover models, then tick the ones you want exposed to Copilot Chat.
6. Open the Copilot Chat model picker and select your model.

## ✨ Configuration UI

The visual configuration panel lives in the Activity Bar.

- **Open**: click the Copilot2API icon, or run **Copilot2API: 打开模型管理器** from the Command Palette.
- **Create / edit / delete** providers without leaving the side bar.
- **Test connectivity** against any selected model and see the round-trip latency.
- **Manage allowed models** with checkboxes and per-model overrides (display name, context length, vision, tool calling, reasoning, custom headers, extra body parameters).

## ✨ Multi-API Mode

Each provider declares its `apiType`, which selects the wire protocol used for that provider's requests.

1. **`openai`** — OpenAI Chat Completions
   - Endpoint: `POST {baseUrl}/chat/completions`
   - Auth header: `Authorization: Bearer <apiKey>`
   - Use with: OpenAI, DeepSeek, Moonshot, MiniMax, GLM, xAI, and any OpenAI-compatible gateway.
2. **`openai-responses`** — OpenAI Responses API
   - Endpoint: `POST {baseUrl}/responses`
   - Auth header: `Authorization: Bearer <apiKey>`
   - Use with: OpenAI Responses API and compatible bridges.
3. **`anthropic`** — Anthropic Messages
   - Endpoint: `POST {baseUrl}/v1/messages`
   - Auth header: `x-api-key: <apiKey>`
   - Use with: Anthropic Claude.
4. **`gemini`** — Google Generative Language
   - Endpoint: `POST {baseUrl}/v1beta/models/{model}:streamGenerateContent?alt=sse`
   - Auth header: `x-goog-api-key: <apiKey>`
   - Use with: Google Gemini and compatible gateways.

## ✨ Multi-Provider Guide

Copilot2API supports any number of providers at the same time. Each provider keeps its own API key in SecretStorage under `copilot2api.apiKey.<providerId>`.

1. Click **新建供应商** for every provider you want to use.
2. Switch between them in the model picker — keys never leave SecretStorage.
3. Use **Copilot2API: 设置服务商 API Key** from the Command Palette to update a key without touching the JSON file.

## ✨ Built-in Provider Presets

Presets seed sensible defaults (Base URL, family, context length, vision/tool flags). You can always override them or add fully custom providers.

| Provider | Built-in presets |
|----------|------------------|
| OpenAI | `gpt-5.5-pro`, `gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.3-codex`, `gpt-5.3-codex-spark`, `gpt-5.2`, `gpt-5.2-codex`, `gpt-5.1`, `gpt-4.1`, `gpt-4o` |
| Anthropic | `claude-opus-4-7`, `claude-sonnet-4-6`, `claude-haiku-4-5`, `claude-3-7-sonnet-20250219`, `claude-3-5-haiku-20241022` |
| DeepSeek | `deepseek-v4-pro`, `deepseek-v4-flash`, `deepseek-chat`, `deepseek-reasoner` |
| Gemini | `gemini-3.1-pro-preview`, `gemini-3-pro-preview`, `gemini-3-flash-preview`, `gemini-2.5-pro`, `gemini-2.5-flash` |
| xAI | `grok-4.20-reasoning`, `grok-4.3`, `grok-code-fast-1` |
| Kimi / Moonshot | `kimi-k2.6`, `kimi-k2.5`, `kimi-k2-thinking`, `kimi-k2-thinking-turbo`, `kimi-k2-0905-preview`, `kimi-k2-turbo-preview`, `moonshot-v1-128k` |
| MiniMax | `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`, `MiniMax-M2.5`, `MiniMax-M2.1`, `MiniMax-M2` |
| GLM / Z.AI | `glm-5.1`, `glm-5`, `glm-5-turbo`, `glm-5v-turbo`, `glm-4.7`, `glm-4.6` |
| Custom | Any OpenAI-, OpenAI Responses-, Anthropic-, or Gemini-compatible endpoint |

> Preset model identifiers reflect what each provider advertises at the time of release. They are not guarantees of availability or quality — verify with your provider before use.

## 🧰 Commands

| Command | Description |
|---------|-------------|
| `Copilot2API: 打开模型管理器` | Open the sidebar model manager. |
| `Copilot2API: 设置服务商 API Key` | Store a provider-scoped API key. |
| `Copilot2API: 设置默认 API Key` | Store the fallback API key. |
| `Copilot2API: 清除默认 API Key` | Remove the fallback API key. |
| `Copilot2API: 打开设置` | Jump to the extension settings page. |
| `Copilot2API: 查看日志` | Open the extension output channel. |

## ⚙️ Model Parameters

Every model entry under `copilot2api.models` accepts the following fields:

- `id` *(required)* — model identifier sent to the provider.
- `displayName` — label shown in the Copilot Chat model picker.
- `provider` — provider key; controls which API key is used.
- `apiType` — `openai` *(default)*, `openai-responses`, `anthropic`, or `gemini`.
- `baseUrl` — per-model override of the provider Base URL.
- `family` — model family hint used by Copilot Chat for capability routing.
- `contextLength` — maximum context length in tokens.
- `maxOutputTokens` — maximum generation length.
- `vision` — set `true` for multi-modal models.
- `toolCalling` — set `true` to advertise tool-calling support.
- `configId` — distinguish multiple configs for the same model id.
- `temperature`, `topP` — sampling parameters.
- `reasoningEffort` — OpenAI reasoning effort: `minimal`, `low`, `medium`, `high`.
- `thinkingBudgetTokens` — Anthropic thinking budget.
- `headers` — extra HTTP headers merged into every request.
- `extra` — arbitrary key/value pairs merged into the request body.

Full data model and request flow: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 🔒 Privacy & Security

- API keys are persisted exclusively in [VS Code SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage).
- Requests go from your machine directly to the Base URL you configure.
- The extension collects no telemetry and bundles no analytics SDKs.
- See [`SECURITY.md`](SECURITY.md) for the security policy and disclosure process.

## 🤝 Contributing

Pull requests and issues are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a PR, and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

```bash
npm install
npm run check      # type-check + compile
npm run package    # produce a local .vsix
```

Press `F5` in VS Code to launch the Extension Development Host.

## 🙏 Acknowledgements

- [VS Code Language Model Chat Provider API](https://code.visualstudio.com/api/extension-guides/ai/language-model-chat-provider)
- Inspired by community OpenAI-compatible Copilot bridges, including [`huggingface/huggingface-vscode-chat`](https://github.com/huggingface/huggingface-vscode-chat) and [`JohnnyZ93/oai-compatible-copilot`](https://github.com/JohnnyZ93/oai-compatible-copilot).

## 📄 Support & License

- Report issues: <https://github.com/Equati0n/copilot2api/issues>
- License: [MIT](LICENSE) — Copyright © 2024–2026 Equati0n and Copilot2API contributors.

> This project is community-maintained and is not affiliated with Microsoft, GitHub, OpenAI, Anthropic, Google, or any other API provider it integrates with.
