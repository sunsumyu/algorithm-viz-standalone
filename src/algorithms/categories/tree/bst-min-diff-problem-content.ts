/**
 * 二叉搜索树最小绝对差 (Minimum Absolute Difference in BST · LeetCode 530 / LC 783)
 * 名师讲义、中序单调性极小值证明与三大阶段分析
 */

import {
  BST_MIN_DIFF_STAGE1_CODES,
  BST_MIN_DIFF_STAGE2_CODES,
  BST_MIN_DIFF_STAGE3_CODES,
} from './bst-min-diff-stage-codes';

export const BST_MIN_DIFF_PROBLEM_HTML = `
<div class="space-y-4 text-slate-300 leading-relaxed">
  <div class="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
      <span>💡 核心问题定义 (LeetCode 530 / LC 783)</span>
    </div>
    <p class="text-xs text-slate-300">
      给你一棵所有节点为非负值的 <strong class="text-sky-400">二叉搜索树（BST）</strong> 的根节点 <code class="text-amber-300 font-mono">root</code>，
      返回树中任意两不同节点值之间的 <strong class="text-emerald-400">最小差值（绝对差）</strong>。
    </p>
    <p class="text-[11px] text-slate-400 mt-1">
      注：本题与 LeetCode 783 完全相同。树中节点数目在范围 <code class="text-slate-300 font-mono">[2, 10^4]</code> 内，节点值在 <code class="text-slate-300 font-mono">[0, 10^5]</code> 之间。
    </p>
  </div>

  <div class="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
    <div class="font-bold text-sky-400 text-xs mb-2">🌿 数学本质：中序单调递增性与邻项差极小原理</div>
    <ul class="text-xs space-y-1.5 list-disc list-inside text-slate-300">
      <li><span class="text-emerald-400 font-medium">BST 中序遍历严格有序：</span>对于任何二叉搜索树，其中序遍历（左 ➔ 根 ➔ 右）遍历所访问的节点值，构成了单调递增序列：<code class="text-sky-300">a₁ ≤ a₂ ≤ a₃ ≤ ... ≤ aₙ</code>。</li>
      <li><span class="text-amber-400 font-medium">全局极小差必在相邻两项之间：</span>若 <code class="text-slate-300">i &lt; j</code>，则差值 <code class="text-slate-300">aⱼ - aᵢ = (aⱼ - aⱼ₋₁) + (aⱼ₋₁ - aⱼ₋₂) + ... + (aᵢ₊₁ - aᵢ)</code>。由于所有项非负，必有 <code class="text-emerald-300">|aⱼ - aᵢ| ≥ aₖ₊₁ - aₖ</code>。因此，<strong>任意两节点的最小绝对差，必然在中序遍历中相邻的两个节点之间产生！</strong></li>
      <li><span class="text-indigo-400 font-medium">双指针滑动窗口：</span>维护指针 <code class="text-amber-300">prev</code> 指向中序遍历的上一个访问节点，遍历到当前节点 <code class="text-emerald-300">curr</code> 时，直接计算 <code class="text-teal-300">diff = curr.val - prev.val</code>，动态更新全局 <code class="text-rose-400 font-bold">minDiff = min(minDiff, diff)</code>，无需保存全部数组！</li>
    </ul>
  </div>

  <div class="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
    <div class="font-bold text-emerald-400 text-xs mb-1.5">⏱️ 复杂度剖析</div>
    <div class="text-xs text-slate-300 space-y-1">
      <p><strong>时间复杂度：</strong>三大阶段均为 <code class="text-emerald-300">O(N)</code>，每个节点被常数次访问。</p>
      <p><strong>空间复杂度：</strong>经典递归与显式栈为 <code class="text-emerald-300">O(H)</code>（最坏单链树 O(N)，平衡二叉树 O(log N)）；<strong>Morris 遍历为 O(1) 绝对常数空间</strong>，无额外栈与队列！</p>
    </div>
  </div>
</div>
`;

export const BST_MIN_DIFF_ANALYSIS_HTML = `
<div class="space-y-3.5 text-slate-300 text-xs leading-relaxed">
  <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="font-bold text-sky-400 mb-1.5">📐 三大演化阶段与架构对照</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-amber-400 font-bold block mb-1">Stage 1: 经典中序双指针递归</span>
        <span class="text-[11px] text-slate-400">标准的左-根-右中序递归，维护全局 prev 指针与 minDiff，直观且优雅。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-teal-400 font-bold block mb-1">Stage 2: 显式单调栈迭代中序</span>
        <span class="text-[11px] text-slate-400">利用显式栈模拟左链下潜与回溯，彻底摆脱系统递归栈，有效防止深度过大爆栈。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-indigo-400 font-bold block mb-1">Stage 3: Morris 空间常数遍历</span>
        <span class="text-[11px] text-slate-400">利用左子树最右节点的空闲 right 指针建立前驱线索，实现 O(1) 辅助空间神级遍历。</span>
      </div>
    </div>
  </div>

  <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="font-bold text-emerald-400 mb-1.5">⚡ Morris 算法核心机制 (线索二叉树)</div>
    <ol class="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
      <li>若当前节点 <code class="text-sky-300">curr.left == null</code>，直接访问当前节点并移动到 <code class="text-sky-300">curr.right</code>；</li>
      <li>若 <code class="text-sky-300">curr.left != null</code>，找到 <code class="text-amber-300">curr</code> 的中序前驱节点 <code class="text-amber-300">mostRight</code>（即左子树中最右侧的叶子）；</li>
      <li>若 <code class="text-amber-300">mostRight.right == null</code>：首次到达，建立线索 <code class="text-indigo-300">mostRight.right = curr</code>，然后向左下潜 <code class="text-sky-300">curr = curr.left</code>；</li>
      <li>若 <code class="text-amber-300">mostRight.right == curr</code>：二次到达，说明左子树已遍历完毕，拆除线索还原树结构 <code class="text-indigo-300">mostRight.right = null</code>，访问 <code class="text-sky-300">curr</code>，然后向右前进 <code class="text-sky-300">curr = curr.right</code>。</li>
    </ol>
  </div>
</div>
`;

export const BST_MIN_DIFF_CODE_LANGUAGES: Record<string, Record<string, string>> = {
  'stage-1': BST_MIN_DIFF_STAGE1_CODES,
  'stage-2': BST_MIN_DIFF_STAGE2_CODES,
  'stage-3': BST_MIN_DIFF_STAGE3_CODES,
};
