/**
 * Class 105: 字符串哈希与滚动哈希 (Rolling Hash & 双哈希)
 * 洛谷 P3370 / LeetCode 187
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { STRING_HASH_CODES, STRING_HASH_LINES } from './string-100-105-stage-codes';
import {
  String100Step,
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';

export interface StringHashStep extends String100Step {
  s: string;
  n: number;
  hashArr: number[];
  queryL1: number;
  queryR1: number;
  queryL2: number;
  queryR2: number;
  hashVal1: number;
  hashVal2: number;
  isEqual: boolean;
}

export const BASE = 131n;
export const MOD = 1000000007n;

export function buildStringHashSteps(
  s: string,
  l1: number,
  r1: number,
  l2: number,
  r2: number
): StringHashStep[] {
  const steps: StringHashStep[] = [];
  const lines = STRING_HASH_LINES;
  const n = s.length;

  const h: bigint[] = new Array(n + 1).fill(0n);
  const power: bigint[] = new Array(n + 1).fill(1n);

  for (let i = 1; i <= n; i++) {
    power[i] = (power[i - 1] * BASE) % MOD;
    h[i] = (h[i - 1] * BASE + BigInt(s.charCodeAt(i - 1))) % MOD;
  }

  const hashArrNum = h.map(x => Number(x % 100000n)); // 压缩便于表格展示

  // Step 0: 入口
  steps.push({
    s,
    n,
    hashArr: hashArrNum,
    queryL1: l1,
    queryR1: r1,
    queryL2: l2,
    queryR2: r2,
    hashVal1: 0,
    hashVal2: 0,
    isEqual: false,
    decision: `主函数入口：接收字符串 s="${s}" (长 ${n})，准备比对两子串 s[${l1}..${r1}] 与 s[${l2}..${r2}] 是否相等`,
    message: '利用前缀哈希数组，将原本需要 O(L) 字符比对的时间降为 O(1) 算术运算',
    log: `enter stringHash(s="${s}")`,
    codeLine: lines.entry,
    metrics: { '字符串长': n, 'Base P': '131', '模数 MOD': '10^9+7' },
  });

  // Step 1: 展示前缀哈希表
  steps.push({
    s,
    n,
    hashArr: hashArrNum,
    queryL1: l1,
    queryR1: r1,
    queryL2: l2,
    queryR2: r2,
    hashVal1: 0,
    hashVal2: 0,
    isEqual: false,
    decision: `前缀哈希数组计算完成：H[i] = (H[i-1] * 131 + s[i]) % 10^9+7`,
    message: '任意区间的子串哈希可以通过 Hash(l..r) = H[r] - H[l-1] * P^(r-l+1) 瞬间提取',
    log: `prefix hash array generated`,
    codeLine: lines.calcHash,
    metrics: { '前缀项数': n + 1, '当前状态': '准备子串提取' },
  });

  // 辅助函数计算子串哈希 (1-based)
  const getHash = (left: number, right: number): bigint => {
    if (left > right || left < 1 || right > n) return 0n;
    let ans = (h[right] - (h[left - 1] * power[right - left + 1]) % MOD) % MOD;
    if (ans < 0n) ans += MOD;
    return ans;
  };

  const val1 = getHash(l1 + 1, r1 + 1);
  const val2 = getHash(l2 + 1, r2 + 1);
  const sub1 = s.slice(l1, r1 + 1);
  const sub2 = s.slice(l2, r2 + 1);

  // Step 2: 提取子串 1 哈希
  steps.push({
    s,
    n,
    hashArr: hashArrNum,
    queryL1: l1,
    queryR1: r1,
    queryL2: l2,
    queryR2: r2,
    hashVal1: Number(val1 % 10000000n),
    hashVal2: 0,
    isEqual: false,
    decision: `提取子串 1 哈希：s[${l1}..${r1}] ("${sub1}") ➔ Hash = ${val1}`,
    message: `利用公式计算: H[${r1 + 1}] - H[${l1}] * P^${r1 - l1 + 1} (mod MOD) = ${val1}`,
    log: `sub1 hash = ${val1}`,
    codeLine: lines.calcHash,
    metrics: { '子串 1 内容': `"${sub1}"`, '子串 1 哈希': `${val1}` },
    statusBadge: { text: `Sub1: ${val1}`, type: 'info' },
  });

  // Step 3: 提取子串 2 哈希
  steps.push({
    s,
    n,
    hashArr: hashArrNum,
    queryL1: l1,
    queryR1: r1,
    queryL2: l2,
    queryR2: r2,
    hashVal1: Number(val1 % 10000000n),
    hashVal2: Number(val2 % 10000000n),
    isEqual: false,
    decision: `提取子串 2 哈希：s[${l2}..${r2}] ("${sub2}") ➔ Hash = ${val2}`,
    message: `利用公式计算: H[${r2 + 1}] - H[${l2}] * P^${r2 - l2 + 1} (mod MOD) = ${val2}`,
    log: `sub2 hash = ${val2}`,
    codeLine: lines.calcHash,
    metrics: { '子串 2 内容': `"${sub2}"`, '子串 2 哈希': `${val2}` },
    statusBadge: { text: `Sub2: ${val2}`, type: 'info' },
  });

  // Step 4: 比对结论
  const isEqual = val1 === val2 && sub1 === sub2;
  steps.push({
    s,
    n,
    hashArr: hashArrNum,
    queryL1: l1,
    queryR1: r1,
    queryL2: l2,
    queryR2: r2,
    hashVal1: Number(val1 % 10000000n),
    hashVal2: Number(val2 % 10000000n),
    isEqual,
    decision: isEqual
      ? `🎉 O(1) 比对一致：Hash1 (${val1}) == Hash2 (${val2})！两子串完全相同 ("${sub1}")`
      : `❌ O(1) 比对不一致：Hash1 (${val1}) != Hash2 (${val2})！两子串不相同 ("${sub1}" != "${sub2}")`,
    message: isEqual ? '常数时间哈希判定命中，子串完全匹配！' : '哈希值不同，子串必定不相等',
    log: `compare result: ${isEqual}`,
    codeLine: lines.returnAns,
    metrics: { '比对结果': isEqual ? '完全相同 (true)' : '不相同 (false)' },
    statusBadge: isEqual ? { text: '子串相同 ✓', type: 'success' } : { text: '子串不同 ✗', type: 'danger' },
  });

  return steps;
}

export const stringHashVisualizer = registerDeclarativeAlgorithm<StringHashStep>({
  id: 'string-hash',
  name: '字符串哈希与滚动哈希 (Class 105)',
  category: 'string',
  icon: '🗝️',
  difficulty: 2,
  levelOrder: 105,
  learningGoal: '掌握 P 进制字符串哈希与前缀累加模型，学会利用乘方差分在 O(1) 常数时间内精确提取并比对任意子串',
  problemHtml: STRING_100_105_PROBLEMS.stringHash.html,
  analysisHtml: STRING_100_105_PROBLEMS.stringHash.html,
  inputs: [
    {
      id: 's',
      label: '输入字符串 (s)',
      type: 'text',
      defaultValue: 'abcdeabcf',
      placeholder: '请输入字符串',
    },
    {
      id: 'range1',
      label: '子串 1 范围 (l1,r1 从0开始)',
      type: 'text',
      defaultValue: '0,2',
      placeholder: '如 0,2 代表 s[0..2]',
    },
    {
      id: 'range2',
      label: '子串 2 范围 (l2,r2 从0开始)',
      type: 'text',
      defaultValue: '5,7',
      placeholder: '如 5,7 代表 s[5..7]',
    },
  ],
  codeLanguages: STRING_HASH_CODES,
  generateSteps: (input) => {
    const s = String(input.s || 'abcdeabcf');
    const [l1, r1] = String(input.range1 || '0,2').split(',').map(Number);
    const [l2, r2] = String(input.range2 || '5,7').split(',').map(Number);
    return buildStringHashSteps(s, l1 ?? 0, r1 ?? 2, l2 ?? 5, r2 ?? 7);
  },
  renderCanvas: (container, step) => {
    const sub1Indices: number[] = [];
    for (let k = step.queryL1; k <= step.queryR1 && k < step.n; k++) sub1Indices.push(k);
    const sub2Indices: number[] = [];
    for (let k = step.queryL2; k <= step.queryR2 && k < step.n; k++) sub2Indices.push(k);

    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCharSequence(
          '字符串与子串 1 高亮 [l1..r1]',
          step.s,
          -1,
          sub1Indices,
          [],
          -1,
          ''
        )}

        ${renderCharSequence(
          '字符串与子串 2 高亮 [l2..r2]',
          step.s,
          -1,
          sub2Indices,
          [],
          -1,
          ''
        )}

        ${renderAuxArrayTable('前缀哈希模数截取 H[i] (Base=131, Mod=10^9+7)', '∅' + step.s, step.hashArr, -1, 'H[i]')}

        ${renderFormulaCard(
          'O(1) 子串哈希提取公式',
          `Hash(l..r) = (H[r] - H[l-1] * P^(r-l+1)) % MOD | Hash1: ${step.hashVal1} | Hash2: ${step.hashVal2}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
