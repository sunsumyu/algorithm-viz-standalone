/**
 * 完全二叉树检验 (Completeness of Binary Tree · LeetCode 958 / Class 036 Code05)
 * 多阶段演化四语言代码模板与精准 1-Based 行号映射
 *
 * Stage 1: 标准 Queue + 左神两大铁律 (Queue BFS + Leaf State Flag · 经典集合)
 * Stage 2: 静态连续数组模拟队列 (Static Array Queue · 左神 Class 036 招牌零 GC)
 * Stage 3: 空节点哨兵单调性校验 (Null Sentinel Queue · 紧凑排布无空隙)
 */

// ============================================================
// Stage 1: 标准 Queue + 左神两大铁律 (Queue BFS + Leaf Flag)
// ============================================================
export const COMPLETENESS_STAGE1_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public boolean isCompleteTree(TreeNode root) {',              // 2
    '        if (root == null) return true;',                          // 3
    '        Queue<TreeNode> queue = new LinkedList<>();',             // 4
    '        queue.offer(root);',                                      // 5
    '        boolean leaf = false;',                                   // 6
    '        while (!queue.isEmpty()) {',                              // 7
    '            TreeNode cur = queue.poll();',                        // 8
    '            TreeNode l = cur.left, r = cur.right;',               // 9
    '            if (leaf && (l != null || r != null)) return false;', // 10
    '            if (l == null && r != null) return false;',           // 11
    '            if (l != null) queue.offer(l);',                      // 12
    '            if (r != null) queue.offer(r);',                      // 13
    '            if (l == null || r == null) leaf = true;',            // 14
    '        }',                                                       // 15
    '        return true;',                                            // 16
    '    }',                                                           // 17
    '}',                                                               // 18
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    bool isCompleteTree(TreeNode* root) {',                       // 3
    '        if (!root) return true;',                                 // 4
    '        queue<TreeNode*> q;',                                     // 5
    '        q.push(root);',                                           // 6
    '        bool leaf = false;',                                      // 7
    '        while (!q.empty()) {',                                    // 8
    '            TreeNode* cur = q.front(); q.pop();',                 // 9
    '            TreeNode* l = cur->left, *r = cur->right;',           // 10
    '            if (leaf && (l || r)) return false;',                 // 11
    '            if (!l && r) return false;',                          // 12
    '            if (l) q.push(l);',                                   // 13
    '            if (r) q.push(r);',                                   // 14
    '            if (!l || !r) leaf = true;',                          // 15
    '        }',                                                       // 16
    '        return true;',                                            // 17
    '    }',                                                           // 18
    '};',                                                              // 19
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def isCompleteTree(self, root: Optional[TreeNode]) -> bool:', // 2
    '        if not root: return True',                                // 3
    '        q = collections.deque([root])',                           // 4
    '        leaf = False',                                            // 5
    '        while q:',                                                // 6
    '            cur = q.popleft()',                                   // 7
    '            l, r = cur.left, cur.right',                          // 8
    '            if leaf and (l or r): return False',                  // 9
    '            if not l and r: return False',                        // 10
    '            if l: q.append(l)',                                   // 11
    '            if r: q.append(r)',                                   // 12
    '            if not l or not r: leaf = True',                      // 13
    '        return True',                                             // 14
  ],
  javascript: [
    'var isCompleteTree = function(root) {',                           // 1
    '    if (!root) return true;',                                     // 2
    '    const q = [root];',                                           // 3
    '    let leaf = false;',                                           // 4
    '    while (q.length > 0) {',                                      // 5
    '        const cur = q.shift();',                                  // 6
    '        const l = cur.left, r = cur.right;',                      // 7
    '        if (leaf && (l || r)) return false;',                     // 8
    '        if (!l && r) return false;',                              // 9
    '        if (l) q.push(l);',                                       // 10
    '        if (r) q.push(r);',                                       // 11
    '        if (!l || !r) leaf = true;',                              // 12
    '    }',                                                           // 13
    '    return true;',                                                // 14
    '};',                                                              // 15
  ],
};

export const COMPLETENESS_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  initQueue: { java: 5, cpp: 6, python: 4, javascript: 3 },
  pollNode: { java: 8, cpp: 9, python: 7, javascript: 6 },
  checkLeafViolate: { java: 10, cpp: 11, python: 9, javascript: 8 },
  checkNoLeftHasRight: { java: 11, cpp: 12, python: 10, javascript: 9 },
  pushChildren: { java: 12, cpp: 13, python: 11, javascript: 10 },
  leafTrigger: { java: 14, cpp: 15, python: 13, javascript: 12 },
  returnTrue: { java: 16, cpp: 17, python: 14, javascript: 14 },
};

// ============================================================
// Stage 2: 静态连续数组模拟队列 (Static Array Queue · Class 036 招牌零 GC)
// ============================================================
export const COMPLETENESS_STAGE2_STATIC_ARRAY_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public static int MAXN = 2001;',                              // 2
    '    public static TreeNode[] queue = new TreeNode[MAXN];',        // 3
    '    public static int l, r;',                                     // 4
    '    public boolean isCompleteTree(TreeNode root) {',              // 5
    '        if (root == null) return true;',                          // 6
    '        l = 0; r = 0;',                                           // 7
    '        queue[r++] = root;',                                      // 8
    '        boolean leaf = false;',                                   // 9
    '        while (l < r) {',                                         // 10
    '            TreeNode cur = queue[l++];',                          // 11
    '            TreeNode left = cur.left, right = cur.right;',        // 12
    '            if (leaf && (left != null || right != null)) return false;', // 13
    '            if (left == null && right != null) return false;',    // 14
    '            if (left != null) queue[r++] = left;',                // 15
    '            if (right != null) queue[r++] = right;',              // 16
    '            if (left == null || right == null) leaf = true;',     // 17
    '        }',                                                       // 18
    '        return true;',                                            // 19
    '    }',                                                           // 20
    '}',                                                               // 21
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    static const int MAXN = 2001;',                               // 3
    '    TreeNode* queue[MAXN];',                                      // 4
    '    bool isCompleteTree(TreeNode* root) {',                       // 5
    '        if (!root) return true;',                                 // 6
    '        int l = 0, r = 0;',                                       // 7
    '        queue[r++] = root;',                                      // 8
    '        bool leaf = false;',                                      // 9
    '        while (l < r) {',                                         // 10
    '            TreeNode* cur = queue[l++];',                         // 11
    '            TreeNode* left = cur->left, *right = cur->right;',    // 12
    '            if (leaf && (left || right)) return false;',          // 13
    '            if (!left && right) return false;',                   // 14
    '            if (left) queue[r++] = left;',                        // 15
    '            if (right) queue[r++] = right;',                      // 16
    '            if (!left || !right) leaf = true;',                   // 17
    '        }',                                                       // 18
    '        return true;',                                            // 19
    '    }',                                                           // 20
    '};',                                                              // 21
  ],
  python: [
    'class Solution:',                                                 // 1
    '    MAXN = 2001',                                                 // 2
    '    queue = [None] * MAXN',                                       // 3
    '    def isCompleteTree(self, root: Optional[TreeNode]) -> bool:', // 4
    '        if not root: return True',                                // 5
    '        l, r = 0, 0',                                             // 6
    '        self.queue[r] = root; r += 1',                            // 7
    '        leaf = False',                                            // 8
    '        while l < r:',                                            // 9
    '            cur = self.queue[l]; l += 1',                         // 10
    '            left, right = cur.left, cur.right',                   // 11
    '            if leaf and (left or right): return False',           // 12
    '            if not left and right: return False',                 // 13
    '            if left: self.queue[r] = left; r += 1',               // 14
    '            if right: self.queue[r] = right; r += 1',             // 15
    '            if not left or not right: leaf = True',               // 16
    '        return True',                                             // 17
  ],
  javascript: [
    'const MAXN = 2001;',                                              // 1
    'const queue = new Array(MAXN);',                                  // 2
    'var isCompleteTree = function(root) {',                           // 3
    '    if (!root) return true;',                                     // 4
    '    let l = 0, r = 0;',                                           // 5
    '    queue[r++] = root;',                                          // 6
    '    let leaf = false;',                                           // 7
    '    while (l < r) {',                                             // 8
    '        const cur = queue[l++];',                                 // 9
    '        const left = cur.left, right = cur.right;',               // 10
    '        if (leaf && (left || right)) return false;',              // 11
    '        if (!left && right) return false;',                       // 12
    '        if (left) queue[r++] = left;',                            // 13
    '        if (right) queue[r++] = right;',                          // 14
    '        if (!left || !right) leaf = true;',                       // 15
    '    }',                                                           // 16
    '    return true;',                                                // 17
    '};',                                                              // 18
  ],
};

export const COMPLETENESS_STAGE2_STATIC_ARRAY_LINES = {
  entry: { java: 5, cpp: 5, python: 4, javascript: 3 },
  offerRoot: { java: 8, cpp: 8, python: 7, javascript: 6 },
  pollNode: { java: 11, cpp: 11, python: 10, javascript: 9 },
  checkLeafViolate: { java: 13, cpp: 13, python: 12, javascript: 11 },
  checkNoLeftHasRight: { java: 14, cpp: 14, python: 13, javascript: 12 },
  pushLeft: { java: 15, cpp: 15, python: 14, javascript: 13 },
  pushRight: { java: 16, cpp: 16, python: 15, javascript: 14 },
  leafTrigger: { java: 17, cpp: 17, python: 16, javascript: 15 },
  returnTrue: { java: 19, cpp: 19, python: 17, javascript: 17 },
};

// ============================================================
// Stage 3: 空节点哨兵单调性校验 (Null Sentinel Queue)
// ============================================================
export const COMPLETENESS_STAGE3_SENTINEL_CODE: Record<string, string[]> = {
  java: [
    'public class Solution {',                                         // 1
    '    public boolean isCompleteTree(TreeNode root) {',              // 2
    '        if (root == null) return true;',                          // 3
    '        Queue<TreeNode> queue = new LinkedList<>();',             // 4
    '        queue.offer(root);',                                      // 5
    '        boolean reachedNull = false;',                            // 6
    '        while (!queue.isEmpty()) {',                              // 7
    '            TreeNode cur = queue.poll();',                        // 8
    '            if (cur == null) {',                                  // 9
    '                reachedNull = true;',                             // 10
    '            } else {',                                            // 11
    '                if (reachedNull) return false;',                  // 12
    '                queue.offer(cur.left);',                          // 13
    '                queue.offer(cur.right);',                         // 14
    '            }',                                                   // 15
    '        }',                                                       // 16
    '        return true;',                                            // 17
    '    }',                                                           // 18
    '}',                                                               // 19
  ],
  cpp: [
    'class Solution {',                                                // 1
    'public:',                                                         // 2
    '    bool isCompleteTree(TreeNode* root) {',                       // 3
    '        if (!root) return true;',                                 // 4
    '        queue<TreeNode*> q;',                                     // 5
    '        q.push(root);',                                           // 6
    '        bool reachedNull = false;',                               // 7
    '        while (!q.empty()) {',                                    // 8
    '            TreeNode* cur = q.front(); q.pop();',                 // 9
    '            if (!cur) {',                                         // 10
    '                reachedNull = true;',                             // 11
    '            } else {',                                            // 12
    '                if (reachedNull) return false;',                  // 13
    '                q.push(cur->left);',                              // 14
    '                q.push(cur->right);',                             // 15
    '            }',                                                   // 16
    '        }',                                                       // 17
    '        return true;',                                            // 18
    '    }',                                                           // 19
    '};',                                                              // 20
  ],
  python: [
    'class Solution:',                                                 // 1
    '    def isCompleteTree(self, root: Optional[TreeNode]) -> bool:', // 2
    '        if not root: return True',                                // 3
    '        q = collections.deque([root])',                           // 4
    '        reached_null = False',                                    // 5
    '        while q:',                                                // 6
    '            cur = q.popleft()',                                   // 7
    '            if not cur:',                                         // 8
    '                reached_null = True',                             // 9
    '            else:',                                               // 10
    '                if reached_null: return False',                   // 11
    '                q.append(cur.left)',                              // 12
    '                q.append(cur.right)',                             // 13
    '        return True',                                             // 14
  ],
  javascript: [
    'var isCompleteTree = function(root) {',                           // 1
    '    if (!root) return true;',                                     // 2
    '    const q = [root];',                                           // 3
    '    let reachedNull = false;',                                    // 4
    '    while (q.length > 0) {',                                      // 5
    '        const cur = q.shift();',                                  // 6
    '        if (cur === null) {',                                     // 7
    '            reachedNull = true;',                                 // 8
    '        } else {',                                                // 9
    '            if (reachedNull) return false;',                      // 10
    '            q.push(cur.left);',                                   // 11
    '            q.push(cur.right);',                                  // 12
    '        }',                                                       // 13
    '    }',                                                           // 14
    '    return true;',                                                // 15
    '};',                                                              // 16
  ],
};

export const COMPLETENESS_STAGE3_SENTINEL_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  initQueue: { java: 5, cpp: 6, python: 4, javascript: 3 },
  pollNode: { java: 8, cpp: 9, python: 7, javascript: 6 },
  triggerNull: { java: 10, cpp: 11, python: 9, javascript: 8 },
  checkGapViolate: { java: 12, cpp: 13, python: 11, javascript: 10 },
  pushBothChildren: { java: 13, cpp: 14, python: 12, javascript: 11 },
  returnTrue: { java: 17, cpp: 18, python: 14, javascript: 15 },
};
