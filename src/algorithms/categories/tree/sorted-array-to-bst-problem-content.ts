/**
 * 将有序数组转换为二叉搜索树 (Convert Sorted Array to BST · LeetCode 108)
 * 名师讲义、图解分析与多解性剖析
 */

export const SORTED_ARRAY_TO_BST_PROBLEM_HTML = `
<div class="space-y-4 text-slate-300 leading-relaxed">
  <div class="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
      <span>💡 核心问题定义 (LeetCode 108)</span>
    </div>
    <p class="text-xs text-slate-300">
      给你一个整数数组 <code class="text-amber-300 font-mono">nums</code>，其中元素已经按 <strong class="text-emerald-400">升序排列</strong>，
      请你将其转换为一棵 <strong class="text-sky-400">高度平衡</strong> 的二叉搜索树（BST）。
    </p>
    <p class="text-[11px] text-slate-400 mt-1">
      高度平衡二叉树是一棵满足「每个节点的左右两个子树的高度差的绝对值不超过 1」的二叉树。
    </p>
  </div>

  <div class="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
    <div class="font-bold text-sky-400 text-xs mb-2">🌿 二分分治与中序单调性本质</div>
    <ul class="text-xs space-y-1.5 list-disc list-inside text-slate-300">
      <li><span class="text-emerald-400 font-medium">中序遍历映射：</span>BST 的中序遍历序列恰好是一个递增序列。因此题目实质上要求：根据给定的中序遍历序列，还原一棵平衡的 BST。</li>
      <li><span class="text-amber-400 font-medium">平衡的核心策略：</span>为了保证左右子树高度差不超过 1，我们每次必须选择区间的<strong>中间元素</strong>作为子树的根节点。</li>
      <li><span class="text-indigo-400 font-medium">多解性来源：</span>当区间长度为偶数时，中间有两个备选元素：
        <ul class="pl-4 pt-1 space-y-1 text-slate-400">
          <li><strong>偏左取中：</strong><code class="text-amber-300">mid = (left + right) / 2</code>，偏左节点为根；</li>
          <li><strong>偏右取中：</strong><code class="text-teal-300">mid = (left + right + 1) / 2</code>，偏右节点为根。两者均满足高度平衡且中序升序，属于完全合法的同构平衡树！</li>
        </ul>
      </li>
    </ul>
  </div>

  <div class="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
    <div class="font-bold text-emerald-400 text-xs mb-1.5">⏱️ 复杂度剖析</div>
    <div class="text-xs text-slate-300 space-y-1">
      <p><strong>时间复杂度：</strong><code class="text-emerald-300">O(N)</code>，每个数组元素恰好被访问并创建为 TreeNode 一次。</p>
      <p><strong>空间复杂度：</strong>递归解法调用栈深度为严格的 <code class="text-emerald-300">O(log N)</code>；显式 BFS 队列空间为 <code class="text-emerald-300">O(N)</code>。</p>
    </div>
  </div>
</div>
`;

export const SORTED_ARRAY_TO_BST_ANALYSIS_HTML = `
<div class="space-y-3.5 text-slate-300 text-xs leading-relaxed">
  <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="font-bold text-sky-400 mb-1.5">📐 三大演化阶段与递归/迭代对照</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-amber-400 font-bold block mb-1">Stage 1: 偏左中点递归分治</span>
        <span class="text-[11px] text-slate-400">经典二分递归，向下取整中点为根，直观易懂。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-teal-400 font-bold block mb-1">Stage 2: 偏右中点递归分治</span>
        <span class="text-[11px] text-slate-400">向上取整中点为根，对比树拓扑的微小偏转，揭示 BST 多解之美。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-indigo-400 font-bold block mb-1">Stage 3: 三队列显式 BFS 迭代</span>
        <span class="text-[11px] text-slate-400">使用 nodeQueue + leftQueue + rightQueue，逐层分裂区间构建，杜绝递归爆栈。</span>
      </div>
    </div>
  </div>
</div>
`;
