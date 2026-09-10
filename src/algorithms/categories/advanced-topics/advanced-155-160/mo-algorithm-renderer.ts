/**
 * Class 159: 莫队算法 (Mo's Algorithm)
 * 莫涛发明 / 洛谷 P1494 [国家集训队] 小 Z 的袜子
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { MO_ALGORITHM_CODES, MO_ALGORITHM_LINES } from './advanced-155-160-stage-codes';
import { Advanced155Step, renderMoBoard } from './advanced-155-160-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MoStep extends Advanced155Step {
  arr: number[];
  blockSize: number;
  curL: number;
  curR: number;
  targetL: number;
  targetR: number;
  curAns: number;
}

export function buildMoSteps(arr: number[], queries: { l: number; r: number; id: number }[]): MoStep[] {
  const steps: MoStep[] = [];
  const lines = MO_ALGORITHM_LINES;

  const n = arr.length;
  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));

  // Step 0: 入口
  steps.push({
    arr: [...arr],
    blockSize,
    curL: 0,
    curR: -1,
    targetL: -1,
    targetR: -1,
    curAns: 0,
    decision: `主函数入口：开始对 ${n} 个元素的数组执行莫队算法，共处理 ${queries.length} 个区间询问`,
    message: `取块长 B = sqrt(N) = ${blockSize}。将所有离线询问按左端点所属块排序，块内按右端点奇偶交错排序`,
    log: `enter moAlgorithm(n=${n}, b=${blockSize})`,
    codeLine: lines.entry,
    metrics: { '数组长度 N': n, '块长 B': blockSize, '离线询问数': queries.length },
  });

  // 1. 奇偶分块排序
  const sortedQ = [...queries].sort((a, b) => {
    const bA = Math.floor(a.l / blockSize);
    const bB = Math.floor(b.l / blockSize);
    if (bA !== bB) return bA - bB;
    return (bA & 1) ? a.r - b.r : b.r - a.r;
  });

  steps.push({
    arr: [...arr],
    blockSize,
    curL: 0,
    curR: -1,
    targetL: sortedQ[0].l,
    targetR: sortedQ[0].r,
    curAns: 0,
    decision: `离线排序完成：双关键字奇偶排序使双指针在相邻询问间无需频繁折返，将指针移动次数减半`,
    message: `排序后询问顺序: [${sortedQ.map(q => `[${q.l}..${q.r}]`).join(', ')}]`,
    log: `sortBlockComplete`,
    codeLine: lines.sortBlock,
    statusBadge: { text: '奇偶排序完成', type: 'info' },
    metrics: { '排序后首个询问': `[${sortedQ[0].l}..${sortedQ[0].r}]` },
  });

  // 2. 双指针挪动
  let curL = 0;
  let curR = -1;
  const cnt = new Map<number, number>();
  let curAns = 0;

  const add = (idx: number) => {
    const val = arr[idx];
    const c = cnt.get(val) || 0;
    cnt.set(val, c + 1);
    if (c === 0) curAns++; // 新增相异元素
  };

  const del = (idx: number) => {
    const val = arr[idx];
    const c = cnt.get(val) || 0;
    if (c === 1) {
      cnt.delete(val);
      curAns--;
    } else {
      cnt.set(val, c - 1);
    }
  };

  for (let qIdx = 0; qIdx < sortedQ.length; qIdx++) {
    const q = sortedQ[qIdx];

    // 移动右端点
    while (curR < q.r) {
      curR++;
      add(curR);
    }
    while (curR > q.r) {
      del(curR);
      curR--;
    }

    // 移动左端点
    while (curL > q.l) {
      curL--;
      add(curL);
    }
    while (curL < q.l) {
      del(curL);
      curL++;
    }

    steps.push({
      arr: [...arr],
      blockSize,
      curL,
      curR,
      targetL: q.l,
      targetR: q.r,
      curAns,
      decision: `处理询问 ${qIdx + 1}/${sortedQ.length} (区间 [${q.l}, ${q.r}])：双指针移达目标，区间相异数字种类为 ${curAns}`,
      message: `指针移动到目标位置，记录询问 id=${q.id} 的答案为 ${curAns}`,
      log: `solveQuery: q=[${q.l}, ${q.r}], ans=${curAns}`,
      codeLine: lines.returnAns,
      statusBadge: { text: `区间 [${q.l}..${q.r}] 答案: ${curAns}`, type: 'success' },
      metrics: { '目标区间': `[${q.l}..${q.r}]`, '相异种类数': curAns, '当前双指针': `[${curL}, ${curR}]` },
    });
  }

  return steps;
}

export const moAlgorithmVisualizer = registerDeclarativeAlgorithm<MoStep>({
  id: 'mo-algorithm-159',
  name: '莫队算法 (Class 159)',
  category: 'search',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 159,
  description: '左程云算法通关课 Class 159：莫队算法与离线分块。莫涛发明，奇偶排序块双指针平滑移动，O(N sqrt(Q)) 优雅解决区间无修改离线统计。',
  learningGoal: '深刻理解莫队算法的分块划分原理与奇偶排序优化，掌握双指针 [L, R] 的四向伸缩转移机制',
  problemHtml: ADVANCED_155_160_PROBLEMS.moAlgorithm.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.moAlgorithm.html,
  inputs: [
    {
      id: 'preset',
      label: '输入序列与询问配置',
      type: 'select',
      defaultValue: 'mo_standard',
      options: [
        { label: '8 元素 4 询问测试 ([1, 2, 1, 1, 1, 2, 3, 2])', value: 'mo_standard' },
      ],
    },
  ],
  codeLanguages: MO_ALGORITHM_CODES,
  generateSteps: () => {
    const arr = [1, 2, 1, 1, 1, 2, 3, 2];
    const queries = [
      { l: 0, r: 2, id: 1 },
      { l: 1, r: 4, id: 2 },
      { l: 2, r: 6, id: 3 },
      { l: 3, r: 7, id: 4 },
    ];
    return buildMoSteps(arr, queries);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderMoBoard(
          step.arr,
          step.blockSize,
          step.curL,
          step.curR,
          step.targetL,
          step.targetR,
          step.curAns
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前指针范围 [L, R]</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
              [${step.curL}, ${step.curR}]
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">相异元素种类总数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.curAns} 种</div>
          </div>
        </div>

        ${renderFormulaCard(
          '莫队离线分块双指针引擎',
          `最优块长: B = N / sqrt(Q) | 奇偶优化: 奇数块 R 升序，偶数块 R 降序 | 总移动复杂度: O(N sqrt(Q))`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
