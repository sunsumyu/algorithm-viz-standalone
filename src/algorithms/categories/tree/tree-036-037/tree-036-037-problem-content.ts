/**
 * 左程云算法通关课 Class 036 与 Class 037 二叉树高频题目专题
 * 问题详情、算法精讲与复杂度深度解析
 */

export const TREE_036_037_PROBLEMS = {
  // ==========================================
  // Class 036: 二叉树高频题目（上）- 不含树型DP
  // ==========================================
  levelOrder036: {
    title: '二叉树层序遍历 (Class 036 Code01)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (单队列按层批量出队 / LeetCode 102)</h2>
        <p>广度优先搜索（BFS）在二叉树中的标准形态。左神指出，通过维护队列的当前快照大小 <code>size = queue.size()</code>，可以严格划分每一层的节点边界，实现 $O(N)$ 时间与 $O(W)$ 宽度的逐层收集。</p>
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">核心机制</h3>
        <ul>
          <li>1. 根节点入队，开启外层循环 <code>while (!queue.isEmpty())</code>。</li>
          <li>2. 锁定当前层节点总数 <code>int size = queue.size()</code>，循环 <code>size</code> 次依次弹出节点。</li>
          <li>3. 弹出的节点收集入当前层列表，若其左右子节点非空则推入队尾作为下一层储备。</li>
        </ul>
      </div>
    `,
  },

  zigzagLevelOrder036: {
    title: '二叉树锯齿形层序遍历 (Class 036 Code02)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (Z字形/之字形交替折返 / LeetCode 103)</h2>
        <p>在普通层序遍历的基础上，增加布尔方向标志 <code>isReverse</code>。偶数层从左往右收集，奇数层从右往左收集（使用双端队列或头插法）。</p>
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">左神关键点</h3>
        <p>队列出入队始终保持从左到右的标准层序不变，仅在将节点值装配到当前层 <code>List</code> 时按方向判定使用 <code>addLast()</code> 还是 <code>addFirst()</code>，逻辑最纯粹且绝不产生指针混乱。</p>
      </div>
    `,
  },

  widthOfBinaryTree036: {
    title: '二叉树最大宽度 (Class 036 Code03)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (完全二叉树编号法与防溢出 / LeetCode 662)</h2>
        <p>二叉树的宽度定义为每一层中最左非空节点到最右非空节点之间的节点数（即使中间包含 null 也要计入）。</p>
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">左神编号映射准则</h3>
        <ul>
          <li>1. 根节点编号为 <code>1</code>；节点编号为 <code>i</code> 时，左孩子编号为 <code>2*i</code>，右孩子编号为 <code>2*i + 1</code>。</li>
          <li>2. <strong>防溢出偏移技巧</strong>：进入每一层时，以该层最左节点的编号为基准 <code>base</code>，所有孩子编号统一减去 <code>base</code>，保证大深度下索引永不溢出。</li>
          <li>3. 当前层宽度即为 <code>(rightIndex - leftIndex + 1)</code>，全局取最大值。</li>
        </ul>
      </div>
    `,
  },

  depthOfBinaryTree036: {
    title: '二叉树最大与最小深度 (Class 036 Code04)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (树递归基本功与叶子边界陷阱 / LeetCode 104 & 111)</h2>
        <p>求树的最大深度与最小深度是递归最基础也最容易踩坑的经典问题。</p>
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">最小深度的巨大陷阱</h3>
        <p>若节点只有单侧子树，其另一侧为 null，此时<strong>绝对不能返回 0 + 1 = 1</strong>，因为最小深度必须到达真实的叶子节点（左右孩子俱空的节点）！若左空右不空，最小深度是右子树深度加 1。</p>
      </div>
    `,
  },

  preorderSerialize036: {
    title: '二叉树先序序列化与反序列化 (Class 036 Code05)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (前序流与 '#' 空哨兵重构 / LeetCode 297)</h2>
        <p>二叉树如果缺少结构信息无法仅凭前序反推，但只要在遇到空指针时输出 <code>#</code> 作为哨兵占位符，仅凭先序遍历字符串流即可 100% 确定唯一树形态！</p>
      </div>
    `,
  },

  levelorderSerialize036: {
    title: '二叉树按层序列化与反序列化 (Class 036 Code06)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (层序队列流与同构消费重构 / LeetCode 297)</h2>
        <p>基于 BFS 队列的序列化。反序列化时，先恢复根节点并入队，随后每次出队一个父节点，从序列化流中连续消费两个 Token 分别构建其左右孩子并入队。</p>
      </div>
    `,
  },

  buildTreePreorderInorder036: {
    title: '从前序与中序序列构造二叉树 (Class 036 Code07)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (前序定根 + 中序定左右子树区间 / LeetCode 105)</h2>
        <p>前序首节点必为整树之根。利用哈希表在 $O(1)$ 时间在中序数组中定位该根的位置，即可精确将中序序列划分为左子树区间与右子树区间，并计算出左右子树的大小，递归向子问题分解。</p>
      </div>
    `,
  },

  completenessBinaryTree036: {
    title: '二叉树完全性检验 (Class 036 Code08)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (完全二叉树两阶段层序判断 / LeetCode 958)</h2>
        <p>左神总结的完全二叉树（CBT）层序扫描双法则：</p>
        <ul>
          <li>1. 任一节点若<strong>有右孩子但无左孩子</strong>，直接判定非 CBT。</li>
          <li>2. 一旦遇到<strong>第一个孩子不全（无右孩子或左右俱无）的节点</strong>，触发 <code>leafPhase = true</code>，后续遇到的所有节点必须全为叶子节点！</li>
        </ul>
      </div>
    `,
  },

  countCompleteTreeNodes036: {
    title: '完全二叉树的节点个数 (Class 036 Code09)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (满二叉树性质二分查找 O(log² N) / LeetCode 222)</h2>
        <p>普通遍历耗时 $O(N)$。利用完全二叉树性质可达到极致 $O(\log^2 N)$：</p>
        <ul>
          <li>探查右子树的最左节点是否直达树的最底层。</li>
          <li>若直达：说明<strong>左子树必为满二叉树</strong>，节点数直接由公式 $2^{h-1}$ 算出，只需递归求右子树！</li>
          <li>若未达：说明<strong>右子树必为满二叉树</strong>，节点数由公式 $2^{h-2}$ 算出，只需递归求左子树！</li>
        </ul>
      </div>
    `,
  },

  // ==========================================
  // Class 037: 二叉树高频题目（下）- 不含树型DP
  // ==========================================
  lowestCommonAncestor037: {
    title: '普通二叉树最近公共祖先 (Class 037 Code01)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (后序遍历信息向上汇聚 / LeetCode 236)</h2>
        <p>自底向上后序遍历：若当前节点为 <code>p</code> 或 <code>q</code> 或 <code>null</code> 则直接返回自身；若左右子树递归返回值皆非空，说明 p 和 q 分布在两侧，当前节点必为最近公共祖先（LCA）！若只有一侧非空，则向上透传该侧结果。</p>
      </div>
    `,
  },

  lowestCommonAncestorBst037: {
    title: '二叉搜索树最近公共祖先 (Class 037 Code02)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (利用 BST 键值大小分岔即 LCA / LeetCode 235)</h2>
        <p>由于 BST 的有序性，若当前值大于 p, q 则向左走，若当前值小于 p, q 则向右走。<strong>首次发生分岔（p, q 一左一右或当前等于其一）的节点，必然是 LCA</strong>，时间复杂度仅 $O(H)$ 且无需递归回溯！</p>
      </div>
    `,
  },

  pathSumII037: {
    title: '路径总和 II 收集所有路径 (Class 037 Code03)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (先序遍历回溯路径栈 / LeetCode 113)</h2>
        <p>维护一个动态路径栈 <code>path</code> 与剩余目标值 <code>remain</code>。当到达叶子节点且 <code>remain == 0</code> 时将路径深拷贝加入结果集；离开节点时执行 <code>pop()</code> 回溯恢复现场。</p>
      </div>
    `,
  },

  balancedBinaryTree037: {
    title: '判断平衡二叉树 (Class 037 Code04)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (递归信息结构体搜集套路 / LeetCode 110)</h2>
        <p>向子树索要两个核心信息：<code>isBalanced</code> 与 <code>height</code>。当前节点高度为左右高度较大值 + 1，平衡条件为左右均平衡且左右高度差绝对值不超过 1。</p>
      </div>
    `,
  },

  validateBst037: {
    title: '验证二叉搜索树 (Class 037 Code05)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (中序遍历严格单调递增性 / LeetCode 98)</h2>
        <p>二叉搜索树的中序遍历序列必然是严格升序序列。维护全局变量 <code>prev</code> 记录前一个访问节点的值，一旦当前节点值 $\le prev$，立即判定非法并剪枝退出。</p>
      </div>
    `,
  },

  trimBst037: {
    title: '修剪二叉搜索树 (Class 037 Code06)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (区间约束与单侧子树舍弃 / LeetCode 669)</h2>
        <p>若当前节点值小于 <code>low</code>，其整个左子树更小必被淘汰，直接返回修剪后的右子树；若大于 <code>high</code>，整个右子树必淘汰，直接返回修剪后的左子树；在范围内则递归修剪左右孩子。</p>
      </div>
    `,
  },

  houseRobberIII037: {
    title: '打家劫舍 III (Class 037 Code07)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (树形DP入门核心 双状态搜集 / LeetCode 337)</h2>
        <p>树形动态规划经典入门。每个节点向左右子树索要两个维度的最优解：<code>(rob, notRob)</code>：</p>
        <ul>
          <li><strong>偷当前节点</strong>：<code>rob = node.val + left.notRob + right.notRob</code>（相邻不能偷）</li>
          <li><strong>不偷当前节点</strong>：左右孩子可偷可不偷取较大者 <code>notRob = max(left) + max(right)</code></li>
        </ul>
      </div>
    `,
  },
};
