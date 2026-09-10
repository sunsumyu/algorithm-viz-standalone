import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

export const BinaryTreeCamerasSpec: AlgorithmSpec = {
  id: 'binary-tree-cameras',
  name: '监控二叉树 (Binary Tree Cameras)',
  category: '树型 DP',
  description: '经典树型动态规划与状态机。在二叉树节点安装摄像头，每个摄像头可监控其自身、父节点和直接子节点。求监控整棵树所需的最少摄像头数量。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 968,
    leetcodeUrl: 'https://leetcode.cn/problems/binary-tree-cameras/',
    difficulty: 'hard',
    tags: ['树', '深度优先搜索', '动态规划', '二叉树', '贪心'],
    description: '给定一个二叉树，我们在树的节点上安装摄像头。<br/><br/>节点上的每个摄影头都可以监视 <strong>其父对象、自身及其直接子对象</strong>。<br/><br/>计算监控树的所有节点所需的最小摄像头数量。',
    examples: [
      {
        input: 'root = [0, 0, null, 0, 0]',
        output: '1',
        explanation: '只需在第二个节点安装一个摄像头，即可监控它的子节点、父节点（根节点）以及自身。',
      },
      {
        input: 'root = [0, 0, null, 0, null, 0, null, null, 0]',
        output: '2',
        explanation: '需要至少安装 2 个摄像头方可覆盖所有节点。',
      },
    ],
    constraints: [
      '给定树的节点数的范围是 [1, 1000] (演示推荐 <= 15)',
      '每个节点的值都是 0',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 7, cpp: 8, python: 7, javascript: 6 },
    init: { java: 3, cpp: 4, python: 3, javascript: 2 },
    stateTransfer: { java: [8, 9, 10, 11, 12, 13, 14], cpp: [9, 10, 11, 12, 13, 14, 15], python: [8, 9, 10, 11, 12, 13, 14], javascript: [7, 8, 9, 10, 11, 12, 13] },
    returnResult: { java: 5, cpp: 6, python: 18, javascript: 17 },
  },
  code: {
    languages: {
      javascript: [
        'function minCameraCover(root) {',
        '    let cameras = 0;',
        '    // 状态定义：0: 无覆盖(需父节点保护), 1: 安装了摄像头, 2: 已被覆盖(不需要再安装)',
        '    function dfs(node) {',
        '        if (!node) return 2; // 空节点视为已被覆盖，避免叶子节点重复安装',
        '        const left = dfs(node.left);',
        '        const right = dfs(node.right);',
        '        // 情况 1: 左右子节点中只要有一个未被覆盖，当前节点必须安装摄像头',
        '        if (left === 0 || right === 0) {',
        '            cameras++;',
        '            return 1;',
        '        }',
        '        // 情况 2: 左右子节点至少有一个安装了摄像头，当前节点已被覆盖',
        '        if (left === 1 || right === 1) {',
        '            return 2;',
        '        }',
        '        // 情况 3: 左右子节点都处于“已被覆盖”状态，当前节点处于无覆盖状态（等父节点照料）',
        '        return 0;',
        '    }',
        '    // 如果根节点最终仍处于无覆盖状态，根节点自身必须额外安装一个',
        '    if (dfs(root) === 0) cameras++;',
        '    return cameras;',
        '}',
      ],
      java: [
        'class Solution {',
        '    private int cameras = 0;',
        '    // 0: 无覆盖, 1: 安装了摄像头, 2: 已被覆盖',
        '    public int minCameraCover(TreeNode root) {',
        '        if (dfs(root) == 0) cameras++;',
        '        return cameras;',
        '    }',
        '    private int dfs(TreeNode node) {',
        '        if (node == null) return 2;',
        '        int left = dfs(node.left);',
        '        int right = dfs(node.right);',
        '        if (left == 0 || right == 0) {',
        '            cameras++;',
        '            return 1;',
        '        }',
        '        if (left == 1 || right == 1) return 2;',
        '        return 0;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        '    int cameras = 0;',
        'public:',
        '    // 0: 无覆盖, 1: 安装了摄像头, 2: 已被覆盖',
        '    int minCameraCover(TreeNode* root) {',
        '        if (dfs(root) == 0) cameras++;',
        '        return cameras;',
        '    }',
        '    int dfs(TreeNode* node) {',
        '        if (!node) return 2;',
        '        int left = dfs(node->left);',
        '        int right = dfs(node->right);',
        '        if (left == 0 || right == 0) {',
        '            cameras++;',
        '            return 1;',
        '        }',
        '        if (left == 1 || right == 1) return 2;',
        '        return 0;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minCameraCover(self, root: Optional[TreeNode]) -> int:',
        '        cameras = 0',
        '        # 0: 无覆盖, 1: 安装了摄像头, 2: 已被覆盖',
        '        def dfs(node):',
        '            nonlocal cameras',
        '            if not node:',
        '                return 2',
        '            left = dfs(node.left)',
        '            right = dfs(node.right)',
        '            if left == 0 or right == 0:',
        '                cameras += 1',
        '                return 1',
        '            if left == 1 or right == 1:',
        '                return 2',
        '            return 0',
        '        if dfs(root) == 0:',
        '            cameras += 1',
        '        return cameras',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '全局变量 cameras 累加安装的摄像头总数。',
        4: '🎯 <strong>函数主入口</strong>。',
        5: '若整棵树遍历完后根节点为 0 (无覆盖)，说明没有父节点可以帮根节点覆盖，根节点必须补装一台。',
        8: '后序深度优先搜索，自底向上贪心决策。',
        9: '空节点视为状态 2 (已被覆盖)，促使叶子节点保持状态 0，将摄像头推迟到叶子的父节点安装，覆盖效率最高。',
        10: '递归获取左子树状态。',
        11: '递归获取右子树状态。',
        12: '🚨 <strong>情况 1</strong>：子节点只要有未被覆盖 (0)，当前节点必须立刻装摄像头 (1)，否则该子节点将永远无法被覆盖。',
        15: '💡 <strong>情况 2</strong>：子节点有摄像头 (1)，当前节点已被子节点的摄像头覆盖，返回状态 2。',
        16: '💡 <strong>情况 3</strong>：左右子节点都被覆盖但自身没有装摄像头 (2, 2)，当前节点自身暴露 (0)，留给父节点安装去覆盖。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        3: '三状态定义声明。',
        5: '空节点设为状态 2。',
        8: '子节点有未覆盖 -> 当前节点安装摄像头。',
        13: '子节点有摄像头 -> 当前节点已被覆盖。',
        17: '子节点均已被覆盖 -> 当前节点为无覆盖。',
        20: '根节点单独判断是否需补装。',
      },
      cpp: {
        1: '类定义 Solution。',
        3: '🎯 <strong>主函数</strong>。',
        9: '后序遍历空节点返回 2。',
        12: '贪心触发摄像头安装。',
        15: '传递被覆盖状态。',
        16: '传递未覆盖状态。',
      },
      python: {
        1: '类定义 Solution。',
        3: '初始化计数器。',
        7: '空节点返回 2。',
        10: '子节点有 0 则当前装 1。',
        13: '子节点有 1 则当前为 2。',
        15: '子节点均为 2 则当前为 0。',
        16: '根节点补装逻辑。',
      },
    },
    keyPoints: {
      thinking: '树型 DP + 贪心状态机。叶子节点千万不要装摄像头（最多只能覆盖叶子和父节点两个点）；而让叶子的父节点装摄像头，可以同时覆盖父、自身和两个子节点，效率最高！因此采用自底向上后序遍历传递覆盖状态。',
      state: '0: 无覆盖(Uncovered), 1: 已安装摄像头(Camera), 2: 已被覆盖(Covered)',
      equation: '状态转移：if (left==0 || right==0) -> 1; else if (left==1 || right==1) -> 2; else -> 0',
      initAndBounds: '空节点返回 2；根节点如果最终为 0，需补装 1 台。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(H)$。',
    },
    faqList: [
      {
        tag: '空节点为何设为状态2',
        question: '为什么空节点的状态必须是 2 (已被覆盖) 而不是 0 或 1？',
        answer: '如果空节点设为 0 (未覆盖)，会导致其父节点（即叶子节点）误以为子节点未被覆盖而立即在叶子节点安装摄像头，这就违背了“尽量把摄像头放在父节点”的最优贪心策略。若设为 1 则相当于空节点有摄像头，会让叶子节点误以为已被覆盖而放弃在叶子父节点装摄像头。因此只能设为 2。',
      },
    ],
  },
  generateSteps: (input: { root?: Array<number | null> }): DpTraceStep[] => {
    const rawArr = input?.root && input.root.length > 0 ? input.root : [0, 0, null, 0, 0];
    const steps: DpTraceStep[] = [];

    interface RawTreeNode {
      id: string;
      val: number;
      left: RawTreeNode | null;
      right: RawTreeNode | null;
    }

    function buildTree(arr: Array<number | null>): RawTreeNode | null {
      if (!arr || arr.length === 0 || arr[0] === null) return null;
      const root: RawTreeNode = { id: '0', val: 0, left: null, right: null };
      const queue: RawTreeNode[] = [root];
      let i = 1;
      while (queue.length > 0 && i < arr.length) {
        const curr = queue.shift()!;
        if (i < arr.length && arr[i] !== null) {
          curr.left = { id: String(i), val: 0, left: null, right: null };
          queue.push(curr.left);
        }
        i++;
        if (i < arr.length && arr[i] !== null) {
          curr.right = { id: String(i), val: 0, left: null, right: null };
          queue.push(curr.right);
        }
        i++;
      }
      return root;
    }

    const treeRoot = buildTree(rawArr);
    let cameraCount = 0;
    const stateMap = new Map<string, number>(); // 0: uncov, 1: cam, 2: cov

    function toDpTree(node: RawTreeNode | null, activeId?: string): DpTreeNode | null {
      if (!node) return null;
      const st = stateMap.get(node.id);
      const stateName = st === 1 ? '📷 摄像头' : st === 2 ? '🛡️ 已覆盖' : st === 0 ? '⚠️ 无覆盖' : '待处理';
      return {
        id: node.id,
        label: `节点#${node.id} (${stateName})`,
        value: st ?? -1,
        state: node.id === activeId ? 'active' : st === 1 ? 'computed' : 'default',
        children: [
          toDpTree(node.left, activeId),
          toDpTree(node.right, activeId),
        ].filter(Boolean) as DpTreeNode[],
      };
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `初始化二叉树监控状态，采用 3 状态机后序遍历 (0:无覆盖, 1:安装摄像头, 2:已被覆盖)`,
        log: '后序遍历启动，空节点状态视为 2',
        vars: [
          { name: 'cameras', value: '0' },
        ],
        metrics: { cameras: 0 },
      })
    );

    function dfs(node: RawTreeNode | null): number {
      if (!node) return 2;

      const left = dfs(node.left);
      const right = dfs(node.right);

      let resState = 0;
      let reason = '';

      if (left === 0 || right === 0) {
        cameraCount++;
        resState = 1;
        reason = `子节点有无覆盖 (左=${left}, 右=${right}) -> 必须在当前节点安装摄像头 📷 (总数: ${cameraCount})`;
      } else if (left === 1 || right === 1) {
        resState = 2;
        reason = `子节点已有摄像头 (左=${left}, 右=${right}) -> 当前节点已被覆盖 🛡️`;
      } else {
        resState = 0;
        reason = `子节点均已被覆盖且无摄像头 (左=${left}, 右=${right}) -> 当前节点暴露为无覆盖 ⚠️ (留给父节点覆盖)`;
      }

      stateMap.set(node.id, resState);

      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, node.id),
          message: `节点 #${node.id}: ${reason}`,
          log: `节点 #${node.id} 状态 = ${resState} (左=${left}, 右=${right})`,
          vars: [
            { name: '当前节点', value: `#${node.id}` },
            { name: '左子状态', value: String(left) },
            { name: '右子状态', value: String(right) },
            { name: '得出状态', value: String(resState) },
            { name: '摄像头总数', value: String(cameraCount) },
          ],
          metrics: { cameras: cameraCount },
        })
      );

      return resState;
    }

    const rootState = dfs(treeRoot);
    if (rootState === 0) {
      cameraCount++;
      stateMap.set(treeRoot!.id, 1);
      steps.push(
        makeTraceStep({
          tree: toDpTree(treeRoot, treeRoot!.id),
          message: `根节点自身最终仍处于无覆盖状态 (0)，必须在其自身补装 1 台摄像头 📷 (总计: ${cameraCount})`,
          log: `根节点补装摄像头 -> cameras = ${cameraCount}`,
          vars: [
            { name: '摄像头总数', value: String(cameraCount) },
          ],
          metrics: { cameras: cameraCount },
        })
      );
    }

    steps.push(
      makeTraceStep({
        tree: toDpTree(treeRoot),
        message: `🎉 监控二叉树计算完成！覆盖整棵二叉树所需的最少摄像头数量为 ${cameraCount}`,
        log: `最终最少摄像头数 = ${cameraCount}`,
        vars: [
          { name: '最少摄像头数', value: String(cameraCount) },
        ],
        metrics: { cameras: cameraCount },
      })
    );

    return steps;
  },
};
