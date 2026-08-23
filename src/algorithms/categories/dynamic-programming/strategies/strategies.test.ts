import { describe, it, expect } from 'vitest';
import { evolutionDispatcher, GridEvolutionStrategy, LinearEvolutionStrategy } from './index';

describe('EvolutionStrategyDispatcher', () => {
  it('dispatches grid-2d requests to GridEvolutionStrategy', () => {
    const strategy = evolutionDispatcher.findStrategy('grid-2d', 'unique-paths');
    expect(strategy).toBeInstanceOf(GridEvolutionStrategy);
  });

  it('dispatches fib-or-climb requests to LinearEvolutionStrategy', () => {
    const strategy = evolutionDispatcher.findStrategy('fib-or-climb', 'climb-stairs');
    expect(strategy).toBeInstanceOf(LinearEvolutionStrategy);
  });

  it('generates multi-language code templates with clean step lines', () => {
    const config = evolutionDispatcher.getCodeConfig({
      algoId: 'unique-paths',
      algoTitle: '不同路径',
      category: 'grid-2d',
      stage: 'space-optimized',
      baseLines: [],
    });

    expect(config.languages.java.length).toBeGreaterThan(5);
    expect(config.languages.python.length).toBeGreaterThan(5);
    expect(config.languages.cpp.length).toBeGreaterThan(5);
    expect(config.languages.javascript.length).toBeGreaterThan(5);
  });
});
