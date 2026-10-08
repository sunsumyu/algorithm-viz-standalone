import { describe, it, expect } from 'vitest';
import { DomainViewPresentationResolver } from './domain-view-presentation-resolver';

describe('DomainViewPresentationResolver', () => {
  it('正确解析图论算法的沙盘标题与 Tab 属性', () => {
    const meta = DomainViewPresentationResolver.resolve({
      id: 'bellman-ford',
      category: 'graph',
      name: 'Bellman-Ford 算法',
    });

    expect(meta.primaryTabLabel).toBe('图拓扑沙盘');
    expect(meta.primaryTabIcon).toBe('fa-circle-nodes');
    expect(meta.deductionTabLabel).toBe('全景推演树');
    expect(meta.deductionTabIcon).toBe('fa-diagram-project');
    expect(meta.card1TitleHtml).toContain('fa-circle-nodes');
    expect(meta.card1TitleHtml).toContain('图拓扑沙盘');
  });

  it('正确解析树形算法的沙盘标题与 Tab 属性', () => {
    const meta = DomainViewPresentationResolver.resolve({
      id: 'binary-tree-cameras',
      category: 'tree',
      name: '监控二叉树',
    });

    expect(meta.primaryTabLabel).toBe('树形拓扑');
    expect(meta.primaryTabIcon).toBe('fa-network-wired');
    expect(meta.card1TitleHtml).toContain('fa-network-wired');
  });

  it('正确解析网格 DP 问题的沙盘标题与 Tab 属性', () => {
    const meta = DomainViewPresentationResolver.resolve({
      id: 'unique-paths',
      category: 'dynamic-programming',
      name: '不同路径',
    });

    expect(meta.primaryTabLabel).toBe('二维网格');
    expect(meta.primaryTabIcon).toBe('fa-table-cells');
    expect(meta.card1TitleHtml).toContain('fa-table-cells');
  });

  it('显式配置的 card1Title 优先保留其内容并规整图标', () => {
    const meta = DomainViewPresentationResolver.resolve({
      id: 'custom-algo',
      category: 'custom',
      card1Title: '自定义专用沙盘',
    });

    expect(meta.card1TitleHtml).toBe('自定义专用沙盘');
    expect(meta.primaryTabLabel).toBe('执行沙盘');
    expect(meta.primaryTabIcon).toBe('fa-cube');
  });

  it('即使 category 为 graph，网格图算法 (如 islands) 也必须正确解析为二维网格沙盘', () => {
    const meta = DomainViewPresentationResolver.resolve({
      id: 'islands',
      category: 'graph',
      name: '岛屿数量',
    });

    expect(meta.primaryTabLabel).toBe('二维网格');
    expect(meta.primaryTabIcon).toBe('fa-table-cells');
    expect(meta.card1TitleHtml).toContain('fa-table-cells');
    expect(meta.card1TitleHtml).toContain('二维网格沙盘');
    expect(meta.card1TitleHtml).not.toContain('图拓扑沙盘与松弛流');
  });
});
