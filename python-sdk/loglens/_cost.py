from typing import Dict, Tuple

# (input_price_per_million, output_price_per_million) in USD
_PRICES: Dict[str, Tuple[float, float]] = {
    # Claude 4
    'claude-opus-4':      (15.0,  75.0),
    'claude-sonnet-4':    (3.0,   15.0),
    'claude-haiku-4':     (0.8,    4.0),
    # Claude 3.5
    'claude-3-5-sonnet':  (3.0,   15.0),
    'claude-3-5-haiku':   (0.8,    4.0),
    # Claude 3
    'claude-3-opus':      (15.0,  75.0),
    'claude-3-sonnet':    (3.0,   15.0),
    'claude-3-haiku':     (0.25,   1.25),
    # GPT-4o
    'gpt-4o-mini':        (0.15,   0.6),
    'gpt-4o':             (2.5,   10.0),
    # GPT-4
    'gpt-4-turbo':        (10.0,  30.0),
    'gpt-4':              (30.0,  60.0),
    # GPT-3.5
    'gpt-3.5-turbo':      (0.5,    1.5),
    # o-series
    'o3-mini':            (1.1,    4.4),
    'o3':                 (10.0,  40.0),
    'o1-mini':            (3.0,   12.0),
    'o1':                 (15.0,  60.0),
}


def calc_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    model_lower = model.lower()
    for key, (inp, out) in _PRICES.items():
        if key in model_lower:
            return (input_tokens * inp + output_tokens * out) / 1_000_000
    return 0.0
