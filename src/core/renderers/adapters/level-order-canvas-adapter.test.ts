// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { LevelOrderCanvasAdapter } from './level-order-canvas-adapter';

describe('LevelOrderCanvasAdapter (二叉树层序遍历视觉与指标看板适配器)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renderQueueBufferHtml 生成包含 FIFO 管道与各节点芯片的 HTML', () => {
    const html = LevelOrderCanvasAdapter.renderQueueBufferHtml([3, 9, 20]);
    expect(html).toContain('BFS 队列管道流');
    expect(html).toContain('当前大小: 3');
    expect(html).toContain('3');
    expect(html).toContain('9');
    expect(html).toContain('20');
  });

  it('renderStaticArrayBufferHtml 渲染连续数组槽位与 l/r 双指针徽标', () => {
    const html = LevelOrderCanvasAdapter.renderStaticArrayBufferHtml({
      array: [3, 9, 20, null],
      l: 0,
      r: 3,
      windowSize: 3,
    });
    expect(html).toContain('静态数组 queue[MAXN]');
    expect(html).toContain('size = r - l = 3 - 0 = 3');
    expect(html).toContain('l');
    expect(html).toContain('r');
  });

  it('renderHashMapBufferHtml 渲染 Node -> Level 映射列表', () => {
    const html = LevelOrderCanvasAdapter.renderHashMapBufferHtml({
      entries: [
        { nodeVal: 3, level: 0 },
        { nodeVal: 9, level: 1 },
      ],
      currentQueriedNode: 9,
      currentQueriedLevel: 1,
    });
    expect(html).toContain('HashMap&lt;TreeNode, Integer&gt;');
    expect(html).toContain('Node(3)');
    expect(html).toContain('L0');
    expect(html).toContain('Node(9)');
    expect(html).toContain('L1');
  });

  it('renderMetricsShell 正确组装缓冲区与已收集层序结果集 ans', () => {
    const bufferHtml = '<div id="test-buffer">BufferContent</div>';
    const step: any = {
      result: [[3], [9, 20]],
    };
    const html = LevelOrderCanvasAdapter.renderLevelOrderMetricsShell(step, bufferHtml);
    expect(html).toContain('BufferContent');
    expect(html).toContain('已收集层序结果集 ans');
    expect(html).toContain('第 0 层:');
    expect(html).toContain('[3]');
    expect(html).toContain('第 1 层:');
    expect(html).toContain('[9, 20]');
  });
});
