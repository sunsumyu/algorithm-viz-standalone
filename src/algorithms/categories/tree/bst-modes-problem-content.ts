/**
 * 二叉搜索树中的众数 (Find Mode in Binary Search Tree · LeetCode 501)
 * 名师讲义、中序连续性证明与在线动态结算分析
 */

import {
  BST_MODES_STAGE1_CODES,
  BST_MODES_STAGE2_CODES,
  BST_MODES_STAGE3_CODES,
} from './bst-modes-stage-codes';

export const BST_MODES_PROBLEM_HTML = `
<div class="space-y-4 text-slate-300 leading-relaxed">
  <div class="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
      <span>💡 核心问题定义 (LeetCode 501)</span>
    </div>
    <p class="text-xs text-slate-300">
      给你一个含重复值的 <strong class="text-sky-400">二叉搜索树（BST）</strong> 的根节点 <code class="text-amber-300 font-mono">root</code>，
      找出并返回 BST 中的所有 <strong class="text-emerald-400">众数</strong>（即出现频率最高的元素）。
    </p>
    <p class="text-[11px] text-slate-400 mt-1">
      如果树中有多个众数，可以按 <strong>任意顺序</strong> 返回。树中节点的数目在范围 <code class="text-slate-300 font-mono">[1, 10^4]</code> 内，节点值在 <code class="text-slate-300 font-mono">[-10^5, 10^5]</code> 之间。
    </p>
  </div>

  <div class="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
    <div class="font-bold text-sky-400 text-xs mb-2">🌿 BST 中序连续性与双指针在线动态结算</div>
    <ul class="text-xs space-y-1.5 list-disc list-inside text-slate-300">
      <li><span class="text-emerald-400 font-medium">中序遍历连续聚合：</span>普通二叉树需要哈希表全量统计频次，空间消耗为 O(N)。但对于 BST，中序遍历（左-根-右）产生单调不降序列，<strong>相同的值必然紧密连续地出现！</strong></li>
      <li><span class="text-amber-400 font-medium">双指针滑动计数：</span>维护前驱节点 <code class="text-amber-300">prev</code> 和当前值计数 <code class="text-teal-300">count</code>。若 <code class="text-slate-300">node.val == prev.val</code> 则 <code class="text-teal-300">count++</code>；否则重置 <code class="text-teal-300">count = 1</code>。</li>
      <li><span class="text-indigo-400 font-medium">动态在线重置机制：</span>
        <ul class="pl-4 pt-1 space-y-1 text-slate-400">
          <li>若 <code class="text-emerald-300">count == maxCount</code>：将当前元素追加到众数列表 <code class="text-sky-300">modes.add(val)</code>；</li>
          <li>若 <code class="text-rose-400">count > maxCount</code>：说明先前所有众数的频率都被打破！<strong>立刻重置列表</strong> <code class="text-rose-300">modes = [val]</code> 并更新 <code class="text-rose-300">maxCount = count</code>。单趟遍历即可完成众数决策！</li>
        </ul>
      </li>
    </ul>
  </div>

  <div class="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
    <div class="font-bold text-emerald-400 text-xs mb-1.5">⏱️ 进阶挑战：O(1) 额外空间 (Follow-up)</div>
    <div class="text-xs text-slate-300 space-y-1">
      <p>题目进阶要求：你能不使用额外的空间解决此问题吗？（不计递归栈）。</p>
      <p>更进一步：<strong>Stage 3 采用 Morris 遍历</strong>，连系统递归栈与显式栈均压缩至 <code class="text-emerald-300">O(1)</code> 绝对常数空间，达成理论极限！</p>
    </div>
  </div>
</div>
`;

export const BST_MODES_ANALYSIS_HTML = `
<div class="space-y-3.5 text-slate-300 text-xs leading-relaxed">
  <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="font-bold text-sky-400 mb-1.5">📐 三大演化阶段与架构对照</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-amber-400 font-bold block mb-1">Stage 1: 经典中序双指针递归</span>
        <span class="text-[11px] text-slate-400">左-根-右中序遍历，维护 prev、count 与 maxCount，在线动态清空重置 modes。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-teal-400 font-bold block mb-1">Stage 2: 显式单调栈迭代中序</span>
        <span class="text-[11px] text-slate-400">显式 Deque 模拟调用栈，左链下潜出栈即时统计，避免深层递归爆栈风险。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-indigo-400 font-bold block mb-1">Stage 3: Morris 空间常数遍历</span>
        <span class="text-[11px] text-slate-400">线索二叉树，0 额外栈空间，完美元神级达成 LeetCode 进阶挑战。</span>
      </div>
    </div>
  </div>

  <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="font-bold text-emerald-400 mb-1.5">⚡ 频次比较状态机</div>
    <div class="text-[11px] text-slate-300 space-y-1">
      <p>• <strong>count &lt; maxCount：</strong>当前频次尚未达到峰值，不影响当前已确认的众数候选。</p>
      <p>• <strong>count == maxCount：</strong>并列第一，将当前节点值纳入众数集合。</p>
      <p>• <strong>count &gt; maxCount：</strong>全新世界纪录！先前的众数全被废弃，清空集合并将当前节点作为唯一候选。</p>
    </div>
  </div>
</div>
`;

export const BST_MODES_CODE_LANGUAGES: Record<string, Record<string, string>> = {
  'stage-1': BST_MODES_STAGE1_CODES,
  'stage-2': BST_MODES_STAGE2_CODES,
  'stage-3': BST_MODES_STAGE3_CODES,
};
