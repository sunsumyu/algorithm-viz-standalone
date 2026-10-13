import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { SudokuCipherVisualizer, SUDOKU_CIPHER_TEMPLATE } from './sudoku-cipher-renderer';

describe('SudokuCipher (Sudoku Cipher Game)', () => {
  it('should instantiate SudokuCipherVisualizer properly', () => {
    const viz = new SudokuCipherVisualizer();
    expect(viz).toBeDefined();
    expect(SUDOKU_CIPHER_TEMPLATE).toContain('algo-sudoku-cipher-view');
    expect(SUDOKU_CIPHER_TEMPLATE).toContain('sudoku-canvas');
    expect(SUDOKU_CIPHER_TEMPLATE).toContain('sudoku-numpad-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(SudokuCipherVisualizer, {
      algorithmId: 'sudoku-cipher',
      viewId: 'algo-sudoku-cipher-view',
    });
  });
});
