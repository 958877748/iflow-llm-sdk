# iFlow LLM SDK

使用 iFlow CLI 认证调用 LLM API 的独立 SDK。

## 安装

```bash
npm install @guolei1994/iflow
```

## 前置要求

需要先安装 iFlow CLI 并登录：

```bash
npm install -g @iflow-ai/iflow-cli@latest
iflow login
```

## 使用方法

### 方式1: 简单使用（推荐）

```typescript
import { createIFlowClient } from '@guolei1994/iflow';

const client = await createIFlowClient();

// 非流式调用
const response = await client.chatComplete([
    { role: 'user', content: '你好' }
]);
console.log(response);
```

### 方式2: 流式输出

```typescript
import { IFlowClient } from '@guolei1994/iflow';

const client = new IFlowClient();
await client.init();

const stream = client.chatStream([
    { role: 'user', content: '写个快速排序' }
]);

for await (const chunk of stream) {
    process.stdout.write(chunk);
}
```

### 方式3: 原始 OpenAI SDK 接口

```typescript
import { IFlowClient } from '@guolei1994/iflow';

const client = new IFlowClient();
await client.init();

const response = await client.chat(
    [{ role: 'user', content: '1+1=?' }],
    { model: 'glm-4.7', stream: false }
);

// response 是 OpenAI SDK 返回的完整对象
console.log(response.choices[0].message.content);
```

### 方式4: AI SDK 集成（推荐用于 AI SDK 生态）

```typescript
import { iflow } from '@guolei1994/iflow';
import { generateText, streamText } from 'ai';

// 非流式调用
const { text } = await generateText({
  model: iflow('iFlow-ROME-30BA3B'),
  prompt: '写一个快速排序算法',
});

// 流式调用
const { textStream } = await streamText({
  model: iflow('iFlow-ROME-30BA3B'),
  prompt: '介绍 JavaScript 的闭包概念',
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

## 支持的模型

- `glm-4.7` - GLM-4.7 标准版
- `glm-4.7-thinking` - GLM-4.7 思考版
- `iFlow-ROME-30BA3B` - iFlow ROME 预览版

## API 参考

### `createIFlowClient(logger?: Logger)`

创建并初始化 iFlow 客户端的便捷函数。

### `IFlowClient`

主要客户端类。

#### 方法

- `init(forceRefresh?: boolean)` - 初始化客户端（自动获取 API Key）
- `chat(messages, options)` - 发送聊天请求（返回原始 OpenAI SDK 响应）
- `chatComplete(messages, options)` - 非流式聊天（返回字符串）
- `chatStream(messages, options)` - 流式聊天（返回异步生成器）
- `refreshAuth()` - 强制刷新认证凭证
- `isInitialized()` - 检查是否已初始化

#### 选项

```typescript
interface ChatOptions {
    model?: string;        // 模型 ID，默认 'glm-4.7'
    stream?: boolean;      // 是否流式输出，默认 true
    temperature?: number;  // 温度参数
    maxTokens?: number;    // 最大 token 数
}
```

## 认证机制

SDK 使用 iFlow CLI 的 OAuth 凭证：

1. 从 `~/.iflow/oauth_creds.json` 读取 OAuth 凭证
2. 自动检查 access_token 是否过期，过期则刷新
3. 使用 access_token 调用 `https://iflow.cn/api/oauth/getUserInfo` 获取 apiKey
4. 缓存 apiKey 2 小时，减少频繁请求
5. 使用 apiKey 调用 `https://apis.iflow.cn/v1` 的 OpenAI 兼容接口

## 自定义日志

```typescript
import { createIFlowClient } from '@guolei1994/iflow';

const logger = {
    trace: () => {},
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
};

const client = await createIFlowClient(logger);
```

## License

MIT
