/*---------------------------------------------------------------------------------------------
 *  iFlow LLM 客户端
 *  使用 OpenAI SDK 调用 iFlow API
 *--------------------------------------------------------------------------------------------*/

import OpenAI from 'openai';
import { IFlowCliAuth } from '../auth/iflowCliAuth';
import type { ChatMessage, ChatOptions, Logger } from '../types';

export class IFlowClient {
    private auth: IFlowCliAuth;
    private openai: OpenAI | null = null;
    private logger: Logger;
    private apiKey: string | null = null;

    constructor(logger?: Logger) {
        this.logger = logger || {
            trace: () => { },
            debug: console.debug,
            info: console.info,
            warn: console.warn,
            error: console.error
        };
        this.auth = new IFlowCliAuth(this.logger);
    }

    /**
     * 初始化客户端（获取 API Key）
     * @param forceRefresh 是否强制刷新凭证
     */
    async init(forceRefresh = false): Promise<void> {
        this.apiKey = await this.auth.getApiKey(forceRefresh);
        if (!this.apiKey) {
            throw new Error(
                '无法获取 iFlow API Key，请确保已安装 iFlow CLI 并已登录:\n' +
                '  npm install -g @iflow-ai/iflow-cli@latest\n' +
                '  iflow login'
            );
        }
        this.openai = new OpenAI({
            apiKey: this.apiKey,
            baseURL: 'https://apis.iflow.cn/v1',
            defaultHeaders: {
                'User-Agent': 'iFlow-Cli'
            }
        });
        this.logger.info('[iFlowClient] 客户端初始化成功');
    }

    /**
     * 检查是否已初始化
     */
    isInitialized(): boolean {
        return this.openai !== null;
    }

    /**
     * 发送聊天请求
     * @param messages 聊天消息数组
     * @param options 聊天选项
     * @returns OpenAI SDK 返回的 completion 对象
     */
    async chat(
        messages: ChatMessage[],
        options: ChatOptions = {}
    ): Promise<OpenAI.Chat.Completions.ChatCompletion | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
        if (!this.openai) {
            await this.init();
        }

        const model = options.model || 'glm-4.7';
        const stream = options.stream ?? true;

        this.logger.debug(`[iFlowClient] 发送请求，模型: ${model}, 流式: ${stream}`);

        const requestConfig: any = {
            model,
            messages: messages as any,
            stream,
            temperature: options.temperature,
            max_tokens: options.maxTokens
        };

        // 添加 extraBody 参数（用于 iFlow 特殊参数如 chat_template_kwargs）
        if (options.extraBody) {
            Object.assign(requestConfig, options.extraBody);
        }

        const response = await this.openai!.chat.completions.create(requestConfig);

        return response;
    }

    /**
     * 流式聊天（简化版，直接返回字符串流）
     * @param messages 聊天消息数组
     * @param options 聊天选项
     */
    async *chatStream(
        messages: ChatMessage[],
        options: Omit<ChatOptions, 'stream'> = {}
    ): AsyncGenerator<string, void, unknown> {
        const response = await this.chat(messages, { ...options, stream: true });

        if (Symbol.asyncIterator in response) {
            for await (const chunk of response as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    yield content;
                }
            }
        }
    }

    /**
     * 非流式聊天（简化版，直接返回完整回复）
     * @param messages 聊天消息数组
     * @param options 聊天选项
     */
    async chatComplete(
        messages: ChatMessage[],
        options: Omit<ChatOptions, 'stream'> = {}
    ): Promise<string> {
        const response = await this.chat(messages, { ...options, stream: false });

        if ('choices' in response) {
            return response.choices[0]?.message?.content || '';
        }
        return '';
    }

    /**
     * 强制刷新认证凭证
     */
    async refreshAuth(): Promise<void> {
        await this.init(true);
    }

    /**
     * 获取当前使用的 API Key（调试用）
     */
    getApiKey(): string | null {
        return this.apiKey;
    }
}

/**
 * 创建 iFlow 客户端的便捷函数
 * @param logger 可选的日志记录器
 */
export async function createIFlowClient(logger?: Logger): Promise<IFlowClient> {
    const client = new IFlowClient(logger);
    await client.init();
    return client;
}
