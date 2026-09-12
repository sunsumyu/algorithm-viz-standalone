/**
 * 字符串 DP 四阶段演化 — 阶段 2：记忆化搜索 — 备忘录缓存 Hit/Miss 推演与 Card 1/2 渲染
 * 从 string-dp-stage-evolution 拆出的单阶段模块（SRP）。
 */

import { HighlightTarget } from './dark-code-terminal-presenter';
import { getLine, type StringDpKind } from './string-dp-stage-shared';
import { type MemoStepBase } from '../step-types';
import { GridVisualAdapter, type GridRenderOptions } from './grid-visual-adapter';

// ==========================================
// 3. 阶段 2: 记忆化搜索数据模型与生成器
// ==========================================

export interface StringDpMemoStep extends MemoStepBase {
  kind: StringDpKind;
  j: number;
  s: string;
  p: string;
  memo: number[][]; // -1: 未计算, 0: false, 1: true
  cacheHit: boolean;
}

export function buildStringDpMemoSteps(
  kind: StringDpKind,
  str: string,
  pat: string
): StringDpMemoStep[] {
  const steps: StringDpMemoStep[] = [];
  const resolveLine = (anchor: string) => getLine(2, kind, anchor);
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;

  const memo: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(-1)
  );

  let hitCount = 0;
  let missCount = 0;

  const pushStep = (
    action: string,
    codeLineKey: string,
    i: number,
    j: number,
    isHit: boolean,
    msg: string,
    decision: string
  ) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      kind,
      action,
      codeLine: resolveLine(codeLineKey),
      i,
      j,
      s,
      p,
      memo: memo.map((r) => [...r]),
      cacheHit: isHit,
      hitCount,
      missCount,
      decision,
      message: msg,
      log: `[记忆化] (${i},${j}) ${action}: ${msg}`,
      metrics: {
        'metric-cur-state': `memo[${i}][${j}]`,
        'metric-hit-rate': `${hitCount + missCount > 0 ? ((hitCount / (hitCount + missCount)) * 100).toFixed(1) : '0'}%`,
        'metric-cache-hits': `${hitCount} 次`,
        'metric-cache-miss': `${missCount} 次`,
      },
    });
  };

  // 1. 数组初始化
  pushStep(
    'memoInit',
    'memoInit',
    -1,
    -1,
    false,
    `🚀 初始化 2D 备忘录缓存：int[][] memo = new int[${n + 1}][${m + 1}]，全部填充 -1 (未探查)`,
    '建立缓存容器'
  );

  pushStep(
    'callRoot',
    'callRoot',
    0,
    0,
    false,
    `🚀 发起记忆化根调用 dfsMemo(i=0, j=0, memo)`,
    '从起点进入记忆化递归'
  );

  function dfsMemo(i: number, j: number): boolean {
    pushStep('fnEnter', 'fnEnter', i, j, false, `⚡ 进入 dfsMemo(i=${i}, j=${j})`, `探查缓存或展开子问题`);

    // 缓存探查
    if (memo[i][j] !== -1) {
      hitCount++;
      const cached = memo[i][j] === 1;
      pushStep(
        'memoCheck',
        'memoCheck',
        i,
        j,
        true,
        `🎯 命中缓存！memo[${i}][${j}] 已有计算结果: ${cached}，立即剪枝返回！`,
        `Cache Hit (${cached})`
      );
      return cached;
    }

    missCount++;
    pushStep(
      'memoCheck',
      'memoCheck',
      i,
      j,
      false,
      `💨 缓存未命中：memo[${i}][${j}] === -1，需要进行递归计算`,
      'Cache Miss'
    );

    // 基础条件检查
    if (j === m) {
      const res = i === n;
      memo[i][j] = res ? 1 : 0;
      pushStep(
        'baseCheck',
        'baseCheck',
        i,
        j,
        false,
        res
          ? `✅ 模式串耗尽且文本串耗尽 (i=${i}==${n})，写入 memo[${i}][${j}]=1 返回 true`
          : `❌ 模式串耗尽但文本串剩余 (i=${i}!=${n})，写入 memo[${i}][${j}]=0 返回 false`,
        'Base Case 写入缓存'
      );
      return res;
    }

    let ans = false;
    if (kind === 'regex') {
      const first = i < n && (s[i] === p[j] || p[j] === '.');
      const hasStar = j + 1 < m && p[j + 1] === '*';
      pushStep(
        'firstMatch',
        'firstMatch',
        i,
        j,
        false,
        `🔍 正则匹配规则：首字符匹配=${first}，星号修饰=${hasStar}`,
        hasStar ? '带星号完全背包' : '普通字符匹配'
      );

      if (hasStar) {
        // 分支 0 探查
        const b0 = dfsMemo(i, j + 2);
        if (b0) {
          ans = true;
        } else if (first) {
          ans = dfsMemo(i + 1, j);
        }
      } else {
        ans = first && dfsMemo(i + 1, j + 1);
      }
    } else {
      const isStar = p[j] === '*';
      pushStep('starCheck', 'starCheck', i, j, false, `⭐ 通配符规则：当前字符 p[${j}]='${p[j]}' (isStar=${isStar})`, isStar ? '星号通配' : '普通单字符');
      if (isStar) {
        const b0 = dfsMemo(i, j + 1);
        if (b0) {
          ans = true;
        } else if (i < n) {
          ans = dfsMemo(i + 1, j);
        }
      } else {
        const charMatch = i < n && (s[i] === p[j] || p[j] === '?');
        ans = charMatch && dfsMemo(i + 1, j + 1);
      }
    }

    // 存入备忘录
    memo[i][j] = ans ? 1 : 0;
    pushStep(
      'memoStore',
      'memoStore',
      i,
      j,
      false,
      `💾 计算完成：将决策结果 ${ans} 写入 memo[${i}][${j}] = ${memo[i][j]}，供后续状态复用`,
      `写入缓存 memo[${i}][${j}]`
    );

    return ans;
  }

  dfsMemo(0, 0);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function renderStringDpMemoCard1(
  container: HTMLElement,
  step: StringDpMemoStep
): void {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
      <!-- 探查结果看板 -->
      <div style="background:rgba(15, 23, 42, 0.8); border:1px solid ${
        step.cacheHit ? '#10b981' : '#334155'
      }; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:2px;">当前探查状态</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:16px; font-weight:700; color:#38bdf8;">
            dfsMemo(i=${step.i}, j=${step.j})
          </div>
        </div>
        <div style="padding:6px 14px; border-radius:6px; font-size:13px; font-weight:700; ${
          step.cacheHit
            ? 'background:rgba(16, 185, 129, 0.2); color:#34d399; border:1px solid #10b981;'
            : 'background:rgba(59, 130, 246, 0.15); color:#60a5fa; border:1px solid #3b82f6;'
        }">
          ${step.cacheHit ? '⚡ CACHE HIT (直接返回)' : '💨 CACHE MISS (递归计算)'}
        </div>
      </div>

      <!-- 探查说明日志 -->
      <div style="background:rgba(30, 41, 59, 0.5); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:11px; color:#94a3b8;">决策说明</div>
        <div style="font-size:13px; font-weight:600; color:#f1f5f9;">${step.decision}</div>
        <div style="font-size:12px; color:#cbd5e1; line-height:1.5;">${step.message}</div>
      </div>

      <!-- 统计指标卡 -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:auto;">
        <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#94a3b8;">缓存命中次数</div>
          <div style="font-size:18px; font-weight:700; color:#34d399; margin-top:2px;">${step.hitCount}</div>
        </div>
        <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#94a3b8;">未命中 (实际计算)</div>
          <div style="font-size:18px; font-weight:700; color:#38bdf8; margin-top:2px;">${step.missCount}</div>
        </div>
        <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#94a3b8;">命中剪枝率</div>
          <div style="font-size:18px; font-weight:700; color:#fbbf24; margin-top:2px;">
            ${step.hitCount + step.missCount > 0 ? ((step.hitCount / (step.hitCount + step.missCount)) * 100).toFixed(0) : '0'}%
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderStringDpMemoCard2(
  container: HTMLElement,
  step: StringDpMemoStep
): void {
  const n = step.s.length;
  const m = step.p.length;

  const rowLabels = Array.from({ length: n + 1 }, (_, i) => (i < n ? `'${step.s[i]}'` : 'EOF'));
  const colLabels = Array.from({ length: m + 1 }, (_, j) => (j < m ? `'${step.p[j]}'` : 'EOF'));

  const stepData = {
    i: step.i,
    j: step.j,
    grid: (step.memo || []).map((row) =>
      row.map((v) => (v === 1 ? 'T' : v === 0 ? 'F' : null))
    ),
    type: step.cacheHit ? '缓存命中' : '未命中试算',
    msg: `memo[${step.i}][${step.j}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: n + 1,
    n: m + 1,
    isReverse: false,
    isGridProblem: false,
    modelId: 'string-dp-memo',
    rowLabels,
    colLabels,
    isMatch: (r, c) => r < n && c < m && (step.p[c] === step.s[r] || step.p[c] === '.' || step.p[c] === '?'),
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
        <span style="font-size:12px; font-weight:700; color:#0284c7;">🎯 备忘录缓存矩阵 memo[0..${n}][0..${m}]</span>
        <span style="font-size:11px; color:#64748b;">T = True (命中), F = False, · = 未探查</span>
      </div>
      <div class="string-dp-memo-grid-wrapper" style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.string-dp-memo-grid-wrapper') as HTMLElement | null;
  if (wrapper) {
    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }
}
