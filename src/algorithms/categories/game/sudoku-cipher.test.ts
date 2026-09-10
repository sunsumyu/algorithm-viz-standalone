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
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new SudokuCipherVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'sudoku-cipher',
      viewId: 'algo-sudoku-cipher-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
