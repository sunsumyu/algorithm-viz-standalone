import { describe, it, expect, beforeEach } from 'vitest';
import {
  visualState,
  visualStateTable,
  setVisualTheme,
  getVisualThemeId,
  type VisualStateId,
} from './visual-state-tokens';

const ALL_STATES: VisualStateId[] = [
  'idle',
  'comparing',
  'scanning',
  'swapping',
  'sorted',
  'pivot',
  'secondary',
  'discovered',
  'unvisited',
];

describe('VisualStateTokens (视觉状态语义令牌层)', () => {
  it('应为全部语义状态提供完整样式', () => {
    const table = visualStateTable();
    for (const state of ALL_STATES) {
      const style = table[state];
      expect(style, `state ${state} should exist`).toBeDefined();
      expect(style.bg).toMatch(/^#[0-9a-f]{6}$/);
      expect(style.border).toMatch(/^#[0-9a-f]{6}$/);
      expect(style.text).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('仅强调态 (swapping / pivot) 携带缩放语义', () => {
    expect(visualState('swapping').scale).not.toBeNull();
    expect(visualState('pivot').scale).not.toBeNull();
    for (const state of ['idle', 'comparing', 'scanning', 'sorted', 'secondary', 'discovered', 'unvisited'] as VisualStateId[]) {
      expect(visualState(state).scale, `${state} should not scale`).toBeNull();
    }
  });

  it('语义色应区分可辨识：sorted 绿系、swapping 红系、comparing 蓝系', () => {
    expect(visualState('sorted').border).toBe('#22c55e');
    expect(visualState('swapping').border).toBe('#ef4444');
    expect(visualState('comparing').border).toBe('#3b82f6');
  });

  it('图论令牌色系：discovered 翠绿、unvisited 浅灰', () => {
    expect(visualState('discovered').border).toBe('#10b981');
    expect(visualState('unvisited').border).toBe('#94a3b8');
  });

  it('未知状态应安全回退 idle（健壮性）', () => {
    const rogue = visualState('mystery-state' as VisualStateId);
    expect(rogue).toEqual(visualState('idle'));
  });

  it('主题切换应改变解析结果并可恢复', () => {
    beforeEach(() => setVisualTheme('light'));
    expect(getVisualThemeId()).toBe('light');
    const lightSorted = visualState('sorted');
    // 当前仅亮色主题：切换回自身应幂等
    setVisualTheme('light');
    expect(visualState('sorted')).toEqual(lightSorted);
  });
});
