<div align="center">

<img src="media/icon.png" alt="Copilot2API logo" width="128" height="128">

# Copilot2API

将任意兼容 OpenAI / OpenAI Responses / Anthropic / Gemini 协议的模型接入 GitHub Copilot Chat 模型选择器。

[English](README.md) | 简体中文

[![CI](https://github.com/Equati0n/copilot2api/actions/workflows/ci.yml/badge.svg)](https://github.com/Equati0n/copilot2api/actions/workflows/ci.yml)
[![Release](https://github.com/Equati0n/copilot2api/actions/workflows/publish.yml/badge.svg)](https://github.com/Equati0n/copilot2api/actions/workflows/publish.yml)
[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/Equati0n.copilot2api?style=flat-square&label=Marketplace&logo=visualstudiocode&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=Equati0n.copilot2api)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea043?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## ✨ 功能特性

- **多协议支持**：在同一扩展中同时支持 OpenAI Chat Completions、OpenAI Responses、Anthropic Messages、Google Gemini 协议。
- **可视化配置 UI**：在 Activity Bar 中管理服务商、API Key 与允许出现在模型选择器中的模型，无需手工修改 JSON。
- **模型自动发现**：通过 `/models`（或各服务商等效接口）抓取模型列表，并自动推断上下文长度、视觉与工具调用能力。
- **Token 用量与自动压缩**：实时读取后端返回的 usage（无 usage 时本地估算）并以 `LanguageModelDataPart('usage')` 上报给 Copilot UI，触发其内置的上下文自动压缩。预设上下文长度已按稳定性需要收紧为安全值（例如 OpenAI/Gemini/Claude/Grok/DeepSeek 类 1M 预设统一降为 400K，200K 类降为 160K），可在设置中翻覆。
- **连通性探测**：对选定的测试模型发送最小请求，并在侧边栏中显示往返时延。
- **推理参数**：原生支持 OpenAI `reasoning.effort` 与 Anthropic `thinking.budget_tokens`。
- **流式工具调用**：同时解析标准 `tool_calls` 与部分兼容服务商输出的文本形态 `<tool_call>`。
- **视觉代理**：当所选模型不支持视觉而消息包含图片时，自动通过同服务商的视觉模型代发。
- **仅写入 SecretStorage**：API Key 不会落入 `settings.json`、工作区状态或日志。
- **零遥测**：不内置任何分析 SDK，请求直接由本机发送至你配置的 Base URL。

## 📦 环境要求

- VS Code **1.116** 或更高版本
- 已安装并登录 GitHub Copilot Chat
- 任意兼容 OpenAI / OpenAI Responses / Anthropic / Gemini 协议的 API 端点
- Node.js **20+**（仅开发需要）

## ⚡ 快速开始

1. 从 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Equati0n.copilot2api) 安装 **Copilot2API**（或下载每个 [GitHub Release](https://github.com/Equati0n/copilot2api/releases) 附带的 `.vsix`）。
2. 在 Activity Bar 中打开 **Copilot2API** 视图，点击 **新建供应商**。
3. 选择内置预设（OpenAI、Anthropic、DeepSeek、Gemini、xAI、Kimi、MiniMax、GLM……）或填入自定义 Base URL。
4. 粘贴 API Key —— 它会被写入 VS Code SecretStorage。
5. 点击 **获取模型列表**，勾选要在 Copilot Chat 中暴露的模型。
6. 打开 Copilot Chat 模型选择器，切换到所配置的模型。

## ✨ 可视化配置 UI

可视化配置面板位于 Activity Bar：

- **打开方式**：点击 Copilot2API 图标，或在命令面板中执行 **Copilot2API: 打开模型管理器**。
- **创建 / 编辑 / 删除** 服务商，全程留在侧边栏中。
- **测试连通性**：对所选模型发起一次轻量请求，并显示往返时延。
- **管理允许模型**：通过复选框启停模型，并按需覆盖显示名、上下文长度、视觉、工具调用、推理、自定义请求头与额外 body 字段。

## ✨ 多协议模式

每个服务商通过 `apiType` 声明所使用的协议：

1. **`openai`** —— OpenAI Chat Completions
   - 端点：`POST {baseUrl}/chat/completions`
   - 鉴权头：`Authorization: Bearer <apiKey>`
   - 适用：OpenAI、DeepSeek、Moonshot、MiniMax、GLM、xAI 等兼容服务商。
2. **`openai-responses`** —— OpenAI Responses API
   - 端点：`POST {baseUrl}/responses`
   - 鉴权头：`Authorization: Bearer <apiKey>`
   - 适用：OpenAI Responses 及其兼容网关。
3. **`anthropic`** —— Anthropic Messages
   - 端点：`POST {baseUrl}/v1/messages`
   - 鉴权头：`x-api-key: <apiKey>`
   - 适用：Anthropic Claude。
4. **`gemini`** —— Google Generative Language
   - 端点：`POST {baseUrl}/v1beta/models/{model}:streamGenerateContent?alt=sse`
   - 鉴权头：`x-goog-api-key: <apiKey>`
   - 适用：Google Gemini 及其兼容网关。

## ✨ 多服务商指南

Copilot2API 可同时管理任意数量的服务商，每个服务商的 API Key 单独保存在 SecretStorage 的 `copilot2api.apiKey.<providerId>` 键下：

1. 为每个需要的服务商点击 **新建供应商**。
2. 在 Copilot Chat 模型选择器中自由切换 —— 密钥不会离开 SecretStorage。
3. 在命令面板执行 **Copilot2API: 设置服务商 API Key**，可在不修改 JSON 的情况下更新密钥。

## ✨ 内置服务商预设

预设仅提供合理的默认值（Base URL、family、上下文长度、视觉/工具标记），可随时覆盖或新增完全自定义的服务商。

| 服务商 | 内置预设 |
|--------|----------|
| OpenAI | `gpt-5.5-pro`、`gpt-5.5`、`gpt-5.4`、`gpt-5.4-mini`、`gpt-5.3-codex`、`gpt-5.3-codex-spark`、`gpt-5.2`、`gpt-5.2-codex`、`gpt-5.1`、`gpt-4.1`、`gpt-4o` |
| Anthropic | `claude-opus-4-7`、`claude-sonnet-4-6`、`claude-haiku-4-5`、`claude-3-7-sonnet-20250219`、`claude-3-5-haiku-20241022` |
| DeepSeek | `deepseek-v4-pro`、`deepseek-v4-flash`、`deepseek-chat`、`deepseek-reasoner` |
| Gemini | `gemini-3.1-pro-preview`、`gemini-3-pro-preview`、`gemini-3-flash-preview`、`gemini-2.5-pro`、`gemini-2.5-flash` |
| xAI | `grok-4.20-reasoning`、`grok-4.3`、`grok-code-fast-1` |
| Kimi / Moonshot | `kimi-k2.6`、`kimi-k2.5`、`kimi-k2-thinking`、`kimi-k2-thinking-turbo`、`kimi-k2-0905-preview`、`kimi-k2-turbo-preview`、`moonshot-v1-128k` |
| MiniMax | `MiniMax-M2.7`、`MiniMax-M2.7-highspeed`、`MiniMax-M2.5`、`MiniMax-M2.1`、`MiniMax-M2` |
| GLM / Z.AI | `glm-5.1`、`glm-5`、`glm-5-turbo`、`glm-5v-turbo`、`glm-4.7`、`glm-4.6` |
| 自定义 | 任意 OpenAI / OpenAI Responses / Anthropic / Gemini 协议端点 |

> 预设中的模型标识来源于各服务商对外宣称的模型名称，不代表当前可用性或质量，请以服务商实际接口为准。

## 🧰 命令

| 命令 | 说明 |
|------|------|
| `Copilot2API: 打开模型管理器` | 打开侧边栏模型管理器。 |
| `Copilot2API: 设置服务商 API Key` | 为单个服务商存入 API Key。 |
| `Copilot2API: 设置默认 API Key` | 设置回退的默认 API Key。 |
| `Copilot2API: 清除默认 API Key` | 删除默认 API Key。 |
| `Copilot2API: 打开设置` | 跳转至扩展设置。 |
| `Copilot2API: 查看日志` | 打开输出通道。 |

## ⚙️ 模型参数

`copilot2api.models` 中每个模型条目支持以下字段：

- `id` *(必填)* —— 发送给服务商的模型标识。
- `displayName` —— 在 Copilot Chat 模型选择器中的显示名。
- `provider` —— 服务商键，用于关联对应的 API Key。
- `apiType` —— `openai`（默认）、`openai-responses`、`anthropic` 或 `gemini`。
- `baseUrl` —— 单模型粒度的 Base URL 覆盖。
- `family` —— 提供给 Copilot Chat 的模型家族提示。
- `contextLength` —— 最大上下文长度（token）。
- `maxOutputTokens` —— 单次最大生成长度。
- `vision` —— 多模态模型设为 `true`。
- `toolCalling` —— 声明工具调用支持。
- `configId` —— 为同一模型 ID 定义多份配置时使用。
- `temperature`、`topP` —— 采样参数。
- `reasoningEffort` —— OpenAI 推理强度：`minimal` / `low` / `medium` / `high`。
- `thinkingBudgetTokens` —— Anthropic thinking 预算。
- `headers` —— 合并到每个请求的额外 HTTP 头。
- `extra` —— 合并到请求 body 的任意键值对。

完整数据结构与请求流程详见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

## 🔒 隐私与安全

- API Key 仅保存于 [VS Code SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)。
- 所有请求由本机直接发送至你配置的 Base URL。
- 扩展不采集任何遥测数据，也不内置分析 SDK。
- 安全策略与披露流程见 [`SECURITY.md`](SECURITY.md)。

## 🤝 参与贡献

欢迎通过 Issue / PR 参与改进。提交前请阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md)，并遵守 [行为准则](CODE_OF_CONDUCT.md)。

```bash
npm install
npm run check      # 类型检查 + 编译
npm run package    # 构建本地 .vsix
```

在 VS Code 中按 `F5` 可启动扩展开发宿主。

## 🙏 致谢

- [VS Code Language Model Chat Provider API](https://code.visualstudio.com/api/extension-guides/ai/language-model-chat-provider)
- 社区中的 OpenAI 兼容 Copilot 桥接项目，包括 [`huggingface/huggingface-vscode-chat`](https://github.com/huggingface/huggingface-vscode-chat) 与 [`JohnnyZ93/oai-compatible-copilot`](https://github.com/JohnnyZ93/oai-compatible-copilot)。

## 📄 支持与许可

- 问题反馈：<https://github.com/Equati0n/copilot2api/issues>
- 许可证：[MIT](LICENSE) —— Copyright © 2024–2026 Equati0n 与 Copilot2API 贡献者。

> 本项目由社区维护，与 Microsoft、GitHub、OpenAI、Anthropic、Google 及其集成的任何服务商均无隶属关系。
