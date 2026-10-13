import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { PalindromeNinjaVisualizer, PALINDROME_NINJA_TEMPLATE } from './palindrome-ninja-renderer';

describe('PalindromeNinja (Palindrome Ninja Game)', () => {
  it('should instantiate PalindromeNinjaVisualizer properly', () => {
    const viz = new PalindromeNinjaVisualizer();
    expect(viz).toBeDefined();
    expect(PALINDROME_NINJA_TEMPLATE).toContain('algo-palindrome-ninja-view');
    expect(PALINDROME_NINJA_TEMPLATE).toContain('ninja-canvas');
    expect(PALINDROME_NINJA_TEMPLATE).toContain('ninja-preset-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(PalindromeNinjaVisualizer, {
      algorithmId: 'palindrome-ninja',
      viewId: 'algo-palindrome-ninja-view',
    });
  });
});
