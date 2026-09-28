/**
 * 左程云 Class 072 Code01: 堆叠长方体的最大高度 (Maximum Height by Stacking Cuboids · LeetCode 1691)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  STACKING_CUBOIDS_072_CODES,
  STACKING_CUBOIDS_072_HTML,
  STACKING_CUBOIDS_072_LINES,
} from './dp-071-072-problem-content';
import { Dp071StepBase } from './dp-071-072-shared';

export interface CuboidStep extends Dp071StepBase {
  cuboids: [number, number, number][];
  dp: number[];
  currentIdx: number;
  compareIdx?: number;
  maxHeight: number;
  stageName: string;
}

const PRESETS: Record<string, [number, number, number][]> = {
  standard: [
    [50, 45, 20],
    [95, 37, 53],
    [45, 23, 12],
  ],
  cubes: [
    [38, 25, 45],
    [76, 35, 3],
  ],
  permutations: [
    [7, 11, 17],
    [7, 17, 11],
    [11, 7, 17],
    [11, 17, 7],
    [17, 7, 11],
    [17, 11, 7],
  ],
};

export function buildStackingCuboids072Steps(rawCuboids?: [number, number, number][]): CuboidStep[] {
  const input = rawCuboids && rawCuboids.length > 0 ? rawCuboids : PRESETS.standard;
  const n = input.length;
  const steps: CuboidStep[] = [];
  const lines = STACKING_CUBOIDS_072_LINES;

  // Step 0: 原始长方体输入
  const initialCuboids = input.map(c => [...c] as [number, number, number]);
  steps.push({
    title: '算法就绪与数据录入',
    description: `共有 ${n} 个长方体输入`,
    message: `🚀 初始化堆叠长方体问题：共有 ${n} 个长方体等待摆放与堆叠。`,
    explanation: '左神贪心点拨：若长方体 A 可叠在 B 上，将二者均以最大边作高、次大边作长、最小边作宽，底面包含关系依然满足，且高度累计最优！',
    line: lines.entry.javascript,
    codeLine: lines.entry,
    cuboids: initialCuboids,
    dp: new Array(n).fill(0),
    currentIdx: -1,
    maxHeight: 0,
    stageName: '原始输入',
    metrics: { '长方体个数': n, '当前阶段': '输入就绪', '最大累计高度': 0 },
  });

  // Step 1: 内部排序归一化
  const normalized = initialCuboids.map(c => {
    const sorted = [...c].sort((a, b) => a - b);
    return [sorted[0], sorted[1], sorted[2]] as [number, number, number];
  });

  steps.push({
    title: '贪心归一化: 内部长宽高排序',
    description: '每个长方体内部排序，确保 c[0] <= c[1] <= c[2]',
    message: `📐 贪心归一化：每个长方体内部尺寸排序，确保 width <= length <= height，将最大维度立起作为高。`,
    explanation: '长方体可以任意翻转。为了使总高度最大且尽量满足底面约束，每个长方体必选最大边作为高最为贪心划算。',
    line: lines.sortInternal.javascript,
    codeLine: lines.sortInternal,
    cuboids: normalized.map(c => [...c] as [number, number, number]),
    dp: new Array(n).fill(0),
    currentIdx: -1,
    maxHeight: 0,
    stageName: '内部归一化',
    metrics: { '长方体个数': n, '当前阶段': '维度排序完成' },
  });

  // Step 2: 整体三维字典序排序
  normalized.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0];
    if (a[1] !== b[1]) return a[1] - b[1];
    return a[2] - b[2];
  });

  steps.push({
    title: '整体字典序排序',
    description: '所有长方体按 (w, l, h) 升序排列',
    message: `📊 整体拓扑排序：所有长方体按宽、长、高字典序升序排列，消除循环依赖，降维成 LIS。`,
    explanation: '排序后，长方体 j 如果能放在长方体 i 上，则必然有 j < i，从而将三维偏序转化为标准最长递增子序列 (LIS) 模式。',
    line: lines.sortCuboids.javascript,
    codeLine: lines.sortCuboids,
    cuboids: normalized.map(c => [...c] as [number, number, number]),
    dp: new Array(n).fill(0),
    currentIdx: -1,
    maxHeight: 0,
    stageName: '整体升序就绪',
    metrics: { '当前阶段': '已升序排列' },
  });

  // Step 3: 初始化 DP 数组为各自自身高度
  const dp = normalized.map(c => c[2]);
  let ans = Math.max(...dp, 0);

  steps.push({
    title: '初始化 DP 数组',
    description: '每个长方体自身独立放置时的高度即为其高 dp[i] = cuboids[i][2]',
    message: `🏁 初始状态：dp[i] 赋初值为自身高度 cuboids[i][2]，即不叠加任何前驱底座时的基础高度。`,
    explanation: '任何一个长方体自身都可以单独构成一座塔，初始高度即为它立起的高度。',
    line: lines.initDp.javascript,
    codeLine: lines.initDp,
    cuboids: normalized.map(c => [...c] as [number, number, number]),
    dp: [...dp],
    currentIdx: -1,
    maxHeight: ans,
    stageName: 'DP状态初试',
    metrics: { '基础最高高度': ans },
  });

  // Step 4: 动态规划外层与内层
  for (let i = 0; i < n; i++) {
    steps.push({
      title: `选定长方体 i=${i} 作为底层底座`,
      description: `底座尺寸: 宽=${normalized[i][0]}, 长=${normalized[i][1]}, 高=${normalized[i][2]}`,
      message: `🧱 考察底层：以长方体 ${i} [宽=${normalized[i][0]}, 长=${normalized[i][1]}, 高=${normalized[i][2]}] 为底层支撑，向前寻找可承托的前驱长方体。`,
      explanation: '在所有 0 <= j < i 的长方体中，寻找满足三维完全被包含的长方体 j。',
      line: lines.outerLoop.javascript,
      codeLine: lines.outerLoop,
      cuboids: normalized.map(c => [...c] as [number, number, number]),
      dp: [...dp],
      currentIdx: i,
      maxHeight: ans,
      stageName: '考察底座',
      metrics: { '当前底座 i': i, '底座自身高度': normalized[i][2], '全局最大高度': ans },
    });

    for (let j = 0; j < i; j++) {
      const canStack =
        normalized[j][0] <= normalized[i][0] &&
        normalized[j][1] <= normalized[i][1] &&
        normalized[j][2] <= normalized[i][2];

      if (canStack) {
        const potential = dp[j] + normalized[i][2];
        const isBetter = potential > dp[i];
        if (isBetter) {
          dp[i] = potential;
        }

        steps.push({
          title: `长方体 ${j} 可以叠在底座 ${i} 上！`,
          description: `前驱三维 [${normalized[j].join(',')}] <= 底座 [${normalized[i].join(',')}], 累计高度更新为 ${dp[i]}`,
          message: `✨ 成功承托：长方体 ${j} 能够稳稳放置于长方体 ${i} 之上！${isBetter ? `刷新 dp[${i}] = dp[${j}] + ${normalized[i][2]} = ${dp[i]}！` : `当前组合未打破已有最佳高度 ${dp[i]}。`}`,
          explanation: '由于长方体 j 的三维尺寸皆小于等于长方体 i，所以 j 可以作为顶层结构，累加当前底座的高度。',
          line: lines.checkCondition.javascript,
          codeLine: lines.checkCondition,
          cuboids: normalized.map(c => [...c] as [number, number, number]),
          dp: [...dp],
          currentIdx: i,
          compareIdx: j,
          maxHeight: Math.max(ans, dp[i]),
          stageName: '堆叠转移',
          metrics: { '底座 i': i, '承托前驱 j': j, '底座最大高度 dp[i]': dp[i] },
        });
      }
    }

    if (dp[i] > ans) {
      ans = dp[i];
      steps.push({
        title: `刷新全局最高塔高度 ➔ ${ans}`,
        description: `全局最大累计高度更新为 ${ans}`,
        message: `🏆 高度突破：以长方体 ${i} 为底座的堆叠塔总高度达到 ${ans}，刷新全局纪录！`,
        explanation: '持续维护全局最大堆叠总高度。',
        line: lines.updateMax.javascript,
        codeLine: lines.updateMax,
        cuboids: normalized.map(c => [...c] as [number, number, number]),
        dp: [...dp],
        currentIdx: i,
        maxHeight: ans,
        stageName: '刷新最高纪录',
        metrics: { '全局最大高度': ans },
      });
    }
  }

  // 终局步骤
  steps.push({
    title: '堆叠长方体最大高度求解完成',
    description: `最大累计高度为 ${ans}`,
    message: `🎉 求解完毕：通过[内部长宽高排序 + 整体字典序升序 + 经典带权LIS]，成功求得堆叠长方体的最大总高度为 ${ans}！`,
    explanation: '本题是多维偏序向 LIS 降维并结合贪心旋转的经典典范，时间复杂度 O(N^2)。',
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    cuboids: normalized.map(c => [...c] as [number, number, number]),
    dp: [...dp],
    currentIdx: n - 1,
    maxHeight: ans,
    stageName: '求解完成',
    metrics: { '最终最大总高度': ans, '状态': '求解完毕' },
  });

  return steps;
}

export function renderStackingCuboidsCanvas(container: HTMLElement, step: CuboidStep): void {
  const cuboidCards = step.cuboids
    .map((c, idx) => {
      const isCurrent = idx === step.currentIdx;
      const isCompare = idx === step.compareIdx;

      let borderColor = '#334155';
      let bgColor = 'rgba(30, 41, 59, 0.7)';
      if (isCurrent) {
        borderColor = '#38bdf8';
        bgColor = 'rgba(14, 165, 233, 0.18)';
      } else if (isCompare) {
        borderColor = '#f59e0b';
        bgColor = 'rgba(245, 158, 11, 0.18)';
      }

      return `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          background: ${bgColor};
          border: 1.5px solid ${borderColor};
          border-radius: 8px;
          padding: 8px 12px;
          min-width: 90px;
          transition: all 0.25s ease;
        ">
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">#${idx}</div>
          <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin: 4px 0; font-family: monospace;">
            ${c[0]} × ${c[1]} × <span style="color: #38bdf8;">${c[2]}</span>
          </div>
          <div style="font-size: 11px; color: #4ade80; font-family: monospace; border-top: 1px solid rgba(148, 163, 184, 0.15); width: 100%; text-align: center; padding-top: 4px;">
            dp: ${step.dp[idx] ?? '-'}
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #0f172a; color: #f8fafc; padding: 12px; box-sizing: border-box; overflow-y: auto;">
      <div style="
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
        padding: 16px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid #334155;
        border-radius: 10px;
      ">
        ${cuboidCards}
      </div>
    </div>
  `;
}

export const stackingCuboids072Visualizer = registerDeclarativeAlgorithm<CuboidStep>({
  id: 'stacking-cuboids',
  aliases: ['class072-code01', 'stacking-cuboids-1691', 'leetcode-1691'],
  name: '堆叠长方体的最大高度 (Stacking Cuboids)',
  category: 'dynamic-programming',
  icon: '📦',
  difficulty: 3,
  levelOrder: 1691,
  learningGoal: '掌握三维偏序问题通过贪心内部排序消解自由度，并结合整体字典序排序降维至带权 LIS 的精妙思想',
  metrics: [
    { id: 'maxHeight', label: '最大堆叠高度', color: 'emerald' },
    { id: 'currentIdx', label: '底座下标 i', color: 'blue' },
  ],
  problemHtml: STACKING_CUBOIDS_072_HTML,
  codeLanguages: STACKING_CUBOIDS_072_CODES,
  presets: [
    { label: '经典三箱: 50x45x20; 95x37x53; 45x23x12', values: { cuboids: '50,45,20; 95,37,53; 45,23,12' } },
    { label: '互不相容: 38x25x45; 76x35x3', values: { cuboids: '38,25,45; 76,35,3' } },
    { label: '置换对称: 7,11,17 六种排列', values: { cuboids: '7,11,17; 7,17,11; 11,7,17; 11,17,7; 17,7,11; 17,11,7' } },
  ],
  inputs: [
    {
      id: 'cuboids',
      label: '长方体列表 [w, l, h] 分号分隔 (如: 50,45,20; 95,37,53; 45,23,12)',
      type: 'text',
      defaultValue: '50,45,20; 95,37,53; 45,23,12',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.cuboids || '50,45,20; 95,37,53; 45,23,12');
    const parsed: [number, number, number][] = raw
      .split(';')
      .map(part => {
        const dims = part.split(',').map(s => Number(s.trim()));
        if (dims.length === 3 && dims.every(d => !isNaN(d) && d > 0)) {
          return [dims[0], dims[1], dims[2]] as [number, number, number];
        }
        return null;
      })
      .filter((c): c is [number, number, number] => c !== null);

    return buildStackingCuboids072Steps(parsed.length > 0 ? parsed : PRESETS.standard);
  },
  renderCanvas: (container, step) => {
    renderStackingCuboidsCanvas(container, step);
  },
});
