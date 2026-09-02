import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

export interface HeightRemovalInput {
  root?: (number | null)[];
  queries?: number[];
}

interface RawTreeNode {
  val: number;
  left: RawTreeNode | null;
  right: RawTreeNode | null;
}

function buildTreeFromArray(arr: (number | null)[]): RawTreeNode | null {
  if (!arr || arr.length === 0 || arr[0] === null) return null;
  const root: RawTreeNode = { val: arr[0]!, left: null, right: null };
  const queue: RawTreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const curr = queue.shift()!;
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
      curr.left = { val: arr[i]!, left: null, right: null };
      queue.push(curr.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
      curr.right = { val: arr[i]!, left: null, right: null };
      queue.push(curr.right);
    }
    i++;
  }
  return root;
}

/**
 * 移除子树后的二叉树高度 (Height of Binary Tree After Subtree Removal Queries)
 * LeetCode 2458 / 左程云算法通关课 第079讲 树型DP下 Code03
 *
 * 核心考点：
 * 树的先序 DFS 序（DFN 序）打平技巧。以 u 为根的子树在 DFN 序中占据连续区间 [dfn[u], dfn[u] + size[u] - 1]。
 * 剔除该子树后，整棵树剩余节点的最大深度即为剔除区间左侧前缀最大深度与右侧后缀最大深度的较大值：
 * max(maxLeft[dfn[u] - 1], maxRight[dfn[u] + size[u]])
 * 单次查询降至 O(1)。
 */
export const HeightRemovalQueriesSpec: AlgorithmSpec = {
  id: 'height-removal-queries',
  name: '移除子树后的二叉树高度 (Height After Subtree Removal)',
  category: '树型 DP',
  description:
    '高阶树型DP与DFS序打平技巧。给定二叉树与多个独立询问，每次查询删除以指定节点为根的子树后整棵树的最大高度。利用先序DFS序将子树映射为连续区间，配合前后缀最大深度数组在 O(1) 时间回答单次询问。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 2458,
    leetcodeUrl: 'https://leetcode.cn/problems/height-of-binary-tree-after-subtree-removal-queries/',
    difficulty: 'hard',
    tags: ['树', '深度优先搜索', '广度优先搜索', '动态规划', '树型DP', 'DFS序'],
    description:
      '给你一棵 <strong>二叉树</strong> 的根节点 <code>root</code> ，树中有 <code>n</code> 个节点，每个节点都有一个从 <code>1</code> 到 <code>n</code> 且互不相同的值。<br/><br/>另给你一个长度为 <code>m</code> 的数组 <code>queries</code>。你必须在树上执行 <code>m</code> 个 <strong>独立</strong> 的查询，第 <code>i</code> 个查询需要从树中 <strong>移除</strong> 以 <code>queries[i]</code> 的值作为根节点的子树。<br/><br/>返回一个长度为 <code>m</code> 的数组 <code>answer</code>，其中 <code>answer[i]</code> 是执行第 <code>i</code> 个查询后树的 <strong>高度</strong>（即根到树中任意节点的最长简单路径中的边数）。<br/><em>注意：查询之间是独立的，每个查询执行后树会回到初始状态。</em>',
    examples: [
      {
        input: 'root = [1, 3, 4, 2, null, 6, 5, null, null, null, null, null, 7], queries = [4]',
        output: '[2]',
        explanation: '移除节点 4 的子树后，剩余节点中最大深度为节点 2（深度 2），树高度为 2。',
      },
      {
        input: 'root = [5, 8, 9, 2, 1, 3, 7, 4, 6], queries = [3, 2, 4, 8]',
        output: '[3, 2, 3, 2]',
        explanation: '每次查询独立删除对应子树后计算剩余树高度。',
      },
    ],
    constraints: [
      '树中节点的数目是 n',
      '2 <= n <= 10^5',
      '1 <= Node.val <= n',
      '树中的所有值互不相同',
      'm == queries.length',
      '1 <= m <= min(n, 10^4)',
      'queries[i] != root.val',
    ],
  },
  semanticLines: {
    entry: { java: 8, cpp: 16, python: 2, javascript: 1 },
    guard: { java: 21, cpp: 8, python: 6, javascript: 7 },
    init: { java: 9, cpp: 17, python: 18, javascript: 20 },
    stateTransfer: {
      java: [10, 11, 12, 13, 16],
      cpp: [18, 19, 20, 21, 24],
      python: [22, 23, 24, 25, 30],
      javascript: [23, 24, 25, 26, 33],
    },
    returnResult: { java: 18, cpp: 26, python: 32, javascript: 36 },
  },
  code: {
    languages: {
      javascript: [
        'function treeQueries(root, queries) {',
        '    const dfn = new Map();',
        '    const deep = [], size = [];',
        '    let dfnCnt = 0;',
        '    function dfs(node, d) {',
        '        if (!node) return;',
        '        const i = dfnCnt++;',
        '        dfn.set(node.val, i);',
        '        deep[i] = d; size[i] = 1;',
        '        if (node.left) {',
        '            dfs(node.left, d + 1);',
        '            size[i] += size[dfn.get(node.left.val)];',
        '        }',
        '        if (node.right) {',
        '            dfs(node.right, d + 1);',
        '            size[i] += size[dfn.get(node.right.val)];',
        '        }',
        '    }',
        '    dfs(root, 0);',
        '    const n = dfnCnt;',
        '    const maxLeft = new Array(n).fill(0);',
        '    const maxRight = new Array(n).fill(0);',
        '    maxLeft[0] = deep[0];',
        '    for (let i = 1; i < n; i++) maxLeft[i] = Math.max(maxLeft[i - 1], deep[i]);',
        '    maxRight[n - 1] = deep[n - 1];',
        '    for (let i = n - 2; i >= 0; i--) maxRight[i] = Math.max(maxRight[i + 1], deep[i]);',
        '    const ans = [];',
        '    for (const q of queries) {',
        '        const i = dfn.get(q);',
        '        const l = i - 1, r = i + size[i];',
        '        let h = 0;',
        '        if (l >= 0) h = Math.max(h, maxLeft[l]);',
        '        if (r < n) h = Math.max(h, maxRight[r]);',
        '        ans.push(h);',
        '    }',
        '    return ans;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private int dfnCnt = 0;',
        '    private int[] dfn = new int[100005];',
        '    private int[] deep = new int[100005];',
        '    private int[] size = new int[100005];',
        '    private int[] maxLeft = new int[100005];',
        '    private int[] maxRight = new int[100005];',
        '    public int[] treeQueries(TreeNode root, int[] queries) {',
        '        dfs(root, 0);',
        '        maxLeft[1] = deep[1];',
        '        for (int i = 2; i <= dfnCnt; i++) maxLeft[i] = Math.max(maxLeft[i - 1], deep[i]);',
        '        maxRight[dfnCnt] = deep[dfnCnt];',
        '        for (int i = dfnCnt - 1; i >= 1; i--) maxRight[i] = Math.max(maxRight[i + 1], deep[i]);',
        '        int[] ans = new int[queries.length];',
        '        for (int k = 0; k < queries.length; k++) {',
        '            int i = dfn[queries[k]];',
        '            ans[k] = Math.max(maxLeft[i - 1], maxRight[i + size[i]]);',
        '        }',
        '        return ans;',
        '    }',
        '    private void dfs(TreeNode node, int d) {',
        '        if (node == null) return;',
        '        int i = ++dfnCnt;',
        '        dfn[node.val] = i; deep[i] = d; size[i] = 1;',
        '        if (node.left != null) { dfs(node.left, d + 1); size[i] += size[dfn[node.left.val]]; }',
        '        if (node.right != null) { dfs(node.right, d + 1); size[i] += size[dfn[node.right.val]]; }',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int dfn[100005], deep[100005], sz[100005];',
        '    int maxLeft[100005], maxRight[100005];',
        '    int dfnCnt = 0;',
        '    void dfs(TreeNode* node, int d) {',
        '        if (!node) return;',
        '        int i = ++dfnCnt;',
        '        dfn[node->val] = i; deep[i] = d; sz[i] = 1;',
        '        if (node->left) { dfs(node->left, d + 1); sz[i] += sz[dfn[node->left->val]]; }',
        '        if (node->right) { dfs(node->right, d + 1); sz[i] += sz[dfn[node->right->val]]; }',
        '    }',
        '    vector<int> treeQueries(TreeNode* root, vector<int>& queries) {',
        '        dfs(root, 0);',
        '        maxLeft[1] = deep[1];',
        '        for (int i = 2; i <= dfnCnt; i++) maxLeft[i] = max(maxLeft[i - 1], deep[i]);',
        '        maxRight[dfnCnt] = deep[dfnCnt];',
        '        for (int i = dfnCnt - 1; i >= 1; i--) maxRight[i] = max(maxRight[i + 1], deep[i]);',
        '        vector<int> ans;',
        '        for (int q : queries) {',
        '            int i = dfn[q];',
        '            ans.push_back(max(maxLeft[i - 1], maxRight[i + sz[i]]));',
        '        }',
        '        return ans;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def treeQueries(self, root: Optional[TreeNode], queries: List[int]) -> List[int]:',
        '        dfn = {}',
        '        deep, size = [], []',
        '        dfn_cnt = 0',
        '        def dfs(node, d):',
        '            nonlocal dfn_cnt',
        '            if not node: return',
        '            i = dfn_cnt',
        '            dfn_cnt += 1',
        '            dfn[node.val] = i',
        '            deep.append(d)',
        '            size.append(1)',
        '            if node.left:',
        '                dfs(node.left, d + 1)',
        '                size[i] += size[dfn[node.left.val]]',
        '            if node.right:',
        '                dfs(node.right, d + 1)',
        '                size[i] += size[dfn[node.right.val]]',
        '        dfs(root, 0)',
        '        n = dfn_cnt',
        '        max_left = [0] * n',
        '        max_right = [0] * n',
        '        max_left[0] = deep[0]',
        '        for i in range(1, n): max_left[i] = max(max_left[i - 1], deep[i])',
        '        max_right[n - 1] = deep[n - 1]',
        '        for i in range(n - 2, -1, -1): max_right[i] = max(max_right[i + 1], deep[i])',
        '        ans = []',
        '        for q in queries:',
        '            i = dfn[q]',
        '            l, r = i - 1, i + size[i]',
        '            h = 0',
        '            if l >= 0: h = max(h, max_left[l])',
        '            if r < n: h = max(h, max_right[r])',
        '            ans.append(h)',
        '        return ans',
      ],
    },
    lineExplanations: {
      javascript: [
        '1: 主函数接收树根节点 root 与查询数组 queries',
        '2-4: 初始化 dfn 映射表、深度数组 deep、子树大小数组 size 与时间戳计数器',
        '5-18: 先序深度优先遍历：为当前节点分配连续 DFN 序，并自底向上累加子树节点总数',
        '19: 执行 DFS 遍历整棵二叉树',
        '21-26: 预处理 DFN 序列的前缀最大深度 maxLeft 与后缀最大深度 maxRight',
        '28-35: 针对每个独立查询节点 q，剔除其对应的 [i, i + size[i] - 1] 区间，O(1) 合并左右剩余区间最大深度',
        '36: 返回所有查询的答案数组',
      ],
      java: [
        '1: Solution 解决方案类定义',
        '2-7: 静态/成员数组：dfn 序号、节点深度 deep、子树大小 size、前后缀最大深度 maxLeft / maxRight',
        '8-19: treeQueries 入口：DFS 建立序列表，预处理前后缀极值，快速回答每个移除子树询问',
        '20-27: dfs 递归过程：先序递增分配 dfnCnt，回溯时累加左右孩子子树规模',
      ],
      cpp: [
        '1: Solution 类定义',
        '3-5: 预分配数组：dfn 序、深度 deep、大小 sz 及前后缀极值数组',
        '6-14: 先序遍历记录 DFN 序及节点深度',
        '15-26: 构建双向前缀/后缀最大值数组，O(1) 计算剔除子树后的整树最大高度',
      ],
      python: [
        '1: Solution 类定义',
        '2-17: treeQueries 入口，内嵌 dfs 先序遍历生成 DFN 序号与子树大小',
        '18-26: 生成线性前缀最大深度 max_left 与后缀最大深度 max_right',
        '27-32: 剔除目标子树区间 [l+1, r-1]，合并两端最大深度并收集结果',
      ],
    },
    keyPoints: {
      thinking:
        '若暴力对每次查询重新遍历树求高度，时间复杂度为 O(m * n)，必定超时。核心洞见在于：二叉树先序遍历得到的 DFS 序（DFN 序）中，任意一棵子树的所有节点一定紧密排列在一段连续闭区间 [dfn[u], dfn[u] + size[u] - 1] 内。因此，“移除一棵子树”等价于“在整个一维 DFN 序列中挖掉这一段连续区间”。序列剩余部分自然裂解为左侧前缀与右侧后缀两部分，其全局最大深度即为 max(前缀最大深度, 后缀最大深度)。',
      state:
        'dfn[u]: 节点 u 在先序遍历中的时间戳编号\ndeep[i]: DFN 序号为 i 的节点深度（根节点为 0）\nsize[i]: 以 DFN 序号为 i 的节点为根的子树总节点数\nmaxLeft[i] = max(deep[0..i]), maxRight[i] = max(deep[i..n-1])',
      equation:
        'ans[k] = max(maxLeft[dfn[queries[k]] - 1], maxRight[dfn[queries[k]] + size[dfn[queries[k]]]])',
      initAndBounds:
        '根节点深度为 0；时间戳从 1（或 0）开始单调递增；当剔除的子树区间恰好包含左边界或右边界时，对应越界侧深度取 0。',
      complexity:
        '时间复杂度：建图与 DFS 遍历 O(n)，前后缀预处理 O(n)，回答 m 次查询 O(m)，总时间复杂度 O(n + m)。空间复杂度 O(n)。',
    },
    faqList: [
      {
        tag: 'DFN序性质',
        question: '为什么以 u 为根的子树在 DFN 序中一定是连续区间？',
        answer:
          '因为在深度优先搜索（DFS）中，进入节点 u 后，必须完整遍历完 u 的所有子孙节点，才会回溯并离开 u。因此所有子孙节点的访问时间戳必定落在 [dfn[u], dfn[u] + size[u] - 1] 范围内。',
      },
      {
        tag: '根节点移除约束',
        question: '题目为什么保证 queries[i] != root.val？',
        answer:
          '若移除了根节点整棵树将变为空树（高度未定义或为 -1）。保证不移除根节点，保证至少存在根节点（深度为 0），左右前缀/后缀至少有一侧保留了根节点，答案恒 >= 0。',
      },
    ],
  },
  generateSteps: (input: HeightRemovalInput): DpTraceStep[] => {
    const rawRoot = input?.root || [1, 3, 4, 2, null, 6, 5, null, null, null, null, null, 7];
    const queries = input?.queries || [4, 3];
    const treeRoot = buildTreeFromArray(rawRoot);
    const steps: DpTraceStep[] = [];

    if (!treeRoot) {
      return [
        makeTraceStep({
          message: '输入为空二叉树',
          log: '空树',
          vars: [{ name: '状态', value: '空树' }],
        }),
      ];
    }

    const dfnMap = new Map<number, number>();
    const nodeValByDfn: number[] = [];
    const deep: number[] = [];
    const size: number[] = [];
    let dfnCnt = 0;

    function dfs(node: RawTreeNode | null, d: number) {
      if (!node) return;
      const idx = dfnCnt++;
      dfnMap.set(node.val, idx);
      nodeValByDfn.push(node.val);
      deep.push(d);
      size.push(1);

      if (node.left) {
        dfs(node.left, d + 1);
        size[idx] += size[dfnMap.get(node.left.val)!];
      }
      if (node.right) {
        dfs(node.right, d + 1);
        size[idx] += size[dfnMap.get(node.right.val)!];
      }
    }

    dfs(treeRoot, 0);
    const n = dfnCnt;

    const maxLeft: number[] = new Array(n).fill(0);
    const maxRight: number[] = new Array(n).fill(0);
    maxLeft[0] = deep[0];
    for (let i = 1; i < n; i++) {
      maxLeft[i] = Math.max(maxLeft[i - 1], deep[i]);
    }
    maxRight[n - 1] = deep[n - 1];
    for (let i = n - 2; i >= 0; i--) {
      maxRight[i] = Math.max(maxRight[i + 1], deep[i]);
    }

    function toDpTree(
      node: RawTreeNode | null,
      disabledSet: Set<number>,
      activeVal?: number
    ): DpTreeNode | null {
      if (!node) return null;
      const d = deep[dfnMap.get(node.val)!];
      const isDisabled = disabledSet.has(node.val);
      const isActive = node.val === activeVal;
      const state: DpTreeNode['state'] = isDisabled
        ? 'disabled'
        : isActive
        ? 'active'
        : 'computed';

      return {
        id: `node-${node.val}`,
        label: `节点#${node.val}\n深度:${d}`,
        value: d,
        state,
        children: [
          toDpTree(node.left, disabledSet, activeVal),
          toDpTree(node.right, disabledSet, activeVal),
        ].filter(Boolean) as DpTreeNode[],
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot, new Set()),
        message: `🌲 预处理完成：建立整棵二叉树的 DFN 序（总节点数 n=${n}），计算前缀最大深度与后缀最大深度`,
        log: `DFN 序列预处理完毕：节点顺序 [${nodeValByDfn.join(', ')}], 各节点深度 [${deep.join(', ')}]`,
        vars: [
          { name: '节点总数 n', value: String(n) },
          { name: '待处理查询数 m', value: String(queries.length) },
          { name: '查询列表', value: `[${queries.join(', ')}]` },
        ],
        metrics: { processedQueries: 0 },
      })
    );

    const answers: number[] = [];

    for (let qIdx = 0; qIdx < queries.length; qIdx++) {
      const q = queries[qIdx];
      const i = dfnMap.get(q);

      if (i === undefined) {
        answers.push(maxRight[0]);
        continue;
      }

      const l = i - 1;
      const r = i + size[i];
      let leftMax = l >= 0 ? maxLeft[l] : 0;
      let rightMax = r < n ? maxRight[r] : 0;
      const ans = Math.max(leftMax, rightMax);
      answers.push(ans);

      // Collect all descendants of q to be marked disabled
      const disabledSubtree = new Set<number>();
      for (let k = i; k < r; k++) {
        disabledSubtree.add(nodeValByDfn[k]);
      }

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, disabledSubtree, q),
          message: `🔍 查询 #${qIdx + 1}: 移除以节点 ${q} 为根的子树（包含 ${size[i]} 个节点，区间 DFN[${i}..${r - 1}]）。左侧前缀最大深度=${leftMax}，右侧后缀最大深度=${rightMax} → 剩余树最大高度为 ${ans}`,
          log: `查询 query=${q}: 子树 DFN 区间 [${i}..${r - 1}], leftMax=${leftMax}, rightMax=${rightMax}, ans=${ans}`,
          formula: 'ans = max(maxLeft[dfn[u] - 1], maxRight[dfn[u] + size[u]])',
          formulaSubstituted: `${ans} = max(${leftMax}, ${rightMax})`,
          vars: [
            { name: '当前查询目标节点', value: String(q) },
            { name: '该子树大小 size', value: String(size[i]) },
            { name: 'DFN剔除区间', value: `[${i} .. ${r - 1}]` },
            { name: '左侧剩余最大深度', value: String(leftMax) },
            { name: '右侧剩余最大深度', value: String(rightMax) },
            { name: '剩余树高度', value: String(ans) },
          ],
          metrics: {
            currentQuery: q,
            treeHeight: ans,
            processedQueries: qIdx + 1,
          },
        })
      );
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot, new Set()),
        message: `🎉 全部 ${queries.length} 个独立查询处理完成！最终答案列表: [${answers.join(', ')}]`,
        log: `最终结果：queries=[${queries.join(', ')}] -> answers=[${answers.join(', ')}]`,
        vars: [
          { name: '查询列表', value: `[${queries.join(', ')}]` },
          { name: '答案列表', value: `[${answers.join(', ')}]` },
        ],
        metrics: {
          processedQueries: queries.length,
        },
      })
    );

    return steps;
  },
};
