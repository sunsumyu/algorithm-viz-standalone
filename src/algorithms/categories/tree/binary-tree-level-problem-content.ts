/**
 * 二叉树的层序遍历 (Binary Tree Level Order Traversal · LeetCode 102 / Class 036 Code01)
 * 领域知识与题解精讲配置声明
 */

export const BINARY_TREE_LEVEL_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 102</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(168,85,247,0.2); color: #c084fc; font-weight: 700; border: 1px solid rgba(168,85,247,0.3);">Class 036 Code01</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">二叉树的层序遍历 (Level Order Traversal)</h2>
    </div>
    <p style="margin: 0;">给你二叉树的根节点 <code style="color: #38bdf8; font-family: monospace;">root</code> ，返回其节点值的 <strong>层序遍历</strong> 。 （即逐层地，从左到右访问所有节点）。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: root = [3, 9, 20, null, null, 15, 7]</div>
      <div>输出: [[3], [9, 20], [15, 7]]</div>
    </div>
  </div>
`;

export const BINARY_TREE_LEVEL_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> BFS 队列分层出队核心机制 (左神 Class 036 讲义精讲)
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 队列大小快照法 (Class 036 经典按层出队)</div>
        <p style="margin: 0; color: #94a3b8;">
        广度优先搜索（BFS）在二叉树中的标准形态。左神指出：<strong>维护队列的当前快照大小 <code style="color: #fbbf24; font-family: monospace;">size = queue.size()</code></strong>，可以严格划分每一层的节点边界，实现 $O(N)$ 时间与 $O(W)$ 宽度的逐层收集。<br/>
        1. 根节点入队，开启外层循环 <code style="color: #38bdf8; font-family: monospace;">while (!queue.isEmpty())</code>；<br/>
        2. 锁定当前层节点总数 <code style="color: #fbbf24; font-family: monospace;">int size = queue.size();</code>，内层循环严格执行 <code>size</code> 次依次弹出节点；<br/>
        3. 弹出的节点收集入当前层列表，若其左右子节点非空则推入队尾作为下一层储备；<br/>
        4. 内层循环结束即宣告本层收集完毕，将 <code style="color: #34d399; font-family: monospace;">level</code> 存入最终二维结果集。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #10b981; margin-bottom: 4px;">② 静态数组模拟队列 (Class 036 招牌极致优化)</div>
        <p style="margin: 0; color: #94a3b8;">
        左神在算法讲解 036 中强调：在笔试或大厂高频算法场景中，Java 的 <code style="color: #fbbf24; font-family: monospace;">LinkedList / ArrayDeque</code> 存在节点包装与动态内存申请开销。利用全局静态数组：<br/>
        <code style="color: #38bdf8; font-family: monospace;">TreeNode[] queue = new TreeNode[MAXN]; int l = 0, r = 0;</code><br/>
        1. 入队操作直接为 <code style="color: #38bdf8; font-family: monospace;">queue[r++] = node</code>，出队直接为 <code style="color: #38bdf8; font-family: monospace;">cur = queue[l++]</code>；<br/>
        2. 当前层节点数天然等于 <code style="color: #10b981; font-family: monospace;">size = r - l</code>；<br/>
        3. 整个过程零动态对象创建，无任何 GC 停顿，常数时间极具压倒性优势！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #ef4444; margin-bottom: 4px;">③ 新手初学劣质解法反思 (哈希表记录层数 · 不推荐)</div>
        <p style="margin: 0; color: #94a3b8;">
        很多初学者不知如何划分层级边界，会引入 <code style="color: #f87171; font-family: monospace;">HashMap&lt;TreeNode, Integer&gt; levels</code>。每弹出一个节点查一次其层号，再放入对应列表。左神明确指出：这种写法对树中每个节点都额外产生了哈希碰撞与对象 Key 寻址，空间与时间常数极为庞大，在工程中绝不可取。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #38bdf8; margin-bottom: 4px;">④ 复杂度与空间边界</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(n)</code>，树中每个节点恰好进出队列一次，且各被常数时间处理。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(w)</code>，取决于树的最大宽度（最宽一层的节点数），在满二叉树中最后一层约为 $N/2$ 个节点，最坏空间占用为 $O(N)$。
        </p>
      </div>
    </div>
  </div>
`;

export const BINARY_TREE_LEVEL_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public List<List<Integer>> levelOrder(TreeNode root) {',
    '        List<List<Integer>> res = new ArrayList<>();',
    '        if (root == null) return res;',
    '        Queue<TreeNode> queue = new LinkedList<>();',
    '        queue.offer(root);',
    '        while (!queue.isEmpty()) {',
    '            int size = queue.size(); // 固定当前层大小',
    '            List<Integer> level = new ArrayList<>();',
    '            for (int i = 0; i < size; i++) {',
    '                TreeNode node = queue.poll();',
    '                level.add(node.val);',
    '                if (node.left != null) queue.offer(node.left);',
    '                if (node.right != null) queue.offer(node.right);',
    '            }',
    '            res.add(level);',
    '        }',
    '        return res;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> levelOrder(TreeNode* root) {',
    '        vector<vector<int>> res;',
    '        if (!root) return res;',
    '        queue<TreeNode*> q;',
    '        q.push(root);',
    '        while (!q.empty()) {',
    '            int size = q.size();',
    '            vector<int> level;',
    '            for (int i = 0; i < size; i++) {',
    '                TreeNode* node = q.front(); q.pop();',
    '                level.push_back(node->val);',
    '                if (node->left) q.push(node->left);',
    '                if (node->right) q.push(node->right);',
    '            }',
    '            res.push_back(level);',
    '        }',
    '        return res;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:',
    '        res = []',
    '        if not root: return res',
    '        queue = collections.deque([root])',
    '        while queue:',
    '            size = len(queue)',
    '            level = []',
    '            for _ in range(size):',
    '                node = queue.popleft()',
    '                level.append(node.val)',
    '                if node.left: queue.append(node.left)',
    '                if node.right: queue.append(node.right)',
    '            res.append(level)',
    '        return res',
  ],
  javascript: [
    'var levelOrder = function(root) {',
    '    const res = [];',
    '    if (!root) return res;',
    '    const queue = [root];',
    '    while (queue.length > 0) {',
    '        const size = queue.length;',
    '        const level = [];',
    '        for (let i = 0; i < size; i++) {',
    '            const node = queue.shift();',
    '            level.push(node.val);',
    '            if (node.left) queue.push(node.left);',
    '            if (node.right) queue.push(node.right);',
    '        }',
    '        res.push(level);',
    '    }',
    '    return res;',
    '};',
  ],
};
