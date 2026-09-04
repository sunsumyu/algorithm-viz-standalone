/**
 * 稳定婚姻匹配 (Stable Marriage - Gale-Shapley 延迟接受算法) 声明式可视化器
 * 进阶匹配理论: 男士主动求婚、女士择优暂留、严格无不稳定阻碍对 (洛谷 P4867 / 诺贝尔经济学奖算法)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (husband, wife, nextPropose) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  STABLE_MARRIAGE_CODE_LANGUAGES,
  STABLE_MARRIAGE_PROBLEM_HTML,
  STABLE_MARRIAGE_ANALYSIS_HTML,
} from './stable-marriage-problem-content';

export interface MarriageStep {
  proposingMan: string;
  proposedWoman: string;
  currentEngagements: Record<string, string>;
  freeMen: string[];
  husbandArray: number[];
  wifeArray: number[];
  nextProposeArray: number[];
  activeArray?: 'husband' | 'wife' | 'nextPropose';
  activeSlot?: number;
  status: 'propose' | 'accept' | 'reject' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildStableMarriageSteps(preset: string = 'classic_3pair'): MarriageStep[] {
  const steps: MarriageStep[] = [];
  const is4Pair = preset === 'cyclic_4pair';
  const n = is4Pair ? 4 : 3;

  // 偏好列表定义
  // classic_3pair: 目标结果 W1: M2, W2: M1, W3: M3
  // 男士偏好:
  // M1: [W1, W2, W3] (首选 W1, 次选 W2)
  // M2: [W1, W3, W2] (首选 W1)
  // M3: [W1, W2, W3]
  // 女士偏好排名:
  // W1: 偏好 M2 > M1 > M3 -> 初始 M1 求婚接受，M2 来时 W1 甩掉 M1 接受 M2！M1 转而向 W2 求婚被接受！
  // W2: 偏好 M1 > M2 > M3
  // W3: 偏好 M3 > M1 > M2
  const menPref: number[][] = is4Pair
    ? [
        [],
        [1, 2, 3, 4],
        [1, 3, 4, 2],
        [2, 1, 4, 3],
        [1, 4, 2, 3],
      ]
    : [
        [],
        [1, 2, 3],
        [1, 3, 2],
        [1, 2, 3],
      ];

  const womenRank: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  if (is4Pair) {
    // 女士偏好
    const wPref = [
      [],
      [4, 2, 1, 3], // W1 喜欢 M4 > M2 > M1 > M3
      [1, 3, 2, 4],
      [2, 4, 3, 1],
      [3, 1, 4, 2],
    ];
    for (let w = 1; w <= n; w++) {
      for (let r = 0; r < n; r++) {
        womenRank[w][wPref[w][r]] = r;
      }
    }
  } else {
    // 3 pair
    const wPref = [
      [],
      [2, 1, 3], // W1 喜欢 M2 > M1 > M3
      [1, 2, 3], // W2 喜欢 M1 > M2 > M3
      [3, 1, 2], // W3 喜欢 M3 > M1 > M2
    ];
    for (let w = 1; w <= n; w++) {
      for (let r = 0; r < n; r++) {
        womenRank[w][wPref[w][r]] = r;
      }
    }
  }

  const husband: number[] = new Array(n + 1).fill(0);
  const wife: number[] = new Array(n + 1).fill(0);
  const nextPropose: number[] = new Array(n + 1).fill(0);
  const freeMenQueue: number[] = [];

  let currentProposingMan = 'M1';
  let currentProposedWoman = 'W1';

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'propose' | 'accept' | 'reject' | 'done',
    activeArray?: 'husband' | 'wife' | 'nextPropose',
    activeSlot?: number
  ): void {
    const engagements: Record<string, string> = {};
    for (let w = 1; w <= n; w++) {
      if (husband[w] > 0) {
        engagements[`W${w}`] = `M${husband[w]}`;
      }
    }

    const matchedPairsStr = `${Object.keys(engagements).length} / ${n}`;
    const curPropStr = status === 'done' ? '全部完备匹配' : `${currentProposingMan} ➔ ${currentProposedWoman}`;
    const freeStr = freeMenQueue.length > 0 ? `待求婚: [ ${freeMenQueue.map((m) => `M${m}`).join(', ')} ]` : '无单身男士';
    const phaseStr =
      status === 'done'
        ? '算法结束'
        : status === 'reject'
          ? '女士婉拒'
          : status === 'accept'
            ? '女士暂留/移情'
            : '发起求婚';

    steps.push({
      proposingMan: currentProposingMan,
      proposedWoman: currentProposedWoman,
      currentEngagements: engagements,
      freeMen: freeMenQueue.map((m) => `M${m}`),
      husbandArray: husband.slice(1),
      wifeArray: wife.slice(1),
      nextProposeArray: nextPropose.slice(1),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-prop': curPropStr,
        'metric-matched-pairs': matchedPairsStr,
        'metric-free-men': freeStr,
        'metric-marriage-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 7: init
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 位男士与 ${n} 位女士的偏好榜单，准备启动 Gale-Shapley 算法。`, 'init() 入口', 'propose');

  // 行 8-11: 建立 womenRank 查表
  makeStep(10, '📊 [构建女士偏好查表] womenRank[w][m] 记录女士 w 对男士 m 的喜爱排名，实现 O(1) 偏好比对。', '预处理 womenRank', 'propose');

  // 行 17-19: 初始化状态数组
  makeStep(17, '🧹 [状态数组置零] husband[], wife[], nextPropose[] 初始化完毕。', '分配状态数组', 'propose');

  // 行 23: freeMen 队列初始化
  for (let i = 1; i <= n; i++) {
    freeMenQueue.push(i);
    makeStep(23, `👥 [男士入队] 男士 M${i} 加入单身待求婚队列。`, `enqueue(M${i})`, 'propose');
  }

  // ==================== 2. Gale-Shapley 主循环 ====================
  let safetyLimit = 0;
  while (freeMenQueue.length > 0 && safetyLimit++ < 100) {
    // 行 27: int m = freeMen.poll();
    const m = freeMenQueue.shift()!;
    currentProposingMan = `M${m}`;
    makeStep(27, `📤 [出队求婚] 单身男士 M${m} 出队，准备向心仪女士发起求婚。`, `poll(M${m})`, 'propose');

    // 行 28: int w = menPref[m][nextPropose[m]++];
    const prefRank = nextPropose[m];
    const w = menPref[m][prefRank];
    nextPropose[m]++;
    currentProposedWoman = `W${w}`;
    makeStep(28, `💌 [锁定目标女士] 男士 M${m} 向其第 ${prefRank + 1} 顺位心仪女士 W${w} 发起求婚！`, `M${m} 向 W${w} 求婚`, 'propose', 'nextPropose', m - 1);

    // 行 30: if (husband[w] == 0)
    if (husband[w] === 0) {
      // 女士单身，直接接受
      husband[w] = m;
      wife[m] = w;
      makeStep(32, `💍 [直接订婚] 女士 W${w} 当前单身，欣然接受男士 M${m} 的求婚！`, `W${w} 接受 M${m}`, 'accept', 'husband', w - 1);
    } else {
      // 竞争比对
      const cur = husband[w];
      makeStep(34, `⚖️ [择优对比] 女士 W${w} 已与男士 M${cur} 订婚！比对两位追求者：rank(M${m})=${womenRank[w][m]} vs rank(M${cur})=${womenRank[w][cur]}。`, '女士对比追求者', 'propose');

      if (womenRank[w][m] < womenRank[w][cur]) {
        // 移情别恋
        husband[w] = m;
        wife[m] = w;
        wife[cur] = 0;
        freeMenQueue.push(cur);
        makeStep(38, `💔 [移情换约] 女士 W${w} 更喜欢新追求者 M${m}！解除与 M${cur} 的婚约，M${cur} 重获单身重回队列！`, `W${w} 换约为 M${m}`, 'accept', 'husband', w - 1);
      } else {
        // 拒绝
        freeMenQueue.push(m);
        makeStep(44, `🙅 [婉拒追求] 女士 W${w} 更青睐现任未婚夫 M${cur}，婉拒男士 M${m}！M${m} 保持单身重回队列。`, `W${w} 拒绝 M${m}`, 'reject');
      }
    }
  }

  // 终态
  makeStep(50, `🎉 [稳定婚姻匹配达成] 所有男女全部成功缔结婚约，且经过 Gale-Shapley 算法验证，全场不存在任何不稳定阻碍对 (Blocking Pair)！`, '稳定匹配完成', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MarriageStep>({
  id: 'stable-marriage',
  name: '稳定婚姻匹配 (Stable Marriage - Gale-Shapley)',
  viewId: 'algo-stable-marriage-view',
  category: 'graph',
  icon: '💍',
  badge: {
    mode: '男士主动求婚 + 女士择优暂留',
    complexity: 'O(N²) · O(N²)',
  },
  card1Title: '💍 男女偏好拓扑、求婚协商与婚约沙盘',
  card2Title: '📊 婚约状态监视器 (husband, wife, nextPropose)',
  card2Desc: '逐行对齐男士出队求婚、O(1) 查表偏好比对、移情别恋反悔与无不稳定阻碍对定理',
  legend: [
    { label: '男士节点 (M1..Mn)', color: '#1e3a8a' },
    { label: '女士节点 (W1..Wn)', color: '#831843' },
    { label: '🟢 确立婚约 (实线)', color: '#10b981' },
    { label: '🟡 正在求婚 (金色)', color: '#facc15' },
    { label: '🔴 婉拒求婚 (红色)', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设偏好网络',
      type: 'select',
      defaultValue: 'classic_3pair',
      options: [
        { label: '3 对经典偏好 (W1:M2, W2:M1, W3:M3)', value: 'classic_3pair' },
        { label: '4 对循环偏好 (4 对完全匹配)', value: 'cyclic_4pair' },
      ],
    },
  ],
  presets: [
    { label: '3 对偏好', values: { 'input-preset': 'classic_3pair' } },
    { label: '4 对偏好', values: { 'input-preset': 'cyclic_4pair' } },
  ],
  metrics: [
    { id: 'metric-cur-prop', label: '当前求婚动作', color: '#facc15' },
    { id: 'metric-matched-pairs', label: '已缔结婚约数', color: '#10b981' },
    { id: 'metric-free-men', label: '单身男士队列', color: '#38bdf8' },
    { id: 'metric-marriage-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: STABLE_MARRIAGE_CODE_LANGUAGES,
  problemHtml: STABLE_MARRIAGE_PROBLEM_HTML,
  analysisHtml: STABLE_MARRIAGE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_3pair') as string;
    return buildStableMarriageSteps(preset);
  },
  renderCanvas: (container, step) => {
    const is4 = step.husbandArray.length === 4;
    const n = is4 ? 4 : 3;

    const leftCoords: Record<string, { x: number; y: number }> = {};
    const rightCoords: Record<string, { x: number; y: number }> = {};

    const yGap = is4 ? 40 : 55;
    const yStart = is4 ? 40 : 45;

    for (let i = 1; i <= n; i++) {
      leftCoords[`M${i}`] = { x: 75, y: yStart + (i - 1) * yGap };
      rightCoords[`W${i}`] = { x: 235, y: yStart + (i - 1) * yGap };
    }

    const engagements = step.currentEngagements;

    let svgEdges = '';
    // 绘制订婚边
    for (let w = 1; w <= n; w++) {
      const mStr = engagements[`W${w}`];
      if (mStr) {
        const p1 = leftCoords[mStr];
        const p2 = rightCoords[`W${w}`];
        if (p1 && p2) {
          svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="3" />`;
        }
      }
    }

    // 绘制当前动作边
    if (step.proposingMan && step.proposedWoman && step.status !== 'done') {
      const p1 = leftCoords[step.proposingMan];
      const p2 = rightCoords[step.proposedWoman];
      if (p1 && p2) {
        const color = step.status === 'reject' ? '#ef4444' : '#facc15';
        svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="2.5" stroke-dasharray="4,2" />`;
      }
    }

    let svgNodes = '';
    for (let i = 1; i <= n; i++) {
      const mStr = `M${i}`;
      const wStr = `W${i}`;
      const pL = leftCoords[mStr];
      const pR = rightCoords[wStr];

      const isCurM = step.proposingMan === mStr;
      const isCurW = step.proposedWoman === wStr;
      const curHusband = engagements[wStr];

      svgNodes += `
        <g>
          <circle cx="${pL.x}" cy="${pL.y}" r="15" fill="${isCurM ? '#0369a1' : '#1e3a8a'}" stroke="${isCurM ? '#38bdf8' : '#64748b'}" stroke-width="${isCurM ? 3 : 1.5}" />
          <text x="${pL.x}" y="${pL.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${mStr}</text>
        </g>
        <g>
          <circle cx="${pR.x}" cy="${pR.y}" r="15" fill="${curHusband ? '#831843' : '#4c0519'}" stroke="${isCurW ? '#facc15' : '#ec4899'}" stroke-width="${isCurW ? 3 : 1.5}" />
          <text x="${pR.x}" y="${pR.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${wStr}</text>
          <text x="${pR.x + 28}" y="${pR.y + 4}" fill="${curHusband ? '#10b981' : '#94a3b8'}" font-size="8.5" font-family="monospace" font-weight="700">${curHusband ? `💍${curHusband}` : '单身'}</text>
        </g>
      `;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          左侧为男士 M，右侧为女士 W | 绿色实线为当前订婚 | 虚线为求婚与协商 | Gale-Shapley 定理：男士最优且必定稳定
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-stable-marriage-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const indices = Array.from({ length: n }, (_, i) => i);
        const renderRow = (name: string, arr: any[], activeName: string, color: string, prefix: string) => {
          const cells = indices
            .map((idx) => {
              const val = arr[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const displayVal = val === 0 ? '-' : prefix === 'W' ? `M${val}` : prefix === 'M' ? `W${val}` : `${val}`;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">${prefix}[${idx + 1}]</span>
                <span style="line-height: 1.1;">${displayVal}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const husRow = renderRow('husband[] (未婚夫)', step.husbandArray, 'husband', '#ec4899', 'W');
        const wifRow = renderRow('wife[] (未婚妻)', step.wifeArray, 'wife', '#38bdf8', 'M');
        const nxtRow = renderRow('nextPropose[] (顺位)', step.nextProposeArray, 'nextPropose', '#f59e0b', 'M');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${husRow}
              ${wifRow}
              ${nxtRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">当前已缔结婚约数:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${Object.keys(step.currentEngagements).length} / ${n} 对</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #94a3b8; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'stable-marriage',
  name: '稳定婚姻匹配 (Stable Marriage - Gale-Shapley)',
  viewId: 'algo-stable-marriage-view',
  category: 'graph',
  description: '博弈论与匹配经典：男士逐轮求婚、女士择优暂留、证明必定收敛且无不稳定阻碍对 (诺贝尔经济学奖算法)',
  icon: '💍',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 91,
  learningGoal: '掌握 Gale-Shapley 延迟接受算法机制、女士反悔移情逻辑及无不稳定阻碍对定理',
});

export { Visualizer as StableMarriageVisualizer };
