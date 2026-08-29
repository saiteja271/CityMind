# Citizen AI

Citizens use an explainable utility-based decision system.

## Decision Pipeline

1. **Critical needs** override (energy < 10, hunger > 90, health < 15)
2. **Schedule** provides preferred activity for current hour
3. **Action generation** scores available actions (work, sleep, eat, shop, socialize, seek job/home)
4. **Utility scoring** combines base priority, personality traits, distance, wealth
5. **Best action** selected; decision logged with alternatives
6. **Execution** pathfinds to target or applies activity locally

## Personality

Traits (ambitious, social, lazy, etc.) and continuous values (ambition, sociability, riskTolerance, workEthic) modify utilities.

## Memory

Citizens store recent events (birth, job change) and decision logs for debugging and advisor explanations.
