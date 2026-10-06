/**
 * Class 112: 权值线段树与单点更新 (Value Segment Tree) 步骤编译器
 * 洛谷 P1138 / P3369
 * 深模块核心编译器 (Deep Module)
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import { SegTreeNode } from '../../../algorithms/categories/tree/tree-108-116/segment-tree-renderer';

export interface ValueSegTreeStep extends StepBase {
  nodes: SegTreeNode[];
  activeNodeId: number;
  curOp: string;
  queryK: number;
  foundVal: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const VALUE_SEG_TREE_CODES = {
  java: `public class ValueSegmentTree {
    static int MAXN = 100005;
    static int[] tree = new int[MAXN << 2];

    public static void insert(int u, int l, int r, int val) {
        tree[u]++;
        if (l == r) return;
        int mid = (l + r) >> 1;
        if (val <= mid) insert(u << 1, l, mid, val);
        else insert(u << 1 | 1, mid + 1, r, val);
    }

    public static int queryKth(int u, int l, int r, int k) {
        if (l == r) return l;
        int mid = (l + r) >> 1;
        int leftCount = tree[u << 1];
        if (k <= leftCount) return queryKth(u << 1, l, mid, k);
        else return queryKth(u << 1 | 1, mid + 1, r, k - leftCount);
    }
}`,
  cpp: `class ValueSegmentTree {
    int tree[400005];
public:
    void insert(int u, int l, int r, int val) {
        tree[u]++;
        if (l == r) return;
        int mid = (l + r) / 2;
        if (val <= mid) insert(u * 2, l, mid, val);
        else insert(u * 2 + 1, mid + 1, r, val);
    }
    int queryKth(int u, int l, int r, int k) {
        if (l == r) return l;
        int mid = (l + r) / 2;
        int leftCnt = tree[u * 2];
        if (k <= leftCnt) return queryKth(u * 2, l, mid, k);
        else return queryKth(u * 2 + 1, mid + 1, r, k - leftCnt);
    }
};`,
  python: `class ValueSegmentTree:
    def __init__(self, max_val):
        self.max_val = max_val
        self.tree = [0] * (4 * (max_val + 1))

    def insert(self, u, l, r, val):
        self.tree[u] += 1
        if l == r: return
        mid = (l + r) // 2
        if val <= mid: self.insert(u * 2, l, mid, val)
        else: self.insert(u * 2 + 1, mid + 1, r, val)

    def query_kth(self, u, l, r, k):
        if l == r: return l
        mid = (l + r) // 2
        left_cnt = self.tree[u * 2]
        if k <= left_cnt: return self.query_kth(u * 2, l, mid, k)
        else: return self.query_kth(u * 2 + 1, mid + 1, r, k - left_cnt)`,
  typescript: `export class ValueSegmentTree {
    tree: number[] = new Array(4005).fill(0);
    insert(u: number, l: number, r: number, val: number): void {
        this.tree[u]++;
        if (l === r) return;
        const mid = Math.floor((l + r) / 2);
        if (val <= mid) this.insert(u * 2, l, mid, val);
        else this.insert(u * 2 + 1, mid + 1, r, val);
    }
    queryKth(u: number, l: number, r: number, k: number): number {
        if (l === r) return l;
        const mid = Math.floor((l + r) / 2);
        const leftCnt = this.tree[u * 2];
        if (k <= leftCnt) return this.queryKth(u * 2, l, mid, k);
        else return this.queryKth(u * 2 + 1, mid + 1, r, k - leftCnt);
    }
}`
};

export const VALUE_SEG_TREE_CODE_LINES: Record<string, HighlightTarget> = {
  init: { java: 1, cpp: 1, python: 1, typescript: 1 },
  insert: { java: 6, cpp: 5, python: 6, typescript: 4 },
  queryBranch: { java: 17, cpp: 15, python: 15, typescript: 13 },
  queryHit: { java: 14, cpp: 12, python: 14, typescript: 11 },
};

export function buildValueSegTreeSteps(
  nums: number[],
  queryK: number,
  maxDomain: number = 8
): ValueSegTreeStep[] {
  const steps: ValueSegTreeStep[] = [];
  const tree: number[] = new Array(4 * maxDomain + 10).fill(0);

  const getSnapshot = (activeId: number): SegTreeNode[] => {
    const list: SegTreeNode[] = [];
    const traverse = (u: number, l: number, r: number) => {
      list.push({ id: u, l, r, val: tree[u], lazy: 0 });
      if (l === r) return;
      const mid = Math.floor((l + r) / 2);
      traverse(u * 2, l, mid);
      traverse(u * 2 + 1, mid + 1, r);
    };
    traverse(1, 1, maxDomain);
    return list;
  };

  // 1. 入口
  steps.push({
    nodes: getSnapshot(1),
    activeNodeId: 1,
    curOp: '初始化',
    queryK,
    foundVal: -1,
    decision: `主函数入口：初始化权值线段树，值域范围 [1, ${maxDomain}]。准备依次插入元素 [${nums.join(', ')}]`,
    message: '权值线段树叶子节点表示数字的出现频次，内部节点记录权值区间的元素总计数',
    log: 'init ValueSegmentTree',
    codeLine: VALUE_SEG_TREE_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' },
  });

  // 2. 插入元素
  for (const num of nums) {
    let u = 1, l = 1, r = maxDomain;
    while (true) {
      tree[u]++;
      steps.push({
        nodes: getSnapshot(u),
        activeNodeId: u,
        curOp: `插入 ${num}`,
        queryK,
        foundVal: -1,
        decision: `插入数字 ${num}：节点 u=${u} 管理区间 [${l}, ${r}]，当前区间频次累加为 ${tree[u]}`,
        message: l === r ? `已到达叶子节点 [${l}, ${l}]，频次更新完毕` : `区间尚未收敛，继续向子树分流下潜`,
        log: `insert(${u}, [${l},${r}], ${num})`,
        codeLine: VALUE_SEG_TREE_CODE_LINES.insert,
        statusBadge: { text: `插入 ${num}`, type: 'warning' },
      });
      if (l === r) break;
      const mid = Math.floor((l + r) / 2);
      if (num <= mid) {
        u = u * 2;
        r = mid;
      } else {
        u = u * 2 + 1;
        l = mid + 1;
      }
    }
  }

  // 3. 查询第 K 小
  let u = 1, l = 1, r = maxDomain, k = queryK;
  while (l < r) {
    const mid = Math.floor((l + r) / 2);
    const leftCnt = tree[u * 2];
    steps.push({
      nodes: getSnapshot(u),
      activeNodeId: u,
      curOp: `查询第 ${queryK} 小`,
      queryK,
      foundVal: -1,
      decision: `查询第 ${k} 小：当前节点 u=${u} 区间 [${l}, ${r}]，左子树 [${l}, ${mid}] 频次总计 ${leftCnt}`,
      message: k <= leftCnt
        ? `目标 k=${k} <= 左子树频次 ${leftCnt}，答案必定落在左半区间 [${l}, ${mid}]！`
        : `目标 k=${k} > 左子树频次 ${leftCnt}，答案必定在右半区间，折抵左子树后查询右子树的第 ${k - leftCnt} 小！`,
      log: `queryKth(u=${u}, [${l},${r}], k=${k})`,
      codeLine: VALUE_SEG_TREE_CODE_LINES.queryBranch,
      statusBadge: { text: `下潜寻找第 ${k} 小`, type: 'info' },
    });

    if (k <= leftCnt) {
      u = u * 2;
      r = mid;
    } else {
      k -= leftCnt;
      u = u * 2 + 1;
      l = mid + 1;
    }
  }

  // 命中叶子节点
  steps.push({
    nodes: getSnapshot(u),
    activeNodeId: u,
    curOp: `查询完成`,
    queryK,
    foundVal: l,
    decision: `🎉 成功收敛至叶子节点 [${l}, ${l}]！全局第 ${queryK} 小的元素为: ${l}`,
    message: `权值二分搜索命中目标，时间复杂度严格 O(log(ValueRange))`,
    log: `return ${l}`,
    codeLine: VALUE_SEG_TREE_CODE_LINES.queryHit,
    statusBadge: { text: `第 ${queryK} 小 = ${l}`, type: 'success' },
  });

  return steps;
}
