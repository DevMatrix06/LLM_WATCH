import Anthropic from '@anthropic-ai/sdk';
import { wrapAnthropic } from './src/index';

const client = wrapAnthropic(new Anthropic(), {
  apiKey:    'lw_llmwatch2026',
  endpoint:  'http://localhost:3001/ingest',
  projectId: 'test',
});

const prompts = [
  'What is the capital of France?',
  'Write a one-sentence poem about the moon.',
  'Name 3 programming languages released after 2000.',
];

for (const prompt of prompts) {
  const msg = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages:   [{ role: 'user', content: prompt }],
  });
  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  console.log(`Q: ${prompt}`);
  console.log(`A: ${text}\n`);
}
