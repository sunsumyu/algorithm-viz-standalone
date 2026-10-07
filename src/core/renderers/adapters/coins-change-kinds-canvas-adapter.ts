/**
 * 能成功找零的钱数种类 (POJ 1742 混合窗口优化)
 * Canvas Adapter: 货币储备资产库与找零面值解锁仓 + 四阶段沙盘演化
 */

import {
  COINS_CHANGE_STAGE1_CODE_LANGUAGES,
  COINS_CHANGE_STAGE2_CODE_LANGUAGES,
  COINS_CHANGE_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-stage-codes';
import { KNAPSACK_075_PROBLEMS } from '../../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-problem-content';
import {
  buildCoinsChangeRecursionSteps,
  buildCoinsChangeMemoSteps,
  buildCoinsChange2DSteps,
} from '../../../algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-stage-evolution';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../special-stage-cards';
import {
  parseCoinsChangeInputs,
  buildCoinsChangeKindsSteps,
  type CoinsChangeKindsStep,
} from './coins-change-kinds-step-compiler';

export function renderCoinsChangeSandbox(container: HTMLElement, step: any): void {
  const ratio = Math.min(100, Math.round((step.totalKinds / Math.max(1, step.targetM)) * 100));

  const coinsHtml = (step.coins || [])
    .map((c: any, idx: number) => {
      const isCur = idx === step.coinIndex;
      const tag = c.strategy === '01' ? '🎯 01背包' : c.strategy === 'unbounded' ? '♾️ 完全' : '🪟 布尔滑窗';
      return `
        <div style="background:${isCur ? 'rgba(30, 27, 75, 0.7)' : 'rgba(241, 245, 249, 0.9)'}; border:1.5px solid ${
        isCur ? '#f59e0b' : '#334155'
      }; border-radius:6px; padding:6px 10px; min-width:110px; flex:1; max-width:180px; display:flex; flex-direction:column; gap:3px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:${isCur ? '#f59e0b' : '#fbbf24'};">货币 #${idx + 1}</span>
            <span style="font-size:9px; background:#78350f; color:#fde68a; padding:1px 4px; border-radius:3px;">${tag}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
            <span style="color:#374151;">面值: <b style="color:#38bdf8;">${c.val} 元</b></span>
            <span style="color:#374151;">拥有: <b>${c.cnt} 张</b></span>
          </div>
        </div>
      `;
    })
    .join('');

  const solvedList: number[] = [];
  for (let j = 1; j <= step.targetM; j++) {
    if (step.dp?.[j]) solvedList.push(j);
  }

  const solvedTagsHtml = solvedList.length > 0
    ? solvedList.map((val) => `
        <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:2px 6px; font-size:10.5px; color:#a7f3d0; font-weight:700;">
          ${val} 元
        </div>
      `).join('')
    : `<span style="color:#64748b; font-size:11px;">(暂未凑出任何金额)</span>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#64748b; font-weight:700;">🪙 货币储备资产库 (01 / 完全 / 布尔滑窗自适应分流)</div>
        <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          金额上限 M: <b style="color:#38bdf8;">${step.targetM}</b> 元
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
        ${coinsHtml}
      </div>

      <!-- 底部实时找零解锁舱 -->
      <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#374151;">💰 已解锁可找零金额种类</span>
          <div style="display:flex; gap:16px; font-size:11px;">
            <span>解锁种类: <b style="color:#10b981;">${step.totalKinds}</b> / ${step.targetM} 种 (${ratio}%)</span>
          </div>
        </div>

        <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
          <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #38bdf8, #10b981); transition:width 0.25s ease;"></div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
          <span style="color:#64748b; font-size:10.5px; min-width:65px;">可找零金额:</span>
          ${solvedTagsHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderCoinsChangeVectorMatrix(container: HTMLElement, step: any): void {
  const cells = (step.dp || []).slice(1).map((ok: boolean, idx: number) => {
    const money = idx + 1;
    const isCur = step.j === money;
    const bg = isCur ? '#0284c7' : ok ? '#065f46' : '#1e293b';
    const border = isCur ? '#38bdf8' : ok ? '#34d399' : '#334155';
    const color = ok ? '#34d399' : '#64748b';
    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:30px; padding:3px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
        <span style="font-size:8px; color:#64748b;">${money}元</span>
        <span style="font-size:10.5px; font-weight:700; color:${color};">${ok ? 'T' : 'F'}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
      <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">找零金额可行性向量 dp[1..${step.targetM}] (T=可找零, F=不可找零)</div>
      <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-height:0; overflow-y:auto; gap:2px; background:#f1f5f9; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
        ${cells.join('')}
      </div>
    </div>
  `;
}

export function createCoinsChangeStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(Π(c_i+1))',
      theme: 'bg-rose',
      badge: {
        mode: '找零种类 · 暴力递归判定',
        complexity: 'O(Π(c_i+1)) · O(N) 栈深',
      },
      card1Title: '🌲 找零可行性枚举决策树',
      card2Title: '🔄 递归调用栈与监控',
      codeLanguages: COINS_CHANGE_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { m, valList, cntList } = parseCoinsChangeInputs(inputs);
        return buildCoinsChangeRecursionSteps(m, valList, cntList);
      },
      renderCanvas: (container: HTMLElement, step: any) => {
        const infoHtml = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
            <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;">${step.decision}</div>
            <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
          </div>
        `;
        renderSpecialRecursionCard1(container, {
          title: step.i < step.n ? `正在决策货币 #${step.i + 1}` : '所有货币枚举完成',
          callStack: step.callStack || [],
          customInfoHtml: infoHtml,
        });
      },
      renderCustomMetrics: (container: HTMLElement, step: any) => {
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:8px; align-items:center; justify-content:center; height:100%; padding:16px; box-sizing:border-box;">
            <div style="font-size:13px; font-weight:700; color:#f43f5e;">🪙 找零递归调用开销监控</div>
            <div style="display:flex; gap:16px; margin-top:8px;">
              <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
                <div style="font-size:11px; color:#64748b;">当前调用深度</div>
                <div style="font-size:20px; font-weight:800; color:#fbbf24;">${step.callStack?.length ?? 0}</div>
              </div>
              <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
                <div style="font-size:11px; color:#64748b;">剩余待凑金额</div>
                <div style="font-size:20px; font-weight:800; color:#38bdf8;">${step.remCap ?? 0} 元</div>
              </div>
            </div>
            <div style="font-size:11px; color:#64748b; text-align:center; max-width:320px; margin-top:6px;">
              暴力搜索每种货币使用 0..c[i] 张的分支组合，在无备忘录时呈现组合爆炸。
            </div>
          </div>
        `;
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N · M)',
      theme: 'bg-blue',
      badge: {
        mode: '找零种类 · 记忆化搜索',
        complexity: 'O(N · M · c) · O(N · M) 备忘录',
      },
      card1Title: '💾 找零备忘录探查 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存矩阵 memo[i][rem]',
      codeLanguages: COINS_CHANGE_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { m, valList, cntList } = parseCoinsChangeInputs(inputs);
        return buildCoinsChangeMemoSteps(m, valList, cntList);
      },
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard1(container, {
          stateStr: `checkMemo(i=${step.i}, rem=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard2(container, {
          title: '找零备忘录 memo[i][rem] (1=True, 0=False)',
          memo: step.memoGrid,
          curI: step.i,
          curJ: step.remCap,
        }),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N · M · c)',
      theme: 'bg-emerald',
      badge: {
        mode: '找零种类 · 严格二维布尔 DP',
        complexity: 'O(N · M · c) · O(N · M)',
      },
      card1Title: '📐 找零可行性转移推导',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      codeLanguages: COINS_CHANGE_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { m, valList, cntList } = parseCoinsChangeInputs(inputs);
        return buildCoinsChange2DSteps(m, valList, cntList);
      },
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.curI}][${step.curJ}]`,
          cellValStr: `${step.dpTable?.[step.curI]?.[step.curJ] === 1 ? 'True (可凑出)' : 'False (不可凑出)'}`,
          depCells: step.depCells || [],
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
        renderSpecial2DCard2(container, {
          title: '严格二维状态表 dp[i][j] (1=True, 0=False)',
          dp: step.dpTable,
          curI: step.curI,
          curJ: step.curJ,
          depCells: (step.depCells || []).map((d: any) => ({ r: d.r, c: d.c })),
        }),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间与滑块优化',
      shortName: '滑块优化',
      num: 4,
      timeBadge: 'O(N · M) 极限',
      theme: 'bg-amber',
      badge: {
        mode: '混合背包 · 三路分流 + 布尔滑块平摊 O(1)',
        complexity: 'O(N · M) · O(M)',
      },
      card1Title: '🪙 货币储备资产库与找零面值解锁仓',
      card2Title: '📊 找零金额可行性向量 dp[1..M]',
      codeLanguages: KNAPSACK_075_PROBLEMS['coins-change-kinds'].codeLanguages,
      buildSteps: buildCoinsChangeKindsSteps,
      renderCanvas: (container: HTMLElement, step: any) => renderCoinsChangeSandbox(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => renderCoinsChangeVectorMatrix(container, step),
    },
  ];
}
