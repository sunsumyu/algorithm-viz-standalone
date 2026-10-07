// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { BinaryGridCanvasAdapter } from './binary-grid-canvas-adapter';

describe('BinaryGridCanvasAdapter (二维网格通用视觉适配器测试)', () => {
  it('formatGridInput 统一以分号加空格分隔多行', () => {
    const grid = [
      [1, 1, 0],
      [0, 1, 0],
    ];
    expect(BinaryGridCanvasAdapter.formatGridInput(grid)).toBe('110; 010');
  });

  it('formatGridInput 空网格安全返回空字符串', () => {
    expect(BinaryGridCanvasAdapter.formatGridInput([])).toBe('');
  });

  it('renderGridCanvas 纯净生成 DOM 矩阵', () => {
    const container = document.createElement('div');
    BinaryGridCanvasAdapter.renderGridCanvas(container, {
      rows: 2,
      cols: 2,
      getCell: (r, c) => ({
        text: r === c ? '1' : '0',
        bg: '#ffffff',
      }),
    });

    const gridEl = container.querySelector('.bga-grid-container');
    expect(gridEl).not.toBeNull();
    const cells = container.querySelectorAll('.bga-cell');
    expect(cells.length).toBe(4);
    expect(cells[0].textContent).toBe('1');
    expect(cells[1].textContent).toBe('0');
  });

  it('container 为空时不抛出异常', () => {
    expect(() => {
      BinaryGridCanvasAdapter.renderGridCanvas(null as any, {
        rows: 2,
        cols: 2,
        getCell: () => ({ text: '0' }),
      });
    }).not.toThrow();
  });
});
