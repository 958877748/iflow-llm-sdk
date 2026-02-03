/**---------------------------------------------------------------------------------------------
 *  简洁使用示例
 *  类似 @ai-sdk/deepseek 的使用方式
 *--------------------------------------------------------------------------------------------*/

import { iflow } from './src/index';
import { generateText, streamText } from 'ai';

// === 非流式调用 ===
async function exampleGenerateText() {
  const { text, usage } = await generateText({
    model: iflow('iFlow-ROME-30BA3B'),
    prompt: '写一个快速排序算法的 Python 实现',
  });

  console.log('回复:', text);
  console.log('Token 使用:', usage);
}

// === 流式调用 ===
async function exampleStreamText() {
  const { textStream } = await streamText({
    model: iflow('iFlow-ROME-30BA3B'),
    prompt: '介绍 JavaScript 的闭包概念',
  });

  for await (const chunk of textStream) {
    process.stdout.write(chunk);
  }
}

// === 带自定义选项 ===
async function exampleWithOptions() {
  const { text } = await generateText({
    model: iflow('iFlow-ROME-30BA3B'),
    prompt: '1+1等于几？',
    providerOptions: {
      iflow: {
        chat_template_kwargs: {
          enable_thinking: false
        }
      }
    },
  });

  console.log(text);
}

// 运行示例
exampleGenerateText().then(() => {
  console.log('\n=== 完成 ===');
});