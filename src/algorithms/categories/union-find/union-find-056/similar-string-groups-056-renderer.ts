/**
 * Class 056: Code04 相似字符串组 (Similar String Groups)
 * LeetCode 839
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { UNION_FIND_056_PROBLEMS } from './union-find-056-problem-content';
import { CODE04_SIMILAR_STRINGS_CODES, CODE04_SIMILAR_STRINGS_LINES } from './union-find-056-stage-codes';
import { Step056, renderSimilarStringsBoard } from './union-find-056-shared';

export function buildSimilarStringsSteps(rawStrs?: string[]): Step056[] {
  const steps: Step056[] = [];
  const lines = CODE04_SIMILAR_STRINGS_LINES;

  const strs = rawStrs && rawStrs.length > 0
    ? [...rawStrs]
    : ['tars', 'rats', 'arts', 'star'];
  const n = strs.length;
  const m = strs[0].length;

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

  function checkSimilarity(a: string, b: string): { isSimilar: boolean; diffCount: number } {
    let diff = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        diff++;
        if (diff > 2) break;
      }
    }
    return { isSimilar: diff === 0 || diff === 2, diffCount: diff };
  }

  // 0. 主函数入口
  steps.push({
    title: '算法初始化 (Entry)',
    description: `共有 N=${n} 个字符串，每个字符串长度 L=${m}。准备使用并查集计算相似字符串组数。`,
    decision: '每一个单词作为一个节点 (0 ~ N-1)，初始互不连通，共有 N 个连通组。',
    message: '相似判定充要条件：两个单词对应字符不同位置数恰好为 0 (完全相同) 或 2 (单次字符对调)。',
    log: `numSimilarGroups: n=${n}, m=${m}`,
    codeLine: lines.entry,
    strs: [...strs],
    strFather: [...father],
    similarSets: sets,
    metrics: { '字符串总数 N': n, '初始组数': sets, '单词长度 L': m },
  });

  // 1. 初始化 father 数组
  steps.push({
    title: '构建并查集 (Build Sets)',
    description: `初始化长度为 ${n} 的 father 数组，father[i] = i。`,
    decision: '通过两两枚举点对 (i, j)，若发现相似且未连通，则立即执行合并并使组数减 1。',
    message: '两两比对时间复杂度 O(N^2 * L)。',
    log: 'initialized father array',
    codeLine: lines.build,
    strs: [...strs],
    strFather: [...father],
    similarSets: sets,
    metrics: { '并查集节点数': n, '独立组数': sets },
  });

  // 2. 双重循环两两比对
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const fi = find(i);
      const fj = find(j);

      // 若已经处于同一组，跳过
      if (fi === fj) {
        steps.push({
          title: `枚举点对 (#${i}, #${j}) - 已在同组跳过`,
          description: `字符串 #${i} "${strs[i]}" 与 #${j} "${strs[j]}" 的代表元均为 #${fi}，本就属于同一相似组，跳过比对。`,
          decision: '同组元素传递相似性已满足，无需多余检查。',
          message: '剪枝优化，直接检查下一对。',
          log: `pair (${i}, ${j}): already in same set ${fi}`,
          codeLine: lines.pairLoop,
          strs: [...strs],
          comparePair: { i, j, diffCount: 0, isSimilar: true },
          strFather: [...father],
          similarSets: sets,
          metrics: { '比对点对': `(${i}, ${j})`, '是否在同组': '是', '当前组数': sets },
        });
        continue;
      }

      // 执行相似判定
      const { isSimilar, diffCount } = checkSimilarity(strs[i], strs[j]);

      steps.push({
        title: `比对 (#${i}, #${j}): "${strs[i]}" vs "${strs[j]}"`,
        description: `逐字符比对 "${strs[i]}" 与 "${strs[j]}"：不同字符数 = ${diffCount}。`,
        decision: isSimilar
          ? `差异数为 ${diffCount} (0 或 2) ➔ 【判定相似】！准备合并两组。`
          : `差异数为 ${diffCount} (> 2) ➔ 【不相似】，保持独立。`,
        message: isSimilar ? '只需一次字符交换即可相互转换。' : '字符差异过大，无法通过单次交换转换。',
        log: `compare (${i}, ${j}): diff=${diffCount}, isSimilar=${isSimilar}`,
        codeLine: lines.checkSimilar,
        strs: [...strs],
        comparePair: { i, j, diffCount, isSimilar },
        strFather: [...father],
        similarSets: sets,
        metrics: { '比较目标': `"${strs[i]}" vs "${strs[j]}"`, '字符差异数': diffCount, '相似判定': isSimilar ? '相似' : '不相似' },
      });

      if (isSimilar) {
        union(i, j);
        steps.push({
          title: `合并相似组 union(#${i}, #${j})`,
          description: `将字符串 #${i} 所在的集合与 #${j} 所在的集合合并 (father[#${fi}] = #${fj})。`,
          decision: `相似组总数 Sets 从 ${sets + 1} 减少为 ${sets}。`,
          message: '连通性具有传递性：若 A 相似 B，B 相似 C，则 A 与 C 属于同一个相似字符串组！',
          log: `union (${i}, ${j}): sets now ${sets}`,
          codeLine: lines.union,
          strs: [...strs],
          comparePair: { i, j, diffCount, isSimilar },
          strFather: [...father],
          similarSets: sets,
          metrics: { '合并操作': `union(${i}, ${j})`, '剩余相似组数': sets },
        });
      }
    }
  }

  // 3. 返回答案
  steps.push({
    title: '算法完成: 相似组统计完毕',
    description: `所有点对比对完成，全图收敛为 ${sets} 个独立的相似字符串连通分量。`,
    decision: `最终相似字符串组总数 = ${sets}。`,
    message: '并查集完美处理了等价类与传递连通关系的快速收敛。',
    log: `done numSimilarGroups: ans = ${sets}`,
    codeLine: lines.returnAns,
    strs: [...strs],
    strFather: [...father],
    similarSets: sets,
    metrics: { '最终相似组数': sets, '字符串总数': n },
  });

  return steps;
}

export const similarStringGroups056Renderer = registerDeclarativeAlgorithm<Step056>({
  id: 'similar-string-groups-056',
  aliases: ['class056-code04', 'similar-string-groups-839'],
  name: '相似字符串组 (Class 056)',
  category: 'union-find',
  difficulty: 'hard',
  badge: { mode: '图连通并查集', complexity: 'O(N²·L)' },
  description: '左程云算法通关课【必备篇】Class 056：相似判定与传递连通等价类收敛，并查集动态求解连通块总数 (LeetCode 839)',
  learningGoal: '掌握两两字符串相似性判定的充要条件（差异为0或2），并结合并查集自动合并等价类连通块。',
  icon: '🔤',

  inputs: [
    {
      id: 'strs',
      label: '字符串列表 (逗号分隔，长度需相同)',
      type: 'text',
      defaultValue: 'tars, rats, arts, star',
      placeholder: '例如: tars, rats, arts, star',
    },
  ],

  presets: [
    {
      label: '经典案例: ["tars", "rats", "arts", "star"] (结果: 2)',
      values: { strs: 'tars, rats, arts, star' },
    },
    {
      label: '两对独立相似组: ["omv", "ovm", "abc", "acb"] (结果: 2)',
      values: { strs: 'omv, ovm, abc, acb' },
    },
    {
      label: '全连通组: ["blw", "bwl", "wlb"] (结果: 1)',
      values: { strs: 'blw, bwl, wlb' },
    },
    {
      label: '全部互不相似: ["abc", "def", "ghi"] (结果: 3)',
      values: { strs: 'abc, def, ghi' },
    },
  ],

  problemContent: UNION_FIND_056_PROBLEMS.similarStringGroups056,
  codeLanguages: CODE04_SIMILAR_STRINGS_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let strs = ['tars', 'rats', 'arts', 'star'];

    if (params && params.strs) {
      const parsed = String(params.strs)
        .split(/[,，\s]+/)
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
      if (parsed.length > 0) {
        strs = parsed;
      }
    }

    return buildSimilarStringsSteps(strs);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderSimilarStringsBoard(step);
  },
});
