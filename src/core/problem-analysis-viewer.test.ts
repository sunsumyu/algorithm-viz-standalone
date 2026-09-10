import { describe, it, expect, beforeEach } from 'vitest';
import { ProblemAnalysisViewer } from './problem-analysis-viewer';
import type { KeyPointsData, ProblemDetail } from './code-panel';

class MockHTMLElement {
  public tagName: string;
  public className = '';
  public innerHTML = '';
  private _textContent = '';
  public get textContent(): string {
    if (this.children.length > 0) {
      return this.children.map((c) => c.textContent).join('');
    }
    return this._textContent;
  }
  public set textContent(val: string) {
    this._textContent = val;
  }
  public style: Record<string, string> = {};
  public dataset: Record<string, string> = {};
  public children: MockHTMLElement[] = [];
  public parentElement: MockHTMLElement | null = null;
  public title = '';

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  appendChild<T extends MockHTMLElement>(child: T): T {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
}

(globalThis as any).document = {
  createElement: (tag: string) => new MockHTMLElement(tag),
};

describe('ProblemAnalysisViewer Deep Module Guard', () => {
  let container: any;

  beforeEach(() => {
    container = (globalThis as any).document.createElement('div');
  });

  it('should render key points with structured points correctly', () => {
    const kpData: KeyPointsData = {
      title: '5步动规法',
      summary: '分割等和子集解题思路',
      points: [
        { label: '状态定义', desc: 'dp[j] 表示容量为 j 时的最大和', icon: '📝', badge: '核心' },
        { label: '状态转移', desc: 'dp[j] = Math.max(dp[j], dp[j-num]+num)', icon: '🔄' }
      ]
    };

    ProblemAnalysisViewer.renderKeyPoints(container, kpData);
    expect(container.children.length).toBeGreaterThan(0);
    const card = container.children[0];
    expect(card.className).toBe('algo-kp-card');
  });

  it('should render problem detail with examples and constraints', () => {
    const problemDetail: ProblemDetail = {
      title: '0-1 背包问题',
      leetcodeId: 416,
      difficulty: 'medium',
      tags: ['动态规划', '背包'],
      description: '给你一个只包含正整数的非空数组 nums。',
      examples: [
        { input: 'nums = [1,5,11,5]', output: 'true', explanation: '数组可以分割成 [1, 5, 5] 和 [11]' }
      ],
      constraints: ['1 <= nums.length <= 200', '1 <= nums[i] <= 100']
    };

    ProblemAnalysisViewer.renderProblemDetail(container, problemDetail);
    expect(container.children.length).toBeGreaterThan(0);
    const card = container.children[0];
    expect(card.className).toBe('algo-problem-card');
  });
});
