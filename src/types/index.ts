/**
 * OAuth 凭证类型
 */
export interface OAuthCredentials {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
}

/**
 * iFlow 特有凭证（包含 apiKey）
 */
export interface IFlowOAuthCredentials extends OAuthCredentials {
    apiKey: string;
}

/**
 * CLI 认证配置
 */
export interface CliAuthConfig {
    name: string;
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    credentialPathPattern: string;
    cliCommand: string;
}

/**
 * LLM 聊天消息
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * 聊天选项
 */
export interface ChatOptions {
    model?: string;
    stream?: boolean;
    temperature?: number;
    maxTokens?: number;
    extraBody?: Record<string, unknown>;
}

/**
 * 日志级别
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

/**
 * 日志接口
 */
export interface Logger {
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
