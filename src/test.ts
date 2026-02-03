/*---------------------------------------------------------------------------------------------
 *  测试示例
 *  展示如何使用 iFlow LLM SDK
 *--------------------------------------------------------------------------------------------*/

import { createIFlowClient, IFlowClient } from './index';

async function testChatComplete(): Promise<void> {
    console.log('=== 测试非流式聊天 ===\n');

    const client = await createIFlowClient();

    const response = await client.chatComplete(
        [
            { role: 'system', content: '你是一个有帮助的助手' },
            { role: 'user', content: '你好，请用一句话介绍自己' }
        ],
        { model: 'glm-4.7' }
    );

    console.log('回复:', response);
}

async function testChatStream(): Promise<void> {
    console.log('\n=== 测试流式聊天 ===\n');

    const client = new IFlowClient();
    await client.init();

    const stream = client.chatStream([
        { role: 'user', content: '写个快速排序的 JavaScript 代码' }
    ], { model: 'glm-4.7' });

    process.stdout.write('回复: ');
    for await (const chunk of stream) {
        process.stdout.write(chunk);
    }
    process.stdout.write('\n');
}

async function testRawOpenAI(): Promise<void> {
    console.log('\n=== 测试原始 OpenAI SDK 接口 ===\n');

    const client = await createIFlowClient();

    const response = await client.chat(
        [
            { role: 'user', content: '1+1等于几？' }
        ],
        { model: 'glm-4.7', stream: false }
    );

    if ('choices' in response) {
        console.log('完整响应:', JSON.stringify(response, null, 2));
    }
}

async function main(): Promise<void> {
    try {
        // 运行测试
        await testChatComplete();
        await testChatStream();
        await testRawOpenAI();

        console.log('\n=== 所有测试完成 ===');
    } catch (error) {
        console.error('测试失败:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}
