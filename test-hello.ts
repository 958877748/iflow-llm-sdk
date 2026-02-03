/**---------------------------------------------------------------------------------------------
 *  简单测试：调用 LLM 说 hello
 *--------------------------------------------------------------------------------------------*/

import { createIFlowClient } from './src/index';

async function main() {
    try {
        console.log('正在初始化 iFlow 客户端...');
        const client = await createIFlowClient();

        console.log('发送请求: "说句hello"');
        const response = await client.chat([
            { role: 'user', content: '说句hello' }
        ], {
            model: 'glm-4.7',
            stream: false,
            extraBody: {
                chat_template_kwargs: {
                    enable_thinking: false
                }
            }
        });

        console.log('\n完整响应对象:');
        console.log(JSON.stringify(response, null, 2));

        if ('choices' in response && response.choices.length > 0) {
            console.log('\nAI 回复:');
            console.log(response.choices[0].message?.content);
        }
    } catch (error) {
        console.error('错误:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();