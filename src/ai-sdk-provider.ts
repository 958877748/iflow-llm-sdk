/*---------------------------------------------------------------------------------------------
 *  AI SDK Provider 导出
 *  提供类似 @ai-sdk/deepseek 的简洁使用方式
 *--------------------------------------------------------------------------------------------*/

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { IFlowCliAuth } from './auth/iflowCliAuth';

let authInstance: IFlowCliAuth | null = null;

function getAuth(): IFlowCliAuth {
  if (!authInstance) {
    authInstance = new IFlowCliAuth();
  }
  return authInstance;
}

/**
 * 创建 iFlow AI SDK Provider
 * 自动处理 OAuth 认证（通过 fetch 中间件）
 */
function createIFlowProvider() {
  const auth = getAuth();

  return createOpenAICompatible({
    name: 'iflow',
    baseURL: 'https://apis.iflow.cn/v1',
    includeUsage: true,
    // fetch 中间件：自动注入 OAuth 认证
    fetch: async (url, options) => {
      const apiKey = await auth.getApiKey();
      if (!apiKey) {
        throw new Error('iFlow 认证失败：请先运行 `iflow login`');
      }
      return fetch(url, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          'Authorization': `Bearer ${apiKey}`,
          'user-agent': 'iFlow-Cli',
        },
      });
    },
    // 请求体转换：为 glm-4.7 模型添加 chat_template_kwargs
    transformRequestBody: (args) => {
      if (args.model === 'glm-4.7') {
        return {
          ...args,
          chat_template_kwargs: {
            enable_thinking: false,
          },
        };
      }
      return args;
    },
  });
}

// 创建单例 provider 实例
const iflowProvider = createIFlowProvider();

/**
 * iFlow AI SDK Provider
 * 
 * @example
 * ```typescript
 * import { iflow } from 'iflow-llm-sdk';
 * import { generateText } from 'ai';
 * 
 * const { text } = await generateText({
 *   model: iflow('iFlow-ROME-30BA3B'),
 *   prompt: 'Write a vegetarian lasagna recipe for 4 people.',
 * });
 * ```
 */
export const iflow = iflowProvider;

/**
 * 重新创建 provider（用于刷新认证等场景）
 */
export function refreshIFlowProvider() {
  if (authInstance) {
    authInstance = null;
  }
  return createIFlowProvider();
}