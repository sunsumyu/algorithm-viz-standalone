/**
 * 2-SAT 问题与强连通缩点 (2-Satisfiability Problem - Tarjan SCC) 声明式可视化器
 * 进阶图论: 逻辑子句 (a ∨ b) 转蕴涵有向边 (¬a ➔ b ∧ ¬b ➔ a)、Tarjan SCC 拓扑染色判定 (洛谷 P4782)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行执行与多状态数组 (dfn, low, scc, inStack, stack) 联动
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TWO_SAT_CODE_LANGUAGES,
  TWO_SAT_PROBLEM_HTML,
  TWO_SAT_ANALYSIS_HTML,
} from './two-sat-problem-content';

export interface TwoSATStep {
  curClause: string;
  sccGroup: Record<string, number>;
  isSatisfiable: boolean;
  chosenLiterals: string[];
  activeNode?: string;
  activeEdge?: [string, string];
  stack?: string[];
  dfnArray: number[];
  lowArray: number[];
  sccArray: number[];
  inStackArray: boolean[];
  activeArray?: 'dfn' | 'low' | 'scc' | 'inStack';
  activeSlot?: number;
  status: 'imply' | 'tarjan' | 'check' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildTwoSATSteps(preset: string = 'satisfiable'): TwoSATStep[] {
  const steps: TwoSATStep[] = [];
  const n = 2; // 两个变量 x1, x2，对应 4 个字面量节点: 1: x1, 2: ¬x1, 3: x2, 4: ¬x2
  const isSatisfiableTarget = preset !== 'unsatisfiable';

  const nodeName = (id: number): string => {
    switch (id) {
      case 1: return 'x1';
      case 2: return '¬x1';
      case 3: return 'x2';
      case 4: return '¬x2';
      default: return String(id);
    }
  };

  // 状态数组 (1-based, 大小为 5)
  const dfn = [0, 0, 0, 0, 0];
  const low = [0, 0, 0, 0, 0];
  const scc = [0, 0, 0, 0, 0];
  const inStack = [false, false, false, false, false];
  const stack: number[] = [];

  let dfnCnt = 0;
  let sccCnt = 0;

  // 邻接表
  const adj: number[][] = [[], [], [], [], []];

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'imply' | 'tarjan' | 'check' | 'done',
    curClause: string = '',
    activeNode?: string,
    activeEdge?: [string, string],
    activeArray?: 'dfn' | 'low' | 'scc' | 'inStack',
    activeSlot?: number,
    chosenLiterals: string[] = []
  ): void {
    const sccGroup: Record<string, number> = {
      x1: scc[1],
      '¬x1': scc[2],
      x2: scc[3],
      '¬x2': scc[4],
    };

    const statusStr =
      status === 'done'
        ? isSatisfiableTarget
          ? '✓ 逻辑满足 (SAT)'
          : '❌ 存在矛盾 (UNSAT)'
        : '检测中...';

    const assignStr =
      chosenLiterals.length > 0 ? chosenLiterals.join(', ') : '未确定';

    steps.push({
      curClause,
      sccGroup,
      isSatisfiable: isSatisfiableTarget,
      chosenLiterals,
      activeNode,
      activeEdge,
      stack: stack.map(nodeName),
      dfnArray: [...dfn],
      lowArray: [...low],
      sccArray: [...scc],
      inStackArray: [...inStack],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-sat-status': statusStr,
        'metric-sat-assign': assignStr,
        'metric-cur-clause': curClause || '—',
        'metric-scc-count': `${sccCnt} 个`,
      },
    });
  }

  // ==================== 1. 初始化 ====================
  // 行 14: init(num)
  makeStep(14, '🚀 [算法初始化] init(num=2)：准备求解 2-SAT 问题，布尔变量集 {x1, x2}。', 'init(2)', 'imply');

  // 行 15: n = num;
  makeStep(15, '📌 [赋值变量数] n = 2; 对应 4 个文字实体：x1 (1), ¬x1 (2), x2 (3), ¬x2 (4)。', 'n = 2', 'imply');

  // 行 16: dfnCnt = 0;
  makeStep(16, '📌 [重置时间戳] dfnCnt = 0; Tarjan DFS 访问时间戳归零。', 'dfnCnt = 0', 'imply');

  // 行 17: sccCnt = 0;
  makeStep(17, '📌 [重置连通块计数] sccCnt = 0; 强连通分量计数归零。', 'sccCnt = 0', 'imply');

  // 行 18: adj = new ArrayList<>();
  makeStep(18, '📐 [初始化邻接表] adj = new ArrayList<>(); 分配有向蕴涵图结构。', 'adj = new ArrayList<>()', 'imply');

  // 行 19: for (int i = 0; i <= 2 * n; i++) adj.add(new ArrayList<>());
  makeStep(19, '📐 [创建 4 节点链表] 为 2*n=4 个字面量节点分别分配邻接链表。', '创建 4 个节点的边表', 'imply');

  // 行 20: dfn = new int[2 * n + 1];
  makeStep(20, '📊 [分配 dfn 数组] dfn = new int[5]; 分配 DFS 时间戳表。', 'dfn 数组初始化', 'imply', '', undefined, undefined, 'dfn');

  // 行 21: low = new int[2 * n + 1];
  makeStep(21, '📊 [分配 low 数组] low = new int[5]; 分配能追溯到的最早祖先时间戳表。', 'low 数组初始化', 'imply', '', undefined, undefined, 'low');

  // 行 22: scc = new int[2 * n + 1];
  makeStep(22, '📊 [分配 scc 数组] scc = new int[5]; 分配所属强连通分量编号表。', 'scc 数组初始化', 'imply', '', undefined, undefined, 'scc');

  // 行 23: inStack = new boolean[2 * n + 1];
  makeStep(23, '📊 [分配 inStack 数组] inStack = new boolean[5]; 分配栈内标记表。', 'inStack 数组初始化', 'imply', '', undefined, undefined, 'inStack');

  // 行 24: st.clear();
  makeStep(24, '📦 [清空辅助栈] st.clear(); Tarjan 递归回溯栈置空。', 'st.clear()', 'imply');

  // ==================== 2. 子句转化与蕴涵边添加 ====================
  // 定义子句
  const clauses = isSatisfiableTarget
    ? [
        { u: 1, valU: 1, v: 2, valV: 1, text: '(x1 ∨ x2)' },
        { u: 1, valU: 0, v: 2, valV: 1, text: '(¬x1 ∨ x2)' },
        { u: 1, valU: 0, v: 2, valV: 0, text: '(¬x1 ∨ ¬x2)' },
      ]
    : [
        { u: 1, valU: 1, v: 2, valV: 1, text: '(x1 ∨ x2)' },
        { u: 1, valU: 1, v: 2, valV: 0, text: '(x1 ∨ ¬x2)' },
        { u: 1, valU: 0, v: 2, valV: 1, text: '(¬x1 ∨ x2)' },
        { u: 1, valU: 0, v: 2, valV: 0, text: '(¬x1 ∨ ¬x2)' },
      ];

  for (const c of clauses) {
    // 行 28: addClause
    makeStep(28, `🔗 [添加子句] addClause: 载入逻辑约束子句 ${c.text}。`, `addClause ${c.text}`, 'imply', c.text);

    // 行 29-32: 计算字面量编号
    const nodeU = c.valU === 1 ? 1 : 2;
    const notU = c.valU === 1 ? 2 : 1;
    const nodeV = c.valV === 1 ? 3 : 4;
    const notV = c.valV === 1 ? 4 : 3;

    makeStep([29, 32], `🔢 [字面量编码] 正文字=${nodeName(nodeU)}, 逆文字=${nodeName(notU)} | 正文字=${nodeName(nodeV)}, 逆文字=${nodeName(notV)}。`, `编码: ${c.text}`, 'imply', c.text);

    // 行 33: adj.get(notU).add(nodeV); // ~u -> v
    adj[notU].push(nodeV);
    makeStep(33, `✏️ [蕴涵边 1] adj.get(${nodeName(notU)}).add(${nodeName(nodeV)}); 逻辑若 ${nodeName(notU)} 为真则 ${nodeName(nodeV)} 必为真。`, `蕴涵边: ${nodeName(notU)} ➔ ${nodeName(nodeV)}`, 'imply', c.text, nodeName(notU), [nodeName(notU), nodeName(nodeV)]);

    // 行 34: adj.get(notV).add(nodeU); // ~v -> u
    adj[notV].push(nodeU);
    makeStep(34, `✏️ [蕴涵边 2] adj.get(${nodeName(notV)}).add(${nodeName(nodeU)}); 逆否命题若 ${nodeName(notV)} 为真则 ${nodeName(nodeU)} 必为真。`, `蕴涵边: ${nodeName(notV)} ➔ ${nodeName(nodeU)}`, 'imply', c.text, nodeName(notV), [nodeName(notV), nodeName(nodeU)]);
  }

  // ==================== 3. Tarjan 算法执行 ====================
  // 行 62: solve()
  makeStep(62, '⚡ [启动求解] solve(): 开始执行 Tarjan 算法求所有强连通分量 (SCC)。', 'solve() 入口', 'tarjan');

  function runTarjan(u: number): void {
    // 行 38: tarjan(u)
    makeStep(38, `🎯 [访问节点] tarjan(${nodeName(u)}): 开始对节点 ${nodeName(u)} 进行深度优先搜索。`, `tarjan(${nodeName(u)})`, 'tarjan', '', nodeName(u));

    // 行 39: dfn[u] = low[u] = ++dfnCnt;
    dfnCnt++;
    dfn[u] = dfnCnt;
    low[u] = dfnCnt;
    makeStep(39, `⏱️ [打时间戳] dfn[${nodeName(u)}] = low[${nodeName(u)}] = ${dfnCnt}; 分配访问序号。`, `dfn[${nodeName(u)}]=low[${nodeName(u)}]=${dfnCnt}`, 'tarjan', '', nodeName(u), undefined, 'dfn', u);

    // 行 40: st.push(u);
    stack.push(u);
    makeStep(40, `📥 [压入辅助栈] st.push(${nodeName(u)}); 当前栈中元素: [${stack.map(nodeName).join(', ')}]。`, `st.push(${nodeName(u)})`, 'tarjan', '', nodeName(u));

    // 行 41: inStack[u] = true;
    inStack[u] = true;
    makeStep(41, `🔒 [入栈标记] inStack[${nodeName(u)}] = true; 标记节点在栈中。`, `inStack[${nodeName(u)}]=true`, 'tarjan', '', nodeName(u), undefined, 'inStack', u);

    // 行 42: for (int v : adj.get(u))
    makeStep(42, `📡 [扫描出边] 遍历节点 ${nodeName(u)} 的所有出边: [${adj[u].map(nodeName).join(', ')}]。`, `遍历 ${nodeName(u)} 邻居`, 'tarjan', '', nodeName(u));

    for (const v of adj[u]) {
      // 行 43: if (dfn[v] == 0)
      makeStep(43, `🔍 [检查后继] 检查节点 ${nodeName(v)}: dfn[${nodeName(v)}] == ${dfn[v]} (${dfn[v] === 0 ? '未访问，进入递归' : '已访问'})。`, `检查出边 ${nodeName(u)} ➔ ${nodeName(v)}`, 'tarjan', '', nodeName(u), [nodeName(u), nodeName(v)]);

      if (dfn[v] === 0) {
        // 行 44: tarjan(v);
        runTarjan(v);

        // 行 45: low[u] = Math.min(low[u], low[v]);
        const oldLow = low[u];
        low[u] = Math.min(low[u], low[v]);
        makeStep(45, `🔄 [回溯更新 low] 从 ${nodeName(v)} 回溯到 ${nodeName(u)}: low[${nodeName(u)}] = min(${oldLow}, ${low[v]}) = ${low[u]}。`, `low[${nodeName(u)}] 更新为 ${low[u]}`, 'tarjan', '', nodeName(u), undefined, 'low', u);
      } else if (inStack[v]) {
        // 行 46-47: low[u] = Math.min(low[u], dfn[v]);
        const oldLow = low[u];
        low[u] = Math.min(low[u], dfn[v]);
        makeStep([46, 47], `🔄 [返祖边更新 low] 发现栈中祖先 ${nodeName(v)}: low[${nodeName(u)}] = min(${oldLow}, dfn[${nodeName(v)}]=${dfn[v]}) = ${low[u]}。`, `返祖边 low[${nodeName(u)}] = ${low[u]}`, 'tarjan', '', nodeName(u), [nodeName(u), nodeName(v)], 'low', u);
      }
    }

    // 行 50: if (dfn[u] == low[u])
    makeStep(50, `⚖️ [判定强连通根] 检查 ${nodeName(u)}: dfn[${dfn[u]}] == low[${low[u]}] (${dfn[u] === low[u] ? '是强连通根，开始弹栈缩点' : '不是根，继续回溯'})。`, `判断根: ${nodeName(u)}`, 'tarjan', '', nodeName(u));

    if (dfn[u] === low[u]) {
      // 行 51: sccCnt++;
      sccCnt++;
      makeStep(51, `🏷️ [新建连通块] sccCnt = ${sccCnt}; 发现新的强连通分量 SCC #${sccCnt}！`, `sccCnt = ${sccCnt}`, 'tarjan', '', nodeName(u));

      // 行 52: while (true)
      while (true) {
        // 行 53: int top = st.pop();
        const top = stack.pop()!;
        // 行 54: inStack[top] = false;
        inStack[top] = false;
        // 行 55: scc[top] = sccCnt;
        scc[top] = sccCnt;
        makeStep([53, 55], `📤 [弹栈缩点] 弹出节点 ${nodeName(top)}，赋值所属连通分量: scc[${nodeName(top)}] = ${sccCnt}。`, `scc[${nodeName(top)}] = ${sccCnt}`, 'tarjan', '', nodeName(top), undefined, 'scc', top);

        // 行 56: if (top == u) break;
        if (top === u) {
          makeStep(56, `✓ [强连通分量闭合] 节点 ${nodeName(u)} 已弹空，SCC #${sccCnt} 形成完毕。`, `SCC #${sccCnt} 收集完成`, 'tarjan', '', nodeName(u));
          break;
        }
      }
    }
  }

  // 行 63: for (int i = 1; i <= 2 * n; i++)
  for (let i = 1; i <= 4; i++) {
    // 行 64: if (dfn[i] == 0) tarjan(i);
    makeStep(63, `🔍 [外层扫描] 检查节点 ${nodeName(i)} (索引 ${i}) 是否已访问。`, `外层遍历节点 ${nodeName(i)}`, 'tarjan', '', nodeName(i));
    if (dfn[i] === 0) {
      makeStep(64, `⚡ [发起 DFS] dfn[${nodeName(i)}] == 0，从 ${nodeName(i)} 发起 Tarjan 搜索。`, `tarjan(${nodeName(i)}) 启动`, 'tarjan', '', nodeName(i));
      runTarjan(i);
    }
  }

  // ==================== 4. 矛盾检测与解构造 ====================
  // 行 66: for (int i = 1; i <= n; i++)
  makeStep(66, '🔎 [开始矛盾检测] 遍历每个布尔变量 x_i，检查其真假两状态是否落在同一强连通分量。', '检查变量冲突', 'check');

  const chosenLiterals: string[] = [];
  let hasConflict = false;

  for (let i = 1; i <= n; i++) {
    const trueNode = 2 * i - 1;
    const falseNode = 2 * i;

    // 行 67-68:
    makeStep([67, 68], `📌 [定位变量 ${i}] 变量 x${i}: 正状态 ${nodeName(trueNode)} (scc=${scc[trueNode]}), 负状态 ${nodeName(falseNode)} (scc=${scc[falseNode]})。`, `检验 x${i}`, 'check', '', `x${i}`);

    // 行 69: if (scc[trueNode] == scc[falseNode])
    makeStep(69, `⚖️ [冲突判定] 检查: scc[${nodeName(trueNode)}]=${scc[trueNode]} == scc[${nodeName(falseNode)}]=${scc[falseNode]}?`, `冲突检验 x${i}`, 'check', '', `x${i}`, undefined, 'scc', trueNode);

    if (scc[trueNode] === scc[falseNode]) {
      // 行 70: return false;
      hasConflict = true;
      makeStep(70, `❌ [发现致命矛盾] 变量 x${i} 的真状态与假状态同在 SCC #${scc[trueNode]}，互为充分必要条件，无解！返回 false！`, `x${i} 存在环路矛盾，return false;`, 'done', '', `x${i}`, undefined, undefined, undefined, []);
      break;
    }

    // 行 73: assignment[i] = scc[trueNode] < scc[falseNode] ? 1 : 0;
    const assignVal = scc[trueNode] < scc[falseNode] ? 1 : 0;
    const assignText = assignVal === 1 ? `x${i} = True (1)` : `x${i} = False (0)`;
    chosenLiterals.push(assignText);
    makeStep(73, `✅ [拓扑赋值] scc[${nodeName(trueNode)}]=${scc[trueNode]} ${scc[trueNode] < scc[falseNode] ? '<' : '>'} scc[${nodeName(falseNode)}]=${scc[falseNode]} -> 赋值 ${assignText}！`, `赋予解: ${assignText}`, 'check', '', `x${i}`, undefined, undefined, undefined, [...chosenLiterals]);
  }

  if (!hasConflict) {
    // 行 75: return true;
    makeStep(75, `🎉 [求解成功] 2-SAT 问题成功求得合法解向量：[${chosenLiterals.join(', ')}]！返回 true！`, 'solve -> true', 'done', '', undefined, undefined, undefined, undefined, [...chosenLiterals]);
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TwoSATStep>({
  id: 'two-sat-problem',
  name: '2-SAT 问题 (Two-Satisfiability)',
  category: 'graph',
  icon: '🔀',
  badge: {
    mode: 'Tarjan SCC + 拓扑赋值',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🔀 2-SAT 蕴涵有向图与强连通缩点沙盘',
  card2Title: '📊 Tarjan 多数组 (dfn, low, scc, inStack) 实时监控器',
  card2Desc: '逐行对齐 Tarjan 缩点与 2-SAT 求解指令，实时跟踪时间戳 dfn[]、祖先回溯 low[] 与 SCC 分量编号',
  legend: [
    { label: '布尔正文字 (True)', color: '#38bdf8' },
    { label: '布尔逆文字 (False)', color: '#f43f5e' },
    { label: '⭐ 当前活跃节点', color: '#f59e0b' },
    { label: '🔴 蕴涵有向边', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '子句系统模式',
      type: 'select',
      defaultValue: 'satisfiable',
      options: [
        { label: '可满足子句集 (SAT 解: x1=0, x2=1)', value: 'satisfiable' },
        { label: '全约束矛盾子句集 (UNSAT 强连通环路冲突)', value: 'unsatisfiable' },
      ],
    },
  ],
  presets: [
    { label: '可满足子句集', values: { 'input-preset': 'satisfiable' } },
    { label: '全约束矛盾子句集', values: { 'input-preset': 'unsatisfiable' } },
  ],
  metrics: [
    { id: 'metric-sat-status', label: '2-SAT 判定状态', color: '#10b981' },
    { id: 'metric-sat-assign', label: '当前求得赋值解', color: '#38bdf8' },
    { id: 'metric-cur-clause', label: '当前聚焦子句/边', color: '#f59e0b' },
    { id: 'metric-scc-count', label: '已发现 SCC 数量', color: '#a855f7' },
  ],
  codeLanguages: TWO_SAT_CODE_LANGUAGES,
  problemHtml: TWO_SAT_PROBLEM_HTML,
  analysisHtml: TWO_SAT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'satisfiable') as string;
    return buildTwoSATSteps(preset);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      x1: { x: 75, y: 55 },
      '¬x1': { x: 75, y: 155 },
      x2: { x: 235, y: 55 },
      '¬x2': { x: 235, y: 155 },
    };

    const edges: Array<[string, string]> = [
      ['¬x1', 'x2'],
      ['¬x2', 'x1'],
      ['x1', 'x2'],
      ['¬x2', '¬x1'],
      ['x1', '¬x2'],
      ['x2', '¬x1'],
      ['x1', 'x2'],
      ['¬x2', '¬x1'],
    ];

    const svgEdges = edges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';
        const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const color = isAct ? '#f59e0b' : '#475569';
        const width = isAct ? 3 : 1.5;

        // 贝塞尔微弯曲线以防双向重叠
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const mx = (p1.x + p2.x) / 2 - dy * 0.12;
        const my = (p1.y + p2.y) / 2 + dx * 0.12;

        return `
          <g>
            <path d="M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}" fill="none" stroke="${color}" stroke-width="${width}" marker-end="url(#arrow)" />
          </g>
        `;
      })
      .join('');

    const nodes = ['x1', '¬x1', 'x2', '¬x2'];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.activeNode === u;
        const sccId = step.sccGroup[u] || 0;
        const isTrueLit = !u.startsWith('¬');
        const bg = isCur ? '#f59e0b' : sccId > 0 ? '#0f766e' : isTrueLit ? '#0369a1' : '#be123c';
        const border = isCur ? '#facc15' : sccId > 0 ? '#2dd4bf' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 3 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="9" font-weight="700" text-anchor="middle">SCC:${sccId > 0 ? `#${sccId}` : '未缩'}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          有向边为逻辑蕴涵关系 (~u ➔ v) | 同一变量 x_i 与 ¬x_i 同在强连通分量则 2-SAT 无解 (UNSAT)
        </div>
      </div>
    `;

    const root =
      container.closest('#algo-two-sat-problem-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (root) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = root.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监控器
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const labels = ['x1(1)', '¬x1(2)', 'x2(3)', '¬x2(4)'];
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
          const cells = [1, 2, 3, 4]
            .map((idx) => {
              const val = arr[idx];
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 42px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">${labels[idx - 1]}</span>
                <span style="line-height: 1.1;">${displayVal}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 90px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const dfnRow = renderRow('dfn[] (访问序)', step.dfnArray, 'dfn', '#38bdf8');
        const lowRow = renderRow('low[] (回溯祖先)', step.lowArray, 'low', '#f59e0b');
        const sccRow = renderRow('scc[] (分量号)', step.sccArray, 'scc', '#a855f7');
        const inStackRow = renderRow('inStack[] (在栈)', step.inStackArray, 'inStack', '#10b981');
        const stackStr = step.stack && step.stack.length > 0 ? step.stack.join(' ➔ ') : '空';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${dfnRow}
              ${lowRow}
              ${sccRow}
              ${inStackRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #94a3b8; font-size: 10px;">Tarjan 辅助栈 st:</span>
                <strong style="color: #38bdf8; font-family: monospace; font-size: 10px;">[ ${stackStr} ]</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #94a3b8; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'two-sat-problem',
  name: '2-SAT 问题 (Two-Satisfiability)',
  viewId: 'algo-two-sat-problem-view',
  category: 'graph',
  description: '进阶图论强连通应用：逻辑子句转蕴涵边、Tarjan 缩点判定与拓扑反序求可行解 (洛谷 P4782)',
  icon: '🔀',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 63,
  learningGoal: '掌握 2-SAT 问题转有向图建模方法、Tarjan SCC 缩点判定矛盾及解向量构造原理',
});

export { Visualizer as TwoSATVisualizer };
