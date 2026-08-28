import { describe, it, expect, beforeEach } from 'vitest';
import { AnalysisKnowledgePresenter } from './analysis-knowledge-presenter';
import type { IYamlAlgorithmModel } from '../interfaces';

class MockElement {
  public innerHTML = '';
  public children: any[] = [];
  public textContent = '';
  public className = '';
  public parentElement: any = null;

  constructor(public tagName = 'div') {}

  public appendChild(child: any) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
}

(globalThis as any).document = {
  createElement: (tag: string) => new MockElement(tag)
};

describe('AnalysisKnowledgePresenter (解法题解与五步法知识流呈现深模块)', () => {
  let container: any;

  beforeEach(() => {
    container = new MockElement('div');
  });

  const mockModel = {
    id: 'unique-paths',
    name: '不同路径',
    category: '动态规划',
    difficulty: '中等',
    description: '一个机器人位于一个 m x n 网格的左上角。',
    problem: {
      title: '不同路径',
      leetcodeId: 62,
      difficulty: '中等',
      description: '一个机器人位于一个 m x n 网格的左上角。',
      tags: ['动态规划', '网格'],
      examples: [
        {
          input: 'm = 3, n = 7',
          output: '28',
          explanation: '从左上角到右下角共有 28 种不同路径。'
        }
      ],
      constraints: ['1 <= m, n <= 100']
    },
    analysis: {
      step1: { title: '1. 确定 dp 数组含义', content: 'dp[i][j] 表示到达 (i, j) 的路径数' },
      step2: { title: '2. 确定递推公式', content: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]' }
    },
    faqs: [
      { q: '起点如何初始化？', a: 'dp[0][0] = 1' }
    ],
    stages: {}
  } as unknown as IYamlAlgorithmModel;

  it('应该正确渲染题目描述与用例约束', () => {
    AnalysisKnowledgePresenter.renderProblemView(container as any, mockModel);
    expect(container.innerHTML).toContain('LeetCode 62. 不同路径');
    expect(container.innerHTML).toContain('中等');
    expect(container.innerHTML).toContain('示例用例');
    expect(container.innerHTML).toContain('m = 3, n = 7');
    expect(container.innerHTML).toContain('28');
    expect(container.innerHTML).toContain('提示与数据约束');
  });

  it('应该优先渲染 YAML 中自定义的 5 步递推法与 FAQs', () => {
    AnalysisKnowledgePresenter.renderAnalysisView(container as any, mockModel);
    expect(container.innerHTML).toContain('动态规划标准 5 步递推分析');
    expect(container.innerHTML).toContain('1. 确定 dp 数组含义');
    expect(container.innerHTML).toContain('dp[i][j] = dp[i-1][j] + dp[i][j-1]');
    expect(container.innerHTML).toContain('常见易错疑问与核心要点 (FAQs)');
    expect(container.innerHTML).toContain('起点如何初始化？');
  });

  it('针对未配置 analysis 的背包模型，应智能生成 5 步法推导', () => {
    const knapsackModel = {
      id: 'target-sum',
      name: '目标和',
      category: '背包问题',
      stages: {}
    } as unknown as IYamlAlgorithmModel;

    AnalysisKnowledgePresenter.renderAnalysisView(container as any, knapsackModel);
    expect(container.innerHTML).toContain('动态规划标准 5 步递推分析');
    expect(container.innerHTML).toContain('1. 确定 dp 数组及下标含义');
    expect(container.innerHTML).toContain('完全背包');
    expect(container.innerHTML).toContain('倒序遍历');
  });

  it('针对未配置 analysis 的序列匹配模型，应智能生成序列 5 步法与空串 Base Case FAQ', () => {
    const seqModel = {
      id: 'longest-common-subsequence',
      name: '最长公共子序列',
      category: '双序列动态规划',
      stages: {}
    } as unknown as IYamlAlgorithmModel;

    AnalysisKnowledgePresenter.renderAnalysisView(container as any, seqModel);
    expect(container.innerHTML).toContain('最优匹配长度');
    expect(container.innerHTML).toContain('子序列 (Subsequence)');
    expect(container.innerHTML).toContain('(m+1) × (n+1)');
  });

  it('针对未配置 analysis 的股票模型，应智能生成股票持有态/未持有态 5 步法', () => {
    const stockModel = {
      id: 'stock-with-cooldown',
      name: '最佳买卖股票时机含冷冻期',
      category: '股票动态规划',
      stages: {}
    } as unknown as IYamlAlgorithmModel;

    const steps = AnalysisKnowledgePresenter.getFiveStepAnalysis(stockModel);
    expect(steps.length).toBe(5);
    expect(steps[0].content).toContain('持有股票');
    expect(steps[1].content).toContain('未持有态');
  });

  it('对于 null 容器或 null 模型调用应安全无异常', () => {
    expect(() => AnalysisKnowledgePresenter.renderProblemView(null, mockModel)).not.toThrow();
    expect(() => AnalysisKnowledgePresenter.renderAnalysisView(null, mockModel)).not.toThrow();
  });
});
