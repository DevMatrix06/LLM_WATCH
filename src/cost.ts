interface Pricing {
  input: number;
  output: number;
}

// Prices in USD per 1M tokens
const PRICES: Record<string, Pricing> = {
  // Anthropic Claude 4.x
  'claude-opus-4-8':              { input: 15,    output: 75   },
  'claude-sonnet-4-6':            { input: 3,     output: 15   },
  'claude-haiku-4-5':             { input: 0.8,   output: 4    },
  'claude-haiku-4-5-20251001':    { input: 0.8,   output: 4    },
  // Anthropic Claude 3.x
  'claude-3-5-sonnet-20241022':   { input: 3,     output: 15   },
  'claude-3-5-sonnet-20240620':   { input: 3,     output: 15   },
  'claude-3-5-haiku-20241022':    { input: 0.8,   output: 4    },
  'claude-3-opus-20240229':       { input: 15,    output: 75   },
  'claude-3-sonnet-20240229':     { input: 3,     output: 15   },
  'claude-3-haiku-20240307':      { input: 0.25,  output: 1.25 },
  // OpenAI GPT-4o family
  'gpt-4o':                       { input: 2.5,   output: 10   },
  'gpt-4o-mini':                  { input: 0.15,  output: 0.6  },
  'gpt-4o-2024-11-20':            { input: 2.5,   output: 10   },
  'gpt-4o-2024-08-06':            { input: 2.5,   output: 10   },
  // OpenAI GPT-4 family
  'gpt-4-turbo':                  { input: 10,    output: 30   },
  'gpt-4-turbo-preview':          { input: 10,    output: 30   },
  'gpt-4':                        { input: 30,    output: 60   },
  // OpenAI GPT-3.5
  'gpt-3.5-turbo':                { input: 0.5,   output: 1.5  },
  // OpenAI o-series
  'o1':                           { input: 15,    output: 60   },
  'o1-mini':                      { input: 3,     output: 12   },
  'o3-mini':                      { input: 1.1,   output: 4.4  },
  'o3':                           { input: 10,    output: 40   },
};

export function calcCost(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICES[model];
  if (!p) return 0;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}
