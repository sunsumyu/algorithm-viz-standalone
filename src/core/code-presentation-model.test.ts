import { describe, it, expect } from 'vitest';
import { CodePresentationModel } from './code-presentation-model';

describe('CodePresentationModel (Deep Module) Pure Semantic Guard', () => {
  it('1. 单语言初始化并正确编译剥离 @step 标签与行号', () => {
    const lines = [
      'public int climbStairs(int n) { // @step:entry',
      '    int[] dp = new int[n + 1]; // @step:init',
      '    return dp[n]; // @step:return',
      '}'
    ];

    const model = new CodePresentationModel({ lines, language: 'java' });
    expect(model.getCurrentLanguage()).toBe('java');
    expect(model.getLineCount()).toBe(4);
    // 标签应被干净剔除
    expect(model.getLines()[0]).not.toContain('@step:entry');
    expect(model.getLines()[0]).toBe('public int climbStairs(int n) {');
  });

  it('2. 多语言代码自动对齐与切换', () => {
    const languages = {
      java: ['public int solve() {', '    return 0;', '}'],
      python: ['def solve():', '    return 0'],
      cpp: ['int solve() {', '    return 0;', '}']
    };

    const model = new CodePresentationModel({ languages, language: 'java' });
    expect(model.getAvailableLanguages()).toEqual(['java', 'python', 'cpp']);
    expect(model.getLineCount('python')).toBe(2);
    expect(model.getLineCount('java')).toBe(3);

    expect(model.setCurrentLanguage('python')).toBe(true);
    expect(model.getCurrentLanguage()).toBe('python');
    expect(model.getLines()[0]).toBe('def solve():');
  });

  it('3. 自定义行释义与启发式智能教学讲解推导', () => {
    const lines = [
      'public int fib(int n) {',
      '    int[] dp = new int[n + 1];',
      '    dp[0] = 0; dp[1] = 1;',
      '    return dp[n];'
    ];

    const model = new CodePresentationModel({
      lines,
      lineExplanations: {
        3: '自定义：设定基础斐波那契底座'
      }
    });

    // 自定义讲解命中
    expect(model.getLineExplanation(3)).toContain('自定义：设定基础斐波那契底座');

    // 启发式函数入口推导
    expect(model.getLineExplanation(1)).toContain('函数主入口');

    // 启发式开辟空间推导
    expect(model.getLineExplanation(2)).toContain('开辟状态空间');

    // 启发式返回推导
    expect(model.getLineExplanation(4)).toContain('返回全局最优解');
  });

  it('4. 语法着色 HTML 与逐行精讲数据结构生成', () => {
    const lines = ['const x = 42;'];
    const model = new CodePresentationModel({ lines, language: 'javascript' });

    const html = model.getHighlightedHtml(0);
    expect(html).toContain('algo-code-token-keyword');

    const walkthrough = model.getWalkthroughData();
    expect(walkthrough).toHaveLength(1);
    expect(walkthrough[0].lineNum).toBe(1);
    expect(walkthrough[0].rawCode).toBe('const x = 42;');
    expect(walkthrough[0].codeHtml).toContain('algo-code-token-keyword');
  });

  it('5. 运行变量实时快照与差异变动对比计算', () => {
    const model = new CodePresentationModel();
    const prevMap = new Map([
      ['i', '1'],
      ['j', '2'],
      ['dp[i][j]', '3']
    ]);

    const nextVars = [
      { name: 'i', value: '1' }, // 未变
      { name: 'j', value: '3' }, // 改变
      { name: 'dp[i][j]', value: '6' } // 改变
    ];

    const { snapshots, newMap } = model.computeVariableSnapshots(nextVars, prevMap);
    expect(snapshots).toHaveLength(3);
    expect(snapshots[0].isChanged).toBe(false);
    expect(snapshots[1].isChanged).toBe(true);
    expect(snapshots[2].isChanged).toBe(true);
    expect(newMap.get('j')).toBe('3');
  });

  it('6. 题目详情与 5 步动规法关键要点结构化领域存储', () => {
    const model = new CodePresentationModel();
    expect(model.getProblemDetail()).toBeUndefined();

    model.setProblemDetail({
      title: '爬楼梯',
      leetcodeId: 70,
      difficulty: 'easy',
      description: '假设你正在爬楼梯...'
    });
    expect(model.getProblemDetail()?.leetcodeId).toBe(70);

    model.setKeyPoints({
      title: '5步法要点',
      points: [{ label: '1. dp数组含义', desc: 'dp[i]表示爬到第i阶的方法数' }]
    });
    expect(model.getKeyPoints()?.points).toHaveLength(1);
  });
});
