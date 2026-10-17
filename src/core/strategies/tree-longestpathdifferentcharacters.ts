import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';

/**
 * 相邻字符不同的最长路径 (Longest Path with Different Characters / LeetCode 2246 / 左程云 79 课 Code04)
 * 严格遵循黄金准则：
 * 1. 树型 DP 经典拐点模型：每个节点向父汇报单侧最长链 1 + max1；
 * 2. 局部拐点融合：maxPath = max(maxPath, 1 + max1 + max2)；
 * 3. 字符约束严格校验：仅当 s[u] != s[v] 时方可接续路径；
 * 4. 双向推导支持（Forward 自底向上拐点融合 / Reverse 自顶向下根向试探对比）。
 */
export function compileLongestPathDifferentCharacters(
  model: IYamlAlgorithmModel,
  _stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const params = (model.defaultParams as any) || {};
  const parent: number[] = params.parent || [-1, 0, 0, 1, 1, 2];
  const s: string = params.s || 'abacbe';
  const n: number = parent.length;

  // 1. 构建多叉树邻接表
  const tree: number[][] = Array.from({ length: n }, () => []);
  for (let i = 1; i < n; i++) {
    if (parent[i] >= 0 && parent[i] < n) {
      tree[parent[i]].push(i);
    }
  }

  // 2. 动态构建 UniversalTreeNode 树骨架
  const colCounters: number[] = [];
  function buildTreeNode(u: number, depth: number): UniversalTreeNode {
    const c = colCounters[depth] || 0;
    colCounters[depth] = c + 1;
    const char = s[u] || '?';
    const label = `点#${u}('${char}')`;
    const childNodes = (tree[u] || []).map((v) => buildTreeNode(v, depth + 1));
    return {
      id: `char-${u}`,
      r: depth,
      c,
      val: label,
      status: 'normal',
      children: childNodes,
    };
  }
  const treeTemplate = buildTreeNode(0, 0);

  const tags = new Map<number, string>();
  const statuses = new Map<number, UniversalTreeNode['status']>();
  const maxChain = new Array(n).fill(0);
  let maxPath = 1;

  function getTreeSnapshot(activeId?: string): UniversalTreeNode {
    function mapNode(node: UniversalTreeNode): UniversalTreeNode {
      const u = parseInt(node.id.replace('char-', ''), 10);
      let status = statuses.get(u) || 'normal';
      if (activeId === node.id) {
        status = 'current';
      }
      const tag = tags.get(u);
      return {
        ...node,
        status,
        tag,
        children: node.children.map(mapNode),
      };
    }
    return mapNode(treeTemplate);
  }

  function getCharStateArrays(activeArrName?: string, activeSlotIdx?: number): StateArrayItem[] {
    const indices: string[] = [];
    const charVals: string[] = [];
    for (let i = 0; i < n; i++) {
      indices.push(`#${i}`);
      charVals.push(s[i] || '?');
    }
    return [
      {
        id: 'arr-chars',
        name: 's[i]',
        label: '节点分配字符',
        indices,
        values: charVals as any,
        activeIdx: activeArrName === 'chars' ? activeSlotIdx : undefined,
        color: 'purple',
      },
      {
        id: 'arr-chain',
        name: 'chain[u]',
        label: '单侧最长链长',
        indices,
        values: [...maxChain],
        activeIdx: activeArrName === 'chain' ? activeSlotIdx : undefined,
        color: 'emerald',
      },
      {
        id: 'arr-ans',
        name: 'maxPath',
        label: '全局最长互异路径',
        indices: ['全局最优'],
        values: [maxPath],
        activeIdx: activeArrName === 'ans' ? activeSlotIdx : undefined,
        color: 'rose',
      },
    ];
  }

  function addCharStep(
    stepData: Omit<UniversalStep, 'stateArrays' | 'treeRoot'> & {
      activeArrName?: string;
      activeArrSlot?: number;
      activeNode?: number;
    }
  ) {
    const { activeArrName, activeArrSlot, activeNode, ...rest } = stepData;
    const activeNodeId = activeNode !== undefined ? `char-${activeNode}` : undefined;
    steps.push({
      ...rest,
      line: rest.line || 1,
      codeLine: rest.codeLine || rest.line || 1,
      activeNodeId,
      treeRoot: getTreeSnapshot(activeNodeId),
      stateArrays: getCharStateArrays(activeArrName, activeArrSlot),
    });
  }

  // 逆向模式：自顶向下根向单链试探对比
  if (direction === 'reverse') {
    const isHigherStage = _stage > 1 && !anchorMap;
    const lineEntryR = anchorMap?.entry ?? 2;
    const lineBuildTreeR = anchorMap?.build_tree ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 2 : 4));
    const lineInitGraphR = anchorMap?.init_graph ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 3 : 7));
    const lineDfsEntryR = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 4 : 11));
    const lineCheckCharR = anchorMap?.check_char ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 8 : 15));
    const lineReturnR = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 11 : 9));

    addCharStep({
      type: 'entry',
      line: lineEntryR,
      codeLine: lineEntryR,
      i: 0,
      j: 0,
      dp1d: [1],
      memo: [1],
      activeSlot: 0,
      tag: '逆向自顶向下单链试探',
      log: "🔍 【逆向对比】启动自顶向下根向试探：从根节点 0('a') 出发单向探查互异链",
      msg: '启动自顶向下试探：对比纯单向由上至下分支探查与自底向上双向拐点融合的表达能力差异。',
      activeNode: 0,
    });

    addCharStep({
      type: 'init',
      line: lineBuildTreeR,
      codeLine: lineBuildTreeR,
      i: 0,
      j: 0,
      dp1d: [1],
      memo: [1],
      activeSlot: 0,
      tag: '树形依赖结构建立',
      log: `🌲 构建树形结构：n=${n} 节点，字符串序列 s="${s}"`,
      msg: `构建树结构：根节点 <strong>点#0('${s[0]}')</strong>。`,
      activeNode: 0,
    });

    let topDownMax = 1;
    const queue: { u: number; curLen: number; prevChar: string }[] = [{ u: 0, curLen: 1, prevChar: s[0] }];
    statuses.set(0, 'visited');
    tags.set(0, `根起点('${s[0]}')`);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const u = curr.u;
      for (const v of tree[u] || []) {
        const isDiff = s[v] !== curr.prevChar;
        const nextLen = isDiff ? curr.curLen + 1 : 1;
        if (nextLen > topDownMax) topDownMax = nextLen;
        statuses.set(v, isDiff ? 'visited' : 'base');
        tags.set(v, isDiff ? `合法单链:${nextLen}` : `相同字符中断(1)`);
        queue.push({ u: v, curLen: nextLen, prevChar: s[v] });

        addCharStep({
          type: 'update',
          line: lineDfsEntryR,
          codeLine: lineDfsEntryR,
          i: v,
          j: nextLen,
          dp1d: [topDownMax],
          memo: [nextLen, topDownMax],
          activeSlot: v,
          tag: `自顶向下试探点#${v}('${s[v]}'): 单链${nextLen}`,
          log: `| ⚡ 【先序试探】点 #${u}('${s[u]}') -> 点 #${v}('${s[v]}'): ${isDiff ? `字符不同，链长累加至 ${nextLen}` : '字符相同，链长重置为 1'}`,
          msg: `单向试探点 <strong>点#${v}('${s[v]}')</strong>：与父节点字符${isDiff ? '不同，链长扩展至 <code>' + nextLen + '</code>' : '相同，链长重置为 1'}。`,
          activeNode: v,
          activeArrName: 'chain',
          activeArrSlot: v,
        });
      }
    }

    addCharStep({
      type: 'return',
      line: lineReturnR,
      codeLine: lineReturnR,
      i: 0,
      j: 0,
      dp1d: [topDownMax],
      memo: [topDownMax],
      activeSlot: 0,
      tag: `逆向单向最长链: ${topDownMax}`,
      log: `| 🏆 逆向推导完成！单向自顶向下最长互异单链为: ${topDownMax}`,
      msg: `🏆 逆向推导完成！自顶向下单向最长单链为 <strong>${topDownMax}</strong>（无法捕捉跨越根节点的双向拱形路径）。`,
      activeNode: 0,
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    return steps.map((s, idx) => ({
      ...s,
      stepIndex: idx,
      stage: _stage || 1,
      line: s.line || 1,
      codeLine: s.codeLine || s.line || 1,
      decision: s.decision || s.log || s.tag || '相邻字符不同最长路径逆向试探',
      message: s.message || s.msg || s.log || '',
      metrics: s.metrics || { '单向最长链': String(topDownMax), '推导方向': '逆向先序试探' },
    }));
  }

  // 正向模式：自底向上后序拐点归约
  const isHigherStage = _stage > 1 && !anchorMap;
  const lineEntry = anchorMap?.entry ?? 2;
  const lineBuildTree = anchorMap?.build_tree ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 2 : 4));
  const lineInitGraph = anchorMap?.init_graph ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 3 : 7));
  const lineDfsCall = anchorMap?.dfs_call ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 4 : 8));
  const lineReturn = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 13 : 9));
  const lineDfsEntry = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 5 : 11));
  const lineInitChains = anchorMap?.init_chains ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 6 : 12));
  const lineLoopChild = anchorMap?.loop_child ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 7 : 13));
  const lineBranchCall = anchorMap?.branch_call ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 8 : 14));
  const lineCheckChar = anchorMap?.check_char ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 9 : 15));
  const lineUpdateMax1 = anchorMap?.update_max1 ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 10 : 16));
  const lineCombinePivot = anchorMap?.combine_pivot ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 11 : 20));
  const lineReturnChain = anchorMap?.return_chain ?? (anchorMap ? anchorMap.entry ?? 2 : (isHigherStage ? 12 : 21));

  // Step 0: 主函数入口
  addCharStep({
    type: 'entry',
    line: lineEntry,
    codeLine: lineEntry,
    i: 0,
    j: 0,
    dp1d: [1],
    memo: [1],
    activeSlot: 0,
    tag: '入口: longestPath',
    log: `🚀 进入 longestPath：节点总数 n=${n}, 字符分配 s="${s}"`,
    msg: `主函数入口：准备求解多叉树中相邻字符互异的最长路径节点数。`,
    activeNode: 0,
  });

  // Step 1: 建图
  addCharStep({
    type: 'init',
    line: lineBuildTree,
    codeLine: lineBuildTree,
    i: 0,
    j: 0,
    dp1d: [1],
    memo: [1],
    activeSlot: 0,
    tag: '构建多叉树邻接表',
    log: '🌲 解析 parent 数组，构建多叉树邻接表 tree',
    msg: `多叉树建图完成：根节点为 <strong>点#0</strong>。`,
    activeNode: 0,
  });

  // Step 2: 全局答案初始化
  addCharStep({
    type: 'init',
    line: lineInitGraph,
    codeLine: lineInitGraph,
    i: 0,
    j: 0,
    dp1d: [1],
    memo: [1],
    activeSlot: 0,
    tag: '初始化 maxPath = 1',
    log: '📊 全局最长路径初始化为 1（单节点路径至少长度为 1）',
    msg: '初始化全局最优解：<code>maxPath = 1</code>。',
    activeNode: 0,
    activeArrName: 'ans',
    activeArrSlot: 0,
  });

  // Step 3: 发起递归 DFS
  addCharStep({
    type: 'init',
    line: lineDfsCall,
    codeLine: lineDfsCall,
    i: 0,
    j: 0,
    dp1d: [1],
    memo: [1],
    activeSlot: 0,
    tag: '启动后序 DFS: dfs(0)',
    log: '| 🚀 从根节点发起后序递归遍历：dfs(0, tree, s)',
    msg: '启动后序递归：子节点自底向上汇报单侧最长链长。',
    activeNode: 0,
  });

  // DFS 递归求解
  function dfs(u: number): number {
    statuses.set(u, 'current');
    let max1 = 0;
    let max2 = 0;
    tags.set(u, `探查中('${s[u]}')`);

    addCharStep({
      type: 'update',
      line: lineInitChains,
      codeLine: lineInitChains,
      i: u,
      j: 0,
      dp1d: [maxPath],
      memo: [max1, max2],
      activeSlot: u,
      tag: `点#${u}('${s[u]}') 初始化 max1=0, max2=0`,
      log: `| 📍 访问点 #${u}('${s[u]}')：候选最长链 max1=0, 次长链 max2=0`,
      msg: `访问节点 <strong>点#${u}('${s[u]}')</strong>：准备收集其子分支中字符不同的最长两条链。`,
      activeNode: u,
    });

    for (const v of tree[u] || []) {
      addCharStep({
        type: 'branch-call',
        line: lineBranchCall,
        codeLine: lineBranchCall,
        i: u,
        j: v,
        dp1d: [maxPath],
        memo: [max1, max2],
        activeSlot: v,
        tag: `深入子节点: #${v}('${s[v]}')`,
        log: `| ⬇️ 【深入分支】点 #${u}('${s[u]}') 递归进入子节点 #${v}('${s[v]}')`,
        msg: `深入子树分支：后序求解子节点 <strong>点#${v}('${s[v]}')</strong> 的最长单链。`,
        activeNode: v,
      });

      const len = dfs(v);

      statuses.set(u, 'current');
      const isDiff = s[u] !== s[v];

      addCharStep({
        type: 'update',
        line: lineCheckChar,
        codeLine: lineCheckChar,
        i: u,
        j: v,
        dp1d: [maxPath],
        memo: [len, max1, max2],
        activeSlot: u,
        tag: `字符校验: s[#${u}]='${s[u]}' vs s[#${v}]='${s[v]}' (${isDiff ? '有效' : '相同中断'})`,
        log: `| 🔍 【字符校验】点 #${u}('${s[u]}') 与子节点 #${v}('${s[v]}'): ${isDiff ? '字符不同，可拼接！' : '字符相同，不可拼接！'}`,
        msg: `字符比对：点 <strong>#${u}('${s[u]}')</strong> 与子节点 <strong>#${v}('${s[v]}')</strong> ${isDiff ? '字符互异，合法连通' : '字符相同，路径中断'}。`,
        activeNode: u,
      });

      if (isDiff) {
        if (len > max1) {
          max2 = max1;
          max1 = len;
        } else if (len > max2) {
          max2 = len;
        }

        addCharStep({
          type: 'update',
          line: lineUpdateMax1,
          codeLine: lineUpdateMax1,
          i: u,
          j: v,
          dp1d: [maxPath],
          memo: [max1, max2],
          activeSlot: u,
          tag: `点#${u} 刷新候选链: [max1:${max1}, max2:${max2}]`,
          log: `| ⚡ 【维护最长链】点 #${u} 最长子链 max1=${max1}, 次长子链 max2=${max2}`,
          msg: `候选分支更新：节点 <strong>点#${u}</strong> 的最长子链 <code>max1=${max1}</code>，次长子链 <code>max2=${max2}</code>。`,
          activeNode: u,
        });
      }
    }

    // 拐点融合结算
    const pivotLen = 1 + max1 + max2;
    if (pivotLen > maxPath) {
      maxPath = pivotLen;
    }

    const reportChain = 1 + max1;
    maxChain[u] = reportChain;
    statuses.set(u, 'visited');
    tags.set(u, `单链:${reportChain}|拐点:${pivotLen}`);

    addCharStep({
      type: 'update',
      line: lineCombinePivot,
      codeLine: lineCombinePivot,
      i: u,
      j: pivotLen,
      dp1d: [maxPath],
      memo: [max1, max2, pivotLen],
      activeSlot: u,
      tag: `点#${u} 拐点融合: 1+${max1}+${max2}=${pivotLen}`,
      log: `| 🌟 【拐点融合】以点 #${u} 为拱顶的最长互异路径 = 1 + ${max1} + ${max2} = ${pivotLen} (全局 maxPath 刷新为 ${maxPath})`,
      msg: `拐点结算：穿过节点 <strong>点#${u}</strong> 的最长互异路径为 <code>1 + ${max1} + ${max2} = <strong>${pivotLen}</strong></code>，当前全局最长互异路径 <strong>${maxPath}</strong>。`,
      activeNode: u,
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    addCharStep({
      type: 'combine',
      line: lineReturnChain,
      codeLine: lineReturnChain,
      i: u,
      j: reportChain,
      dp1d: [maxPath],
      memo: [reportChain],
      activeSlot: u,
      tag: `点#${u} 汇报单链: ${reportChain}`,
      log: `| ⬆️ 【汇报父级】点 #${u} 向直接父节点汇报单侧最长链 1 + max1 = ${reportChain}`,
      msg: `向上汇报：节点 <strong>点#${u}</strong> 向父节点汇报单侧有效最长链 <code>1 + ${max1} = <strong>${reportChain}</strong></code>。`,
      activeNode: u,
      activeArrName: 'chain',
      activeArrSlot: u,
    });

    return reportChain;
  }

  dfs(0);

  // 最终返回
  addCharStep({
    type: 'return',
    line: lineReturn,
    codeLine: lineReturn,
    i: 0,
    j: 0,
    dp1d: [maxPath],
    memo: [maxPath],
    activeSlot: 0,
    tag: `全局最长互异路径: ${maxPath}`,
    log: `| 🏆 计算完成！return maxPath = ${maxPath}`,
    msg: `🏆 演化推导全部完成！树中相邻字符互异的最长路径包含 <strong>${maxPath}</strong> 个节点。`,
    activeNode: 0,
    activeArrName: 'ans',
    activeArrSlot: 0,
  });

  return steps.map((s, idx) => ({
    ...s,
    stepIndex: idx,
    stage: _stage || 1,
    line: s.line || 1,
    codeLine: s.codeLine || s.line || 1,
    decision: s.decision || s.log || s.tag || '相邻字符不同最长路径状态转移',
    message: s.message || s.msg || s.log || '',
    metrics: s.metrics || { '最长互异路径': String(maxPath), '节点数': String(n), '根节点': '点#0' },
  }));
}
