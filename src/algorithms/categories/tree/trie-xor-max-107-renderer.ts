/**
 * Class 107: 01-Trie 与异或最大值 (01-Trie Max XOR)
 * LeetCode 421 / 洛谷 P4551
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface Trie107Step extends StepBase {
  nums: number[];
  curNum: number;
  curBit: number;
  expectedBit: number;
  actualBit: number;
  path: number[];
  curXor: number;
  globalMaxXor: number;
  trieSize: number;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

interface TrieNode {
  id: number;
  next: [number, number]; // [left(0), right(1)]
}

export const TRIE_XOR_CODES = {
  java: `public class Solution {
    static int[][] tree = new int[3000005][2];
    static int cnt = 1;
    public static void insert(int num) {
        int cur = 1;
        for (int i = 30; i >= 0; i--) {
            int path = (num >> i) & 1;
            if (tree[cur][path] == 0) {
                tree[cur][path] = ++cnt;
            }
            cur = tree[cur][path];
        }
    }
    public static int query(int num) {
        int cur = 1, ans = 0;
        for (int i = 30; i >= 0; i--) {
            int status = (num >> i) & 1;
            int want = status ^ 1;
            if (tree[cur][want] != 0) {
                ans |= (1 << i);
                cur = tree[cur][want];
            } else {
                cur = tree[cur][status];
            }
        }
        return ans;
    }
    public int findMaximumXOR(int[] nums) {
        cnt = 1;
        int max = 0;
        for (int x : nums) insert(x);
        for (int x : nums) max = Math.max(max, query(x));
        return max;
    }
}`,
  cpp: `class Solution {
    int tree[3000005][2];
    int cnt = 1;
public:
    void insert(int num) {
        int cur = 1;
        for (int i = 30; i >= 0; i--) {
            int path = (num >> i) & 1;
            if (!tree[cur][path]) tree[cur][path] = ++cnt;
            cur = tree[cur][path];
        }
    }
    int query(int num) {
        int cur = 1, ans = 0;
        for (int i = 30; i >= 0; i--) {
            int status = (num >> i) & 1;
            int want = status ^ 1;
            if (tree[cur][want]) {
                ans |= (1 << i);
                cur = tree[cur][want];
            } else {
                cur = tree[cur][status];
            }
        }
        return ans;
    }
    int findMaximumXOR(vector<int>& nums) {
        int ans = 0;
        for (int x : nums) insert(x);
        for (int x : nums) ans = max(ans, query(x));
        return ans;
    }
};`,
  python: `class Solution:
    def findMaximumXOR(self, nums: List[int]) -> int:
        tree = {}
        def insert(num: int):
            cur = tree
            for i in range(30, -1, -1):
                b = (num >> i) & 1
                if b not in cur:
                    cur[b] = {}
                cur = cur[b]
        def query(num: int) -> int:
            cur = tree
            ans = 0
            for i in range(30, -1, -1):
                b = (num >> i) & 1
                want = b ^ 1
                if want in cur:
                    ans |= (1 << i)
                    cur = cur[want]
                else:
                    cur = cur[b]
            return ans
        for x in nums: insert(x)
        return max(query(x) for x in nums)`,
  typescript: `export function findMaximumXOR(nums: number[]): number {
    const tree: number[][] = Array.from({ length: 300005 }, () => [0, 0]);
    let cnt = 1;
    function insert(num: number) {
        let cur = 1;
        for (let i = 30; i >= 0; i--) {
            const b = (num >> i) & 1;
            if (tree[cur][b] === 0) tree[cur][b] = ++cnt;
            cur = tree[cur][b];
        }
    }
    function query(num: number): number {
        let cur = 1, ans = 0;
        for (let i = 30; i >= 0; i--) {
            const b = (num >> i) & 1;
            const want = b ^ 1;
            if (tree[cur][want] !== 0) {
                ans |= (1 << i);
                cur = tree[cur][want];
            } else {
                cur = tree[cur][b];
            }
        }
        return ans;
    }
    for (const x of nums) insert(x);
    let max = 0;
    for (const x of nums) max = Math.max(max, query(x));
    return max;
}`
};

export function buildTrieXorMaxSteps(nums: number[], maxBit: number = 5): Trie107Step[] {
  const steps: Trie107Step[] = [];
  const nodes: TrieNode[] = [{ id: 1, next: [0, 0] }];
  let nodeCount = 1;

  // 1. 入口
  steps.push({
    nums,
    curNum: 0,
    curBit: -1,
    expectedBit: -1,
    actualBit: -1,
    path: [],
    curXor: 0,
    globalMaxXor: 0,
    trieSize: 1,
    decision: `算法入口：输入数组 [${nums.join(', ')}]，准备建立 01-Trie 前缀树并贪心求解两数最大异或和`,
    message: '核心原理：高位具有更高的权重 (2^i)，贪心优先保证最高位异或结果为 1',
    log: `init nums=[${nums.join(',')}]`,
    codeLine: 1,
    statusBadge: { text: '初始化', type: 'info' },
  });

  // 2. 插入所有数
  for (const num of nums) {
    let cur = 1;
    const path: number[] = [];
    for (let i = maxBit; i >= 0; i--) {
      const bit = (num >> i) & 1;
      path.push(bit);
      if (nodes[cur - 1].next[bit] === 0) {
        nodeCount++;
        nodes[cur - 1].next[bit] = nodeCount;
        nodes.push({ id: nodeCount, next: [0, 0] });
      }
      cur = nodes[cur - 1].next[bit];
    }
    steps.push({
      nums,
      curNum: num,
      curBit: -1,
      expectedBit: -1,
      actualBit: -1,
      path,
      curXor: 0,
      globalMaxXor: 0,
      trieSize: nodeCount,
      decision: `将数字 ${num} (二进制 0b${num.toString(2).padStart(maxBit + 1, '0')}) 插入 01-Trie`,
      message: `树当前共有 ${nodeCount} 个节点`,
      log: `insert(${num}) done`,
      codeLine: 5,
      statusBadge: { text: `插入 ${num}`, type: 'warning' },
    });
  }

  // 3. 对每个数查询最大异或值
  let globalMax = 0;
  for (const num of nums) {
    let cur = 1;
    let ans = 0;
    const queryPath: number[] = [];
    for (let i = maxBit; i >= 0; i--) {
      const status = (num >> i) & 1;
      const want = status ^ 1;
      let actual = status;
      if (nodes[cur - 1].next[want] !== 0) {
        ans |= (1 << i);
        actual = want;
        cur = nodes[cur - 1].next[want];
      } else {
        cur = nodes[cur - 1].next[status];
      }
      queryPath.push(actual);

      steps.push({
        nums,
        curNum: num,
        curBit: i,
        expectedBit: want,
        actualBit: actual,
        path: [...queryPath],
        curXor: ans,
        globalMaxXor: Math.max(globalMax, ans),
        trieSize: nodeCount,
        decision: `探查 ${num} 第 ${i} 位 (值为 ${status})：期望寻找对偶位 ${want}，实际匹配走向 ${actual} 分支`,
        message: actual === want ? `🎉 成功匹配对偶位，当前位异或贡献 2^${i} = ${1 << i}！` : `⚠️ 对偶位不存在，只能走向同值位，当前位贡献 0`,
        log: `query(${num}, bit=${i}) -> curXor=${ans}`,
        codeLine: 18,
        statusBadge: actual === want ? { text: `成功贪心匹配 +${1 << i}`, type: 'success' } : { text: '贪心失败', type: 'danger' },
      });
    }

    if (ans > globalMax) {
      globalMax = ans;
    }
    steps.push({
      nums,
      curNum: num,
      curBit: 0,
      expectedBit: -1,
      actualBit: -1,
      path: [...queryPath],
      curXor: ans,
      globalMaxXor: globalMax,
      trieSize: nodeCount,
      decision: `数字 ${num} 探查完毕，其最佳对偶伙伴产生的异或值为 ${ans}`,
      message: `当前全局最大异或和更新为: ${globalMax}`,
      log: `maxSoFar = ${globalMax}`,
      codeLine: 29,
      statusBadge: { text: `最大异或: ${globalMax}`, type: 'success' },
    });
  }

  return steps;
}

export const trieXorMaxVisualizer = registerDeclarativeAlgorithm<Trie107Step>({
  id: 'trie-xor-max-107',
  name: '01-Trie 与异或最大值 (Class 107)',
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 107,
  learningGoal: '掌握 01-Trie 字典树对二进制数逐位构建、高位贪心走对偶分支达到 O(N * 32) 极速求最大异或和',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给你一个整数数组 <code>nums</code>，返回 <code>nums[i] XOR nums[j]</code> 的最大运算结果，其中 <code>0 <= i <= j < nums.length</code>。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>输入样例：</strong>nums = [3, 10, 5, 25, 2, 8]<br/>
        <strong>输出样例：</strong>28<br/>
        <strong>解释：</strong>5 XOR 25 = 28 为全局最大值。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '正整数序列 (逗号分隔)',
      type: 'text',
      defaultValue: '3, 10, 5, 25, 2, 8',
      placeholder: '请输入正整数列表',
    },
  ],
  codeLanguages: TRIE_XOR_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '3, 10, 5, 25, 2, 8');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildTrieXorMaxSteps(nums.length > 0 ? nums : [3, 10, 5, 25, 2, 8], 5);
  },
  renderCanvas: (container, step) => {
    const bitStr = step.curNum.toString(2).padStart(6, '0');
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- 顶部状态卡片 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前探测数字</div>
            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">${step.curNum} <span style="font-size: 12px; color: #94a3b8;">(0b${bitStr})</span></div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前探查二进制位</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.curBit >= 0 ? `第 ${step.curBit} 位 (权值 ${1 << step.curBit})` : '闲置'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前数累计异或值</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.curXor}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">全局最大异或值 Max</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.globalMaxXor}</div>
          </div>
        </div>

        <!-- 01-Trie 分支探测路径展示 -->
        <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
            🌲 01-Trie 对偶分支探查路径 (高位向低位贪心)
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${step.path.map((b, idx) => `
              <div style="display: flex; align-items: center; gap: 4px; background: #ffffff; border: 1px solid #94a3b8; border-radius: 6px; padding: 4px 10px;">
                <span style="font-size: 10px; color: #64748b;">位 ${5 - idx}:</span>
                <span style="font-size: 13px; font-weight: 700; color: ${b === 1 ? '#0284c7' : '#e11d48'};">走向分支 [${b}]</span>
              </div>
            `).join(' ➜ ')}
          </div>
        </div>

        <!-- 公式与决策解析卡片 -->
        ${renderFormulaCard(
          '01-Trie 贪心决策核心状态',
          `期望 want = status ^ 1 = ${step.expectedBit >= 0 ? step.expectedBit : 'N/A'} | 实际走向 branch = ${step.actualBit >= 0 ? step.actualBit : 'N/A'}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
