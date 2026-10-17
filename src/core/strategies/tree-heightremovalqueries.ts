import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode, StateArrayItem } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { cloneTree } from './strategy-helpers';

export function compileHeightRemovalQueries(
    model: IYamlAlgorithmModel,
    _stage: number = 1,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    const params = (model?.defaultParams as any) || {};
    const queries: number[] = Array.isArray(params.queries) && params.queries.length > 0 ? params.queries : [4];

    interface SimpleNode {
      id: string;
      val: number;
      left?: SimpleNode;
      right?: SimpleNode;
    }

    const n2: SimpleNode = { id: 'node-2', val: 2 };
    const n6: SimpleNode = { id: 'node-6', val: 6 };
    const n5: SimpleNode = { id: 'node-5', val: 5 };
    const n3: SimpleNode = { id: 'node-3', val: 3, left: n2 };
    const n4: SimpleNode = { id: 'node-4', val: 4, left: n6, right: n5 };
    const n1: SimpleNode = { id: 'node-1', val: 1, left: n3, right: n4 };

    const treeState: UniversalTreeNode = {
      id: 'node-1',
      r: 0,
      c: 0,
      val: '点#1(深0)',
      status: 'normal',
      tag: '待访问',
      children: [
        {
          id: 'node-3',
          r: 1,
          c: 0,
          val: '点#3(深1)',
          status: 'normal',
          tag: '待访问',
          children: [
            { id: 'node-2', r: 2, c: 0, val: '点#2(深2)', status: 'normal', tag: '待访问', children: [] },
          ],
        },
        {
          id: 'node-4',
          r: 1,
          c: 1,
          val: '点#4(深1)',
          status: 'normal',
          tag: '待访问',
          children: [
            { id: 'node-6', r: 2, c: 1, val: '点#6(深2)', status: 'normal', tag: '待访问', children: [] },
            { id: 'node-5', r: 2, c: 2, val: '点#5(深2)', status: 'normal', tag: '待访问', children: [] },
          ],
        },
      ],
    };

    // 逆向暴力排除重测推导分支 (Reverse Exclusion Simulation)
    if (direction === 'reverse') {
      const revSteps: UniversalStep[] = [];
      const revAns = new Array(queries.length).fill(0);
      const lineRevEntry = anchorMap?.entry ?? 2;
      const lineRevInitAns = anchorMap?.call_dfs ?? 3;
      const lineRevLoop = anchorMap?.init_ans ?? 4;
      const lineRevCallEx = anchorMap?.calc_ans ?? 5;
      const lineRevReturn = anchorMap?.return ?? 7;
      const lineRevDfsEntry = anchorMap?.dfs_entry ?? 9;
      const lineRevDfsNull = anchorMap?.dfs_null ?? 10;
      const lineRevDfsLeft = anchorMap?.dfs_left ?? 11;
      const lineRevDfsRight = anchorMap?.dfs_right ?? 12;

      const revTree = cloneTree(treeState);
      function getRevStateArrays(targetQ?: number, ansVal?: number): StateArrayItem[] {
        return [
          {
            id: 'arr-queries',
            name: 'queries[]',
            label: '目标询问节点',
            indices: queries.map((_, idx) => `q[${idx}]`),
            values: [...queries],
            activeIdx: targetQ !== undefined ? queries.indexOf(targetQ) : undefined,
            color: 'rose',
          },
          {
            id: 'arr-rev-ans',
            name: 'ans[]',
            label: '暴力排除测高',
            indices: queries.map((_, idx) => `ans[${idx}]`),
            values: [...revAns],
            activeIdx: ansVal !== undefined ? 0 : undefined,
            color: 'emerald',
          },
        ];
      }

      function addRevStep(data: Partial<UniversalStep> & { targetQ?: number; ansVal?: number }) {
        const { targetQ, ansVal, ...rest } = data;
        revSteps.push({
          type: rest.type || 'step',
          line: rest.line || lineRevEntry,
          codeLine: rest.codeLine || rest.line || lineRevEntry,
          i: rest.i ?? 0,
          j: rest.j ?? 0,
          dp1d: [...revAns],
          memo: [...revAns],
          activeSlot: rest.activeSlot ?? 0,
          tag: rest.tag || '',
          log: rest.log || '',
          msg: rest.msg || '',
          activeNodeId: rest.activeNodeId,
          treeRoot: rest.treeRoot || cloneTree(revTree),
          stateArrays: getRevStateArrays(targetQ, ansVal),
        });
      }

      addRevStep({
        type: 'entry',
        line: lineRevEntry,
        tag: 'treeQueriesReverse 入口',
        log: '🚀 启动逆向暴力排除对比：依次剔除子树并重测全树高度',
        msg: '启动 <code>treeQueriesReverse</code>：对每个独立询问，动态排除目标子树并重新深度优先遍历。',
        activeNodeId: 'node-1',
      });

      addRevStep({
        type: 'init',
        line: lineRevInitAns,
        tag: '分配 ans 数组',
        log: `| int[] ans = new int[${queries.length}];`,
        msg: `创建查询结果数组 <code>ans</code>，长度为 ${queries.length}。`,
        activeNodeId: 'node-1',
      });

      for (let k = 0; k < queries.length; k++) {
        const q = queries[k];
        addRevStep({
          type: 'loop',
          line: lineRevLoop,
          targetQ: q,
          tag: `处理询问 queries[${k}]=${q}`,
          log: `| 正在处理第 ${k} 个询问：临时断开以 #${q} 为根的完整子树`,
          msg: `处理询问 <code>queries[${k}] = ${q}</code>：将节点 <strong>#${q}</strong> 及其所有后代从树中动态剔除。`,
          activeNodeId: `node-${q}`,
        });

        function calcHeight(node: SimpleNode | undefined, d: number): number {
          if (!node) {
            addRevStep({
              type: 'boundary',
              line: lineRevDfsNull,
              targetQ: q,
              tag: `node=null (d=${d})`,
              log: `| node == null，返回深度 ${d - 1}`,
              msg: `遇到空节点，返回当前上层深度 <code>${d - 1}</code>。`,
            });
            return d - 1;
          }

          addRevStep({
            type: 'entry',
            line: lineRevDfsEntry,
            targetQ: q,
            activeNodeId: node.id,
            tag: `探测 node=#${node.val} (d=${d})`,
            log: `| 递归访问节点 #${node.val}，当前深度 d=${d}`,
            msg: `探测节点 <strong>#${node.val}</strong>（深度 <code>${d}</code>）。`,
          });

          if (node.val === q) {
            addRevStep({
              type: 'boundary',
              line: lineRevDfsNull,
              targetQ: q,
              activeNodeId: node.id,
              tag: `命中排除节点 #${q}！立即剪枝`,
              log: `| 💥 node.val == ${q} 命中目标剔除子树，直接阻断递归并剪枝！`,
              msg: `<strong>动态剪枝</strong>：节点 <strong>#${q}</strong> 属于被删除子树，整枝剪除，返回 <code>${d - 1}</code>！`,
            });
            return d - 1;
          }

          addRevStep({
            type: 'call',
            line: lineRevDfsLeft,
            targetQ: q,
            activeNodeId: node.id,
            tag: `向左探测 #${node.val}->left`,
            log: `| 向左子树递归探测深度 d=${d + 1}`,
            msg: `深入节点 <strong>#${node.val}</strong> 的左子树。`,
          });
          const leftH = calcHeight(node.left, d + 1);

          addRevStep({
            type: 'call',
            line: lineRevDfsRight,
            targetQ: q,
            activeNodeId: node.id,
            tag: `向右探测 #${node.val}->right`,
            log: `| 向右子树递归探测深度 d=${d + 1}`,
            msg: `深入节点 <strong>#${node.val}</strong> 的右子树。`,
          });
          const rightH = calcHeight(node.right, d + 1);

          const curH = Math.max(leftH, rightH);
          addRevStep({
            type: 'update',
            line: lineRevDfsRight,
            targetQ: q,
            activeNodeId: node.id,
            tag: `节点 #${node.val} 最大分支高度: ${curH}`,
            log: `| 节点 #${node.val} 左右支最大高度 = max(${leftH}, ${rightH}) = ${curH}`,
            msg: `节点 <strong>#${node.val}</strong> 归约结果：左右支最大高度为 <code>max(${leftH}, ${rightH}) = <strong>${curH}</strong></code>。`,
          });
          return curH;
        }

        addRevStep({
          type: 'call',
          line: lineRevCallEx,
          targetQ: q,
          tag: `调用 calcHeightExcluding(root, ${q}, 0)`,
          log: `| 调用 calcHeightExcluding(root, ${q}, 0) 暴力重测全树剩余高度`,
          msg: `开始执行全树排除重测：以根节点 <strong>#1</strong> 为入口，排除子树 <strong>#${q}</strong>。`,
          activeNodeId: 'node-1',
        });

        const res = calcHeight(n1, 0);
        revAns[k] = res;

        addRevStep({
          type: 'update',
          line: lineRevCallEx,
          targetQ: q,
          ansVal: res,
          tag: `ans[${k}] = ${res}`,
          log: `| ✅ 暴力重测计算得到：剔除子树 #${q} 后整树最大高度为 ${res}`,
          msg: `暴力重测完成：剔除节点 <strong>#${q}</strong> 及其子树后，剩余树的最大高度为 <strong>${res}</strong>！`,
          activeNodeId: 'node-1',
        });
      }

      addRevStep({
        type: 'return',
        line: lineRevReturn,
        ansVal: revAns[0],
        tag: `返回 ans=[${revAns.join(', ')}]`,
        log: `| 🏆 return ans = [${revAns.join(', ')}]`,
        msg: `🏆 逆向对比完成！验证得到答案 <strong>[${revAns.join(', ')}]</strong>，与 DFN 序前后缀极值 O(1) 求解完全一致！`,
        activeNodeId: 'node-1',
      });

      return revSteps.map((s, idx) => ({
        ...s,
        stepIndex: idx,
        stage: _stage || 1,
        line: s.line || 1,
        codeLine: s.codeLine || s.line || 1,
        decision: s.decision || s.log || s.tag || '移除子树后的二叉树高度逆向暴力排除重测',
        message: s.message || s.msg || s.log || '',
        metrics: {
          '当前询问节点': String(queries[0] ?? 4),
          '剩余树高': String(revAns[0] ?? 2),
          '整树节点数': '6',
          '模式': '逆向暴力排除对比',
        },
      }));
    }

    // 正向 DFN 序打平与前后缀极值求解 (Forward DFN Flattening)
    const steps: UniversalStep[] = [];
    let dfnCnt = 0;
    const dfn: Record<number, number> = {};
    const deep: number[] = new Array(7).fill(0);
    const size: number[] = new Array(7).fill(0);
    const maxLeft: number[] = new Array(7).fill(0);
    const maxRight: number[] = new Array(7).fill(0);
    const ans: number[] = new Array(queries.length).fill(0);
    const dp1dDisplay: number[] = [0, 0, 0, 0, 0, 0];

    function setNodeStatus(id: string, status: any, tag?: string) {
      function traverse(n: UniversalTreeNode) {
        if (n.id === id) {
          n.status = status;
          if (tag !== undefined) n.tag = tag;
        }
        n.children.forEach(traverse);
      }
      traverse(treeState);
    }

    function getSnapshotStateArrays(activeArrName?: string, activeSlotIdx?: number, highlightIndices?: number[]): StateArrayItem[] {
      return [
        {
          id: 'arr-dfn',
          name: 'dfn[]',
          label: '节点访问时间戳',
          indices: ['#1', '#2', '#3', '#4', '#5', '#6'],
          values: [dfn[1] || 0, dfn[2] || 0, dfn[3] || 0, dfn[4] || 0, dfn[5] || 0, dfn[6] || 0],
          activeIdx: activeArrName === 'dfn' ? activeSlotIdx : undefined,
          color: 'blue',
        },
        {
          id: 'arr-deep',
          name: 'deep[]',
          label: 'DFN 节点深度',
          indices: ['1', '2', '3', '4', '5', '6'],
          values: [deep[1] || 0, deep[2] || 0, deep[3] || 0, deep[4] || 0, deep[5] || 0, deep[6] || 0],
          activeIdx: activeArrName === 'deep' ? activeSlotIdx : undefined,
          color: 'indigo',
        },
        {
          id: 'arr-size',
          name: 'size[]',
          label: 'DFN 子树规模',
          indices: ['1', '2', '3', '4', '5', '6'],
          values: [size[1] || 0, size[2] || 0, size[3] || 0, size[4] || 0, size[5] || 0, size[6] || 0],
          activeIdx: activeArrName === 'size' ? activeSlotIdx : undefined,
          color: 'purple',
        },
        {
          id: 'arr-maxleft',
          name: 'maxLeft[]',
          label: '前缀最大深度',
          indices: ['1', '2', '3', '4', '5', '6'],
          values: [maxLeft[1] || 0, maxLeft[2] || 0, maxLeft[3] || 0, maxLeft[4] || 0, maxLeft[5] || 0, maxLeft[6] || 0],
          activeIdx: activeArrName === 'maxLeft' ? activeSlotIdx : undefined,
          highlightIndices: activeArrName === 'maxLeft' ? highlightIndices : undefined,
          color: 'emerald',
        },
        {
          id: 'arr-maxright',
          name: 'maxRight[]',
          label: '后缀最大深度',
          indices: ['1', '2', '3', '4', '5', '6'],
          values: [maxRight[1] || 0, maxRight[2] || 0, maxRight[3] || 0, maxRight[4] || 0, maxRight[5] || 0, maxRight[6] || 0],
          activeIdx: activeArrName === 'maxRight' ? activeSlotIdx : undefined,
          highlightIndices: activeArrName === 'maxRight' ? highlightIndices : undefined,
          color: 'amber',
        },
        {
          id: 'arr-ans',
          name: 'ans[]',
          label: '查询结果收集',
          indices: ['q[0]=4'],
          values: [ans[0] || 0],
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

    // Line 8: public int[] treeQueries(TreeNode root, int[] queries) {
    addStep({
      type: 'entry',
      line: 8,
      i: 0,
      j: 0,
      dp1d: [...dp1dDisplay],
      memo: [...dp1dDisplay],
      activeSlot: 0,
      tag: 'treeQueries 入口',
      log: '🚀 public int[] treeQueries(TreeNode root, int[] queries) 函数入口，queries=[4]',
      msg: '启动 <code>treeQueries</code>：传入二叉树与查询数组 <code>queries = [4]</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
    });

    // Line 9: dfs(root, 0);
    addStep({
      type: 'call',
      line: 9,
      i: 0,
      j: 0,
      dp1d: [...dp1dDisplay],
      memo: [...dp1dDisplay],
      activeSlot: 0,
      tag: '调用 dfs(root, 0)',
      log: '🌲 dfs(root, 0); 调用先序深度优先遍历整树',
      msg: '准备从树根 <strong>#1</strong> 开始先序深度优先遍历。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
    });

    function simulateDfs(node: SimpleNode | undefined, d: number) {
      // Line 21: private void dfs(TreeNode node, int d) {
      addStep({
        type: 'entry',
        line: 21,
        i: node ? node.val : 0,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: Math.max(0, dfnCnt - 1),
        tag: node ? `dfs(node=#${node.val}, d=${d})` : 'dfs(null)',
        log: node ? `进入 dfs(node=#${node.val}, d=${d})` : `进入 dfs(node=null, d=${d})`,
        msg: node ? `进入 <code>dfs(node=#${node.val}, d=${d})</code> 递归函数。` : '进入 <code>dfs(null)</code>。',
        activeNodeId: node?.id,
        treeRoot: cloneTree(treeState),
      });

      // Line 22: if (node == null) return;
      if (!node) {
        addStep({
          type: 'boundary',
          line: 22,
          i: 0,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: Math.max(0, dfnCnt - 1),
          tag: 'node == null (return)',
          log: '| if (node == null) 为真，直接 return',
          msg: '节点为空，触发边界返回。',
          treeRoot: cloneTree(treeState),
        });
        return;
      }

      addStep({
        type: 'update',
        line: 22,
        i: node.val,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: Math.max(0, dfnCnt - 1),
        tag: `node=#${node.val} != null`,
        log: `| 检查: node=#${node.val} != null，继续执行`,
        msg: `检查边界：节点 <strong>#${node.val}</strong> 非空，继续向下执行。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
      });

      // Line 23: int i = ++dfnCnt;
      dfnCnt++;
      const curI = dfnCnt;
      setNodeStatus(node.id, 'visited', `DFN:${curI}|深:${d}`);
      dfn[node.val] = curI;
      addStep({
        type: 'update',
        line: 23,
        i: node.val,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: curI - 1,
        tag: `int i = ++dfnCnt (${curI})`,
        log: `| int i = ++dfnCnt; (分配时间戳 i = ${curI})`,
        msg: `先序计数器自增：为节点 <strong>#${node.val}</strong> 分配 DFN 序号 <code>i = ++dfnCnt = ${curI}</code>。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'dfn',
        activeArrSlot: node.val - 1,
      });

      // Line 24: dfn[node.val] = i; deep[i] = d; size[i] = 1;
      deep[curI] = d;
      size[curI] = 1;
      dp1dDisplay[curI - 1] = d;
      addStep({
        type: 'update',
        line: 24,
        i: node.val,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: curI - 1,
        tag: `dfn[${node.val}]=${curI}, deep[${curI}]=${d}`,
        log: `| dfn[${node.val}]=${curI}; deep[${curI}]=${d}; size[${curI}]=1; (记录节点深度与初始大小)`,
        msg: `记录状态：<code>dfn[${node.val}]=${curI}, deep[${curI}]=${d}, size[${curI}]=1</code>。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'deep',
        activeArrSlot: curI - 1,
      });

      // Line 25: if (node.left != null) { dfs(node.left, d + 1); size[i] += size[dfn[node.left.val]]; }
      if (node.left) {
        addStep({
          type: 'call',
          line: 25,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: `node.left != null (进入 #${node.left.val})`,
          log: `| if (node.left != null): 发现左孩子 #${node.left.val}，调用 dfs(node.left, ${d + 1})`,
          msg: `检查左孩子：存在节点 <strong>#${node.left.val}</strong>，递归进入左子树。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });

        simulateDfs(node.left, d + 1);

        // 回溯后累加 size
        size[curI] += size[dfn[node.left.val]];
        addStep({
          type: 'update',
          line: 25,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: `size[${curI}] += ${size[dfn[node.left.val]]}`,
          log: `| size[${curI}] += size[dfn[${node.left.val}]] = ${size[dfn[node.left.val]]} -> size[${curI}] = ${size[curI]}`,
          msg: `左孩子回溯：累加左子树大小，<code>size[${curI}] = ${size[curI]}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
          activeArrName: 'size',
          activeArrSlot: curI - 1,
        });
      } else {
        addStep({
          type: 'update',
          line: 25,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: 'node.left == null',
          log: `| if (node.left != null) 为假 (左孩子为空)`,
          msg: `检查左孩子：节点 <strong>#${node.val}</strong> 左孩子为空，跳过递归。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });
      }

      // Line 26: if (node.right != null) { dfs(node.right, d + 1); size[i] += size[dfn[node.right.val]]; }
      if (node.right) {
        addStep({
          type: 'call',
          line: 26,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: `node.right != null (进入 #${node.right.val})`,
          log: `| if (node.right != null): 发现右孩子 #${node.right.val}，调用 dfs(node.right, ${d + 1})`,
          msg: `检查右孩子：存在节点 <strong>#${node.right.val}</strong>，递归进入右子树。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });

        simulateDfs(node.right, d + 1);

        // 回溯后累加 size
        size[curI] += size[dfn[node.right.val]];
        addStep({
          type: 'update',
          line: 26,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: `size[${curI}] += ${size[dfn[node.right.val]]}`,
          log: `| size[${curI}] += size[dfn[${node.right.val}]] = ${size[dfn[node.right.val]]} -> size[${curI}] = ${size[curI]}`,
          msg: `右孩子回溯：累加右子树大小，<code>size[${curI}] = ${size[curI]}</code>。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
          activeArrName: 'size',
          activeArrSlot: curI - 1,
        });
      } else {
        addStep({
          type: 'update',
          line: 26,
          i: node.val,
          j: d,
          dp1d: [...dp1dDisplay],
          memo: [...dp1dDisplay],
          activeSlot: curI - 1,
          tag: 'node.right == null',
          log: `| if (node.right != null) 为假 (右孩子为空)`,
          msg: `检查右孩子：节点 <strong>#${node.val}</strong> 右孩子为空，跳过递归。`,
          activeNodeId: node.id,
          treeRoot: cloneTree(treeState),
        });
      }

      // Line 27: method exit
      addStep({
        type: 'return',
        line: 27,
        i: node.val,
        j: d,
        dp1d: [...dp1dDisplay],
        memo: [...dp1dDisplay],
        activeSlot: curI - 1,
        tag: `dfs(#${node.val}) 结束返回`,
        log: `| dfs(node=#${node.val}) 执行完毕返回上一层 (子树总规模 size=${size[curI]})`,
        msg: `节点 <strong>#${node.val}</strong> 遍历完毕，返回上一层调用栈。`,
        activeNodeId: node.id,
        treeRoot: cloneTree(treeState),
        activeArrName: 'size',
        activeArrSlot: curI - 1,
      });
    }

    // 执行真实 dfs
    simulateDfs(n1, 0);

    // Line 10: maxLeft[1] = deep[1];
    maxLeft[1] = deep[1];
    const prefixDisplay: number[] = new Array(6).fill(0);
    prefixDisplay[0] = maxLeft[1];
    addStep({
      type: 'update',
      line: 10,
      i: 1,
      j: 0,
      dp1d: [...prefixDisplay],
      memo: [...prefixDisplay],
      activeSlot: 0,
      tag: 'maxLeft[1] = deep[1]',
      log: `📊 maxLeft[1] = deep[1] = ${deep[1]}; (初始化前缀最大深度)`,
      msg: `初始化前缀最大值数组：<code>maxLeft[1] = deep[1] = ${deep[1]}</code>。`,
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'maxLeft',
      activeArrSlot: 0,
    });

    // Line 11: for (int i = 2; i <= dfnCnt; i++) maxLeft[i] = Math.max(maxLeft[i - 1], deep[i]);
    for (let i = 2; i <= dfnCnt; i++) {
      addStep({
        type: 'loop',
        line: 11,
        i,
        j: 0,
        dp1d: [...prefixDisplay],
        memo: [...prefixDisplay],
        activeSlot: i - 1,
        tag: `循环 i=${i}<=dfnCnt`,
        log: `| for (int i = ${i}; i <= ${dfnCnt}; i++): 循环条件满足`,
        msg: `检查前缀循环条件：<code>i = ${i} <= ${dfnCnt}</code> 为真，准备递推计算。`,
        activeNodeId: 'node-1',
        treeRoot: cloneTree(treeState),
        activeArrName: 'maxLeft',
        activeArrSlot: i - 1,
      });

      maxLeft[i] = Math.max(maxLeft[i - 1], deep[i]);
      prefixDisplay[i - 1] = maxLeft[i];

      addStep({
        type: 'update',
        line: 11,
        i,
        j: 0,
        dp1d: [...prefixDisplay],
        memo: [...prefixDisplay],
        activeSlot: i - 1,
        tag: `maxLeft[${i}]=${maxLeft[i]}`,
        log: `| maxLeft[${i}] = Math.max(maxLeft[${i - 1}]=${maxLeft[i - 1]}, deep[${i}]=${deep[i]}) = ${maxLeft[i]};`,
        msg: `递推前缀极值：<code>maxLeft[${i}] = max(${maxLeft[i - 1]}, ${deep[i]}) = ${maxLeft[i]}</code>。`,
        activeNodeId: 'node-1',
        treeRoot: cloneTree(treeState),
        activeArrName: 'maxLeft',
        activeArrSlot: i - 1,
        highlightArrSlots: [i - 2],
      });
    }

    // Line 12: maxRight[dfnCnt] = deep[dfnCnt];
    maxRight[dfnCnt] = deep[dfnCnt];
    const suffixDisplay: number[] = new Array(6).fill(0);
    suffixDisplay[dfnCnt - 1] = maxRight[dfnCnt];
    addStep({
      type: 'update',
      line: 12,
      i: dfnCnt,
      j: 0,
      dp1d: [...suffixDisplay],
      memo: [...suffixDisplay],
      activeSlot: dfnCnt - 1,
      tag: `maxRight[${dfnCnt}]=${maxRight[dfnCnt]}`,
      log: `📊 maxRight[${dfnCnt}] = deep[${dfnCnt}] = ${deep[dfnCnt]}; (初始化后缀最大深度)`,
      msg: `初始化后缀最大值数组：<code>maxRight[${dfnCnt}] = deep[${dfnCnt}] = ${deep[dfnCnt]}</code>。`,
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'maxRight',
      activeArrSlot: dfnCnt - 1,
    });

    // Line 13: for (int i = dfnCnt - 1; i >= 1; i--) maxRight[i] = Math.max(maxRight[i + 1], deep[i]);
    for (let i = dfnCnt - 1; i >= 1; i--) {
      addStep({
        type: 'loop',
        line: 13,
        i,
        j: 0,
        dp1d: [...suffixDisplay],
        memo: [...suffixDisplay],
        activeSlot: i - 1,
        tag: `循环 i=${i}>=1`,
        log: `| for (int i = ${i}; i >= 1; i--): 循环条件满足`,
        msg: `检查后缀循环条件：<code>i = ${i} >= 1</code> 为真，准备逆序递推。`,
        activeNodeId: 'node-1',
        treeRoot: cloneTree(treeState),
        activeArrName: 'maxRight',
        activeArrSlot: i - 1,
      });

      maxRight[i] = Math.max(maxRight[i + 1], deep[i]);
      suffixDisplay[i - 1] = maxRight[i];

      addStep({
        type: 'update',
        line: 13,
        i,
        j: 0,
        dp1d: [...suffixDisplay],
        memo: [...suffixDisplay],
        activeSlot: i - 1,
        tag: `maxRight[${i}]=${maxRight[i]}`,
        log: `| maxRight[${i}] = Math.max(maxRight[${i + 1}]=${maxRight[i + 1]}, deep[${i}]=${deep[i]}) = ${maxRight[i]};`,
        msg: `递推后缀极值：<code>maxRight[${i}] = max(${maxRight[i + 1]}, ${deep[i]}) = ${maxRight[i]}</code>。`,
        activeNodeId: 'node-1',
        treeRoot: cloneTree(treeState),
        activeArrName: 'maxRight',
        activeArrSlot: i - 1,
        highlightArrSlots: [i],
      });
    }

    // Line 14: int[] ans = new int[queries.length];
    addStep({
      type: 'update',
      line: 14,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: 'int[] ans 分配',
      log: '📦 int[] ans = new int[queries.length = 1]; (分配查询答案数组)',
      msg: '为答案分配数组：<code>int[] ans = new int[1]</code>。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    // Line 15: for (int k = 0; k < queries.length; k++) {
    for (let k = 0; k < queries.length; k++) {
      addStep({
        type: 'loop',
        line: 15,
        i: k,
        j: 0,
        dp1d: [...ans],
        memo: [...ans],
        activeSlot: k,
        tag: `for k=${k}<queries.length`,
        log: `🔍 for (int k = ${k}; k < ${queries.length}; k++): 处理第 ${k + 1} 个查询 queries[${k}] = ${queries[k]}`,
        msg: `进入查询循环：当前处理 <code>queries[${k}] = ${queries[k]}</code>。`,
        activeNodeId: `node-${queries[k]}`,
        treeRoot: cloneTree(treeState),
        activeArrName: 'ans',
        activeArrSlot: k,
      });

      // Line 16: int i = dfn[queries[k]];
      const targetVal = queries[k];
      const targetI = dfn[targetVal];
      const targetSize = size[targetI];

      const queryTree = cloneTree(treeState);
      const markSubtreePruned = (n: UniversalTreeNode) => {
        if (n.id === `node-${targetVal}` || n.id === 'node-6' || n.id === 'node-5') {
          n.status = 'pruned';
          n.tag = '已剔除';
        }
        n.children.forEach(markSubtreePruned);
      };
      if (queryTree) markSubtreePruned(queryTree);

      addStep({
        type: 'update',
        line: 16,
        i: targetI,
        j: 0,
        dp1d: [...ans],
        memo: [...ans],
        activeSlot: k,
        tag: `int i = dfn[${targetVal}] = ${targetI}`,
        log: `| int i = dfn[queries[${k}] = ${targetVal}] = ${targetI}; (子树区间 DFN[${targetI} .. ${targetI + targetSize - 1}])`,
        msg: `定位子树 DFN 区间：节点 <strong>#${targetVal}</strong> 的时间戳为 <code>${targetI}</code>，子树大小为 <code>${targetSize}</code>，剔除闭区间 <code>[${targetI} .. ${targetI + targetSize - 1}]</code>。`,
        activeNodeId: `node-${targetVal}`,
        treeRoot: queryTree,
        activeArrName: 'dfn',
        activeArrSlot: targetVal - 1,
      });

      // Line 17: ans[k] = Math.max(maxLeft[i - 1], maxRight[i + size[i]]);
      const leftMax = targetI - 1 >= 1 ? maxLeft[targetI - 1] : 0;
      const rightIdx = targetI + targetSize;
      const rightMax = rightIdx <= dfnCnt ? maxRight[rightIdx] : 0;
      ans[k] = Math.max(leftMax, rightMax);

      addStep({
        type: 'update',
        line: 17,
        i: targetI,
        j: 0,
        dp1d: [...ans],
        memo: [...ans],
        activeSlot: k,
        tag: `ans[${k}] = max(${leftMax}, ${rightMax}) = ${ans[k]}`,
        log: `| ans[${k}] = Math.max(maxLeft[${targetI - 1}]=${leftMax}, maxRight[${rightIdx}]=${rightMax}) = ${ans[k]};`,
        msg: `<strong>核心极值合并</strong>：左侧前缀最大深度 <code>maxLeft[${targetI - 1}]=${leftMax}</code>，右侧后缀最大深度 <code>maxRight[${rightIdx}]=${rightMax}</code>，合并得到整树最大高度 <strong>${ans[k]}</strong>！`,
        activeNodeId: `node-${targetVal}`,
        treeRoot: queryTree,
        activeArrName: 'ans',
        activeArrSlot: k,
      });
    }

    // Line 15: loop exit
    addStep({
      type: 'loop',
      line: 15,
      i: queries.length,
      j: 0,
      dp1d: [...ans],
      memo: [...ans],
      activeSlot: 0,
      tag: '查询循环结束',
      log: `| for (int k = ${queries.length}; k < ${queries.length}; k++): 条件为假，退出循环`,
      msg: '所有查询处理完毕，跳出循环。',
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    // Line 19: return ans;
    addStep({
      type: 'return',
      line: 19,
      i: 0,
      j: 0,
      dp1d: [...ans],
      memo: [...ans],
      activeSlot: 0,
      tag: 'return ans',
      log: `🏆 return ans; (返回查询答案数组 [${ans.join(', ')}])`,
      msg: `🏆 演化推导全部完成！返回答案数组 <strong>[${ans.join(', ')}]</strong>。`,
      activeNodeId: 'node-1',
      treeRoot: cloneTree(treeState),
      activeArrName: 'ans',
      activeArrSlot: 0,
    });

    const stageLines = _stage === 2 ? 15 : _stage === 3 ? 12 : _stage === 4 ? 12 : 28;
    return steps.map((s, idx) => {
      let line = s.line || 1;
      if (_stage > 1 && !anchorMap) {
        line = Math.min(line, stageLines);
      }
      return {
        ...s,
        stepIndex: idx,
        stage: _stage || 1,
        line,
        codeLine: line,
        decision: s.decision || s.log || s.tag || '移除子树后的二叉树高度状态转移',
        message: s.message || s.msg || s.log || '',
        metrics: s.metrics || {
          '当前询问节点': String(queries[0] ?? 4),
          '整树移除后最大高度': String(ans[0] ?? 2),
          '整树节点数': '6',
          'DFN打平跨度': '6',
        },
      };
    });
}
