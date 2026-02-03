/*---------------------------------------------------------------------------------------------
 *  AI SDK 集成测试
 *  使用 fetch 中间件自动处理 iFlow OAuth 认证
 *--------------------------------------------------------------------------------------------*/

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, streamText } from 'ai';
import { IFlowCliAuth } from './src/auth/iflowCliAuth';

// 创建 iFlow 认证实例
const auth = new IFlowCliAuth();

// 创建自定义 fetch 中间件
const iflowFetch = async (url: RequestInfo, options?: RequestInit) => {
  console.log('[fetch 中间件] 拦截请求...');
  console.log('[fetch 中间件] URL:', url);

  // 1. 获取 apiKey（自动处理 OAuth 凭证、刷新、缓存）
  const apiKey = await auth.getApiKey();

  if (!apiKey) {
    throw new Error('无法获取 iFlow API Key，请先运行 iflow login');
  }

  console.log('[fetch 中间件] 已获取 apiKey，正在注入 Authorization 头...');

  // 2. 添加 Authorization 头
  const headers = {
    ...options?.headers,
    'Authorization': `Bearer ${apiKey}`
  };

  console.log('[fetch 中间件] 请求头:', JSON.stringify(headers, null, 2));
  if (options?.body) {
    console.log('[fetch 中间件] 请求体:', options.body);
  }

  // 3. 转发请求并记录响应
  const response = await fetch(url, { ...options, headers });

  console.log('[fetch 中间件] 响应状态:', response.status, response.statusText);

  // 克隆响应以便读取和转发
  const clonedResponse = response.clone();
  const responseText = await clonedResponse.text();
  console.log('[fetch 中间件] 响应内容:', responseText.substring(0, 500));

  return response;
};

// 创建 provider（不设置 apiKey，由 fetch 中间件注入）
const iflowProvider = createOpenAICompatible({
  name: 'iflow',
  baseURL: 'https://apis.iflow.cn/v1',
  fetch: iflowFetch,  // 注入自定义 fetch 中间件
  includeUsage: true,
});

async function testGenerateText(): Promise<void> {
  console.log('\n=== 测试 generateText (非流式) ===\n');

  const { text, usage } = await generateText({
    model: iflowProvider('iFlow-ROME-30BA3B'),
    prompt: '用一句话介绍快速排序算法',
  });

  console.log('回复:', text);
  console.log('Token 使用:', usage);
}

async function testStreamText(): Promise<void> {
  console.log('\n=== 测试 streamText (流式) ===\n');

  const { textStream } = await streamText({
    model: iflowProvider('iFlow-ROME-30BA3B'),
    prompt: '写一个冒泡排序的 JavaScript 代码',
  });

  process.stdout.write('回复: ');
  for await (const chunk of textStream) {
    process.stdout.write(chunk);
  }
  process.stdout.write('\n');
}

async function testProviderOptions(): Promise<void> {
  console.log('\n=== 测试 providerOptions (自定义选项) ===\n');

  const { text } = await generateText({
    model: iflowProvider('iFlow-ROME-30BA3B'),
    prompt: '1+1等于几？',
    providerOptions: {
      iflow: {
        chat_template_kwargs: {
          enable_thinking: false
        }
      }
    },
  });

  console.log('回复:', text);
}

async function testMultipleRequests(): Promise<void> {
  console.log('\n=== 测试多次请求（验证 apiKey 缓存） ===\n');

  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- 请求 ${i} ---`);
    const { text } = await generateText({
      model: iflowProvider('iFlow-ROME-30BA3B'),
      prompt: `这是第 ${i} 次请求，请回复 "收到第${i}次"`,
    });
    console.log('回复:', text);
  }
}

async function main(): Promise<void> {
  try {
    console.log('开始运行测试...');

    // 运行所有测试
    await testGenerateText();
    await testStreamText();
    await testProviderOptions();
    await testMultipleRequests();

    console.log('\n=== 所有测试完成 ===');
  } catch (error) {
    console.error('测试失败:');
    console.error('错误消息:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('堆栈跟踪:', error.stack);
    }
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}