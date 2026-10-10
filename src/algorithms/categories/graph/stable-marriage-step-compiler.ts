/**
 * 稳定婚姻匹配 (Stable Marriage - Gale-Shapley 延迟接受算法) 步进编译器
 * 进阶匹配理论: 男士主动求婚、女士择优暂留、严格无不稳定阻碍对 (洛谷 P4867 / 诺贝尔经济学奖算法)
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

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

  // 1. 初始化
  makeStep(7, `🚀 [算法初始化] 建立包含 ${n} 位男士与 ${n} 位女士的偏好榜单，准备启动 Gale-Shapley 算法。`, 'init() 入口', 'propose');
  makeStep(10, '📊 [构建女士偏好查表] womenRank[w][m] 记录女士 w 对男士 m 的喜爱排名，实现 O(1) 偏好比对。', '预处理 womenRank', 'propose');
  makeStep(17, '🧹 [状态数组置零] husband[], wife[], nextPropose[] 初始化完毕。', '分配状态数组', 'propose');

  for (let i = 1; i <= n; i++) {
    freeMenQueue.push(i);
    makeStep(23, `👥 [男士入队] 男士 M${i} 加入单身待求婚队列。`, `enqueue(M${i})`, 'propose');
  }

  // 2. Gale-Shapley 主循环
  let safetyLimit = 0;
  while (freeMenQueue.length > 0 && safetyLimit++ < 100) {
    const m = freeMenQueue.shift()!;
    currentProposingMan = `M${m}`;
    makeStep(27, `📤 [出队求婚] 单身男士 M${m} 出队，准备向心仪女士发起求婚。`, `poll(M${m})`, 'propose');

    const prefRank = nextPropose[m];
    const w = menPref[m][prefRank];
    nextPropose[m]++;
    currentProposedWoman = `W${w}`;
    makeStep(28, `💌 [锁定目标女士] 男士 M${m} 向其第 ${prefRank + 1} 顺位心仪女士 W${w} 发起求婚！`, `M${m} 向 W${w} 求婚`, 'propose', 'nextPropose', m - 1);

    if (husband[w] === 0) {
      husband[w] = m;
      wife[m] = w;
      makeStep(32, `💍 [直接订婚] 女士 W${w} 当前单身，欣然接受男士 M${m} 的求婚！`, `W${w} 接受 M${m}`, 'accept', 'husband', w - 1);
    } else {
      const cur = husband[w];
      makeStep(34, `⚖️ [择优对比] 女士 W${w} 已与男士 M${cur} 订婚！比对两位追求者：rank(M${m})=${womenRank[w][m]} vs rank(M${cur})=${womenRank[w][cur]}。`, '女士对比追求者', 'propose');

      if (womenRank[w][m] < womenRank[w][cur]) {
        husband[w] = m;
        wife[m] = w;
        wife[cur] = 0;
        freeMenQueue.push(cur);
        makeStep(38, `💔 [移情换约] 女士 W${w} 更喜欢新追求者 M${m}！解除与 M${cur} 的婚约，M${cur} 重获单身重回队列！`, `W${w} 换约为 M${m}`, 'accept', 'husband', w - 1);
      } else {
        freeMenQueue.push(m);
        makeStep(44, `🙅 [婉拒追求] 女士 W${w} 更青睐现任未婚夫 M${cur}，婉拒男士 M${m}！M${m} 保持单身重回队列。`, `W${w} 拒绝 M${m}`, 'reject');
      }
    }
  }

  makeStep(50, `🎉 [稳定婚姻匹配达成] 所有男女全部成功缔结婚约，且经过 Gale-Shapley 算法验证，全场不存在任何不稳定阻碍对 (Blocking Pair)！`, '稳定匹配完成', 'done');

  return steps;
}
