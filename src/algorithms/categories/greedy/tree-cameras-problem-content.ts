/**
 * LeetCode 968: 监控二叉树 (Binary Tree Cameras)
 * 领域知识与题解精讲配置声明
 */

export const TREE_CAMERAS_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">LeetCode 968</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">监控二叉树 (Binary Tree Cameras)</h2>
    </div>
    <p style="margin: 0;">给定一个二叉树，我们在树的节点上安装摄像头。</p>
    <p style="margin: 0;">节点上的每个摄影头都可以监视<strong>其父节点、自身及其直接子节点</strong>。</p>
    <p style="margin: 0;">计算监控树的所有节点所需的最小摄像头数量。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: [0,0,null,0,0]</div>
      <div>输出: 1</div>
      <div>解释: 如图所示，一台摄像头足以监控所有节点。</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: [0,0,null,0,null,0,null,null,1]</div>
      <div>输出: 2</div>
      <div>解释: 需要至少两个摄像头来监视树的所有节点。</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 给定树的节点数的范围是 [1, 1000]。</div>
      <div>• 每个节点的值都是 0。</div>
    </div>
  </div>
`;

export const TREE_CAMERAS_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心核心：后序自底向上推导，叶子节点父节点放摄像头
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么不能在叶子节点放摄像头？</div>
        <p style="margin: 0; color: #94a3b8;">一个摄像头最多覆盖 3 层（自身、父、子）。叶子节点没有子节点，如果在叶子节点放摄像头只能覆盖自身和父节点（最多 2 个）；而如果在<strong>叶子的父节点</strong>放摄像头，可以同时覆盖父节点、左右子节点、甚至祖父节点（最多 4 个）！因此<strong>贪心策略是尽量让叶子节点的父节点安装摄像头</strong>！</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 节点状态定义 (后序遍历)</div>
        <p style="margin: 0; color: #94a3b8;">
        • <code style="color: #f87171; font-family: monospace;">0: 无覆盖 (uncovered)</code><br/>
        • <code style="color: #34d399; font-family: monospace;">1: 有摄像头 (camera)</code><br/>
        • <code style="color: #60a5fa; font-family: monospace;">2: 有覆盖 (covered)</code><br/>
        • 空节点 <code style="color: #7dd3fc; font-family: monospace;">null</code> 视为 <code style="color: #60a5fa; font-family: monospace;">2 (有覆盖)</code>，避免叶子节点放摄像头。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #f472b6; margin-bottom: 4px;">③ 状态转移三分支</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 左右孩子只要有一个为 <code style="color: #f87171; font-family: monospace;">0 (无覆盖)</code>：当前父节点必须装摄像头 &rarr; <code style="color: #34d399; font-family: monospace;">result++; return 1;</code><br/>
        2. 左右孩子只要有一个为 <code style="color: #34d399; font-family: monospace;">1 (有摄像头)</code>：当前节点已被覆盖 &rarr; <code style="color: #60a5fa; font-family: monospace;">return 2;</code><br/>
        3. 左右孩子均为 <code style="color: #60a5fa; font-family: monospace;">2 (有覆盖)</code>：当前节点暂时无覆盖，留给上层父节点覆盖 &rarr; <code style="color: #f87171; font-family: monospace;">return 0;</code><br/>
        4. 根节点特判：遍历结束后若根节点为 <code style="color: #f87171; font-family: monospace;">0</code>，根节点必须安装摄像头 &rarr; <code style="color: #34d399; font-family: monospace;">result++;</code>
        </p>
      </div>
    </div>
  </div>
`;

export const TREE_CAMERAS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    private int result = 0;',
    '    public int minCameraCover(TreeNode root) {',
    '        // 0:无覆盖, 1:有摄像头, 2:有覆盖',
    '        if (traversal(root) == 0) {',
    '            result++; // 根节点无覆盖，需放摄像头',
    '        }',
    '        return result;',
    '    }',
    '    private int traversal(TreeNode cur) {',
    '        if (cur == null) return 2; // 空节点视为有覆盖',
    '        int left = traversal(cur.left);   // 左',
    '        int right = traversal(cur.right); // 右',
    '        // 中：情况1 左右孩子有无覆盖节点',
    '        if (left == 0 || right == 0) {',
    '            result++;',
    '            return 1;',
    '        }',
    '        // 情况2 左右孩子至少有一个摄像头',
    '        if (left == 1 || right == 1) {',
    '            return 2;',
    '        }',
    '        // 情况3 左右孩子都被覆盖',
    '        return 0;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    '    int result = 0;',
    '    int traversal(TreeNode* cur) {',
    '        if (!cur) return 2;',
    '        int left = traversal(cur->left);',
    '        int right = traversal(cur->right);',
    '        if (left == 0 || right == 0) {',
    '            result++;',
    '            return 1;',
    '        }',
    '        if (left == 1 || right == 1) return 2;',
    '        return 0;',
    '    }',
    'public:',
    '    int minCameraCover(TreeNode* root) {',
    '        if (traversal(root) == 0) result++;',
    '        return result;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def minCameraCover(self, root: TreeNode) -> int:',
    '        result = 0',
    '        def traversal(cur):',
    '            nonlocal result',
    '            if not cur:',
    '                return 2',
    '            left = traversal(cur.left)',
    '            right = traversal(cur.right)',
    '            if left == 0 or right == 0:',
    '                result += 1',
    '                return 1',
    '            if left == 1 or right == 1:',
    '                return 2',
    '            return 0',
    '        if traversal(root) == 0:',
    '            result += 1',
    '        return result',
  ],
  javascript: [
    'var minCameraCover = function(root) {',
    '    let result = 0;',
    '    const traversal = (cur) => {',
    '        if (!cur) return 2;',
    '        const left = traversal(cur.left);',
    '        const right = traversal(cur.right);',
    '        if (left === 0 || right === 0) {',
    '            result++;',
    '            return 1;',
    '        }',
    '        if (left === 1 || right === 1) return 2;',
    '        return 0;',
    '    };',
    '    if (traversal(root) === 0) result++;',
    '    return result;',
    '};',
  ],
};
