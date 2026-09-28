/**
 * Class 056: Code03 情侣牵手与置换环定理 (Couples Holding Hands)
 * LeetCode 765
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 * - 保留库内既有 couples-holding-hands 独立性，通过别名与主 ID 精准区分
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { UNION_FIND_056_PROBLEMS } from './union-find-056-problem-content';
import { CODE03_COUPLES_CODES, CODE03_COUPLES_LINES } from './union-find-056-stage-codes';
import { Step056, renderCouplesHandsBoard } from './union-find-056-shared';

export function buildCouplesHandsSteps(rawRow?: number[]): Step056[] {
  const steps: Step056[] = [];
  const lines = CODE03_COUPLES_LINES;

  const row = rawRow && rawRow.length >= 2 && rawRow.length % 2 === 0
    ? [...rawRow]
    : [0, 2, 1, 3];
  const m = row.length;
  const n = Math.floor(m / 2); // 情侣对数

  // 并查集初始化
  const father: number[] = Array.from({ length: n }, (_, i) => i);
  let sets = n;

  function find(i: number): number {
    if (i !== father[i]) {
      father[i] = find(father[i]);
    }
    return father[i];
  }

  function union(x: number, y: number): boolean {
    const fx = find(x);
    const fy = find(y);
    if (fx !== fy) {
      father[fx] = fy;
      sets--;
      return true;
    }
    return false;
  }

  // 0. 主函数入口
  steps.push({
    title: '算法初始化 (Entry)',
    description: `共有 2N=${m} 个人，对应 N=${n} 对情侣。沙发总数=${n}。当前座位排布: [${row.join(', ')}]。`,
    decision: '将每对情侣缩为一个抽象节点 (0 ~ N-1)。初始时每个情侣节点独立，独立连通块数 Sets = N。',
    message: '数学定理：若 k 对情侣形成一个错位纠缠环，拆解该环只需 k-1 次交换！因此总交换次数 = N - Sets。',
    log: `minSwapsCouples: total people=${m}, total couples=${n}`,
    codeLine: lines.entry,
    row: [...row],
    parentCouples: [...father],
    curSwaps: 0,
    metrics: { '情侣总对数 N': n, '当前连通块数 Sets': sets, '当前需交换次数': 0 },
  });

  // 1. 初始化并查集
  steps.push({
    title: '构建情侣并查集 (Build Sets)',
    description: `初始化长度为 N=${n} 的情侣并查集数组 father，每个情侣对初始自成集合。`,
    decision: '每张双人沙发上若坐了两个不同情侣对的人，则在两情侣对之间连一条无向边 (Union)。',
    message: '通过并查集自动识别连通环的大小。',
    log: `init union-find of size ${n}`,
    codeLine: lines.build,
    row: [...row],
    parentCouples: [...father],
    curSwaps: 0,
    metrics: { '情侣总对数 N': n, '当前连通块数 Sets': sets, '当前需交换次数': n - sets },
  });

  // 2. 依次遍历每张沙发
  for (let couch = 0; couch < n; couch++) {
    const p1 = row[2 * couch];
    const p2 = row[2 * couch + 1];
    const c1 = Math.floor(p1 / 2);
    const c2 = Math.floor(p2 / 2);

    steps.push({
      title: `沙发 #${couch}: 检查人员 [${p1}, ${p2}]`,
      description: `双人沙发 #${couch} 上坐着人员 ${p1} (属于情侣对 ${c1}) 和 人员 ${p2} (属于情侣对 ${c2})。`,
      decision: c1 === c2
        ? `两人本就属于同一对情侣 (情侣对 ${c1})，已经牵手成功，无需连边！`
        : `两人来自不同情侣对 (${c1} 与 ${c2})，在情侣对 ${c1} 与 ${c2} 之间连边建立关联。`,
      message: c1 === c2 ? '天生已牵手对，自成 1 节点闭环 (交换 0 次)。' : '错位牵线，将两情侣并入同一个置换环。',
      log: `couch ${couch}: person ${p1} (couple ${c1}), person ${p2} (couple ${c2})`,
      codeLine: lines.loopCouples,
      row: [...row],
      couchIdx: couch,
      couples: [c1, c2],
      parentCouples: [...father],
      curSwaps: n - sets,
      metrics: { '沙发编号': `#${couch}`, '情侣组': `${c1} & ${c2}`, '是否同对': c1 === c2 ? '是' : '否' },
    });

    // 执行 union
    const merged = union(c1, c2);

    steps.push({
      title: `沙发 #${couch}: 并查集合并 union(对${c1}, 对${c2})`,
      description: merged
        ? `情侣对 ${c1} 与情侣对 ${c2} 成功合并！独立连通分量 Sets 减 1 (当前 Sets = ${sets})。`
        : `情侣对 ${c1} 与情侣对 ${c2} 此前已处于同一连通块内，形成回路闭环，Sets 保持 ${sets} 不变。`,
      decision: `置换环当前贡献需交换次数 = N - Sets = ${n} - ${sets} = ${n - sets} 次。`,
      message: merged ? '连通块收敛，连环规模扩大。' : '闭合环路闭合完成。',
      log: `union couple ${c1} and ${c2}: merged=${merged}, sets now=${sets}`,
      codeLine: lines.union,
      row: [...row],
      couchIdx: couch,
      couples: [c1, c2],
      parentCouples: [...father],
      curSwaps: n - sets,
      metrics: { '当前 Sets': sets, '累计所需交换次数': n - sets },
    });
  }

  // 3. 返回最终答案
  const ans = n - sets;
  steps.push({
    title: '算法完成: 得出最少交换次数',
    description: `全部 ${n} 张双人沙发扫描完毕，全图被划分为 ${sets} 个置换环连通块。`,
    decision: `由置换环定理，最少交换次数 = N - Sets = ${n} - ${sets} = ${ans} 次！`,
    message: '数学贪心与并查集的完美结合，无需模拟繁琐的真实交换过程，直接得出全局最优解！',
    log: `done minSwapsCouples: ans = ${ans}`,
    codeLine: lines.returnAns,
    row: [...row],
    parentCouples: [...father],
    curSwaps: ans,
    metrics: { '情侣总数 N': n, '独立置换环 Sets': sets, '最少交换次数': ans },
  });

  return steps;
}

export const couplesHoldingHands056Renderer = registerDeclarativeAlgorithm<Step056>({
  id: 'couples-holding-hands-056',
  aliases: ['class056-code03', 'couples-holding-hands-765'],
  name: '情侣牵手与置换环定理 (Class 056)',
  category: 'union-find',
  difficulty: 'hard',
  badge: { mode: '置换环定理', complexity: 'O(N)' },
  description: '左程云算法通关课【必备篇】Class 056：利用并查集求解情侣牵手置换环拆解，交换次数 = N - Sets (LeetCode 765)',
  learningGoal: '掌握图论缩点与置换环定理：当 k 个元素互相错位纠缠成环时，只需 k-1 次交换即可拆解环使全部元素归位。',
  icon: '👫',

  inputs: [
    {
      id: 'row',
      label: '座位排布人员编号 (偶数个, 逗号分隔)',
      type: 'text',
      defaultValue: '0, 2, 1, 3',
      placeholder: '例如: 0, 2, 1, 3 或 5, 4, 2, 6, 3, 1, 0, 7',
    },
  ],

  presets: [
    {
      label: '经典案例 1: [0, 2, 1, 3] (需1次交换)',
      values: { row: '0, 2, 1, 3' },
    },
    {
      label: '经典案例 2: [3, 2, 0, 1] (0次交换，天生牵手)',
      values: { row: '3, 2, 0, 1' },
    },
    {
      label: '复杂错位环: [5, 4, 2, 6, 3, 1, 0, 7] (4对情侣)',
      values: { row: '5, 4, 2, 6, 3, 1, 0, 7' },
    },
    {
      label: '完全混乱大环: [0, 3, 2, 5, 4, 7, 6, 1]',
      values: { row: '0, 3, 2, 5, 4, 7, 6, 1' },
    },
  ],

  problemContent: UNION_FIND_056_PROBLEMS.couplesHoldingHands056,
  codeLanguages: CODE03_COUPLES_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let row = [0, 2, 1, 3];

    if (params && params.row) {
      const parsed = String(params.row)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length >= 2 && parsed.length % 2 === 0) {
        row = parsed;
      }
    }

    return buildCouplesHandsSteps(row);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderCouplesHandsBoard(step);
  },
});
