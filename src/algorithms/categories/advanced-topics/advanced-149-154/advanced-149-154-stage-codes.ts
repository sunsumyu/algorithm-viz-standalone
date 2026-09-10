/**
 * 左神算法通关课 149 ~ 154 有序表全家桶多语言代码与 1-based 行号映射
 * 涵盖：SB 树、红黑树、跳表、Splay 伸展树、替罪羊树、FHQ-Treap
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 149: Size Balanced Tree (SB 树)
// ==========================================
export const SB_TREE_CODES: Record<string, string[]> = {
  java: [
    'public SBNode insert(SBNode t, int key) {', // 1
    '    if (t == null) return new SBNode(key);', // 2
    '    t.size++;', // 3
    '    if (key < t.key) t.left = insert(t.left, key);', // 4
    '    else t.right = insert(t.right, key);', // 5
    '    return maintain(t); // 仅在插入时维持 size 平衡', // 6
    '}', // 7
    'public SBNode maintain(SBNode t) {', // 8
    '    if (t == null) return null;', // 9
    '    if (getSize(t.left?.left) > getSize(t.right)) { t = rotateRight(t); t.right = maintain(t.right); t = maintain(t); } // LL', // 10
    '    else if (getSize(t.left?.right) > getSize(t.right)) { t.left = rotateLeft(t.left); t = rotateRight(t); ... } // LR', // 11
    '    else if (getSize(t.right?.right) > getSize(t.left)) { t = rotateLeft(t); t.left = maintain(t.left); t = maintain(t); } // RR', // 12
    '    else if (getSize(t.right?.left) > getSize(t.left)) { t.right = rotateRight(t.right); t = rotateLeft(t); ... } // RL', // 13
    '    return t;', // 14
    '}', // 15
  ],
  cpp: [
    'SBNode* insert(SBNode* t, int key) {', // 1
    '    if (!t) return new SBNode(key);', // 2
    '    t->size++;', // 3
    '    if (key < t->key) t->left = insert(t->left, key);', // 4
    '    else t->right = insert(t->right, key);', // 5
    '    return maintain(t);', // 6
    '}', // 7
    'SBNode* maintain(SBNode* t) {', // 8
    '    if (!t) return nullptr;', // 9
    '    if (getSize(t->left ? t->left->left : nullptr) > getSize(t->right)) { t = rotateRight(t); t->right = maintain(t->right); t = maintain(t); }', // 10
    '    else if (getSize(t->left ? t->left->right : nullptr) > getSize(t->right)) { t->left = rotateLeft(t->left); t = rotateRight(t); }', // 11
    '    else if (getSize(t->right ? t->right->right : nullptr) > getSize(t->left)) { t = rotateLeft(t); t->left = maintain(t->left); t = maintain(t); }', // 12
    '    else if (getSize(t->right ? t->right->left : nullptr) > getSize(t->left)) { t->right = rotateRight(t->right); t = rotateLeft(t); }', // 13
    '    return t;', // 14
    '}', // 15
  ],
  python: [
    'def insert(t, key):', // 1
    '    if not t: return SBNode(key)', // 2
    '    t.size += 1', // 3
    '    if key < t.key: t.left = insert(t.left, key)', // 4
    '    else: t.right = insert(t.right, key)', // 5
    '    return maintain(t)', // 6
    '', // 7
    'def maintain(t):', // 8
    '    if not t: return None', // 9
    '    if get_size(t.left.left if t.left else None) > get_size(t.right): t = rotate_right(t); t.right = maintain(t.right); t = maintain(t)', // 10
    '    elif get_size(t.left.right if t.left else None) > get_size(t.right): t.left = rotate_left(t.left); t = rotate_right(t)', // 11
    '    elif get_size(t.right.right if t.right else None) > get_size(t.left): t = rotate_left(t); t.left = maintain(t.left); t = maintain(t)', // 12
    '    elif get_size(t.right.left if t.right else None) > get_size(t.left): t.right = rotate_right(t.right); t = rotate_left(t)', // 13
    '    return t', // 14
  ],
  javascript: [
    'function insert(t, key) {', // 1
    '    if (!t) return new SBNode(key);', // 2
    '    t.size++;', // 3
    '    if (key < t.key) t.left = insert(t.left, key);', // 4
    '    else t.right = insert(t.right, key);', // 5
    '    return maintain(t);', // 6
    '}', // 7
    'function maintain(t) {', // 8
    '    if (!t) return null;', // 9
    '    if (getSize(t.left?.left) > getSize(t.right)) { t = rotateRight(t); t.right = maintain(t.right); t = maintain(t); }', // 10
    '    else if (getSize(t.left?.right) > getSize(t.right)) { t.left = rotateLeft(t.left); t = rotateRight(t); }', // 11
    '    else if (getSize(t.right?.right) > getSize(t.left)) { t = rotateLeft(t); t.left = maintain(t.left); t = maintain(t); }', // 12
    '    else if (getSize(t.right?.left) > getSize(t.left)) { t.right = rotateRight(t.right); t = rotateLeft(t); }', // 13
    '    return t;', // 14
    '}', // 15
  ],
};

export const SB_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  bstInsert: { java: 4, cpp: 4, python: 4, javascript: 4 },
  maintain:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  repairLL:  { java: 10, cpp: 10, python: 10, javascript: 10 },
  repairRR:  { java: 12, cpp: 12, python: 12, javascript: 12 },
  returnAns: { java: 14, cpp: 14, python: 14, javascript: 14 },
};

// ==========================================
// 2. Class 150: 红黑树 (Red-Black Tree)
// ==========================================
export const RED_BLACK_CODES: Record<string, string[]> = {
  java: [
    'public void insertFixup(RBNode z) {', // 1
    '    while (z.parent != null && z.parent.color == RED) {', // 2
    '        if (z.parent == z.parent.parent.left) {', // 3
    '            RBNode y = z.parent.parent.right; // 叔叔节点', // 4
    '            if (y != null && y.color == RED) { // Case 1: 叔叔为红，变色上推', // 5
    '                z.parent.color = BLACK; y.color = BLACK; z.parent.parent.color = RED; z = z.parent.parent;', // 6
    '            } else {', // 7
    '                if (z == z.parent.right) { z = z.parent; rotateLeft(z); } // Case 2: 之字形先左旋', // 8
    '                z.parent.color = BLACK; z.parent.parent.color = RED; rotateRight(z.parent.parent); // Case 3: 一字形右旋', // 9
    '            }', // 10
    '        } else { /* 对称处理右侧 */ }', // 11
    '    }', // 12
    '    root.color = BLACK; // 根节点始终置黑', // 13
    '}', // 14
  ],
  cpp: [
    'void insertFixup(RBNode* z) {', // 1
    '    while (z->parent && z->parent->color == RED) {', // 2
    '        if (z->parent == z->parent->parent->left) {', // 3
    '            RBNode* y = z->parent->parent->right;', // 4
    '            if (y && y->color == RED) {', // 5
    '                z->parent->color = BLACK; y->color = BLACK; z->parent->parent->color = RED; z = z->parent->parent;', // 6
    '            } else {', // 7
    '                if (z == z->parent->right) { z = z->parent; rotateLeft(z); }', // 8
    '                z->parent->color = BLACK; z->parent->parent->color = RED; rotateRight(z->parent->parent);', // 9
    '            }', // 10
    '        } else { /* 对称右侧 */ }', // 11
    '    }', // 12
    '    root->color = BLACK;', // 13
    '}', // 14
  ],
  python: [
    'def insert_fixup(self, z):', // 1
    '    while z.parent and z.parent.color == RED:', // 2
    '        if z.parent == z.parent.parent.left:', // 3
    '            y = z.parent.parent.right', // 4
    '            if y and y.color == RED:', // 5
    '                z.parent.color = BLACK; y.color = BLACK; z.parent.parent.color = RED; z = z.parent.parent', // 6
    '            else:', // 7
    '                if z == z.parent.right: z = z.parent; self.rotate_left(z)', // 8
    '                z.parent.color = BLACK; z.parent.parent.color = RED; self.rotate_right(z.parent.parent)', // 9
    '        else: pass', // 10
    '    self.root.color = BLACK', // 11
  ],
  javascript: [
    'function insertFixup(z) {', // 1
    '    while (z.parent && z.parent.color === "RED") {', // 2
    '        if (z.parent === z.parent.parent.left) {', // 3
    '            let y = z.parent.parent.right;', // 4
    '            if (y && y.color === "RED") {', // 5
    '                z.parent.color = "BLACK"; y.color = "BLACK"; z.parent.parent.color = "RED"; z = z.parent.parent;', // 6
    '            } else {', // 7
    '                if (z === z.parent.right) { z = z.parent; rotateLeft(z); }', // 8
    '                z.parent.color = "BLACK"; z.parent.parent.color = "RED"; rotateRight(z.parent.parent);', // 9
    '            }', // 10
    '        } else { /* 对称右侧 */ }', // 11
    '    }', // 12
    '    root.color = "BLACK";', // 13
    '}', // 14
  ],
};

export const RED_BLACK_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  checkLoop: { java: 2, cpp: 2, python: 2, javascript: 2 },
  caseRecolor:{ java: 6, cpp: 6, python: 6, javascript: 6 },
  caseRotate: { java: 9, cpp: 9, python: 9, javascript: 9 },
  rootBlack: { java: 13, cpp: 13, python: 11, javascript: 13 },
};

// ==========================================
// 3. Class 151: 跳表 (SkipList)
// ==========================================
export const SKIPLIST_CODES: Record<string, string[]> = {
  java: [
    'public void insert(int val) {', // 1
    '    Node[] update = new Node[MAX_LEVEL]; Node cur = head;', // 2
    '    for (int i = level - 1; i >= 0; i--) {', // 3
    '        while (cur.next[i] != null && cur.next[i].val < val) cur = cur.next[i]; // 向右跳跃', // 4
    '        update[i] = cur; // 记录每层下降前驱', // 5
    '    }', // 6
    '    int lv = randomLevel(); // 掷硬币决定随机层高', // 7
    '    Node newNode = new Node(val, lv);', // 8
    '    for (int i = 0; i < lv; i++) { newNode.next[i] = update[i].next[i]; update[i].next[i] = newNode; }', // 9
    '}', // 10
  ],
  cpp: [
    'void insert(int val) {', // 1
    '    vector<Node*> update(MAX_LEVEL, nullptr); Node* cur = head;', // 2
    '    for (int i = level - 1; i >= 0; i--) {', // 3
    '        while (cur->next[i] && cur->next[i]->val < val) cur = cur->next[i];', // 4
    '        update[i] = cur;', // 5
    '    }', // 6
    '    int lv = randomLevel();', // 7
    '    Node* newNode = new Node(val, lv);', // 8
    '    for (int i = 0; i < lv; i++) { newNode->next[i] = update[i]->next[i]; update[i]->next[i] = newNode; }', // 9
    '}', // 10
  ],
  python: [
    'def insert(self, val: int):', // 1
    '    update = [None] * MAX_LEVEL; cur = self.head', // 2
    '    for i in range(self.level - 1, -1, -1):', // 3
    '        while cur.next[i] and cur.next[i].val < val: cur = cur.next[i]', // 4
    '        update[i] = cur', // 5
    '    lv = self.random_level()', // 6
    '    new_node = Node(val, lv)', // 7
    '    for i in range(lv):', // 8
    '        new_node.next[i] = update[i].next[i]; update[i].next[i] = new_node', // 9
  ],
  javascript: [
    'function insert(val) {', // 1
    '    const update = new Array(MAX_LEVEL).fill(null); let cur = head;', // 2
    '    for (let i = level - 1; i >= 0; i--) {', // 3
    '        while (cur.next[i] && cur.next[i].val < val) cur = cur.next[i];', // 4
    '        update[i] = cur;', // 5
    '    }', // 6
    '    const lv = randomLevel();', // 7
    '    const newNode = new Node(val, lv);', // 8
    '    for (let i = 0; i < lv; i++) { newNode.next[i] = update[i].next[i]; update[i].next[i] = newNode; }', // 9
    '}', // 10
  ],
};

export const SKIPLIST_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  findPre:   { java: 4, cpp: 4, python: 4, javascript: 4 },
  randLevel: { java: 7, cpp: 7, python: 6, javascript: 7 },
  linkNode:  { java: 9, cpp: 9, python: 9, javascript: 9 },
  returnAns: { java: 10, cpp: 10, python: 9, javascript: 10 },
};

// ==========================================
// 4. Class 152: 伸展树与区间翻转 (Splay Tree)
// ==========================================
export const SPLAY_TREE_CODES: Record<string, string[]> = {
  java: [
    'public void splay(int x, int goal) {', // 1
    '    while (fa[x] != goal) {', // 2
    '        int f = fa[x], g = fa[f];', // 3
    '        if (g != goal) {', // 4
    '            if (get(x) == get(f)) rotate(f); // Zig-Zig 一字形先旋父节点', // 5
    '            else rotate(x); // Zig-Zag 之字形先旋当前节点', // 6
    '        }', // 7
    '        rotate(x); // 最后旋转自身', // 8
    '    }', // 9
    '    if (goal == 0) root = x;', // 10
    '}', // 11
  ],
  cpp: [
    'void splay(int x, int goal) {', // 1
    '    while (fa[x] != goal) {', // 2
    '        int f = fa[x], g = fa[f];', // 3
    '        if (g != goal) {', // 4
    '            if (get(x) == get(f)) rotate(f);', // 5
    '            else rotate(x);', // 6
    '        }', // 7
    '        rotate(x);', // 8
    '    }', // 9
    '    if (goal == 0) root = x;', // 10
    '}', // 11
  ],
  python: [
    'def splay(self, x: int, goal: int):', // 1
    '    while self.fa[x] != goal:', // 2
    '        f, g = self.fa[x], self.fa[self.fa[x]]', // 3
    '        if g != goal:', // 4
    '            if self.get(x) == self.get(f): self.rotate(f)', // 5
    '            else: self.rotate(x)', // 6
    '        self.rotate(x)', // 7
    '    if goal == 0: self.root = x', // 8
  ],
  javascript: [
    'function splay(x, goal) {', // 1
    '    while (fa[x] !== goal) {', // 2
    '        const f = fa[x], g = fa[f];', // 3
    '        if (g !== goal) {', // 4
    '            if (get(x) === get(f)) rotate(f);', // 5
    '            else rotate(x);', // 6
    '        }', // 7
    '        rotate(x);', // 8
    '    }', // 9
    '    if (goal === 0) root = x;', // 10
    '}', // 11
  ],
};

export const SPLAY_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  zigZig:    { java: 5, cpp: 5, python: 5, javascript: 5 },
  zigZag:    { java: 6, cpp: 6, python: 6, javascript: 6 },
  rotateSelf:{ java: 8, cpp: 8, python: 7, javascript: 8 },
  returnAns: { java: 10, cpp: 10, python: 8, javascript: 10 },
};

// ==========================================
// 5. Class 153: 替罪羊树 (Scapegoat Tree)
// ==========================================
export const SCAPEGOAT_CODES: Record<string, string[]> = {
  java: [
    'public void checkRebuild(SGNode cur) {', // 1
    '    if (cur == null) return;', // 2
    '    if (Math.max(getSize(cur.left), getSize(cur.right)) > ALPHA * cur.size) {', // 3
    '        flatten(cur, buffer); // 拍扁为中序序列', // 4
    '        rebuild(0, buffer.size() - 1); // 绝对平衡重构', // 5
    '    }', // 6
    '}', // 7
  ],
  cpp: [
    'void checkRebuild(SGNode* cur) {', // 1
    '    if (!cur) return;', // 2
    '    if (max(getSize(cur->left), getSize(cur->right)) > ALPHA * cur->size) {', // 3
    '        flatten(cur, buffer);', // 4
    '        rebuild(0, buffer.size() - 1);', // 5
    '    }', // 6
    '}', // 7
  ],
  python: [
    'def check_rebuild(self, cur):', // 1
    '    if not cur: return', // 2
    '    if max(get_size(cur.left), get_size(cur.right)) > ALPHA * cur.size:', // 3
    '        self.flatten(cur, self.buffer)', // 4
    '        self.rebuild(0, len(self.buffer) - 1)', // 5
  ],
  javascript: [
    'function checkRebuild(cur) {', // 1
    '    if (!cur) return;', // 2
    '    if (Math.max(getSize(cur.left), getSize(cur.right)) > ALPHA * cur.size) {', // 3
    '        flatten(cur, buffer);', // 4
    '        rebuild(0, buffer.length - 1);', // 5
    '    }', // 6
    '}', // 7
  ],
};

export const SCAPEGOAT_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  checkAlpha:{ java: 3, cpp: 3, python: 3, javascript: 3 },
  flatten:   { java: 4, cpp: 4, python: 4, javascript: 4 },
  rebuild:   { java: 5, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 7, cpp: 7, python: 5, javascript: 7 },
};

// ==========================================
// 6. Class 154: 非旋 Treap (FHQ-Treap)
// ==========================================
export const FHQ_TREAP_CODES: Record<string, string[]> = {
  java: [
    'public void split(int root, int key, int[] out) { // 按值 key 分裂为 L, R', // 1
    '    if (root == 0) { out[0] = 0; out[1] = 0; return; }', // 2
    '    if (val[root] <= key) { out[0] = root; split(rc[root], key, out); rc[root] = out[1]; }', // 3
    '    else { out[1] = root; split(lc[root], key, out); lc[root] = out[0]; }', // 4
    '    pushUp(root);', // 5
    '}', // 6
    'public int merge(int x, int y) { // 按优先级 priority 堆序合并', // 7
    '    if (x == 0 || y == 0) return x + y;', // 8
    '    if (pri[x] < pri[y]) { rc[x] = merge(rc[x], y); pushUp(x); return x; }', // 9
    '    else { lc[y] = merge(x, lc[y]); pushUp(y); return y; }', // 10
    '}', // 11
  ],
  cpp: [
    'void split(int root, int key, int& x, int& y) {', // 1
    '    if (!root) { x = y = 0; return; }', // 2
    '    if (val[root] <= key) { x = root; split(rc[root], key, rc[root], y); }', // 3
    '    else { y = root; split(lc[root], key, x, lc[root]); }', // 4
    '    pushUp(root);', // 5
    '}', // 6
    'int merge(int x, int y) {', // 7
    '    if (!x || !y) return x + y;', // 8
    '    if (pri[x] < pri[y]) { rc[x] = merge(rc[x], y); pushUp(x); return x; }', // 9
    '    else { lc[y] = merge(x, lc[y]); pushUp(y); return y; }', // 10
    '}', // 11
  ],
  python: [
    'def split(self, root, key):', // 1
    '    if not root: return 0, 0', // 2
    '    if self.val[root] <= key: x = root; self.rc[root], y = self.split(self.rc[root], key)', // 3
    '    else: y = root; x, self.lc[root] = self.split(self.lc[root], key)', // 4
    '    self.push_up(root); return x, y', // 5
    '', // 6
    'def merge(self, x, y):', // 7
    '    if not x or not y: return x + y', // 8
    '    if self.pri[x] < self.pri[y]: self.rc[x] = self.merge(self.rc[x], y); self.push_up(x); return x', // 9
    '    else: self.lc[y] = self.merge(x, self.lc[y]); self.push_up(y); return y', // 10
  ],
  javascript: [
    'function split(root, key) {', // 1
    '    if (!root) return [0, 0];', // 2
    '    if (val[root] <= key) { const [, r] = split(rc[root], key); rc[root] = r; return [root, r]; }', // 3
    '    else { const [l] = split(lc[root], key); lc[root] = l; return [l, root]; }', // 4
    '}', // 5
    'function merge(x, y) {', // 6
    '    if (!x || !y) return x + y;', // 7
    '    if (pri[x] < pri[y]) { rc[x] = merge(rc[x], y); pushUp(x); return x; }', // 8
    '    else { lc[y] = merge(x, lc[y]); pushUp(y); return y; }', // 9
    '}', // 10
  ],
};

export const FHQ_TREAP_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  splitVal:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  mergeHeap: { java: 9, cpp: 9, python: 9, javascript: 8 },
  returnAns: { java: 11, cpp: 11, python: 10, javascript: 10 },
};
