/**
 * 数字串翻译方案数(LeetCode 91)步进生成器
 *
 * 纯函数模块：不引用任何 DOM / 浏览器 API。
 * 提供两种生成器：
 * - buildRecursiveSteps：暴力递归 f1(char[] s, int i) 的事件流步骤 + 递归树结构
 * - buildDpSteps：一维 dp 从右往左填表的步骤（与递归自顶向下镜像）
 */

import type { StepBase } from '../../../core/step-visualizer';

/* ───────────────────────── 递归模式 ───────────────────────── */

export interface DecodeTreeNode {
  id: number;
  /** 父节点 id；根节点为 null */
  parentId: number | null;
  /** 该节点对应的递归参数 f(i) */
  i: number;
  depth: number;
  /** 回溯回填的返回值；未回填为 null */
  value: number | null;
  /** 同参数 i 第二次及以后的展开标记（重复子问题） */
  isRepeated: boolean;
  /** 预计算的布局坐标（叶子按序号均分，内部节点取子节点均值） */
  x: number;
  y: number;
}

export type DecodeRecEventType =
  | 'init'
  | 'call'
  | 'base-case'
  | 'dead-zero'
  | 'branch-1'
  | 'branch-2'
  | 'return'
  | 'done';

export interface TwoDigitCheck {
  /** 被尝试的两位数字切片，如 "26" */
  digits: string;
  /** 两位数的数值，如 26 */
  value: number;
  /** 是否满足 10 ≤ 值 ≤ 26 */
  ok: boolean;
  /** 不可用原因：'>26' 或 '越界'（i+1 超出串长） */
  reason?: string;
}

export interface DecodeRecStep extends StepBase {
  type: DecodeRecEventType;
  /** 事件目标节点 id */
  nodeId: number;
  i: number;
  depth: number;
  /** call 事件新增的节点（增量绘制用） */
  newNode?: DecodeTreeNode;
  /** 指向新节点的边；dead 判定（>26 / 越界）产生虚线悬挂边 */
  edge?: { fromId: number | null; label: string; dead: boolean };
  /** base-case / dead-zero / return / done 携带的返回值 */
  returnValue?: number;
  /** branch-2 事件的两位判定标注 */
  twoDigit?: TwoDigitCheck;
  /** 截至本步累计可见节点数（渲染器按 id 顺序增量绘制） */
  visibleCount: number;
  stats: { calls: number; repeats: number; twoDigitHits: number };
  /** done 事件携带最终答案 */
  answer?: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

export interface RecursiveResult {
  steps: DecodeRecStep[];
  /** 全部树节点（id 升序，含布局坐标与回填值） */
  nodes: DecodeTreeNode[];
  answer: number;
}

/** Java 递归版（与 spec 截图 f1 逐行一致；codeLine 为 1 起始行号） */
export const REC_JAVA_CODE = [
  '// s : 数字字符串',
  '// s[i....]有多少种有效的转化方案',
  'public static int f1(char[] s, int i) {',
  '    if (i == s.length) {',
  '        return 1;',
  '    }',
  '    int ans;',
  "    if (s[i] == '0') {",
  '        ans = 0;',
  '    } else {',
  '        ans = f1(s, i + 1);',
  "        if (i + 1 < s.length && ((s[i] - '0') * 10 + s[i + 1] - '0') <= 26) {",
  '            ans += f1(s, i + 2);',
  '        }',
  '    }',
  '    return ans;',
  '}',
];

/* ───────────────────────── DP 模式 ───────────────────────── */

export interface DecodeBranchInfo {
  key: 'one' | 'two';
  title: string;
  /** 分支是否可用；不可用时置灰 */
  ok: boolean;
  /** 不可用原因：'>26' | '越界' | "s[i]=='0'" */
  reason?: string;
  /** 依赖格下标 i+1 / i+2 */
  depIdx?: number;
  depValue?: number;
  formula?: string;
}

export interface DecodeDpStep extends StepBase {
  type: 'init' | 'compute' | 'zero' | 'done';
  /** 当前正在填的格（init 为 n） */
  i: number;
  /** 本步之后的 dp 数组快照 */
  dp: number[];
  /** 依赖格下标列表（取 1 位 / 取 2 位） */
  deps?: number[];
  formula?: string;
  formulaSubstituted?: string;
  branch1?: DecodeBranchInfo;
  branch2?: DecodeBranchInfo;
  /** 已填格数（含 dp[n] 边界） */
  filledCount: number;
  answer?: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

/** Java DP 迭代版（codeLine 为 1 起始行号） */
export const DP_JAVA_CODE = [
  'public static int numDecodings(String s) {',
  '    int n = s.length();',
  '    int[] dp = new int[n + 1];',
  '    dp[n] = 1; // 边界：空串一种方案',
  '    for (int i = n - 1; i >= 0; i--) {',
  "        if (s.charAt(i) == '0') {",
  "            dp[i] = 0; // '0' 不能单独翻译",
  '        } else {',
  '            dp[i] = dp[i + 1]; // 取 1 位',
  '            if (i + 1 < n && (s.charAt(i) - \'0\') * 10 + (s.charAt(i + 1) - \'0\') <= 26) {',
  '                dp[i] += dp[i + 2]; // 取 2 位',
  '            }',
  '        }',
  '    }',
  '    return dp[0];',
  '}',
];

/* ───────────────────────── 布局 ───────────────────────── */

const NODE_GAP = 78;
const LEVEL_HEIGHT = 92;
const MARGIN_X = 60;
const MARGIN_Y = 56;

interface LayoutNode {
  id: number;
  parentId: number | null;
  i: number;
  depth: number;
  value: number | null;
  isRepeated: boolean;
}

/** 叶子按序号均分横坐标，内部节点取子节点均值；y 按深度分层 */
function layoutTree(nodes: LayoutNode[]): DecodeTreeNode[] {
  const childrenOf = new Map<number, number[]>();
  nodes.forEach((n) => {
    if (n.parentId !== null) {
      const list = childrenOf.get(n.parentId) ?? [];
      list.push(n.id);
      childrenOf.set(n.parentId, list);
    }
  });

  let leafCursor = 0;
  const xOf = new Map<number, number>();

  // 后序遍历：先子后父
  const visit = (id: number): number => {
    const kids = childrenOf.get(id) ?? [];
    if (kids.length === 0) {
      const x = MARGIN_X + leafCursor * NODE_GAP;
      leafCursor++;
      xOf.set(id, x);
      return x;
    }
    const xs = kids.map(visit);
    const x = xs.reduce((a, b) => a + b, 0) / xs.length;
    xOf.set(id, x);
    return x;
  };
  if (nodes.length > 0) visit(nodes[0].id);

  return nodes.map((n) => ({
    ...n,
    x: xOf.get(n.id) ?? MARGIN_X,
    y: MARGIN_Y + n.depth * LEVEL_HEIGHT,
  }));
}

/* ───────────────────── 递归步进生成器 ───────────────────── */

export function buildRecursiveSteps(input: string): RecursiveResult {
  const s = input.split('');
  const n = s.length;
  const steps: DecodeRecStep[] = [];
  const rawNodes: LayoutNode[] = [];
  const seenParams = new Set<number>();
  let nodeSeq = 0;
  let visibleCount = 0;
  const stats = { calls: 0, repeats: 0, twoDigitHits: 0 };

  const push = (step: Omit<DecodeRecStep, 'stats' | 'visibleCount'>): void => {
    steps.push({ ...step, stats: { ...stats }, visibleCount });
  };

  push({
    type: 'init',
    nodeId: 0,
    i: 0,
    depth: 0,
    message: `初始化：数字串 "${input}"，从 f(0) 开始从左往右尝试翻译。`,
    log: `init s="${input}", start f(0)`,
    codeLine: 3,
  });

  const twoDigitCheck = (i: number): TwoDigitCheck | null => {
    if (i + 1 >= n) return { digits: '', value: -1, ok: false, reason: '越界' };
    const digits = input.slice(i, i + 2);
    const value = (s[i].charCodeAt(0) - 48) * 10 + (s[i + 1].charCodeAt(0) - 48);
    return { digits, value, ok: value >= 10 && value <= 26, reason: value > 26 ? '>26' : undefined };
  };

  function rec(i: number, parentId: number | null, depth: number, edgeLabel: string): number {
    stats.calls++;
    const isRepeated = seenParams.has(i);
    if (isRepeated) stats.repeats++;
    seenParams.add(i);

    const id = nodeSeq++;
    rawNodes.push({ id, parentId, i, depth, value: null, isRepeated });
    visibleCount++;
    push({
      type: 'call',
      nodeId: id,
      i,
      depth,
      newNode: { id, parentId, i, depth, value: null, isRepeated, x: 0, y: 0 },
      edge: parentId !== null ? { fromId: parentId, label: edgeLabel, dead: false } : undefined,
      message: isRepeated
        ? `f(${i}) 展开过，本次是重复子问题，仍需完整重算（暴力递归的代价）。`
        : `调用 f(${i})：子问题 "${input.slice(i)}" 有多少种翻译方案？`,
      log: `call f(${i})${isRepeated ? ' [重复子问题]' : ''}`,
      codeLine: 3,
    });

    // base case：i == n
    if (i === n) {
      rawNodes[id].value = 1;
      push({
        type: 'base-case',
        nodeId: id,
        i,
        depth,
        returnValue: 1,
        message: `i == ${n} 到达串尾，整个串成功切完，返回 1（一种方案）。`,
        log: `base-case f(${n}) = 1`,
        codeLine: [4, 5],
      });
      return 1;
    }

    // s[i] == '0'：死分支
    if (s[i] === '0') {
      rawNodes[id].value = 0;
      push({
        type: 'dead-zero',
        nodeId: id,
        i,
        depth,
        returnValue: 0,
        message: `s[${i}] == '0'，0 无法单独翻译也无法组两位（前一位已被拆走），返回 0。`,
        log: `dead-zero f(${i}) = 0`,
        codeLine: [8, 9],
      });
      return 0;
    }

    // 取 1 位 -> f(i+1)
    push({
      type: 'branch-1',
      nodeId: id,
      i,
      depth,
      message: `取 1 位 s[${i}]='${s[i]}'（${digitToLetter(s[i])}），递归 f(${i + 1})。`,
      log: `branch-1 f(${i}): take '${s[i]}' -> f(${i + 1})`,
      codeLine: 11,
    });
    let ans = rec(i + 1, id, depth + 1, `1位 ${s[i]}`);

    // 取 2 位判定
    const check = twoDigitCheck(i);
    if (check) {
      if (check.ok) {
        stats.twoDigitHits++;
        push({
          type: 'branch-2',
          nodeId: id,
          i,
          depth,
          twoDigit: check,
          message: `取 2 位 "${check.digits}" = ${check.value} ≤ 26 ✓（${twoDigitToLetters(input, i)}），可再递归 f(${i + 2})。`,
          log: `branch-2 f(${i}): take "${check.digits}"=${check.value} ✓ -> f(${i + 2})`,
          codeLine: [12, 13],
        });
        ans += rec(i + 2, id, depth + 1, `2位 ${check.digits}✓`);
      } else {
        push({
          type: 'branch-2',
          nodeId: id,
          i,
          depth,
          twoDigit: check,
          edge: { fromId: id, label: `2位 ${check.digits || '—'}✗ ${check.reason}`, dead: true },
          message:
            check.reason === '越界'
              ? `取 2 位越界：i+1 = ${i + 1} 已超出串长 ${n}，剪枝。`
              : `取 2 位 "${check.digits}" = ${check.value} > 26，无法翻译，剪枝。`,
          log: `branch-2 f(${i}): take "${check.digits || '—'}" ✗ ${check.reason}`,
          codeLine: 12,
        });
      }
    }

    // 回溯回填
    rawNodes[id].value = ans;
    push({
      type: 'return',
      nodeId: id,
      i,
      depth,
      returnValue: ans,
      message: `f(${i}) 回溯：${i === 0 ? `根调用完成，` : ''}返回 ${ans}。`,
      log: `return f(${i}) = ${ans}`,
      codeLine: 16,
    });
    return ans;
  }

  const answer = rec(0, null, 0, '');

  // 布局：预计算全部节点坐标；步骤里的 newNode 快照补上坐标
  const nodes = layoutTree(rawNodes);
  const byId = new Map(nodes.map((nd) => [nd.id, nd]));
  steps.forEach((st) => {
    if (st.newNode) {
      const laid = byId.get(st.newNode.id);
      if (laid) st.newNode = { ...laid };
    }
  });

  push({
    type: 'done',
    nodeId: -1,
    i: 0,
    depth: 0,
    returnValue: answer,
    answer,
    message: `✅ 完成："${input}" 共有 ${answer} 种翻译方案（递归与 DP 殊途同归）。`,
    log: `done: answer = ${answer}`,
    codeLine: 16,
  });

  return { steps, nodes, answer };
}

/* ───────────────────── DP 步进生成器 ───────────────────── */

export function buildDpSteps(input: string): { steps: DecodeDpStep[]; answer: number } {
  const s = input.split('');
  const n = s.length;
  const dp = new Array<number>(n + 1).fill(0);
  const steps: DecodeDpStep[] = [];

  dp[n] = 1;
  steps.push({
    type: 'init',
    i: n,
    dp: [...dp],
    filledCount: 1,
    message: `初始化：dp[${n}] = 1（空串一种方案），从右往左填表到 dp[0]。`,
    log: `init dp[${n}] = 1`,
    codeLine: 4,
  });

  for (let i = n - 1; i >= 0; i--) {
    const ch = s[i];
    if (ch === '0') {
      dp[i] = 0;
      steps.push({
        type: 'zero',
        i,
        dp: [...dp],
        filledCount: n - i + 1,
        formula: `dp[${i}] = 0`,
        formulaSubstituted: `s[${i}] = '0' → dp[${i}] = 0`,
        branch1: { key: 'one', title: `取 1 位 s[${i}]='0'`, ok: false, reason: "s[i]=='0'" },
        branch2: { key: 'two', title: `取 2 位 s[${i}..]`, ok: false, reason: "s[i]=='0'" },
        message: `s[${i}] = '0'：本位不可单独翻译，dp[${i}] = 0。`,
        log: `dp[${i}] = 0 ('0' 特判)`,
        codeLine: [6, 7],
      });
      continue;
    }

    const take1 = dp[i + 1];
    const twoDigits = i + 1 < n ? input.slice(i, i + 2) : '';
    const twoVal = i + 1 < n ? (ch.charCodeAt(0) - 48) * 10 + (s[i + 1].charCodeAt(0) - 48) : -1;
    const twoOk = i + 1 < n && twoVal >= 10 && twoVal <= 26;
    const take2 = twoOk ? dp[i + 2] : 0;

    dp[i] = take1 + take2;
    const deps = twoOk ? [i + 1, i + 2] : [i + 1];
    const formula = twoOk
      ? `dp[${i}] = dp[${i + 1}] + dp[${i + 2}]`
      : `dp[${i}] = dp[${i + 1}]`;
    const formulaSubstituted = twoOk
      ? `dp[${i}] = ${take1} + ${take2} = ${dp[i]}`
      : `dp[${i}] = ${take1}`;

    const branch1: DecodeBranchInfo = {
      key: 'one',
      title: `取 1 位 s[${i}]='${ch}'（${digitToLetter(ch)}）`,
      ok: true,
      depIdx: i + 1,
      depValue: take1,
      formula: `dp[${i + 1}] = ${take1}`,
    };
    const branch2: DecodeBranchInfo = twoOk
      ? {
          key: 'two',
          title: `取 2 位 "${twoDigits}" = ${twoVal} ✓（${twoDigitToLetters(input, i)}）`,
          ok: true,
          depIdx: i + 2,
          depValue: take2,
          formula: `dp[${i + 2}] = ${take2}`,
        }
      : {
          key: 'two',
          title: `取 2 位 ${twoDigits ? `"${twoDigits}" = ${twoVal}` : 's[i..i+1]'}`,
          ok: false,
          reason: i + 1 >= n ? '越界' : '>26',
        };

    steps.push({
      type: 'compute',
      i,
      dp: [...dp],
      deps,
      formula,
      formulaSubstituted,
      branch1,
      branch2,
      filledCount: n - i + 1,
      message: `计算 dp[${i}]：${formulaSubstituted}${twoOk ? '' : `（两位${branch2.reason === '越界' ? '越界' : `"${twoDigits}" > 26`}不可用）`}。`,
      log: `dp[${i}] = ${dp[i]}${twoOk ? ` (= dp[${i + 1}] + dp[${i + 2}])` : ''}`,
      codeLine: twoOk ? [9, 10, 11] : 9,
    });
  }

  const answer = dp[0];
  steps.push({
    type: 'done',
    i: 0,
    dp: [...dp],
    filledCount: n + 1,
    formula: `answer = dp[0]`,
    formulaSubstituted: `answer = dp[0] = ${answer}`,
    answer,
    message: `✅ 填表完成：dp[0] = ${answer}，即 "${input}" 共 ${answer} 种翻译方案。`,
    log: `done: dp[0] = ${answer}`,
    codeLine: 15,
  });

  return { steps, answer };
}

/* ───────────────────────── 辅助 ───────────────────────── */

function digitToLetter(d: string): string {
  const v = d.charCodeAt(0) - 48;
  return v >= 1 && v <= 26 ? String.fromCharCode(64 + v) : '?';
}

function twoDigitToLetters(input: string, i: number): string {
  const v = (input.charCodeAt(i) - 48) * 10 + (input.charCodeAt(i + 1) - 48);
  return v >= 1 && v <= 26 ? String.fromCharCode(64 + v) : '?';
}
