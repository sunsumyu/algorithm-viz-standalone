/**
 * 2-SAT 问题与强连通缩点 (2-Satisfiability Problem - Tarjan SCC) 步进编译器
 * 进阶图论: 逻辑子句 (a ∨ b) 转蕴涵有向边 (¬a ➔ b ∧ ¬b ➔ a)、Tarjan SCC 拓扑染色判定 (洛谷 P4782)
 * 遵循深模块架构规范：纯中文步骤日志、严谨状态捕获
 */

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
  makeStep(14, '🚀 [算法初始化] init(num=2)：准备求解 2-SAT 问题，布尔变量集 {x1, x2}。', '初始化 2-SAT 求解器 (n=2)', 'imply');

  // 行 15: n = num;
  makeStep(15, '📌 [赋值变量数] n = 2; 对应 4 个文字实体：x1 (1), ¬x1 (2), x2 (3), ¬x2 (4)。', '设置变量规模 n=2', 'imply');

  // 行 16: dfnCnt = 0;
  makeStep(16, '📌 [重置时间戳] dfnCnt = 0; Tarjan DFS 访问时间戳归零。', '重置访问时间戳计数 dfnCnt = 0', 'imply');

  // 行 17: sccCnt = 0;
  makeStep(17, '📌 [重置连通块计数] sccCnt = 0; 强连通分量计数归零。', '重置强连通分量计数 sccCnt = 0', 'imply');

  // 行 18: adj = new ArrayList<>();
  makeStep(18, '📐 [初始化邻接表] adj = new ArrayList<>(); 分配有向蕴涵图结构。', '初始化邻接表结构 adj', 'imply');

  // 行 19: for (int i = 0; i <= 2 * n; i++) adj.add(new ArrayList<>());
  makeStep(19, '📐 [创建 4 节点链表] 为 2*n=4 个字面量节点分别分配邻接链表。', '分配 4 个字面量节点的出边列表', 'imply');

  // 行 20: dfn = new int[2 * n + 1];
  makeStep(20, '📊 [分配 dfn 数组] dfn = new int[5]; 分配 DFS 时间戳表。', '初始化时间戳数组 dfn', 'imply', '', undefined, undefined, 'dfn');

  // 行 21: low = new int[2 * n + 1];
  makeStep(21, '📊 [分配 low 数组] low = new int[5]; 分配能追溯到的最早祖先时间戳表。', '初始化回溯祖先数组 low', 'imply', '', undefined, undefined, 'low');

  // 行 22: scc = new int[2 * n + 1];
  makeStep(22, '📊 [分配 scc 数组] scc = new int[5]; 分配所属强连通分量编号表。', '初始化强连通编号数组 scc', 'imply', '', undefined, undefined, 'scc');

  // 行 23: inStack = new boolean[2 * n + 1];
  makeStep(23, '📊 [分配 inStack 数组] inStack = new boolean[5]; 分配栈内标记表。', '初始化栈内存在标记数组 inStack', 'imply', '', undefined, undefined, 'inStack');

  // 行 24: st.clear();
  makeStep(24, '📦 [清空辅助栈] st.clear(); Tarjan 递归回溯栈置空。', '清空 Tarjan 辅助栈 st', 'imply');

  // ==================== 2. 子句转化与蕴涵边添加 ====================
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
    makeStep(28, `🔗 [添加子句] addClause: 载入逻辑约束子句 ${c.text}。`, `载入逻辑子句 ${c.text}`, 'imply', c.text);

    // 行 29-32: 计算字面量编号
    const nodeU = c.valU === 1 ? 1 : 2;
    const notU = c.valU === 1 ? 2 : 1;
    const nodeV = c.valV === 1 ? 3 : 4;
    const notV = c.valV === 1 ? 4 : 3;

    makeStep([29, 32], `🔢 [字面量编码] 正文字=${nodeName(nodeU)}, 逆文字=${nodeName(notU)} | 正文字=${nodeName(nodeV)}, 逆文字=${nodeName(notV)}。`, `字面量正负编码: ${c.text}`, 'imply', c.text);

    // 行 33: adj.get(notU).add(nodeV); // ~u -> v
    adj[notU].push(nodeV);
    makeStep(33, `✏️ [蕴涵边 1] adj.get(${nodeName(notU)}).add(${nodeName(nodeV)}); 逻辑若 ${nodeName(notU)} 为真则 ${nodeName(nodeV)} 必为真。`, `蕴涵边: ${nodeName(notU)} ➔ ${nodeName(nodeV)}`, 'imply', c.text, nodeName(notU), [nodeName(notU), nodeName(nodeV)]);

    // 行 34: adj.get(notV).add(nodeU); // ~v -> u
    adj[notV].push(nodeU);
    makeStep(34, `✏️ [蕴涵边 2] adj.get(${nodeName(notV)}).add(${nodeName(nodeU)}); 逆否命题若 ${nodeName(notV)} 为真则 ${nodeName(nodeU)} 必为真。`, `蕴涵边: ${nodeName(notV)} ➔ ${nodeName(nodeU)}`, 'imply', c.text, nodeName(notV), [nodeName(notV), nodeName(nodeU)]);
  }

  // ==================== 3. Tarjan 算法执行 ====================
  // 行 62: solve()
  makeStep(62, '⚡ [启动求解] solve(): 开始执行 Tarjan 算法求所有强连通分量 (SCC)。', '启动 2-SAT 求解流程', 'tarjan');

  function runTarjan(u: number): void {
    // 行 38: tarjan(u)
    makeStep(38, `🎯 [访问节点] tarjan(${nodeName(u)}): 开始对节点 ${nodeName(u)} 进行深度优先搜索。`, `访问节点 ${nodeName(u)} 开始 Tarjan 搜索`, 'tarjan', '', nodeName(u));

    // 行 39: dfn[u] = low[u] = ++dfnCnt;
    dfnCnt++;
    dfn[u] = dfnCnt;
    low[u] = dfnCnt;
    makeStep(39, `⏱️ [打时间戳] dfn[${nodeName(u)}] = low[${nodeName(u)}] = ${dfnCnt}; 分配访问序号。`, `打时间戳 dfn[${nodeName(u)}] = low[${nodeName(u)}] = ${dfnCnt}`, 'tarjan', '', nodeName(u), undefined, 'dfn', u);

    // 行 40: st.push(u);
    stack.push(u);
    makeStep(40, `📥 [压入辅助栈] st.push(${nodeName(u)}); 当前栈中元素: [${stack.map(nodeName).join(', ')}]。`, `将节点 ${nodeName(u)} 压入栈`, 'tarjan', '', nodeName(u));

    // 行 41: inStack[u] = true;
    inStack[u] = true;
    makeStep(41, `🔒 [入栈标记] inStack[${nodeName(u)}] = true; 标记节点在栈中。`, `标记节点 ${nodeName(u)} 在栈中`, 'tarjan', '', nodeName(u), undefined, 'inStack', u);

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
      makeStep(51, `🏷️ [新建连通块] sccCnt = ${sccCnt}; 发现新的强连通分量 SCC #${sccCnt}！`, `发现新强连通分量 SCC #${sccCnt}`, 'tarjan', '', nodeName(u));

      // 行 52: while (true)
      while (true) {
        // 行 53: int top = st.pop();
        const top = stack.pop()!;
        // 行 54: inStack[top] = false;
        inStack[top] = false;
        // 行 55: scc[top] = sccCnt;
        scc[top] = sccCnt;
        makeStep([53, 55], `📤 [弹栈缩点] 弹出节点 ${nodeName(top)}，赋值所属连通分量: scc[${nodeName(top)}] = ${sccCnt}。`, `弹栈并归属节点 ${nodeName(top)} 至 SCC #${sccCnt}`, 'tarjan', '', nodeName(top), undefined, 'scc', top);

        // 行 56: if (top == u) break;
        if (top === u) {
          makeStep(56, `✓ [强连通分量闭合] 节点 ${nodeName(u)} 已弹空，SCC #${sccCnt} 形成完毕。`, `强连通分量 SCC #${sccCnt} 闭合完成`, 'tarjan', '', nodeName(u));
          break;
        }
      }
    }
  }

  // 行 63: for (int i = 1; i <= 2 * n; i++)
  for (let i = 1; i <= 4; i++) {
    makeStep(63, `🔍 [外层扫描] 检查节点 ${nodeName(i)} (索引 ${i}) 是否已访问。`, `外层遍历节点 ${nodeName(i)}`, 'tarjan', '', nodeName(i));
    if (dfn[i] === 0) {
      makeStep(64, `⚡ [发起 DFS] dfn[${nodeName(i)}] == 0，从 ${nodeName(i)} 发起 Tarjan 搜索。`, `对未访问节点 ${nodeName(i)} 发起 Tarjan 搜索`, 'tarjan', '', nodeName(i));
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
      makeStep(70, `❌ [发现致命矛盾] 变量 x${i} 的真状态与假状态同在 SCC #${scc[trueNode]}，互为充分必要条件，无解！返回 false！`, `变量 x${i} 存在强连通矛盾冲突，返回无解`, 'done', '', `x${i}`, undefined, undefined, undefined, []);
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
    makeStep(75, `🎉 [求解成功] 2-SAT 问题成功求得合法解向量：[${chosenLiterals.join(', ')}]！返回 true！`, '成功求得满足解向量，返回有解', 'done', '', undefined, undefined, undefined, undefined, [...chosenLiterals]);
  }

  return steps;
}
