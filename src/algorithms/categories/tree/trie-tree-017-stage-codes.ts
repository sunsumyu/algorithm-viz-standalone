/**
 * Class 017: 前缀树多语言代码模板与行号索引
 * 包含动态指针版 (Stage 1 & 3) 与 静态连续数组版 (Stage 2)
 */

import { HighlightTarget } from '../../../core/step-visualizer';

export const TRIE_017_CODES = {
  java: `public class TrieTree {
    static class Node {
        int pass = 0, end = 0;
        Node[] nexts = new Node[26];
    }
    private Node root = new Node();

    public void insert(String word) {
        Node cur = root;
        cur.pass++;
        for (char c : word.toCharArray()) {
            int path = c - 'a';
            if (cur.nexts[path] == null) cur.nexts[path] = new Node();
            cur = cur.nexts[path];
            cur.pass++;
        }
        cur.end++;
    }

    public int search(String word) {
        Node cur = root;
        for (char c : word.toCharArray()) {
            int path = c - 'a';
            if (cur.nexts[path] == null) return 0;
            cur = cur.nexts[path];
        }
        return cur.end;
    }

    public int prefixNumber(String pre) {
        Node cur = root;
        for (char c : pre.toCharArray()) {
            int path = c - 'a';
            if (cur.nexts[path] == null) return 0;
            cur = cur.nexts[path];
        }
        return cur.pass;
    }
}`,
  cpp: `class TrieTree {
    struct Node {
        int pass = 0, end = 0;
        Node* nexts[26] = {nullptr};
    };
    Node* root = new Node();
public:
    void insert(const string& word) {
        Node* cur = root;
        cur->pass++;
        for (char c : word) {
            int path = c - 'a';
            if (!cur->nexts[path]) cur->nexts[path] = new Node();
            cur = cur->nexts[path];
            cur->pass++;
        }
        cur->end++;
    }
    int search(const string& word) {
        Node* cur = root;
        for (char c : word) {
            int path = c - 'a';
            if (!cur->nexts[path]) return 0;
            cur = cur->nexts[path];
        }
        return cur->end;
    }
    int prefixNumber(const string& pre) {
        Node* cur = root;
        for (char c : pre) {
            int path = c - 'a';
            if (!cur->nexts[path]) return 0;
            cur = cur->nexts[path];
        }
        return cur->pass;
    }
};`,
  python: `class TrieNode:
    def __init__(self):
        self.pass_cnt = 0
        self.end_cnt = 0
        self.nexts = {}

class TrieTree:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str):
        cur = self.root
        cur.pass_cnt += 1
        for c in word:
            if c not in cur.nexts:
                cur.nexts[c] = TrieNode()
            cur = cur.nexts[c]
            cur.pass_cnt += 1
        cur.end_cnt += 1

    def search(self, word: str) -> int:
        cur = self.root
        for c in word:
            if c not in cur.nexts:
                return 0
            cur = cur.nexts[c]
        return cur.end_cnt

    def prefix_number(self, pre: str) -> int:
        cur = self.root
        for c in pre:
            if c not in cur.nexts:
                return 0
            cur = cur.nexts[c]
        return cur.pass_cnt`,
  typescript: `export class TrieNode {
    pass = 0;
    end = 0;
    nexts: { [c: string]: TrieNode } = {};
}

export class TrieTree {
    root = new TrieNode();

    insert(word: string): void {
        let cur = this.root;
        cur.pass++;
        for (const c of word) {
            if (!cur.nexts[c]) cur.nexts[c] = new TrieNode();
            cur = cur.nexts[c];
            cur.pass++;
        }
        cur.end++;
    }

    search(word: string): number {
        let cur = this.root;
        for (const c of word) {
            if (!cur.nexts[c]) return 0;
            cur = cur.nexts[c];
        }
        return cur.end;
    }

    prefixNumber(pre: string): number {
        let cur = this.root;
        for (const c of pre) {
            if (!cur.nexts[c]) return 0;
            cur = cur.nexts[c];
        }
        return cur.pass;
    }
}`,
};

export const TRIE_017_CODE_LINES: Record<string, HighlightTarget> = {
  init: { java: 1, cpp: 1, python: 7, typescript: 6 },
  insertStart: { java: 8, cpp: 9, python: 11, typescript: 9 },
  insertAdvance: { java: 15, cpp: 15, python: 17, typescript: 14 },
  insertDone: { java: 17, cpp: 17, python: 18, typescript: 16 },
  searchStart: { java: 20, cpp: 19, python: 20, typescript: 19 },
  searchMiss: { java: 24, cpp: 23, python: 23, typescript: 22 },
  searchAdvance: { java: 25, cpp: 24, python: 24, typescript: 23 },
  searchDone: { java: 27, cpp: 26, python: 25, typescript: 25 },
  prefixStart: { java: 30, cpp: 28, python: 27, typescript: 28 },
  prefixMiss: { java: 34, cpp: 32, python: 30, typescript: 31 },
  prefixAdvance: { java: 35, cpp: 33, python: 31, typescript: 32 },
  prefixDone: { java: 37, cpp: 35, python: 32, typescript: 34 },
};

export const TRIE_STAGE2_STATIC_CODES = {
  java: `public class TrieTreeStatic {
    public static int MAXN = 100001;
    public static int[][] tree = new int[MAXN][26];
    public static int[] pass = new int[MAXN];
    public static int[] end = new int[MAXN];
    public static int cnt = 1;

    public static void clear() {
        for (int i = 1; i <= cnt; i++) {
            Arrays.fill(tree[i], 0);
            pass[i] = 0;
            end[i] = 0;
        }
        cnt = 1;
    }

    public static void insert(String word) {
        int cur = 1;
        pass[cur]++;
        for (char c : word.toCharArray()) {
            int path = c - 'a';
            if (tree[cur][path] == 0) {
                tree[cur][path] = ++cnt;
            }
            cur = tree[cur][path];
            pass[cur]++;
        }
        end[cur]++;
    }

    public static int search(String word) {
        int cur = 1;
        for (char c : word.toCharArray()) {
            int path = c - 'a';
            if (tree[cur][path] == 0) return 0;
            cur = tree[cur][path];
        }
        return end[cur];
    }

    public static int prefixNumber(String pre) {
        int cur = 1;
        for (char c : pre.toCharArray()) {
            int path = c - 'a';
            if (tree[cur][path] == 0) return 0;
            cur = tree[cur][path];
        }
        return pass[cur];
    }
}`,
  cpp: `class TrieStatic {
    static const int MAXN = 100005;
    int tree[MAXN][26] = {0};
    int pass[MAXN] = {0};
    int end[MAXN] = {0};
    int cnt = 1;
public:
    void clear() {
        for (int i = 1; i <= cnt; i++) {
            fill(tree[i], tree[i] + 26, 0);
            pass[i] = 0; end[i] = 0;
        }
        cnt = 1;
    }
    void insert(const string& word) {
        int cur = 1; pass[cur]++;
        for (char c : word) {
            int path = c - 'a';
            if (!tree[cur][path]) tree[cur][path] = ++cnt;
            cur = tree[cur][path];
            pass[cur]++;
        }
        end[cur]++;
    }
    int search(const string& word) {
        int cur = 1;
        for (char c : word) {
            int path = c - 'a';
            if (!tree[cur][path]) return 0;
            cur = tree[cur][path];
        }
        return end[cur];
    }
    int prefixNumber(const string& pre) {
        int cur = 1;
        for (char c : pre) {
            int path = c - 'a';
            if (!tree[cur][path]) return 0;
            cur = tree[cur][path];
        }
        return pass[cur];
    }
};`,
  python: `class TrieStatic:
    def __init__(self, max_n=100005):
        self.tree = [ [0] * 26 for _ in range(max_n) ]
        self.pass_cnt = [0] * max_n
        self.end_cnt = [0] * max_n
        self.cnt = 1

    def insert(self, word: str):
        cur = 1
        self.pass_cnt[cur] += 1
        for c in word:
            path = ord(c) - ord('a')
            if self.tree[cur][path] == 0:
                self.cnt += 1
                self.tree[cur][path] = self.cnt
            cur = self.tree[cur][path]
            self.pass_cnt[cur] += 1
        self.end_cnt[cur] += 1

    def search(self, word: str) -> int:
        cur = 1
        for c in word:
            path = ord(c) - ord('a')
            if self.tree[cur][path] == 0:
                return 0
            cur = self.tree[cur][path]
        return self.end_cnt[cur]

    def prefix_number(self, pre: str) -> int:
        cur = 1
        for c in pre:
            path = ord(c) - ord('a')
            if self.tree[cur][path] == 0:
                return 0
            cur = self.tree[cur][path]
        return self.pass_cnt[cur]`,
  typescript: `export class TrieStatic {
    private tree: number[][] = [];
    private pass: number[] = [];
    private end: number[] = [];
    private cnt = 1;

    constructor(maxN = 10000) {
        for (let i = 0; i < maxN; i++) {
            this.tree.push(new Array(26).fill(0));
            this.pass.push(0);
            this.end.push(0);
        }
    }

    insert(word: string): void {
        let cur = 1;
        this.pass[cur]++;
        for (let i = 0; i < word.length; i++) {
            const path = word.charCodeAt(i) - 97;
            if (this.tree[cur][path] === 0) {
                this.tree[cur][path] = ++this.cnt;
            }
            cur = this.tree[cur][path];
            this.pass[cur]++;
        }
        this.end[cur]++;
    }

    search(word: string): number {
        let cur = 1;
        for (let i = 0; i < word.length; i++) {
            const path = word.charCodeAt(i) - 97;
            if (this.tree[cur][path] === 0) return 0;
            cur = this.tree[cur][path];
        }
        return this.end[cur];
    }

    prefixNumber(pre: string): number {
        let cur = 1;
        for (let i = 0; i < pre.length; i++) {
            const path = pre.charCodeAt(i) - 97;
            if (this.tree[cur][path] === 0) return 0;
            cur = this.tree[cur][path];
        }
        return this.pass[cur];
    }
}`,
};

export const TRIE_STAGE2_CODE_LINES: Record<string, HighlightTarget> = {
  init: { java: 1, cpp: 1, python: 1, typescript: 1 },
  insertStart: { java: 18, cpp: 16, python: 8, typescript: 15 },
  insertAdvance: { java: 25, cpp: 21, python: 16, typescript: 22 },
  insertDone: { java: 27, cpp: 23, python: 17, typescript: 24 },
  searchStart: { java: 30, cpp: 25, python: 19, typescript: 27 },
  searchMiss: { java: 34, cpp: 29, python: 23, typescript: 31 },
  searchAdvance: { java: 35, cpp: 30, python: 24, typescript: 32 },
  searchDone: { java: 37, cpp: 32, python: 25, typescript: 34 },
  prefixStart: { java: 40, cpp: 34, python: 27, typescript: 37 },
  prefixMiss: { java: 44, cpp: 38, python: 31, typescript: 41 },
  prefixAdvance: { java: 45, cpp: 39, python: 32, typescript: 42 },
  prefixDone: { java: 47, cpp: 41, python: 33, typescript: 44 },
};
