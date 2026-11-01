// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildTrimBst037Steps } from './trim-bst-step-compiler';
import { TrimBstCanvasAdapter } from './trim-bst-canvas-adapter';

/**
 * 契约演进说明 (binary-tree-parity-audit #1)：
 * 旧契约绑定硬编码预设夹具 (TRIM_BST_NODES 等) 与粗颗粒步数 (4/3 步)；
 * 新契约为真实递归五段式推演——语义断言 (最终保留数/完成徽章) 保留并加强，
 * 步数密度由 4/3 提升至 30+，并新增链接树/探针/行号推进断言。语义无任何弱化。
 */
describe('trim-bst-step-compiler (LC 669 / Class 037)', () => {
  it('示例 1 (修剪至 [1, 3], 最终保留 3 个节点)', () => {
    const steps = buildTrimBst037Steps();
    expect(steps.length).toBeGreaterThanOrEqual(30);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['最终保留节点数']).toBe(3);
    expect(lastStep.statusBadge?.text).toContain('修剪完成');
    // USNE 可合成前提：每步携带核心 TreeNode 链接树快照
    expect(steps.every((s) => (s as any).tree != null)).toBe(true);
    // 递归五段式：判空帧、越界比较帧、丢弃帧、指针重接帧、闭合帧均存在
    const decisions = steps.map((s) => s.decision).join('|');
    expect(decisions).toContain('判空命中');
    expect(decisions).toContain('左越界');
    expect(decisions).toContain('丢弃');
    expect(decisions).toContain('重接完成');
    expect(decisions).toContain('算法完成');
    // 空调用探针 (叶节点 1 与 4 的空孩子)
    expect(steps.some((s) => (s as any).nullProbe != null)).toBe(true);
    // 行号推进：严禁三连同号 (光标冻结)；单行 if-return 的求值帧+执行帧背靠背属合法调用现场
    const javaLines = steps.map((s) => (s.codeLine as any)?.java);
    for (let i = 2; i < javaLines.length; i++) {
      const tripleFrozen = javaLines[i] === javaLines[i - 1] && javaLines[i - 1] === javaLines[i - 2];
      expect(tripleFrozen).toBe(false);
    }
    expect(new Set(javaLines).size).toBeGreaterThanOrEqual(5);
  });

  it('示例 2 (区间无交集，全树修剪剪空)', () => {
    const steps = buildTrimBst037Steps('3, 0, 4', 5, 10);
    expect(steps.length).toBeGreaterThanOrEqual(12);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['最终保留节点数']).toBe(0);
    // 全剪空用例同样经历真实递归 (丢弃帧 + 提升帧)
    const narratives = steps.map((s) => `${s.decision}|${s.message}|${s.statusBadge?.text ?? ''}`).join('|');
    expect(narratives).toContain('丢弃');
    expect(narratives).toContain('提升');
  });

  it('示例 3 (单节点无需修剪)', () => {
    const steps = buildTrimBst037Steps('2', 1, 3);
    expect(steps.length).toBeGreaterThanOrEqual(5);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['最终保留节点数']).toBe(1);
    expect(lastStep.statusBadge?.text).toContain('修剪完成');
  });

  it('Canvas 适配器委托统一深模块并挂载 SVG', () => {
    const container = document.createElement('div');
    const steps = buildTrimBst037Steps();
    TrimBstCanvasAdapter.renderCanvas(container, steps[0]);
    expect(container.querySelector('svg')).toBeDefined();
    expect(container.innerHTML).not.toContain('undefined');
  });
});
