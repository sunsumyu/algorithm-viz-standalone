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

  it('renderGridCanvas 纯净生成 DOM 矩阵并使用自适应尺度', () => {
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
    expect(cells[0].textContent?.trim()).toBe('1');
    expect(cells[1].textContent?.trim()).toBe('0');
  });

  it('computeAdaptiveMetrics 针对不同尺寸计算最佳自适应尺寸', () => {
    const small = BinaryGridCanvasAdapter.computeAdaptiveMetrics(3, 3);
    expect(small.cellSize).toBe('68px');

    const mid = BinaryGridCanvasAdapter.computeAdaptiveMetrics(4, 5);
    expect(mid.cellSize).toBe('56px');

    const big = BinaryGridCanvasAdapter.computeAdaptiveMetrics(10, 10);
    expect(big.cellSize).toBe('38px');
  });

  it('支持 variant=adventurer 风格配置：包含探险家小人、坐标标注与终点旗帜', () => {
    const container = document.createElement('div');
    BinaryGridCanvasAdapter.renderGridCanvas(container, {
      rows: 3,
      cols: 4,
      variant: 'adventurer',
      adventurer: { r: 0, c: 1, state: 'walking' },
      targetPos: [2, 3],
      riverBarrierText: true,
      getCell: (r, c) => ({
        text: '-',
      }),
    });

    // 探险家小人存在
    const adventurerHolder = container.querySelector('.adventurer-char-holder');
    expect(adventurerHolder).not.toBeNull();
    const svg = container.querySelector('svg.adventurer-char');
    expect(svg).not.toBeNull();

    // 终点旗帜存在
    expect(container.innerHTML).toContain('🏁');

    // 边界深水河流横条存在
    expect(container.innerHTML).toContain('边界深水河流 · 越界反弹');

    // 坐标标注存在
    expect(container.innerHTML).toContain('0,0');
    expect(container.innerHTML).toContain('2,3');
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
