/**
 * Class 112: 权值线段树与单点更新 (Value Segment Tree)
 * 洛谷 P1138 / P3369
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';
import { SegTreeNode } from './segment-tree-renderer';
import { renderSegmentTreeVisual } from './tree-108-116-shared';

export interface ValueSegTreeStep extends StepBase {
  nodes: SegTreeNode[];
  activeNodeId: number;
  curOp: string;
  queryK: number;
  foundVal: number;
  decision: string;
  message: string;
  log: string;
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
    codeLine: 1,
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
        codeLine: 7,
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
      codeLine: 18,
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
    codeLine: 24,
    statusBadge: { text: `第 ${queryK} 小 = ${l}`, type: 'success' },
  });

  return steps;
}

export const valueSegTreeVisualizer = registerDeclarativeAlgorithm<ValueSegTreeStep>({
  id: 'value-segment-tree-112',
  name: '权值线段树与单点更新 (Class 112)',
  category: 'tree',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 112,
  learningGoal: '深入掌握权值线段树对值域进行二分建树与单点插入，实现 O(log V) 查找动态集合中第 K 小元素',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给定一个动态正整数集合，支持插入数字与查询集合中全局第 <code>K</code> 小的数。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例：</strong>依次插入 [3, 1, 5, 2, 7, 3]，查询第 4 小的数。<br/>
        <strong>排序后：</strong>[1, 2, 3, 3, 5, 7]，第 4 小的数为 3。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '插入序列 (1~8 之间的正整数)',
      type: 'text',
      defaultValue: '3, 1, 5, 2, 7, 3',
      placeholder: '请输入正整数列表',
    },
    {
      id: 'k',
      label: '查询第 K 小 (K)',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 6,
    },
  ],
  codeLanguages: VALUE_SEG_TREE_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '3, 1, 5, 2, 7, 3');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const k = Math.max(1, parseInt(String(inputs.k || 4), 10));
    return buildValueSegTreeSteps(nums.length > 0 ? nums : [3, 1, 5, 2, 7, 3], k, 8);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前操作类型</div>
            <div style="font-size: 16px; font-weight: 700; color: #0284c7; margin-top: 4px;">${step.curOp}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">目标排名 (K)</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">第 ${step.queryK} 小</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前聚焦节点</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">节点 u=${step.activeNodeId}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">第 K 小最终结果</div>
            <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.foundVal >= 0 ? step.foundVal : '计算中...'}</div>
          </div>
        </div>

        <!-- 树形结构可视化 -->
        ${renderSegmentTreeVisual(step.nodes, step.activeNodeId)}

        <!-- 决策与公式卡片 -->
        ${renderFormulaCard(
          '权值二分判定准则',
          `if (k <= leftCount) u = u * 2; else { k -= leftCount; u = u * 2 + 1; }`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
