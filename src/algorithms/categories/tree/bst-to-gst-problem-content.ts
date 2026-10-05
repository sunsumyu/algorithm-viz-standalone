/**
 * 把二叉搜索树转换为累加树 (Convert BST to Greater Tree · LeetCode 538 / LC 1038)
 * 名师讲义、反向中序数学本质与三大演化阶段分析
 */

import {
  BST_TO_GST_STAGE1_CODES,
  BST_TO_GST_STAGE2_CODES,
  BST_TO_GST_STAGE3_CODES,
} from './bst-to-gst-stage-codes';

export const BST_TO_GST_PROBLEM_HTML = `
<div class="space-y-4 text-slate-300 leading-relaxed">
  <div class="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
      <span>💡 核心问题定义 (LeetCode 538 / LC 1038)</span>
    </div>
    <p class="text-xs text-slate-300">
      给出二叉搜索树（BST）的根节点，该树的节点值各不相同，请你将其转换为 <strong class="text-emerald-400">累加树（Greater Sum Tree）</strong>，
      使每个节点 <code class="text-amber-300 font-mono">node</code> 的新值等于原树中 <strong class="text-sky-400">大于或等于</strong> <code class="text-amber-300 font-mono">node.val</code> 的所有节点值之和。
    </p>
    <p class="text-[11px] text-slate-400 mt-1">
      注：本题与 LeetCode 1038 完全相同。树中的节点数介于 <code class="text-slate-300 font-mono">[1, 100]</code> 之间，每个节点的值在 <code class="text-slate-300 font-mono">[0, 100]</code> 之间。
    </p>
  </div>

  <div class="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
    <div class="font-bold text-sky-400 text-xs mb-2">🌿 数学本质：反向中序（右-根-左）与后缀累加和</div>
    <ul class="text-xs space-y-1.5 list-disc list-inside text-slate-300">
      <li><span class="text-emerald-400 font-medium">常规中序递增：</span>BST 经典中序遍历（左 ➔ 根 ➔ 右）遍历序列单调递增，对应前缀和方向。</li>
      <li><span class="text-amber-400 font-medium">反向中序严格递减：</span>颠倒左右递归次序，采用「右 ➔ 根 ➔ 左」的反向中序遍历，访问节点的数值将按<strong>从大到小严格递减</strong>！</li>
      <li><span class="text-indigo-400 font-medium">单变量在线就地累加：</span>
        维护一个全局变量 <code class="text-emerald-300">sum = 0</code>。访问每个节点时：
        <ol class="pl-4 pt-1 space-y-1 text-slate-400 list-decimal list-inside">
          <li>先向右递归，将所有大于当前节点的右侧元素全部累加完毕；</li>
          <li>处理当前节点：<code class="text-sky-300">sum += node.val; node.val = sum;</code>（直接完成当前节点累加转换！）；</li>
          <li>再向左递归，将累加和继续传递并增加到小于当前节点的左侧元素中。</li>
        </ol>
      </li>
    </ul>
  </div>

  <div class="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
    <div class="font-bold text-emerald-400 text-xs mb-1.5">⏱️ 复杂度剖析</div>
    <div class="text-xs text-slate-300 space-y-1">
      <p><strong>时间复杂度：</strong><code class="text-emerald-300">O(N)</code>，所有阶段均恰好单次遍历所有节点。</p>
      <p><strong>空间复杂度：</strong>经典递归与显式栈为 <code class="text-emerald-300">O(H)</code>；<strong>Morris 反向中序算法为 O(1) 绝对常数空间</strong>！</p>
    </div>
  </div>
</div>
`;

export const BST_TO_GST_ANALYSIS_HTML = `
<div class="space-y-3.5 text-slate-300 text-xs leading-relaxed">
  <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="font-bold text-sky-400 mb-1.5">📐 三大演化阶段与架构对照</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-amber-400 font-bold block mb-1">Stage 1: 反向中序递归遍历</span>
        <span class="text-[11px] text-slate-400">右-根-左递归，单变量 sum 线性累加，直观清晰地展现数值变换。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-teal-400 font-bold block mb-1">Stage 2: 显式单调栈迭代反向中序</span>
        <span class="text-[11px] text-slate-400">显式模拟右链入栈与回溯出栈，摆脱递归深度对函数栈帧的限制。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-indigo-400 font-bold block mb-1">Stage 3: Morris 反向空间常数遍历</span>
        <span class="text-[11px] text-slate-400">利用右子树中最左节点的空闲 left 指针建立线索，达成 O(1) 辅助空间转换。</span>
      </div>
    </div>
  </div>

  <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="font-bold text-emerald-400 mb-1.5">⚡ Morris 反向中序线索机制 (Mirror Threading)</div>
    <ol class="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
      <li>若 <code class="text-sky-300">curr.right == null</code>，直接累加并更新 <code class="text-sky-300">curr.val</code>，转向左孩子 <code class="text-sky-300">curr = curr.left</code>；</li>
      <li>若 <code class="text-sky-300">curr.right != null</code>，找到 <code class="text-amber-300">curr</code> 右子树中最左侧的节点 <code class="text-amber-300">mostLeft</code>；</li>
      <li>若 <code class="text-amber-300">mostLeft.left == null</code>：首次到达，建立线索 <code class="text-indigo-300">mostLeft.left = curr</code>，然后向右前进 <code class="text-sky-300">curr = curr.right</code>；</li>
      <li>若 <code class="text-amber-300">mostLeft.left == curr</code>：二次到达，拆除线索还原树拓扑 <code class="text-indigo-300">mostLeft.left = null</code>，累加更新 <code class="text-sky-300">curr.val</code>，然后向左前进 <code class="text-sky-300">curr = curr.left</code>。</li>
    </ol>
  </div>
</div>
`;

export const BST_TO_GST_CODE_LANGUAGES: Record<string, Record<string, string>> = {
  'stage-1': BST_TO_GST_STAGE1_CODES,
  'stage-2': BST_TO_GST_STAGE2_CODES,
  'stage-3': BST_TO_GST_STAGE3_CODES,
};
