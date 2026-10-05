/**
 * 二叉搜索树中的删除 (Delete Node in a BST · LeetCode 450)
 * 名师讲义、图解分析与五大生命周期场景
 */

export const BST_DELETE_PROBLEM_HTML = `
<div class="space-y-4 text-slate-300 leading-relaxed">
  <div class="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
      <span>💡 核心问题定义 (LeetCode 450)</span>
    </div>
    <p class="text-xs text-slate-300">
      给定一个二叉搜索树的根节点 <code class="text-amber-300 font-mono">root</code> 和一个值 <code class="text-amber-300 font-mono">key</code>，
      要求在 BST 中删除键值为 <code class="text-amber-300 font-mono">key</code> 的节点，并返回调整后依然满足 BST 性质的根节点。
    </p>
  </div>

  <div class="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
    <div class="font-bold text-sky-400 text-xs mb-2">🌿 二叉搜索树删除的五大基本场景分类</div>
    <ul class="text-xs space-y-1.5 list-disc list-inside text-slate-300">
      <li><span class="text-slate-400 font-medium">场景 1 (未命中)：</span>目标值不存在于树中，递归下潜至空节点直接返回，树结构保持不变。</li>
      <li><span class="text-emerald-400 font-medium">场景 2 (叶子节点)：</span>目标节点左右孩子俱为空，直接删除该节点并向上层返回 <code class="text-emerald-300">null</code>。</li>
      <li><span class="text-indigo-400 font-medium">场景 3 (单右子树)：</span>目标节点左孩子为空、右孩子非空，删除目标节点，右孩子直接晋升补位。</li>
      <li><span class="text-teal-400 font-medium">场景 4 (单左子树)：</span>目标节点右孩子为空、左孩子非空，删除目标节点，左孩子直接晋升补位。</li>
      <li><span class="text-amber-400 font-medium">场景 5 (左右俱在)：</span>双子树俱非空，最棘手的情况。有两类经典解法：
        <ul class="pl-4 pt-1 space-y-1 text-slate-400">
          <li><strong>子树嫁接重连法 (Grafting)：</strong>定位右子树的极左后继节点，将原左子树整体挂载为该后继的左孩子，原右子树根直接上位。无需修改节点值，纯指针操作！</li>
          <li><strong>后继值覆盖法 (Value Replacement)：</strong>找到右子树极小节点，将其值复制给当前节点，随后递归在右子树中删除该极小节点。</li>
        </ul>
      </li>
    </ul>
  </div>

  <div class="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
    <div class="font-bold text-emerald-400 text-xs mb-1.5">⏱️ 复杂度剖析</div>
    <div class="text-xs text-slate-300 space-y-1">
      <p><strong>时间复杂度：</strong><code class="text-emerald-300">O(H)</code>，其中 H 为树高。最好/平衡时为 <code class="text-emerald-300">O(log N)</code>，退化单链时为 <code class="text-emerald-300">O(N)</code>。</p>
      <p><strong>空间复杂度：</strong>递归法系统调用栈为 <code class="text-emerald-300">O(H)</code>；迭代法则为绝对纯净的 <code class="text-emerald-300">O(1)</code> 额外常数空间。</p>
    </div>
  </div>
</div>
`;

export const BST_DELETE_ANALYSIS_HTML = `
<div class="space-y-3.5 text-slate-300 text-xs leading-relaxed">
  <div class="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
    <div class="font-bold text-sky-400 mb-1.5">📐 双版本长处整合与三大演化阶段</div>
    <p>
      很多初学者在面对 BST 删除时容易出现“野指针断链”、“破坏中序单调性”或“树高过度暴增”。
      本模块将 BST 删除拆解为三大递进阶段：
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-amber-400 font-bold block mb-1">Stage 1: 递归直接嫁接</span>
        <span class="text-[11px] text-slate-400">左右非空时，将左子树接入右子树极左叶下，右根直接上位。代码精炼极简。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-teal-400 font-bold block mb-1">Stage 2: 递归后继值覆盖</span>
        <span class="text-[11px] text-slate-400">算法导论经典流派：复制右子树后继值后递归删除后继，树平衡度衰减较平缓。</span>
      </div>
      <div class="p-2 rounded bg-slate-900/60 border border-slate-700/40">
        <span class="text-indigo-400 font-bold block mb-1">Stage 3: 双指针显式迭代</span>
        <span class="text-[11px] text-slate-400">维护 parent 与 cur 双指针。精准重连父节点孩子指针，无递归栈消耗。</span>
      </div>
    </div>
  </div>
</div>
`;
