/**
 * 火星词典拓扑排序 (Alien Dictionary - LeetCode 269 / 剑指 Offer II 114) 步进编译器
 * 核心：字典序首个不同字符提取有向偏序关系、入度统计与拓扑排序、非法前缀与环检测
 * 深度架构重构：严格全流程逐行高亮执行、纯中文步骤日志、四语言行号映射
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface AlienStep {
  wordList: string[];
  edges: Array<[string, string]>;
  inDegrees: Record<string, number>;
  topoOrder: string[];
  queue?: string[];
  activeChar?: string;
  activeEdge?: [string, string];
  charList: string[];
  inDegreeArray: number[];
  activeArray?: 'inDegree' | 'queue';
  activeSlot?: number;
  status: 'extract' | 'topo' | 'error' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildAlienDictSteps(preset: string = 'valid'): AlienStep[] {
  const steps: AlienStep[] = [];

  const wordList =
    preset === 'prefix_error'
      ? ['abc', 'ab']
      : preset === 'cycle'
        ? ['z', 'x', 'z']
        : ['wrt', 'wrf', 'er', 'ett', 'rftt'];

  const inDegreeMap: Record<string, number> = {};
  for (const w of wordList) {
    for (let i = 0; i < w.length; i++) {
      inDegreeMap[w[i]] = 0;
    }
  }

  const charList = Object.keys(inDegreeMap).sort();
  const edges: Array<[string, string]> = [];
  const adj: Record<string, string[]> = {};
  for (const c of charList) adj[c] = [];

  const topoOrder: string[] = [];
  let queue: string[] = [];
  let activeChar: string | undefined = undefined;
  let activeEdge: [string, string] | undefined = undefined;

  // 精准 22 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 19, java: 7, python: 3, javascript: 2 },
    initInDegree: { cpp: 24, java: 12, python: 5, javascript: 7 },
    initGraph: { cpp: 21, java: 17, python: 6, javascript: 8 },
    countKinds: { cpp: 28, java: 20, python: 5, javascript: 7 },
    loopWords: { cpp: 30, java: 22, python: 9, javascript: 12 },
    fetchPair: { cpp: 31, java: 23, python: 10, javascript: 13 },
    whileSame: { cpp: 34, java: 26, python: 13, javascript: 16 },
    checkDiffChar: { cpp: 36, java: 28, python: 16, javascript: 19 },
    addEdge: { cpp: 39, java: 30, python: 19, javascript: 21 },
    incrementInDegree: { cpp: 40, java: 31, python: 20, javascript: 22 },
    checkPrefixError: { cpp: 42, java: 32, python: 21, javascript: 25 },
    returnPrefixError: { cpp: 43, java: 33, python: 22, javascript: 26 },
    initQueue: { cpp: 47, java: 37, python: 24, javascript: 30 },
    checkZeroInDegree: { cpp: 49, java: 40, python: 24, javascript: 30 },
    pushZeroInDegree: { cpp: 49, java: 40, python: 24, javascript: 31 },
    whileQueue: { cpp: 53, java: 44, python: 27, javascript: 34 },
    pollQueue: { cpp: 55, java: 45, python: 28, javascript: 35 },
    appendAns: { cpp: 56, java: 46, python: 29, javascript: 36 },
    loopAdj: { cpp: 58, java: 47, python: 30, javascript: 37 },
    decrementInDegree: { cpp: 59, java: 48, python: 31, javascript: 38 },
    pushNewZero: { cpp: 59, java: 48, python: 33, javascript: 39 },
    returnAns: { cpp: 63, java: 51, python: 35, javascript: 42 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'extract' | 'topo' | 'error' | 'done',
    actArray?: 'inDegree' | 'queue',
    actSlot?: number
  ): void {
    const ordStr =
      status === 'error'
        ? '存在冲突 (无解)'
        : topoOrder.length > 0
          ? topoOrder.join(' ➔ ')
          : '提取中...';
    const qStr = queue.length > 0 ? `[${queue.join(', ')}]` : '空';
    const phaseStr =
      status === 'done'
        ? '排序完成'
        : status === 'error'
          ? '检测到逻辑冲突'
          : status === 'topo'
            ? '拓扑消元'
            : '提取偏序关系';

    const inDegArr = charList.map((c) => inDegreeMap[c] ?? 0);

    steps.push({
      wordList,
      edges: edges.map((e) => [...e] as [string, string]),
      inDegrees: { ...inDegreeMap },
      topoOrder: [...topoOrder],
      queue: [...queue],
      activeChar,
      activeEdge,
      charList,
      inDegreeArray: inDegArr,
      activeArray: actArray,
      activeSlot: actSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-alien-chars': `${charList.length} 个字符 (${charList.join(', ')})`,
        'metric-alien-order': ordStr,
        'metric-alien-queue': qStr,
        'metric-alien-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, '🚀 [火星词典启动] alienOrder(words)：分析火星语言字典序。', '初始化 alienOrder 求解入口', 'extract');
  makeStep(lines.initInDegree, `🔤 [扫描全部字符] 统计出现字符种类: [${charList.join(', ')}]，初始化入度为 0。`, '初始化字符集与入度映射表', 'extract', 'inDegree');
  makeStep(lines.initGraph, '📦 [构建邻接表] 初始化偏序有向图邻接表 graph。', '初始化偏序有向图邻接表', 'extract');
  makeStep(lines.countKinds, `🏷️ [统计字符总数] 共有 kinds = ${charList.length} 个独立字符。`, `统计独立字符种类数 kinds = ${charList.length}`, 'extract');

  // 2. 扫描相邻单词提取偏序关系
  let prefixError = false;

  for (let i = 0; i < wordList.length - 1; i++) {
    const cur = wordList[i];
    const nxt = wordList[i + 1];
    makeStep(lines.loopWords, `🔍 [比较相邻单词] 第 ${i + 1} 组: "${cur}" 与 "${nxt}"。`, `比对相邻单词 "${cur}" 与 "${nxt}"`, 'extract');
    makeStep(lines.fetchPair, `  ↳ [计算前缀边界] minLen = min(${cur.length}, ${nxt.length})。`, '计算前缀最小公共长度边界', 'extract');

    let j = 0;
    while (j < cur.length && j < nxt.length && cur[j] === nxt[j]) {
      makeStep(lines.whileSame, `  ⏩ [跳过公共前缀] 位置 ${j}: '${cur[j]}' == '${nxt[j]}' 字符一致，继续比对下一位。`, `跳过相同前缀字符 '${cur[j]}'`, 'extract');
      j++;
    }
    makeStep(lines.whileSame, `  ⏩ [公共前缀扫描完毕] 公共前缀长度为 ${j}。`, `公共前缀比对完毕，长度为 ${j}`, 'extract');

    if (j < cur.length && j < nxt.length) {
      const u = cur[j];
      const v = nxt[j];
      activeEdge = [u, v];
      makeStep(lines.checkDiffChar, `  💡 [发现首个不同字符] '${u}' 必在 '${v}' 前面！`, `首个相异字符确定偏序: '${u}' ➔ '${v}'`, 'extract');

      if (!adj[u].includes(v)) {
        adj[u].push(v);
        edges.push([u, v]);
        makeStep(lines.addEdge, `  ➕ [添加偏序有向边] 建立有向依赖: '${u}' ➔ '${v}'。`, `建立偏序有向依赖边 '${u}' ➔ '${v}'`, 'extract');

        inDegreeMap[v] = (inDegreeMap[v] || 0) + 1;
        const vIdx = charList.indexOf(v);
        makeStep(lines.incrementInDegree, `  📈 [入度自增] inDegree['${v}'] 增加为 ${inDegreeMap[v]}。`, `后继字符 '${v}' 入度递增为 ${inDegreeMap[v]}`, 'extract', 'inDegree', vIdx);
      }
    } else if (cur.length > nxt.length) {
      makeStep(lines.checkPrefixError, `  🚨 [前缀合法性检查] if (cur.length(${cur.length}) > nxt.length(${nxt.length})) -> (true)！`, '检测到较长单词排在较短前缀之前', 'error');
      makeStep(lines.returnPrefixError, `❌ [非法前缀陷阱] 较长单词 "${cur}" 排在较短前缀 "${nxt}" 前面，违反字典序公理！return ""！`, '非法前缀反转异常，判定无解', 'error');
      prefixError = true;
      break;
    }
  }

  activeEdge = undefined;

  if (prefixError) {
    return steps;
  }

  // 3. 拓扑排序：初始化零入度队列
  makeStep(lines.initQueue, '📦 [初始化拓扑队列] int[] queue = new int[26]，准备入队 0 入度字符。', '初始化 0 入度字符队列', 'topo', 'queue');

  queue = [];
  for (const c of charList) {
    makeStep(lines.checkZeroInDegree, `  🔎 [检查入度] '${c}' 的入度为 ${inDegreeMap[c]}。`, `核验字符 '${c}' 入度是否为 0`, 'topo');
    if (inDegreeMap[c] === 0) {
      queue.push(c);
      makeStep(lines.pushZeroInDegree, `  📥 [0入度入队] 将字符 '${c}' 加入拓扑队列！`, `0 入度字符 '${c}' 成功加入队列`, 'topo', 'queue');
    }
  }

  // 4. 拓扑排序消元
  while (queue.length > 0) {
    makeStep(lines.whileQueue, `🔁 [拓扑消元循环] while (queue.length > 0) -> 队列: [${queue.join(', ')}]。`, '拓扑消元循环持续出队', 'topo');

    const u = queue.shift()!;
    activeChar = u;
    makeStep(lines.pollQueue, `📤 [出队字符] 弹出最高优先级字符 '${u}'。`, `弹出队首 0 入度字符 '${u}'`, 'topo');

    topoOrder.push(u);
    makeStep(lines.appendAns, `📝 [加入拓扑序列] 确定字符 '${u}' 的顺序，当前序列: "${topoOrder.join('')}"。`, `将字符 '${u}' 追加至拓扑序列`, 'topo');

    for (const v of adj[u] || []) {
      makeStep(lines.loopAdj, `  ↳ [消除偏序边] 消除出边 '${u}' ➔ '${v}'。`, `消除字符出边 '${u}' ➔ '${v}'`, 'topo');

      inDegreeMap[v]--;
      const vIdx = charList.indexOf(v);
      makeStep(lines.decrementInDegree, `  📉 [扣减入度] inDegree['${v}'] 减至 ${inDegreeMap[v]}。`, `后继字符 '${v}' 入度递减至 ${inDegreeMap[v]}`, 'topo', 'inDegree', vIdx);

      if (inDegreeMap[v] === 0) {
        queue.push(v);
        makeStep(lines.pushNewZero, `  ✨ [产生新0入度] 字符 '${v}' 前置约束解除，入队！`, `字符 '${v}' 入度降为 0 并入队`, 'topo', 'queue');
      }
    }
  }

  activeChar = undefined;

  // 5. 判环与收尾
  if (topoOrder.length === charList.length) {
    makeStep(lines.returnAns, `🎉 [火星词典拓扑达成] return "${topoOrder.join('')}"！成功解析出无冲突的火星字母表顺序！`, '拓扑排序成功完成，返回有效字母顺序', 'done');
  } else {
    makeStep(lines.returnAns, `❌ [存在环状逻辑矛盾] 拓扑序列长度 ${topoOrder.length} < 字符种类 ${charList.length}，图中存在环状冲突，return ""！`, '检测到有向环逻辑矛盾，返回空串', 'error');
  }

  return steps;
}
