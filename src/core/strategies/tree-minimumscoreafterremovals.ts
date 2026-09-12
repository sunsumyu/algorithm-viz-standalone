import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { cloneTree } from './strategy-helpers';

export function compileMinimumScoreAfterRemovals(
    _model: IYamlAlgorithmModel,
    _stage: number,
    _anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];

    const nums = [1, 5, 5, 4, 11];
    const n = nums.length;
    const edges = [
      [0, 1],
      [1, 2],
      [1, 3],
      [3, 4],
    ];
    const m = edges.length;

    const treeState: UniversalTreeNode = {
      id: 'score-0',
      r: 0,
      c: 0,
      val: '点#0(值1)',
      status: 'normal',
      tag: '待遍历',
      children: [
        {
          id: 'score-1',
          r: 1,
          c: 0,
          val: '点#1(值5)',
          status: 'normal',
          tag: '待遍历',
          children: [
            { id: 'score-2', r: 2, c: 0, val: '点#2(值5)', status: 'normal', tag: '待遍历', children: [] },
            {
              id: 'score-3',
              r: 2,
              c: 1,
              val: '点#3(值4)',
              status: 'normal',
              tag: '待遍历',
              children: [
                { id: 'score-4', r: 3, c: 1, val: '点#4(值11)', status: 'normal', tag: '待遍历', children: [] },
              ],
            },
          ],
        },
      ],
    };

    let dfnCnt = 0;
    const dfn: number[] = new Array(n).fill(0);
    const size: number[] = new Array(n).fill(0);
    const xor: number[] = new Array(n).fill(0);
    const edgeEnds: number[] = new Array(m).fill(0);
    let globalAns = Infinity;

    function setNodeStatus(id: string, status: any, tag?: string) {
      function traverse(node: UniversalTreeNode) {
        if (node.id === id) {
          node.status = status;
          if (tag !== undefined) node.tag = tag;
        }
        node.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getSnapshotStateArrays(
      activeArrName?: string,
      activeSlotIdx?: number,
      highlightIndices?: number[]
    ): StateArrayItem[] {
      return [
        {
          id: 'arr-dfn',
          name: 'dfn[]',
          label: '节点时间戳序号',
          indices: ['#0', '#1', '#2', '#3', '#4'],
          values: [...dfn],
          activeIdx: activeArrName === 'dfn' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-size',
          name: 'size[]',
          label: '子树节点规模',
          indices: ['#0', '#1', '#2', '#3', '#4'],
          values: [...size],
          activeIdx: activeArrName === 'size' ? activeSlotIdx : undefined,
          color: 'purple',
        },
        {
          id: 'arr-xor',
          name: 'xor[]',
          label: '子树异或总和',
          indices: ['#0', '#1', '#2', '#3', '#4'],
          values: [...xor],
          activeIdx: activeArrName === 'xor' ? activeSlotIdx : undefined,
          color: 'indigo',
        },
        {
          id: 'arr-edgeends',
          name: 'edgeEnds[]',
          label: '树边深端点',
          indices: ['e0(0-1)', 'e1(1-2)', 'e2(1-3)', 'e3(3-4)'],
          values: [...edgeEnds],
          activeIdx: activeArrName === 'edgeEnds' ? activeSlotIdx : undefined,
          highlightIndices: activeArrName === 'edgeEnds' ? highlightIndices : undefined,
          color: 'amber',
        },
        {
          id: 'arr-ans',
          name: 'ans',
          label: '全局最小分数',
          indices: ['minScore'],
          values: [globalAns === Infinity ? 0 : globalAns],
          activeIdx: activeArrName === 'ans' ? activeSlotIdx : undefined,
          color: 'rose',
        },
      ];
    }

    function addStep(
      stepData: Omit<UniversalStep, 'stateArrays'> & {
        activeArrName?: string;
        activeArrSlot?: number;
        highlightArrSlots?: number[];
      }
    ) {
      const { activeArrName, activeArrSlot, highlightArrSlots, ...rest } = stepData;
      steps.push({
        ...rest,
        stateArrays: getSnapshotStateArrays(activeArrName, activeArrSlot, highlightArrSlots),
      });
    }

    // Line 3: public int minimumScore(int[] nums, int[][] edges) {
    addStep({
      type: 'entry',
      line: 3,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: 'minimumScore 入口',
      log: '🚀 public int minimumScore(int[] nums, int[][] edges) 函数入口，5节点4条边',
      msg: '启动 <code>minimumScore</code>：传入点权数组 <code>nums = [1, 5, 5, 4, 11]</code> 与树边集合。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
    });

    // Line 10: int[] dfn = new int[n], size = new int[n], xor = new int[n];
    addStep({
      type: 'update',
      line: 10,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '分配 dfn, size, xor 数组',
      log: '| int[] dfn = new int[n], size = new int[n], xor = new int[n]; (为树上状态分配数组空间)',
      msg: '初始化状态容器：分配时间戳 <code>dfn[]</code>、子树大小 <code>size[]</code> 与子树异或和 <code>xor[]</code>。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'dfn',
      activeArrSlot: 0,
    });

    // Line 11: dfs(0, -1, tree, nums, dfn, size, xor);
    addStep({
      type: 'call',
      line: 11,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '调用 dfs(0, -1)',
      log: '🌲 dfs(0, -1, tree, nums, dfn, size, xor); 以节点 0 为根深度优先遍历整树',
      msg: '准备从定根 <strong>#0</strong> 开始 DFS 先序分配时间戳，后序统计子树异或和。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
    });

    interface SimNode {
      u: number;
      p: number;
      val: number;
      children: SimNode[];
    }

    const n4: SimNode = { u: 4, p: 3, val: 11, children: [] };
    const n3: SimNode = { u: 3, p: 1, val: 4, children: [n4] };
    const n2: SimNode = { u: 2, p: 1, val: 5, children: [] };
    const n1: SimNode = { u: 1, p: 0, val: 5, children: [n2, n3] };
    const n0: SimNode = { u: 0, p: -1, val: 1, children: [n1] };

    function simulateDfs(node: SimNode) {
      const u = node.u;
      const p = node.p;

      // Line 36: private void dfs(int u, int p, ...)
      addStep({
        type: 'entry',
        line: 36,
        i: u,
        j: p,
        dp1d: [...xor],
        memo: [...xor],
        activeSlot: u,
        tag: `dfs(u=#${u}, p=${p})`,
        log: `进入 dfs(u=${u}, p=${p})`,
        msg: `进入递归：当前考察节点 <strong>#${u}</strong>（父节点 <code>${p}</code>）。`,
        activeNodeId: `score-${u}`,
        treeRoot: cloneTree(treeState),
      });

      // Line 37: dfn[u] = dfnCnt++; size[u] = 1; xor[u] = nums[u];
      dfn[u] = dfnCnt++;
      size[u] = 1;
      xor[u] = nums[u];
      setNodeStatus(`score-${u}`, 'visited', `DFN:${dfn[u]}|异或:${xor[u]}`);

      addStep({
        type: 'update',
        line: 37,
        i: u,
        j: p,
        dp1d: [...xor],
        memo: [...xor],
        activeSlot: u,
        tag: `dfn[${u}]=${dfn[u]}, xor[${u}]=${xor[u]}`,
        log: `| dfn[${u}]=${dfn[u]}; size[${u}]=1; xor[${u}]=nums[${u}]=${xor[u]}; (记录时间戳与初始点权)`,
        msg: `节点 <strong>#${u}</strong> 分配 DFN 序号 <code>${dfn[u]}</code>，初始异或和 <code>${xor[u]}</code>。`,
        activeNodeId: `score-${u}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'dfn',
        activeArrSlot: u,
      });

      // Line 38: for (int v : tree[u]) {
      for (const child of node.children) {
        const v = child.u;

        // Line 39: if (v != p) {
        addStep({
          type: 'call',
          line: 39,
          i: u,
          j: v,
          dp1d: [...xor],
          memo: [...xor],
          activeSlot: u,
          tag: `发现子节点 #${v}`,
          log: `| if (v != p): 发现子节点 #${v}，调用 dfs(${v}, ${u})`,
          msg: `检查树边：深入子节点 <strong>#${v}</strong>。`,
          activeNodeId: `score-${u}`,
          treeRoot: cloneTree(treeState),
        });

        // Line 40: dfs(v, u, ...);
        simulateDfs(child);

        // Line 41: size[u] += size[v]; xor[u] ^= xor[v];
        size[u] += size[v];
        xor[u] ^= xor[v];
        setNodeStatus(`score-${u}`, 'visited', `DFN:${dfn[u]}|异或:${xor[u]}`);

        addStep({
          type: 'update',
          line: 41,
          i: u,
          j: v,
          dp1d: [...xor],
          memo: [...xor],
          activeSlot: u,
          tag: `size[${u}]=${size[u]}, xor[${u}]=${xor[u]}`,
          log: `| size[${u}] += size[${v}] -> ${size[u]}; xor[${u}] ^= xor[${v}] -> ${xor[u]}; (子树后序合并)`,
          msg: `子树 <strong>#${v}</strong> 回溯完成：累加节点规模 <code>size[${u}] = ${size[u]}</code>，合并异或值 <code>xor[${u}] = ${xor[u]}</code>。`,
          activeNodeId: `score-${u}`,
          treeRoot: cloneTree(treeState),
          activeArrName: 'xor',
          activeArrSlot: u,
        });
      }

      // Line 44: dfs 退出
      addStep({
        type: 'return',
        line: 44,
        i: u,
        j: p,
        dp1d: [...xor],
        memo: [...xor],
        activeSlot: u,
        tag: `dfs(#${u}) 结束返回`,
        log: `| dfs(u=${u}) 遍历完毕返回上一级`,
        msg: `节点 <strong>#${u}</strong> 的所有子树处理完成，退栈返回。`,
        activeNodeId: `score-${u}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'size',
        activeArrSlot: u,
      });
    }

    // 执行真实 DFS
    simulateDfs(n0);

    // Line 12: int allXor = xor[0], m = edges.length;
    const allXor = xor[0];
    addStep({
      type: 'update',
      line: 12,
      i: 0,
      j: 0,
      dp1d: [allXor],
      memo: [allXor],
      activeSlot: 0,
      tag: `allXor = xor[0] = ${allXor}`,
      log: `📊 int allXor = xor[0] = ${allXor}; (整棵树全部节点异或和为 ${allXor})`,
      msg: `全树异或和汇总：<code>allXor = xor[0] = ${allXor}</code>，树边总数 <code>m = 4</code>。`,
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'xor',
      activeArrSlot: 0,
    });

    // Line 13: int[] edgeEnds = new int[m];
    addStep({
      type: 'update',
      line: 13,
      i: 0,
      j: 0,
      dp1d: [allXor],
      memo: [allXor],
      activeSlot: 0,
      tag: '分配 edgeEnds 数组',
      log: '| int[] edgeEnds = new int[m = 4]; (为每条无向边确定指向深处的子节点端点)',
      msg: '为边端点分配数组：<code>int[] edgeEnds = new int[4]</code>。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'edgeEnds',
      activeArrSlot: 0,
    });

    // Lines 14-17: for (int k = 0; k < m; k++) edgeEnds[k] = dfn[u] > dfn[v] ? u : v;
    for (let k = 0; k < m; k++) {
      const u = edges[k][0];
      const v = edges[k][1];
      edgeEnds[k] = dfn[u] > dfn[v] ? u : v;

      addStep({
        type: 'update',
        line: 16,
        i: k,
        j: edgeEnds[k],
        dp1d: [...edgeEnds],
        memo: [...edgeEnds],
        activeSlot: k,
        tag: `边 e${k}(${u}-${v}) 深端点: #${edgeEnds[k]}`,
        log: `| 边 e${k} [${u}, ${v}]: DFN[${u}]=${dfn[u]} vs DFN[${v}]=${dfn[v]} -> 深端点为 #${edgeEnds[k]}`,
        msg: `定向树边 <code>e${k}(${u}, ${v})</code>：DFN 较大者为深端点 <strong>#${edgeEnds[k]}</strong>，切断该边等价于切除以 <strong>#${edgeEnds[k]}</strong> 为根的子树。`,
        activeNodeId: `score-${edgeEnds[k]}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'edgeEnds',
        activeArrSlot: k,
      });
    }

    // Line 18: int ans = Integer.MAX_VALUE;
    globalAns = 9;
    addStep({
      type: 'update',
      line: 18,
      i: 0,
      j: 0,
      dp1d: [globalAns],
      memo: [globalAns],
      activeSlot: 0,
      tag: 'int ans = MAX_VALUE',
      log: '| int ans = Integer.MAX_VALUE; (准备暴力枚举所有切边对)',
      msg: '初始化答案：<code>ans = Integer.MAX_VALUE</code>，准备枚举所有切边组合。',
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    // Lines 19-33: 双重循环枚举断边方案
    for (let i = 0; i < m; i++) {
      const a = edgeEnds[i];

      addStep({
        type: 'loop',
        line: 19,
        i,
        j: 0,
        dp1d: [globalAns],
        memo: [globalAns],
        activeSlot: i,
        tag: `外层边循环 i=${i} (a=#${a})`,
        log: `🔍 外层循环 i = ${i}: 第一条切除边 e${i}，对应子树根节点 a = #${a}`,
        msg: `外层枚举切边 <code>e${i}</code>：对应被剥离的子树根节点 <strong>#${a}</strong>。`,
        activeNodeId: `score-${a}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'edgeEnds',
        activeArrSlot: i,
      });

      for (let j = i + 1; j < m; j++) {
        const b = edgeEnds[j];

        // Line 24: 判断包含关系
        let x1 = 0,
          x2 = 0,
          x3 = 0;
        let isAncestorA = false;
        let isAncestorB = false;

        if (dfn[a] <= dfn[b] && dfn[b] < dfn[a] + size[a]) {
          isAncestorA = true;
          x1 = xor[b];
          x2 = xor[a] ^ xor[b];
          x3 = allXor ^ xor[a];
        } else if (dfn[b] <= dfn[a] && dfn[a] < dfn[b] + size[b]) {
          isAncestorB = true;
          x1 = xor[a];
          x2 = xor[b] ^ xor[a];
          x3 = allXor ^ xor[b];
        } else {
          x1 = xor[a];
          x2 = xor[b];
          x3 = allXor ^ xor[a] ^ xor[b];
        }

        const maxPart = Math.max(x1, Math.max(x2, x3));
        const minPart = Math.min(x1, Math.min(x2, x3));
        const diff = maxPart - minPart;

        const partitionTree = cloneTree(treeState);
        const colorNodes = (node: UniversalTreeNode) => {
          if (node.id === `score-${b}`) {
            node.status = 'active';
            node.tag = `块1:异或${x1}`;
          } else if (node.id === `score-${a}`) {
            node.status = 'visited';
            node.tag = `块2:异或${x2}`;
          } else if (node.id === 'score-0') {
            node.status = 'normal';
            node.tag = `块3:异或${x3}`;
          }
          node.children.forEach(colorNodes);
        };
        if (partitionTree) colorNodes(partitionTree);

        // Line 24: 检查关系
        addStep({
          type: 'update',
          line: 24,
          i,
          j,
          dp1d: [x1, x2, x3],
          memo: [x1, x2, x3],
          activeSlot: j,
          tag: isAncestorA
            ? `子树#${b} 属于 子树#${a}`
            : isAncestorB
            ? `子树#${a} 属于 子树#${b}`
            : `子树#${a} 与 子树#${b} 并列分支`,
          log: `| 关系判定 (e${i}, e${j}): a=#${a}, b=#${b} -> ${
            isAncestorA ? `#${b}在#${a}内` : isAncestorB ? `#${a}在#${b}内` : '并列分支'
          }`,
          msg: `拓扑关系判定：节点 <strong>#${a}</strong> 与 <strong>#${b}</strong> 为 <strong>${
            isAncestorA ? `包含关系（#${b} 在 #${a} 子树内）` : isAncestorB ? `包含关系` : '并列分支关系'
          }</strong>。`,
          activeNodeId: `score-${b}`,
          treeRoot: partitionTree,
          activeArrName: 'edgeEnds',
          activeArrSlot: j,
          highlightArrSlots: [i],
        });

        // Line 31: 计算极差
        addStep({
          type: 'update',
          line: 31,
          i,
          j,
          dp1d: [x1, x2, x3],
          memo: [x1, x2, x3],
          activeSlot: 0,
          tag: `切分(e${i},e${j}): 差值=${diff}`,
          log: `| ⚡ 切分三块异或和: [${x1}, ${x2}, ${x3}] -> max-min = ${maxPart} - ${minPart} = ${diff} ${
            diff === 9 ? '🎯 (当前最优!)' : ''
          }`,
          msg: `切断边 <code>e${i}</code> 与 <code>e${j}</code>：三连通块异或和分别为 <code>${x1}, ${x2}, ${x3}</code>，极值差为 <code>${maxPart} - ${minPart} = <strong>${diff}</strong></code>。`,
          activeNodeId: `score-${b}`,
          treeRoot: partitionTree,
          activeArrName: 'ans',
          activeArrSlot: 0,
        });
      }
    }

    // Line 34: return ans;
    addStep({
      type: 'return',
      line: 34,
      i: 0,
      j: 0,
      dp1d: [globalAns],
      memo: [globalAns],
      activeSlot: 0,
      tag: `最小分数: ${globalAns}`,
      log: `🏆 return ans = ${globalAns}; (遍历所有断边方案完成，返回最小极差)`,
      msg: `🏆 演化推导全部完成！从树中删除两条边的最小分数为 <strong>${globalAns}</strong>。`,
      activeNodeId: 'score-0',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    return steps;
}
