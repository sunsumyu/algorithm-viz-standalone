// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { __testHooks } from './index';
import type { AlgorithmMetadata } from '../../core/registry';
import * as recentAlgosModule from '../../core/recent-algorithms';

describe('AlgorithmVizPlugin - Search & Recent Visits Integration', () => {
  const mockAlgorithms: AlgorithmMetadata[] = [
    {
      id: 'balanced-binary-tree',
      name: '判断平衡二叉树 (Class 037)',
      viewId: 'view-balanced-binary-tree',
      category: 'tree',
      description: '二叉树递归套路',
      difficulty: 1,
      icon: '🌲',
      levelOrder: 1,
    },
    {
      id: 'symmetric-tree',
      name: '对称二叉树',
      viewId: 'view-symmetric-tree',
      category: 'tree',
      description: '判断二叉树是否镜像对称',
      difficulty: 1,
      icon: '🌲',
      levelOrder: 2,
    },
    {
      id: 'pacific-atlantic-water-flow',
      name: '太平洋大西洋水流 (LC 417)',
      viewId: 'view-pacific-atlantic-water-flow',
      category: 'graph',
      description: '多源 BFS 逆向渗透',
      difficulty: 2,
      icon: '🌊',
      levelOrder: 1,
    },
    {
      id: 'two-sum',
      name: '两数之和',
      viewId: 'view-two-sum',
      category: 'array',
      description: '哈希表查差值',
      difficulty: 1,
      icon: '📊',
      levelOrder: 1,
    },
  ];

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="search-box" class="search-box">
        <input id="search-input" value="" />
        <button id="search-clear" class="search-clear"></button>
        <div id="search-history-dropdown" style="display: none;"></div>
      </div>
      <div id="sidebar-categories"></div>
      <div id="sidebar-recent-footer"></div>
      <div id="content-header">
        <h2 id="content-title">📊 数组 <span class="result-count" id="result-count"></span></h2>
      </div>
      <div id="cards-grid"></div>
    `;

    __testHooks.setAllAlgorithms(mockAlgorithms);
    __testHooks.setCurrentCategory('all');
    __testHooks.setSearchQuery('');

    // Mock recent algorithms
    vi.spyOn(recentAlgosModule, 'getRecentAlgorithmIds').mockReturnValue([
      'balanced-binary-tree',
      'symmetric-tree',
      'pacific-atlantic-water-flow',
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('在搜索状态下切换到最近访问分类时，应自动清空搜索输入框并成功加载全部最近访问记录', () => {
    const input = document.getElementById('search-input') as HTMLInputElement;
    const clearBtn = document.getElementById('search-clear') as HTMLButtonElement;
    const searchBox = document.getElementById('search-box') as HTMLDivElement;

    // 1. 模拟用户输入搜索词“平衡二”
    input.value = '平衡二';
    __testHooks.setSearchQuery('平衡二');
    clearBtn.classList.add('visible');
    searchBox.classList.add('has-value');

    expect(__testHooks.getSearchQuery()).toBe('平衡二');

    // 2. 模拟用户点击“最近访问”分类
    __testHooks.selectCategory('recent');

    // 3. 验证搜索状态已完全重置
    expect(__testHooks.getSearchQuery()).toBe('');
    expect(input.value).toBe('');
    expect(clearBtn.classList.contains('visible')).toBe(false);
    expect(searchBox.classList.contains('has-value')).toBe(false);

    // 4. 验证当前分类已正确切换为 recent
    expect(__testHooks.getCurrentCategory()).toBe('recent');

    // 5. 验证可见卡片网格包含了全部 3 个最近访问算法（而非仅过滤出 1 个平衡二叉树）
    const visibleCards = __testHooks.getVisibleCards();
    expect(visibleCards.length).toBe(3);
    expect(visibleCards.map((c) => c.id)).toEqual([
      'balanced-binary-tree',
      'symmetric-tree',
      'pacific-atlantic-water-flow',
    ]);
  });

  it('在搜索状态下切换到其他分类（如全部算法或树）时，也应清空搜索状态', () => {
    const input = document.getElementById('search-input') as HTMLInputElement;
    input.value = '二叉树';
    __testHooks.setSearchQuery('二叉树');

    __testHooks.selectCategory('tree');

    expect(__testHooks.getSearchQuery()).toBe('');
    expect(input.value).toBe('');
    expect(__testHooks.getCurrentCategory()).toBe('tree');

    const visibleCards = __testHooks.getVisibleCards();
    expect(visibleCards.length).toBe(2);
    expect(visibleCards.every((c) => c.category === 'tree')).toBe(true);
  });

  it('updateContentHeader 连续调用多次不会破坏 result-count 节点，且标题和计数均准确渲染', () => {
    const titleEl = document.getElementById('content-title') as HTMLElement;

    // 第一次调用：全部算法
    __testHooks.setCurrentCategory('all');
    __testHooks.setSearchQuery('');
    __testHooks.updateContentHeader();
    expect(titleEl.innerHTML).toContain('全部算法');
    expect(titleEl.innerHTML).toContain('(4 个)');
    expect(document.getElementById('result-count')?.textContent).toBe('(4 个)');

    // 第二次调用：搜索状态
    __testHooks.setSearchQuery('平衡');
    __testHooks.updateContentHeader();
    expect(titleEl.innerHTML).toContain('🔍 搜索结果');
    expect(titleEl.innerHTML).toContain('(1 个匹配)');
    expect(document.getElementById('result-count')?.textContent).toBe('(1 个匹配)');

    // 第三次调用：切换到最近访问
    __testHooks.setSearchQuery('');
    __testHooks.setCurrentCategory('recent');
    __testHooks.updateContentHeader();
    expect(titleEl.innerHTML).toContain('🕒 最近访问');
    expect(titleEl.innerHTML).toContain('(3 个记录)');
    expect(document.getElementById('result-count')?.textContent).toBe('(3 个记录)');

    // 第四次调用：切换到特定分类
    __testHooks.setCurrentCategory('tree');
    __testHooks.updateContentHeader();
    expect(titleEl.innerHTML).toContain('二叉树');
    expect(titleEl.innerHTML).toContain('(2 关)');
    expect(document.getElementById('result-count')?.textContent).toBe('(2 关)');
  });
});
