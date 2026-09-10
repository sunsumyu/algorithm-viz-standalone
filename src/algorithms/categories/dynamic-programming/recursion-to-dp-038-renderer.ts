/**
 * Class 038: 经典递归向记忆化搜索与动态规划初步转换 (Recursion to DP Evolution)
 * 左程云算法通关课入门篇 Class 038
 * 动态规划四阶段演化：暴力递归 ➔ 记忆化搜索 ➔ 严格表依赖 ➔ 空间压缩优化
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface RecursionToDpStep extends StepBase {
  stepIndex?: number;
  stage: 'brute' | 'memo' | 'tab' | 'rolling';
  currentN: number;
  memoTable: (number | null)[];
  dpTable: number[];
  rollingVars?: { prev2: number; prev1: number; cur: number };
  callCount: number;
  cacheHits: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const RECURSION_TO_DP_038_CODES = {
  java: `public class RecursionToDp {
    // 阶段 1: 暴力递归 (指数级展开 O(2^N))
    public static int f1(int n) {
        if (n <= 1) return n;
        return f1(n - 1) + f1(n - 2);
    }

    // 阶段 2: 记忆化搜索 (自顶向下剪枝 O(N))
    public static int f2(int n, int[] memo) {
        if (n <= 1) return n;
        if (memo[n] != -1) return memo[n]; // 命中缓存直接返回
        memo[n] = f2(n - 1, memo) + f2(n - 2, memo);
        return memo[n];
    }

    // 阶段 3: 严格表依赖 (自底向上迭代填表 O(N), 空间 O(N))
    public static int f3(int n) {
        if (n <= 1) return n;
        int[] dp = new int[n + 1];
        dp[0] = 0; dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }

    // 阶段 4: 空间压缩优化 (双变量滚动 O(N), 空间 O(1))
    public static int f4(int n) {
        if (n <= 1) return n;
        int prev2 = 0, prev1 = 1;
        for (int i = 2; i <= n; i++) {
            int cur = prev1 + prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
  cpp: `class RecursionToDp {
public:
    int f1(int n) {
        if (n <= 1) return n;
        return f1(n - 1) + f1(n - 2);
    }
    int f2(int n, vector<int>& memo) {
        if (n <= 1) return n;
        if (memo[n] != -1) return memo[n];
        return memo[n] = f2(n - 1, memo) + f2(n - 2, memo);
    }
    int f3(int n) {
        if (n <= 1) return n;
        vector<int> dp(n + 1, 0);
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }
    int f4(int n) {
        if (n <= 1) return n;
        int p2 = 0, p1 = 1;
        for (int i = 2; i <= n; i++) {
            int cur = p1 + p2;
            p2 = p1; p1 = cur;
        }
        return p1;
    }
};`,
  python: `class RecursionToDp:
    def f1(self, n: int) -> int:
        if n <= 1: return n
        return self.f1(n - 1) + self.f1(n - 2)

    def f2(self, n: int, memo: list) -> int:
        if n <= 1: return n
        if memo[n] != -1: return memo[n]
        memo[n] = self.f2(n - 1, memo) + self.f2(n - 2, memo)
        return memo[n]

    def f3(self, n: int) -> int:
        if n <= 1: return n
        dp = [0] * (n + 1)
        dp[1] = 1
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]

    def f4(self, n: int) -> int:
        if n <= 1: return n
        p2, p1 = 0, 1
        for _ in range(2, n + 1):
            cur = p1 + p2
            p2, p1 = p1, cur
        return p1`,
  typescript: `class RecursionToDp {
    f1(n: number): number {
        if (n <= 1) return n;
        return this.f1(n - 1) + this.f1(n - 2);
    }
    f2(n: number, memo: number[]): number {
        if (n <= 1) return n;
        if (memo[n] !== -1) return memo[n];
        return memo[n] = this.f2(n - 1, memo) + this.f2(n - 2, memo);
    }
    f3(n: number): number {
        if (n <= 1) return n;
        const dp = new Array(n + 1).fill(0);
        dp[1] = 1;
        for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }
    f4(n: number): number {
        if (n <= 1) return n;
        let p2 = 0, p1 = 1;
        for (let i = 2; i <= n; i++) {
            const cur = p1 + p2;
            p2 = p1; p1 = cur;
        }
        return p1;
    }
}`
};

export function generateRecursionToDpSteps(n: number = 6, stage: 'brute' | 'memo' | 'tab' | 'rolling' = 'tab'): RecursionToDpStep[] {
  const steps: RecursionToDpStep[] = [];
  const memo = new Array(n + 1).fill(null);
  const dp = new Array(n + 1).fill(0);

  const lines = {
    bruteEntry: 4,
    bruteCompute: 5,
    memoEntry: 10,
    memoHit: 11,
    memoCompute: 12,
    tabEntry: 17,
    tabInit: 19,
    tabLoop: 21,
    tabReturn: 23,
    rollingEntry: 27,
    rollingLoop: 30,
    rollingReturn: 35,
  };

  // Step 0: 对应阶段启动
  steps.push({
    stage: stage,
    currentN: n,
    memoTable: [...memo],
    dpTable: [...dp],
    callCount: 0,
    cacheHits: 0,
    decision: `启动【${stage.toUpperCase()}】阶段演进演化演示 (n=${n})`,
    message: '从经典暴力递归逐步向记忆化搜索、严格状态依赖表与空间压缩四段式蜕变',
    log: `Init stage: ${stage}`,
    codeLine: stage === 'brute' ? lines.bruteEntry : stage === 'memo' ? lines.memoEntry : stage === 'tab' ? lines.tabEntry : lines.rollingEntry,
    statusBadge: { text: '阶段就绪', type: 'info' },
  });

  if (stage === 'brute' || stage === 'memo') {
    let calls = 0;
    let hits = 0;

    function solve(cur: number): number {
      calls++;
      if (cur <= 1) {
        steps.push({
          stage,
          currentN: cur,
          memoTable: [...memo],
          dpTable: [...dp],
          callCount: calls,
          cacheHits: hits,
          decision: `到达基底边界：f(${cur}) = ${cur}`,
          message: `规模降至边界出口，直接返回常数`,
          log: `f(${cur}) -> base return ${cur}`,
          codeLine: stage === 'memo' ? lines.memoEntry : lines.bruteEntry,
          statusBadge: { text: '递归基底', type: 'warning' },
        });
        return cur;
      }

      if (stage === 'memo' && memo[cur] !== null) {
        hits++;
        steps.push({
          stage,
          currentN: cur,
          memoTable: [...memo],
          dpTable: [...dp],
          callCount: calls,
          cacheHits: hits,
          decision: `🎉 命中记忆化缓存：memo[${cur}] = ${memo[cur]}`,
          message: `重叠子问题被成功拦截！避免重复展开其庞大的子树`,
          log: `Cache hit for f(${cur}) = ${memo[cur]}`,
          codeLine: lines.memoHit,
          statusBadge: { text: '缓存命中', type: 'success' },
        });
        return memo[cur]!;
      }

      steps.push({
        stage,
        currentN: cur,
        memoTable: [...memo],
        dpTable: [...dp],
        callCount: calls,
        cacheHits: hits,
        decision: `展开子问题：计算 f(${cur}) = f(${cur - 1}) + f(${cur - 2})`,
        message: `发起双分支递归计算`,
        log: `f(${cur}) expanding`,
        codeLine: stage === 'memo' ? lines.memoCompute : lines.bruteCompute,
        statusBadge: { text: '展开递归', type: 'info' },
      });

      const res = solve(cur - 1) + solve(cur - 2);
      if (stage === 'memo') {
        memo[cur] = res;
        steps.push({
          stage,
          currentN: cur,
          memoTable: [...memo],
          dpTable: [...dp],
          callCount: calls,
          cacheHits: hits,
          decision: `写入记忆化表：memo[${cur}] = ${res}`,
          message: `子问题计算完毕并存入缓存备忘录`,
          log: `memo[${cur}] saved: ${res}`,
          codeLine: lines.memoCompute,
          statusBadge: { text: '缓存填入', type: 'success' },
        });
      }
      return res;
    }

    // 限制深度以防步数爆炸
    solve(Math.min(n, 4));
  } else if (stage === 'tab') {
    dp[0] = 0;
    dp[1] = 1;
    steps.push({
      stage,
      currentN: 1,
      memoTable: [...memo],
      dpTable: [...dp],
      callCount: 0,
      cacheHits: 0,
      decision: '初始化基础边界：dp[0]=0, dp[1]=1',
      message: '确定严格表自底向上迭代推导的基石状态',
      log: 'Init dp table base values',
      codeLine: lines.tabInit,
      statusBadge: { text: '基石初始化', type: 'info' },
    });

    for (let i = 2; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      steps.push({
        stage,
        currentN: i,
        memoTable: [...memo],
        dpTable: [...dp],
        callCount: 0,
        cacheHits: 0,
        decision: `严格表自底向上递推：dp[${i}] = dp[${i - 1}] (${dp[i - 1]}) + dp[${i - 2}] (${dp[i - 2]}) = ${dp[i]}`,
        message: `消除递归调用开销，严格遵循从左到右依赖顺序填表`,
        log: `dp[${i}] = ${dp[i]}`,
        codeLine: lines.tabLoop,
        statusBadge: { text: `填入 dp[${i}]`, type: 'success' },
      });
    }

    steps.push({
      stage,
      currentN: n,
      memoTable: [...memo],
      dpTable: [...dp],
      callCount: 0,
      cacheHits: 0,
      decision: `🎉 严格表填表完毕！最终答案 = dp[${n}] = ${dp[n]}`,
      message: '无栈溢出风险，时间严格 O(N)',
      log: `Done tab f(${n}) = ${dp[n]}`,
      codeLine: lines.tabReturn,
      statusBadge: { text: '填表完成', type: 'success' },
    });
  } else {
    // rolling
    let p2 = 0;
    let p1 = 1;
    steps.push({
      stage,
      currentN: 1,
      memoTable: [...memo],
      dpTable: [...dp],
      rollingVars: { prev2: p2, prev1: p1, cur: 1 },
      callCount: 0,
      cacheHits: 0,
      decision: '空间压缩初始化：prev2 = 0, prev1 = 1',
      message: '观察状态依赖发现：当前项仅依赖前两项，无需开辟 N 大小数组！',
      log: 'Rolling vars initialized',
      codeLine: lines.rollingEntry,
      statusBadge: { text: '双变量就绪', type: 'info' },
    });

    for (let i = 2; i <= n; i++) {
      const cur = p1 + p2;
      steps.push({
        stage,
        currentN: i,
        memoTable: [...memo],
        dpTable: [...dp],
        rollingVars: { prev2: p2, prev1: p1, cur: cur },
        callCount: 0,
        cacheHits: 0,
        decision: `滚动推进：cur = prev1 (${p1}) + prev2 (${p2}) = ${cur}`,
        message: `空间占用压缩为严格 O(1)，无额外内存开销`,
        log: `i=${i}: cur=${cur}`,
        codeLine: lines.rollingLoop,
        statusBadge: { text: `推进到 ${i}`, type: 'success' },
      });
      p2 = p1;
      p1 = cur;
    }

    steps.push({
      stage,
      currentN: n,
      memoTable: [...memo],
      dpTable: [...dp],
      rollingVars: { prev2: p2, prev1: p1, cur: p1 },
      callCount: 0,
      cacheHits: 0,
      decision: `🎉 空间压缩最优解达成！答案 = ${p1} (空间 O(1))`,
      message: '四段式演进完美收官',
      log: `Rolling done = ${p1}`,
      codeLine: lines.rollingReturn,
      statusBadge: { text: '演化圆满', type: 'success' },
    });
  }

  return steps;
}

export function renderRecursionToDpCanvas(container: HTMLElement, step: RecursionToDpStep): void {
  const stageLabels = {
    brute: '阶段 1: 暴力递归',
    memo: '阶段 2: 记忆化搜索',
    tab: '阶段 3: 严格表依赖',
    rolling: '阶段 4: 空间压缩优化',
  };

  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 演化阶段指示器 -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        ${(['brute', 'memo', 'tab', 'rolling'] as const).map(s => `
          <div style="
            flex: 1;
            padding: 8px 12px;
            border-radius: 6px;
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            background: ${step.stage === s ? '#0284c7' : 'rgba(30, 41, 59, 0.6)'};
            color: ${step.stage === s ? '#fff' : '#94a3b8'};
            border: ${step.stage === s ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)'};
          ">
            ${stageLabels[s]}
          </div>
        `).join('')}
      </div>

      <!-- 核心指标面板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前焦点子问题</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            f( ${step.currentN} )
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">${step.stage === 'memo' ? '缓存命中次数' : '调用/迭代开销'}</div>
          <div style="font-size: 20px; font-weight: bold; color: ${step.stage === 'memo' ? '#34d399' : '#fbbf24'}; margin-top: 4px;">
            ${step.stage === 'memo' ? `命中 ${step.cacheHits} 次` : `累计 ${step.callCount || step.currentN} 次`}
          </div>
        </div>
      </div>

      <!-- 主沙盘展示区 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        ${
          step.stage === 'tab'
            ? `
            <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">严格 DP 状态网格 (自底向上从左至右)</div>
            <div style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 0;">
              ${step.dpTable.map((val, idx) => `
                <div style="
                  min-width: 52px;
                  height: 60px;
                  background: ${idx === step.currentN ? '#0369a1' : val > 0 ? '#1e293b' : 'rgba(30,41,59,0.3)'};
                  border: ${idx === step.currentN ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'};
                  border-radius: 6px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  box-shadow: ${idx === step.currentN ? '0 0 10px rgba(56,189,248,0.5)' : 'none'};
                ">
                  <div style="font-size: 10px; color: #94a3b8;">dp[${idx}]</div>
                  <div style="font-size: 16px; font-weight: bold; color: #fff; margin-top: 2px;">${val}</div>
                </div>
              `).join('')}
            </div>
          `
            : step.stage === 'rolling' && step.rollingVars
            ? `
            <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">空间压缩双变量滚动寄存器 (空间严格 O(1))</div>
            <div style="display: flex; gap: 24px; align-items: center; justify-content: center; padding: 20px 0;">
              <div style="text-align: center; background: rgba(30, 41, 59, 0.7); border: 1px solid #475569; padding: 14px 24px; border-radius: 8px;">
                <div style="font-size: 11px; color: #94a3b8;">寄存器 prev2</div>
                <div style="font-size: 24px; font-weight: bold; color: #fbbf24; margin-top: 4px;">${step.rollingVars.prev2}</div>
              </div>
              <div style="font-size: 20px; color: #94a3b8;">+</div>
              <div style="text-align: center; background: rgba(30, 41, 59, 0.7); border: 1px solid #475569; padding: 14px 24px; border-radius: 8px;">
                <div style="font-size: 11px; color: #94a3b8;">寄存器 prev1</div>
                <div style="font-size: 24px; font-weight: bold; color: #38bdf8; margin-top: 4px;">${step.rollingVars.prev1}</div>
              </div>
              <div style="font-size: 20px; color: #94a3b8;">=</div>
              <div style="text-align: center; background: rgba(14, 165, 233, 0.2); border: 2px solid #0284c7; padding: 14px 24px; border-radius: 8px;">
                <div style="font-size: 11px; color: #38bdf8;">当前值 cur</div>
                <div style="font-size: 24px; font-weight: bold; color: #34d399; margin-top: 4px;">${step.rollingVars.cur}</div>
              </div>
            </div>
          `
            : `
            <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
              ${step.stage === 'memo' ? '记忆化备忘录 (Memo Table) 状态' : '暴力递归树探索状态'}
            </div>
            <div style="display: flex; gap: 8px; overflow-x: auto; padding: 8px 0;">
              ${step.memoTable.map((val, idx) => `
                <div style="
                  min-width: 52px;
                  height: 60px;
                  background: ${idx === step.currentN ? '#0369a1' : val !== null ? '#065f46' : 'rgba(30,41,59,0.3)'};
                  border: ${idx === step.currentN ? '2px solid #38bdf8' : val !== null ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)'};
                  border-radius: 6px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                ">
                  <div style="font-size: 10px; color: #94a3b8;">memo[${idx}]</div>
                  <div style="font-size: 16px; font-weight: bold; color: #fff; margin-top: 2px;">
                    ${val !== null ? val : '空'}
                  </div>
                </div>
              `).join('')}
            </div>
          `
        }
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '动态规划四阶段演化哲学',
        '暴力递归找到重叠子问题 ➔ 备忘录缓存消除重复展开 ➔ 自底向上整理严格依赖顺序 ➔ 丢弃无用历史达成空间极限压缩。这就是动态规划设计的大一统标准演进路径！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const recursionToDp038Visualizer = registerDeclarativeAlgorithm<RecursionToDpStep>({
  id: 'recursion-to-dp-038',
  name: 'Class 038: 经典递归向记忆化搜索与动态规划初步转换 (Recursion to DP)',
  category: 'dynamic-programming',
  icon: '📈',
  difficulty: 2,
  levelOrder: 38,
  learningGoal: '掌握经典暴力递归向记忆化搜索、严格表依赖与空间压缩的四段式蜕变全流程与设计思维',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 038)</h3>
      <p>动态规划的核心思维跃迁：</p>
      <ul>
        <li><strong>阶段 1: 暴力递归</strong>：自顶向下拆分子问题，存在大量重复计算（指数级爆炸）。</li>
        <li><strong>阶段 2: 记忆化搜索</strong>：挂载备忘录，遇到已计算状态直接取值，消除重复分支。</li>
        <li><strong>阶段 3: 严格表依赖</strong>：梳理状态依赖关系，摆脱递归栈开销，自底向上迭代填表。</li>
        <li><strong>阶段 4: 空间压缩</strong>：仅保存计算当前状态所需的有限前序变量，实现 $O(1)$ 极致空间节省。</li>
      </ul>
    </div>
  `,
  codeLanguages: RECURSION_TO_DP_038_CODES,
  inputs: [
    {
      id: 'stage',
      label: '演化阶段',
      type: 'select',
      defaultValue: 'tab',
      options: [
        { label: '阶段 1: 暴力递归 (Brute-force)', value: 'brute' },
        { label: '阶段 2: 记忆化搜索 (Memoization)', value: 'memo' },
        { label: '阶段 3: 严格表依赖 (Tabulation)', value: 'tab' },
        { label: '阶段 4: 空间压缩优化 (Rolling)', value: 'rolling' },
      ],
    },
    {
      id: 'n',
      label: '目标规模 N',
      type: 'number',
      defaultValue: 6,
    },
  ],
  generateSteps: (input) => {
    const stage = (input.stage || 'tab') as 'brute' | 'memo' | 'tab' | 'rolling';
    const n = Number(input.n) || 6;
    return generateRecursionToDpSteps(n, stage);
  },
  renderCanvas: (container, step) => {
    renderRecursionToDpCanvas(container, step);
  },
});
