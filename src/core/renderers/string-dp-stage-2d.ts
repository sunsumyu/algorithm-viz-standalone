/**
 * 字符串 DP 四阶段演化 — 阶段 3：严格位置依赖二维 DP — 自底向上填表推演与 Card 1/2 渲染
 * 从 string-dp-stage-evolution 拆出的单阶段模块（SRP）。
 */

import { HighlightTarget } from './dark-code-terminal-presenter';
import { getLine, type StringDpKind } from './string-dp-stage-shared';
import { GridVisualAdapter, type GridRenderOptions } from './grid-visual-adapter';

// ==========================================
// 4. 阶段 3: 严格位置依赖二维 DP 数据模型与生成器
// ==========================================

export interface StringDp2DStep {
  stepIndex: number;
  totalSteps: number;
  kind: StringDpKind;
  action: string;
  codeLine: HighlightTarget;
  i: number;
  j: number;
  s: string;
  p: string;
  dp: boolean[][];
  depCells: Array<{ r: number; c: number; label: string; val: boolean }>;
  decision: string;
  message: string;
  log: string;
  metrics: Record<string, string>;
}

export function buildStringDp2DSteps(
  kind: StringDpKind,
  str: string,
  pat: string
): StringDp2DStep[] {
  const steps: StringDp2DStep[] = [];
  const resolveLine = (anchor: string) => getLine(3, kind, anchor);
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;

  const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(false)
  );

  const pushStep = (
    action: string,
    codeLineKey: string,
    i: number,
    j: number,
    depCells: Array<{ r: number; c: number; label: string; val: boolean }>,
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
      dp: dp.map((r) => [...r]),
      depCells,
      decision,
      message: msg,
      log: `[二维DP] (${i},${j}) ${action}: ${msg}`,
      metrics: {
        'metric-cell': `dp[${i >= 0 ? i : '—'}][${j >= 0 ? j : '—'}]`,
        'metric-cell-val': i >= 0 && j >= 0 ? (dp[i][j] ? 'TRUE' : 'FALSE') : '—',
        'metric-decision': decision,
      },
    });
  };

  // 1. 初始化
  pushStep(
    'initDp',
    'initDp',
    -1,
    -1,
    [],
    `🚀 初始化二维状态矩阵：boolean[][] dp = new boolean[${n + 1}][${m + 1}]，全部预填 false`,
    '初始化 DP 矩阵'
  );

  // 2. 基底空串
  dp[n][m] = true;
  pushStep(
    'baseEmpty',
    'baseEmpty',
    n,
    m,
    [],
    `✨ 基底定义：空文本对空模式串必定匹配，设定 dp[${n}][${m}] = true`,
    '空对空基底'
  );

  // 3. 处理文本串为空时，模式串的星号消解
  for (let j = m - 1; j >= 0; j--) {
    if (kind === 'regex') {
      const canCancel = j + 1 < m && p[j + 1] === '*' && dp[n][j + 2];
      if (canCancel) {
        dp[n][j] = true;
      }
      pushStep(
        'baseStarSet',
        'baseStarSet',
        n,
        j,
        j + 2 <= m ? [{ r: n, c: j + 2, label: `dp[${n}][${j + 2}]`, val: dp[n][j + 2] }] : [],
        canCancel
          ? `✨ 基底转移：模式串 '${p[j]}*' 取 0 次消去，依赖 dp[${n}][${j + 2}]=true，设定 dp[${n}][${j}] = true`
          : `🛑 基底转移：模式串 '${p[j]}' 无法消解空文本，dp[${n}][${j}] = false`,
        canCancel ? `'${p[j]}*' 取 0 次` : '无法消解空串'
      );
    } else {
      // 通配符
      if (p[j] === '*' && dp[n][j + 1]) {
        dp[n][j] = true;
        pushStep(
          'baseStarSet',
          'baseStarSet',
          n,
          j,
          [{ r: n, c: j + 1, label: `dp[${n}][${j + 1}]`, val: dp[n][j + 1] }],
          `✨ 基底转移：通配符 '*' 匹配空串，依赖右侧 dp[${n}][${j + 1}]=true，设定 dp[${n}][${j}] = true`,
          `'*' 匹配空串`
        );
      } else {
        pushStep(
          'baseStarSet',
          'baseStarSet',
          n,
          j,
          [],
          `🛑 基底转移：模式串字符 '${p[j]}' 无法匹配空串，dp[${n}][${j}] = false`,
          '通配失败'
        );
        break; // 通配符非星号后无法继续向左通配
      }
    }
  }

  // 4. 自底向上、从右往左严格递推填表
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (kind === 'regex') {
        if (j + 1 === m || p[j + 1] !== '*') {
          // 普通单字符匹配，依赖右下方 dp[i+1][j+1]
          const charMatch = s[i] === p[j] || p[j] === '.';
          dp[i][j] = charMatch && dp[i + 1][j + 1];
          const deps = [{ r: i + 1, c: j + 1, label: `dp[${i + 1}][${j + 1}]`, val: dp[i + 1][j + 1] }];
          pushStep(
            'charTransition',
            'charTransition',
            i,
            j,
            deps,
            `🔍 严格依赖右下方：s[${i}]='${s[i]}' ↔ p[${j}]='${p[j]}'，首字匹配=${charMatch}，dp[${i}][${j}] = ${charMatch} && dp[${i + 1}][${j + 1}](${dp[i + 1][j + 1]}) = ${dp[i][j]}`,
            charMatch ? '单字符匹配成功' : '单字符失配'
          );
        } else {
          // 星号修饰转移
          const dep0 = { r: i, c: j + 2, label: `dp[${i}][${j + 2}](取0次)`, val: dp[i][j + 2] };
          const first = s[i] === p[j] || p[j] === '.';
          const dep1 = { r: i + 1, c: j, label: `dp[${i + 1}][${j}](取>=1次)`, val: dp[i + 1][j] };
          dp[i][j] = dep0.val || (first && dep1.val);
          pushStep(
            'starTransition',
            'starTransition',
            i,
            j,
            [dep0, dep1],
            `⭐ 完全背包状态转移：dp[${i}][${j}] = dp[${i}][${j + 2}](${dep0.val}) || (first(${first}) && dp[${i + 1}][${j}](${dep1.val})) -> ${dp[i][j]}`,
            dp[i][j] ? (dep0.val ? '匹配0次生效' : '完全背包复用生效') : '两路均无法匹配'
          );
        }
      } else {
        // 通配符
        if (p[j] !== '*') {
          const charMatch = s[i] === p[j] || p[j] === '?';
          dp[i][j] = charMatch && dp[i + 1][j + 1];
          const deps = [{ r: i + 1, c: j + 1, label: `dp[${i + 1}][${j + 1}]`, val: dp[i + 1][j + 1] }];
          pushStep(
            'charTransition',
            'charTransition',
            i,
            j,
            deps,
            `🔍 通配单字符匹配：s[${i}]='${s[i]}' ↔ p[${j}]='${p[j]}', 依赖右下方 dp[${i + 1}][${j + 1}](${dp[i + 1][j + 1]}) -> ${dp[i][j]}`,
            charMatch ? '匹配推进' : '失配'
          );
        } else {
          const depEmpty = { r: i, c: j + 1, label: `dp[${i}][${j + 1}](匹配空)`, val: dp[i][j + 1] };
          const depChar = { r: i + 1, c: j, label: `dp[${i + 1}][${j}](匹配>=1字)`, val: dp[i + 1][j] };
          dp[i][j] = depEmpty.val || depChar.val;
          pushStep(
            'starTransition',
            'starTransition',
            i,
            j,
            [depEmpty, depChar],
            `⭐ 通配符斜率优化转移：dp[${i}][${j}] = dp[${i}][${j + 1}](${depEmpty.val}) || dp[${i + 1}][${j}](${depChar.val}) -> ${dp[i][j]}`,
            dp[i][j] ? '通配匹配成功' : '通配失败'
          );
        }
      }
    }
  }

  // 最终答案
  pushStep(
    'returnAns',
    'returnAns',
    0,
    0,
    [],
    `🎉 二维 DP 填表全部完成！左上角起始状态 dp[0][0] = ${dp[0][0]} 即为最终匹配判定！`,
    dp[0][0] ? '完全匹配成功 (TRUE)' : '匹配失败 (FALSE)'
  );

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function renderStringDp2DCard1(
  container: HTMLElement,
  step: StringDp2DStep
): void {
  const depsHtml =
    step.depCells.length === 0
      ? '<div style="color:#64748b; font-size:11px;">无前驱依赖（基底直接赋值）</div>'
      : step.depCells
          .map(
            (dep) => `
        <div style="display:inline-flex; align-items:center; gap:6px; background:#0f172a; border:1px solid #334155; border-radius:4px; padding:4px 8px; font-family:'JetBrains Mono', monospace; font-size:11px;">
          <span style="color:#94a3b8;">${dep.label}:</span>
          <span style="color:${dep.val ? '#34d399' : '#f87171'}; font-weight:700;">${dep.val ? 'TRUE' : 'FALSE'}</span>
        </div>
      `
          )
          .join(' ');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
      <!-- 当前考察单元格看板 -->
      <div style="background:rgba(15, 23, 42, 0.8); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:11px; color:#94a3b8;">当前递推单元格</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:18px; font-weight:700; color:#38bdf8;">
            dp[${step.i >= 0 ? step.i : '—'}][${step.j >= 0 ? step.j : '—'}]
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; color:#94a3b8;">单元格赋值结果</div>
          <div style="font-size:18px; font-weight:700; color:${
            step.i >= 0 && step.j >= 0 && step.dp[step.i]?.[step.j] ? '#34d399' : '#f87171'
          };">
            ${step.i >= 0 && step.j >= 0 ? (step.dp[step.i]?.[step.j] ? 'TRUE' : 'FALSE') : '—'}
          </div>
        </div>
      </div>

      <!-- 转移依赖来源 -->
      <div style="background:rgba(30, 41, 59, 0.5); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">🔗 单元格转移依赖来源 (Dependency Cells)</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${depsHtml}
        </div>
      </div>

      <!-- 决策详情 -->
      <div style="background:rgba(30, 41, 59, 0.5); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:11px; color:#94a3b8;">填表状态说明</div>
        <div style="font-size:13px; font-weight:600; color:#f1f5f9;">${step.decision}</div>
        <div style="font-size:12px; color:#cbd5e1; line-height:1.5;">${step.message}</div>
      </div>
    </div>
  `;
}

export function renderStringDp2DCard2(
  container: HTMLElement,
  step: StringDp2DStep
): void {
  const n = step.s.length;
  const m = step.p.length;

  const rowLabels = Array.from({ length: n + 1 }, (_, i) => (i < n ? `'${step.s[i]}'` : 'EOF'));
  const colLabels = Array.from({ length: m + 1 }, (_, j) => (j < m ? `'${step.p[j]}'` : 'EOF'));

  const deps: Array<{ r: number; c: number; type?: 'top' | 'left' | 'diag'; label?: string }> = (
    step.depCells || []
  ).map((dep) => {
    let type: 'top' | 'left' | 'diag' | undefined;
    if (dep.r === step.i - 1 && dep.c === step.j) type = 'top';
    else if (dep.r === step.i && dep.c < step.j) type = 'left';
    else if (dep.r < step.i && dep.c < step.j) type = 'diag';
    return { r: dep.r, c: dep.c, type, label: dep.label };
  });

  const stepData = {
    i: step.i,
    j: step.j,
    grid: (step.dp || []).map((row) => row.map((v) => (v ? 'T' : 'F'))),
    deps,
    msg: `dp[${step.i}][${step.j}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: n + 1,
    n: m + 1,
    isReverse: false,
    isGridProblem: false,
    modelId: 'string-dp-2d',
    rowLabels,
    colLabels,
    deps,
    isMatch: (r, c) => r < n && c < m && (step.p[c] === step.s[r] || step.p[c] === '.' || step.p[c] === '?'),
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
        <span style="font-size:12px; font-weight:700; color:#059669;">📐 二维动态规划表 dp[0..${n}][0..${m}] (自底向上从右往左)</span>
        <div style="display:flex; gap:8px; font-size:11px;">
          <span style="color:#2563eb;">■ 当前格</span>
          <span style="color:#d97706;">■ 依赖格</span>
        </div>
      </div>
      <div class="string-dp-2d-grid-wrapper" style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.string-dp-2d-grid-wrapper') as HTMLElement | null;
  if (wrapper) {
    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }
}
