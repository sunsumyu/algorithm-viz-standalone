/**
 * 左程云算法通关课 Class 019: 二叉树高频递归套路 (Tree Recursion Patterns / Tree DP)
 * 核心讲义、数学推导与树形 DP Info 结构体设计哲学
 */

export const TREE_RECURSION_019_PROBLEM_CONTENT = {
  title: '二叉树高频递归套路 (Tree DP) — 左神 Class 019',
  source: '左程云算法通关课 Class 019 / 大厂面试树形 DP 必考母题',
  difficulty: 'Medium',
  tags: ['二叉树', '树形DP', '后序遍历', '递归套路', '分治聚合'],
  summary:
    '二叉树递归套路是解决绝大多数大厂二叉树难题的“银弹”母题模板。其本质是树形动态规划（Tree DP）：可以向左子树要信息，也可以向右子树要信息；设计统一结构体 Info 搜集子树全集；在左右子树汇报完毕后，自底向上合并解出当前节点的 Info 并返回。',

  description: `
    <h3>课程核心内容 (Class 019)</h3>
    <p>二叉树的所有算法中，<strong>递归套路</strong>是最通用、最具杀伤力的思想框架。它能够以几乎完全一致的思维模型秒杀一系列复杂树形考题：</p>
    <ul>
      <li><strong>问题 1 (Stage 1)：判断二叉树是否为平衡二叉树 (Is Balanced)</strong>：
        每一棵子树的左高与右高相差不超过 1，且左右子树自身也必须都是平衡树。
      </li>
      <li><strong>问题 2 (Stage 2)：判断二叉树是否为搜索二叉树 (Is BST)</strong>：
        左子树最大值严格小于当前节点，右子树最小值严格大于当前节点，且左右子树自身均为合法 BST。
      </li>
      <li><strong>问题 3 (Stage 3)：二叉树中两节点的最大距离 (Tree Diameter / Max Distance)</strong>：
        最大距离可能来自左子树内部、右子树内部，或者横跨当前根节点（左高 + 右高 + 1）。
      </li>
    </ul>
  `,

  methodology: `
    <h3>二叉树递归套路解题三步法</h3>
    <ol>
      <li>
        <strong>第一步：列出可能性与设计 Info 结构体</strong>：
        分析以某个节点 <code>x</code> 为根节点的整棵子树，要解决目标问题，需要其左右子树提供什么信息？把需要信息的全集封装成一个结构体 <code>Info</code>。
      </li>
      <li>
        <strong>第二步：明确 Base Case (空节点特判)</strong>：
        当 <code>x == null</code> 时，<code>Info</code> 应该如何设置？如果空节点很容易构造（如高度为 0、是平衡树），直接返回对应默认对象；若无法合理设置初始值（如最大距离或最大最小值），则返回 <code>null</code> 由上层判定。
      </li>
      <li>
        <strong>第三步：假设左右子树信息已备齐，后序整合并返回</strong>：
        递归调用 <code>process(x.left)</code> 得到 <code>leftInfo</code>，调用 <code>process(x.right)</code> 得到 <code>rightInfo</code>。
        严格按照可能性分类，整合出以 <code>x</code> 为头的 <code>Info</code> 并向上层 <code>return</code>。
      </li>
    </ol>
  `,

  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 平衡二叉树判定 (Is Balanced)',
      desc: '定义 Info(isBalanced, height)，自底向上搜集子树高度与平衡标志，校验每层高度差 <= 1。',
    },
    {
      id: 'stage2',
      name: 'Stage 2: 搜索二叉树判定 (Is BST)',
      desc: '定义 Info(isBST, min, max)，后序搜集左子树最大值与右子树最小值，严格校验 BST 大小序。',
    },
    {
      id: 'stage3',
      name: 'Stage 3: 二叉树最大节点距离 (Max Distance)',
      desc: '定义 Info(maxDistance, height)，三种可能性横向对比：左树内最大、右树内最大、跨根节点(左高+右高+1)。',
    },
  ],
};
