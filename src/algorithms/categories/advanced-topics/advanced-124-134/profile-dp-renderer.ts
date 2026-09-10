/**
 * Class 125: 轮廓线 DP (Profile Dynamic Programming / 骨牌铺砖)
 * POJ 2411 蒙德里安的梦想 / 骨牌铺满棋盘
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { PROFILE_DP_CODES, PROFILE_DP_LINES } from './advanced-124-134-stage-codes';
import { AdvancedStep, renderProfileGrid } from './advanced-124-134-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ProfileDpStep extends AdvancedStep {
  n: number;
  m: number;
  curR: number;
  curC: number;
  activeMask: number;
  validStatesCount: number;
  highlightIndices?: number[];
  finalAns?: number;
}

export function buildProfileDpSteps(n: number, m: number): ProfileDpStep[] {
  const steps: ProfileDpStep[] = [];
  const lines = PROFILE_DP_LINES;

  let dp: Record<number, number> = { 0: 1 };
  const totalStates = 1 << m;

  // Step 0: 入口
  steps.push({
    n,
    m,
    curR: 0,
    curC: 0,
    activeMask: 0,
    validStatesCount: 1,
    decision: `主函数入口：开始计算在 ${n} x ${m} 棋盘中用 1 x 2 多米诺骨牌无重叠完全铺满的方案数`,
    message: `采用逐格推进的轮廓线 DP，轮廓线仅需 ${m} 位二进制状态，空间复杂度 O(2^M)`,
    log: `enter profileDpDomino(n=${n}, m=${m})`,
    codeLine: lines.entry,
    metrics: { '网格尺寸': `${n} x ${m}`, '轮廓状态数': 1 << m, '初始方案': 1 },
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const nxt: Record<number, number> = {};

      steps.push({
        n,
        m,
        curR: i,
        curC: j,
        activeMask: 0,
        validStatesCount: Object.keys(dp).length,
        decision: `移动到单元格 (${i}, ${j})：准备对轮廓线第 ${j} 位插头状态进行逐一转移拓展`,
        message: `当前活跃状态集合共有 ${Object.keys(dp).length} 种可能`,
        log: `cellLoop(i=${i}, j=${j})`,
        codeLine: lines.cellLoop,
        metrics: { '当前行 i': i, '当前列 j': j, '活跃轮廓数': Object.keys(dp).length },
      });

      for (let mask = 0; mask < totalStates; mask++) {
        const ways = dp[mask];
        if (!ways) continue;

        if ((mask & (1 << j)) !== 0) {
          // 上方有插头：必须向下合并消去
          const newMask = mask ^ (1 << j);
          nxt[newMask] = (nxt[newMask] || 0) + ways;

          steps.push({
            n,
            m,
            curR: i,
            curC: j,
            activeMask: mask,
            validStatesCount: Object.keys(nxt).length,
            decision: `🔌 单元格 (${i}, ${j}) 受到上方插头覆盖：强制消去插头，方案数累加 +${ways}`,
            message: `轮廓状态从 ${mask.toString(2).padStart(m, '0')} 转移至 ${newMask.toString(2).padStart(m, '0')}`,
            log: `mergeUp: mask=${mask} -> ${newMask}, +${ways}`,
            codeLine: lines.mergeUp,
            metrics: { '当前格': `(${i}, ${j})`, '处理动作': '上方插头合并', '转移方案': ways },
            highlightIndices: [mask, newMask],
          });
        } else {
          // 上方无插头：可竖放向下延伸，或横放向右延伸
          // 选项 1: 竖放
          const vertMask = mask | (1 << j);
          nxt[vertMask] = (nxt[vertMask] || 0) + ways;

          steps.push({
            n,
            m,
            curR: i,
            curC: j,
            activeMask: mask,
            validStatesCount: Object.keys(nxt).length,
            decision: `⬇️ 尝试在 (${i}, ${j}) 坚放骨牌：向下延伸出新插头，方案数累加 +${ways}`,
            message: `轮廓状态从 ${mask.toString(2).padStart(m, '0')} 转移至 ${vertMask.toString(2).padStart(m, '0')}`,
            log: `placeVert: mask=${mask} -> ${vertMask}, +${ways}`,
            codeLine: lines.placeVert,
            metrics: { '当前格': `(${i}, ${j})`, '放置类型': '竖放向下', '转移方案': ways },
          });

          // 选项 2: 横放向右
          if (j + 1 < m && (mask & (1 << (j + 1))) === 0) {
            const horzMask = mask | (1 << (j + 1));
            nxt[horzMask] = (nxt[horzMask] || 0) + ways;

            steps.push({
              n,
              m,
              curR: i,
              curC: j,
              activeMask: mask,
              validStatesCount: Object.keys(nxt).length,
              decision: `➡️ 尝试在 (${i}, ${j}) 横放骨牌：向右延伸至 (${i}, ${j+1})，方案数累加 +${ways}`,
              message: `轮廓状态从 ${mask.toString(2).padStart(m, '0')} 转移至 ${horzMask.toString(2).padStart(m, '0')}`,
              log: `placeHorz: mask=${mask} -> ${horzMask}, +${ways}`,
              codeLine: lines.placeHorz,
              metrics: { '当前格': `(${i}, ${j})`, '放置类型': '横放向右', '转移方案': ways },
            });
          }
        }
      }

      dp = nxt;
    }
  }

  const finalAns = dp[0] || 0;

  // 终态
  steps.push({
    n,
    m,
    curR: n - 1,
    curC: m - 1,
    activeMask: 0,
    validStatesCount: 1,
    finalAns,
    decision: `✅ 棋盘逐格决策完成！铺满 ${n} x ${m} 棋盘的有效合法总方案数为: ${finalAns}`,
    message: `最终合法铺满状态对应轮廓线上插头全部闭合（mask = 0）。单格推进成功避免了 2^(2M) 的冗余枚举！`,
    log: `profile dp finished, total ways = ${finalAns}`,
    codeLine: lines.returnAns,
    metrics: { '最终合法方案数': finalAns, '复杂度': `O(N x M x 2^M)` },
    statusBadge: { text: `铺满总方案: ${finalAns}`, type: 'success' },
  });

  return steps;
}

export const profileDpVisualizer = registerDeclarativeAlgorithm<ProfileDpStep>({
  id: 'profile-dp-125',
  name: '轮廓线 DP (Class 125)',
  category: 'dynamic-programming',
  icon: '🏁',
  difficulty: 3,
  levelOrder: 125,
  learningGoal: '掌握逐格状态压缩与插头合并的轮廓线动态规划机制，理解利用 M 位状态替代 2M 位行状压的降维思想',
  problemHtml: ADVANCED_124_134_PROBLEMS.profileDp.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.profileDp.html,
  inputs: [
    {
      id: 'n',
      label: '棋盘行数 N',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 4,
    },
    {
      id: 'm',
      label: '棋盘列数 M',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 4,
    },
  ],
  codeLanguages: PROFILE_DP_CODES,
  generateSteps: (input) => {
    const n = Math.min(4, Math.max(1, Number(input.n) || 2));
    const m = Math.min(4, Math.max(1, Number(input.m) || 3));
    return buildProfileDpSteps(n, m);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderProfileGrid(step.n, step.m, step.curR, step.curC, step.activeMask, step.finalAns !== undefined ? step.finalAns : step.validStatesCount)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前单元格坐标</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">(${step.curR}, ${step.curC})</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前有效轮廓数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.validStatesCount}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">最终铺满方案数</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.finalAns !== undefined ? step.finalAns : '计算中'}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '轮廓线 DP 转移引擎',
          `当前状态掩码: ${step.activeMask.toString(2).padStart(step.m, '0')} ${step.finalAns !== undefined ? `| 最终铺满总方案 = ${step.finalAns}` : ''}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
