/**
 * VariableContextResolver (全自动变量状态捕获与智能求值深模块)
 *
 * 核心设计与深模块契约：
 * 1. 100% 零 DOM / 零 UI 依赖：纯逻辑解析，输入任意多态的 Step 对象，输出高一致性的变量字典。
 * 2. 多源容错归一化：
 *    - 优先级 0: 显式 `step.scope` (Universal Scope Snapshot)
 *    - 优先级 1: 显式 `step.vars` (StepVar[])
 *    - 优先级 2: `step.metrics` 指标字典解析 (提取 key=val 与 metric-xxx 后缀)
 *    - 优先级 3: `step` 自身核心属性 (i, j, k, l, r, len, curL, curR, ans 等)
 *    - 优先级 4: 全文本智能反向挖掘 (从 currentCell, decision, log 中自动萃取变量赋值)
 *    - 优先级 5: 环境上下文自动派生 (由 s 自动派生 n=s.length, 由 s1/s2 派生 m/n 等)
 * 3. 跨算法语义别名映射池：自动在水平/垂直/循环变量间进行双向等价类别名推导。
 * 4. 复合表达式动态求值器：支持对 dp[l][r], s[l], s.charAt(l) 等下标表达式的即时动态求值。
 */

import type { StepVar } from './interfaces';

export interface ResolvedVariable {
  name: string;
  value: string;
  type?: 'number' | 'string' | 'array' | 'boolean' | 'object' | 'expression';
  raw?: unknown;
  detail?: string;
}

export class VariableContextResolver {
  /** 常见核心算法属性白名单（避免将无用的 DOM、函数、巨大图元对象混入变量表） */
  private static readonly RELEVANT_PRIMITIVE_KEYS = new Set([
    'i', 'j', 'k', 'l', 'r', 'c', 'u', 'v', 'p1', 'p2', 'len', 'length', 'size',
    'curL', 'curR', 'curI', 'curJ', 'left', 'right', 'mid', 'target', 'ans', 'val', 'sum',
    'cur', 'prev', 'next', 'min', 'max', 'count', 'res', 'dist', 'weight', 'capacity', 'cost',
    'head', 'tail', 'slow', 'fast', 'pivot', 'low', 'high', 'top', 'leftDown', 'backup',
    's1', 's2', 'a', 'b', 's', 'str', 'nums', 'arr', 'items', 'piles', 'values', 'dp', 'memo', 'n', 'm',
    // 背包、分组背包与区间DP核心状态键
    'teams', 'start', 'end', 'candidate', 'group', 'curGroup', 'groupCount', 'remCap',
    // 常量与标准I/O句柄
    'MAXN', 'MAXM', 'INF', 'MOD', 'maxn', 'maxm', 'inf', 'mod', 'br', 'in', 'out', 'args',
    // 扩展图论、树与通用算法核心状态键
    'curNode', 'to', 'w', 'edge', 'd', 'visited', 'distance', 'distList', 'visitedList',
    'cnt', 'ei', 'curWeight',
    'pq', 'heap', 'pqSnapshot', 'maxDelay', 'maxDelaySoFar', 'totalCost',
    'source', 'dest', 'destination', 'path', 'found',
    // 图论拓扑、邻接表与网格矩阵核心键
    'graph', 'adj', 'times', 'matrix', 'grid', 'edges',
  ]);

  /** 全局常见算法核心变量业务语义词典（用于代码悬停气泡精准显示变量作用） */
  private static readonly DEFAULT_VARIABLE_DESCRIPTIONS: Record<string, string> = {
    // ── 基础数据与输入集合 ──
    arr: '二维物品三元组数组: arr[k][0]=体积, arr[k][1]=价值, arr[k][2]=组号',
    items: '二维物品特征集合列表: items[k][0]=体积, items[k][1]=价值, items[k][2]=组号',
    nums: '核心数字序列/元素数组',
    values: '多边形顶点权值数组 (凸多边形逆时针顶点权值)',
    maxn: '常量: 物品/数据规模上限 (静态分配空间)',
    maxm: '常量: 背包容量/列规模上限 (静态分配空间)',
    inf: '无穷大哨兵常量 (如 1e9 / 0x3f3f3f3f)',
    mod: '大质数取模常量 (1e9+7)',
    br: '标准输入缓冲字符流 (BufferedReader)',
    in: '标准输入分词器 (StreamTokenizer)',
    out: '标准格式化输出流 (PrintWriter)',
    args: '主函数命令行启动参数 (String[] args)',

    // ── 分组背包与动态规划 ──
    teams: '独立物品组总数 (按组互斥划分)',
    start: '当前物品组起始下标 (双指针区间起点)',
    end: '当前物品组终止边界 (双指针开区间终点)',
    capacity: '背包当前限制容量 (最大可承载负荷)',
    remCap: '背包剩余可用容量',
    cost: '物品消耗成本 / 占用体积',
    candidate: '状态转移候选计算值',

    // ── 图论与最短路核心 ──
    k: '信号广播源点 (起始发射节点)',
    n: '网络节点总数 (标记为 1 到 n)',
    m: '网络边总数 / 矩阵列数',
    times: '有向网络链路传输时间列表 [u, v, w]',
    edges: '有向边集合列表',
    graph: '全网节点出边邻接表结构',
    adj: '全网节点出边邻接表结构',
    distance: '源点 k 到各节点的最短时间表 (到达延迟)',
    dist: '源点 k 到各节点的最短时间表 (到达延迟)',
    distlist: '源点 k 到各节点的最短时间表 (到达延迟)',
    visited: '节点信号锁定状态 (已收到且为最优时间)',
    visitedlist: '节点信号锁定状态 (已收到且为最优时间)',
    pq: '波前优先队列小根堆 (按到达耗时升序排队)',
    heap: '小根堆数据结构',
    pqsnapshot: '优先队列就绪波前节点镜像',
    cur: '堆顶弹出的当前波前元组 [节点 u, 耗时 d]',
    u: '当前出堆并向外扩散信号的源头节点',
    v: '当前正在考察的链路下跳目标节点',
    w: '链路传输延迟时间 (ms)',
    d: '当前波前到达耗时 / 最短延迟 (ms)',
    edge: '当前正在传播信号的有向链路 [v, w]',
    ans: '全网所有节点都收到信号的最迟时刻 max(dist[1..n])',
    maxdelay: '全网所有节点都收到信号的最迟时刻',
    maxdelaysofar: '当前收齐的最迟时间',
    where: '反向索引堆节点映射 (-1 未入堆, >=0 堆位置, -2 已锁定)',

    // ── 双指针与滑动窗口 ──
    i: '当前遍历循环指针 (索引)',
    j: '二重循环指针 / 列指针',
    l: '滑动窗口 / 区间左边界指针',
    r: '滑动窗口 / 区间右边界指针',
    left: '区间左边界指针',
    right: '区间右边界指针',
    mid: '折半二分中点位置',
    len: '当前有效区间 / 窗口长度',
    size: '当前窗口尺寸 / 堆有效大小',
    slow: '快慢双指针 - 慢指针',
    fast: '快慢双指针 - 快指针',
    target: '检索目标值 / 匹配目标',

    // ── 动态规划与缓存 ──
    dp: '动态规划最优子结构状态备忘表',
    memo: '记忆化递归搜索缓存表',

    // ── 链式前向星 ──
    head: '链式前向星顶点出边表头指针',
    next: '链式前向星同起点下一条边指针',
    to: '链式前向星边所指向的目标顶点',
    weight: '链式前向星边的权值 (耗时/代价)',
    cnt: '链式前向星边计数器 (1-based)',
    ei: '链式前向星当前遍历边索引',

    // ── 树与递归 ──
    root: '二叉树根节点',
    node: '当前访问树节点',
    depth: '当前递归深度 / 树高度',
    val: '当前节点数值 / 元素值',
    sum: '当前路径或区间累加和',
  };

  /** 忽略的非业务属性名 */
  private static readonly IGNORED_KEYS = new Set([
    'treeRoot', 'activeNodeId', 'children', 'status',
    'type', 'index', 'stepIndex', 'snapshot', 'codeLanguages', 'modeCodeLanguages',
    'decision', 'message', 'log', 'currentCell', 'depCells', 'visitedMap', 'activeTrail', 'activeStack',
  ]);

  /**
   * 赋予变量业务语义解释 (detail)
   */
  private static enrichDetail(
    entry: ResolvedVariable,
    varName: string,
    stepContext?: any
  ): ResolvedVariable {
    if (entry.detail) return entry;

    const clean = varName.trim();
    const cleanLower = clean.toLowerCase();

    // 1. 优先使用步骤上下文中针对本题定制的描述 (varDetails)
    const customDesc =
      stepContext?.varDetails?.[clean] ||
      stepContext?.vars?.varDetails?.[clean] ||
      stepContext?.varDetails?.[cleanLower] ||
      stepContext?.vars?.varDetails?.[cleanLower];

    if (customDesc) {
      return { ...entry, detail: customDesc };
    }

    // 2. 回退至全局常见算法语义词典
    const defaultDesc =
      this.DEFAULT_VARIABLE_DESCRIPTIONS[clean] ||
      this.DEFAULT_VARIABLE_DESCRIPTIONS[cleanLower];

    if (defaultDesc) {
      return { ...entry, detail: defaultDesc };
    }

    return entry;
  }

  /**
   * 获取变量的业务语义说明（支持题干定制与全局语义词典）
   */
  public static getDescription(varName: string, stepContext?: any): string | undefined {
    if (!varName) return undefined;
    const clean = varName.trim();
    const cleanLower = clean.toLowerCase();

    const customDesc =
      stepContext?.varDetails?.[clean] ||
      stepContext?.vars?.varDetails?.[clean] ||
      stepContext?.varDetails?.[cleanLower] ||
      stepContext?.vars?.varDetails?.[cleanLower];

    if (customDesc) return customDesc;

    return (
      this.DEFAULT_VARIABLE_DESCRIPTIONS[clean] ||
      this.DEFAULT_VARIABLE_DESCRIPTIONS[cleanLower]
    );
  }

  /**
   * 安全解析下标表达式（如 "i", "j", "i - 1", "j - 10", "k + 1", "0", "j - arr[k][0]"）
   */
  public static evaluateIndexExpr(
    expr: string,
    varsMap: Map<string, ResolvedVariable>,
    stepContext?: any,
    depth: number = 0
  ): number {
    if (!expr || depth > 2) return NaN;
    const trimmed = expr.trim();
    if (/^-?\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }
    const directVar = varsMap.get(trimmed);
    if (directVar && /^-?\d+$/.test(directVar.value)) {
      return parseInt(directVar.value, 10);
    }
    const opMatch = trimmed.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([+-])\s*(.+)$/);
    if (opMatch) {
      const leftId = opMatch[1];
      const op = opMatch[2];
      const rightTerm = opMatch[3].trim();
      const leftVal = parseInt(varsMap.get(leftId)?.value ?? '', 10);
      let rightVal = NaN;
      if (/^\d+$/.test(rightTerm)) {
        rightVal = parseInt(rightTerm, 10);
      } else if (varsMap.has(rightTerm)) {
        rightVal = parseInt(varsMap.get(rightTerm)?.value ?? '', 10);
      } else if (rightTerm.includes('[') && depth < 2) {
        // 尝试解析嵌套数组表达式 如 arr[k][0]
        const nestedRes = this.getVariable(varsMap, rightTerm, stepContext);
        if (nestedRes && /^-?\d+$/.test(nestedRes.value)) {
          rightVal = parseInt(nestedRes.value, 10);
        }
      }
      if (!isNaN(leftVal) && !isNaN(rightVal)) {
        return op === '+' ? leftVal + rightVal : leftVal - rightVal;
      }
    }
    return NaN;
  }

  /**
   * 解析数组/矩阵下标表达式（支持多维嵌套，如 "dp[i - 1][j - arr[k][0]]", "arr[k][1]", "dp[j]"）
   */
  public static parseSubscriptExpression(expr: string): { tableName: string; indices: string[] } | null {
    if (!expr) return null;
    const trimmed = expr.trim();
    const idMatch = trimmed.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\[/);
    if (!idMatch) return null;

    const tableName = idMatch[1];
    let idx = idMatch[0].length - 1; // pointing to first '['
    const indices: string[] = [];

    while (idx < trimmed.length && trimmed[idx] === '[') {
      let depth = 0;
      const start = idx + 1;
      while (idx < trimmed.length) {
        if (trimmed[idx] === '[') depth++;
        else if (trimmed[idx] === ']') {
          depth--;
          if (depth === 0) {
            indices.push(trimmed.slice(start, idx));
            idx++;
            break;
          }
        }
        idx++;
      }
      if (depth !== 0) return null; // 未正确闭合
      while (idx < trimmed.length && /\s/.test(trimmed[idx])) idx++;
    }

    if (indices.length === 0 || idx < trimmed.length) return null;
    return { tableName, indices };
  }

  /**
   * 判断是否为 Canvas/SVG 专用图元布局对象（包含带坐标的 nodes/edges），避免图元污染变量表
   */
  private static isVisualLayoutObject(val: unknown): boolean {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const obj = val as Record<string, any>;
      if (Array.isArray(obj.nodes) && Array.isArray(obj.edges)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 便捷实例/静态方法：将多态 step 解析为平铺键值字典（支持单测与外部快速访问）
   */
  public resolveVariables(step: unknown, currentLang: string = 'java'): Record<string, any> {
    return VariableContextResolver.resolveVariables(step, currentLang);
  }

  public static resolveVariables(step: unknown, currentLang: string = 'java'): Record<string, any> {
    const varsMap = this.resolve(step, currentLang);
    const result: Record<string, any> = {};
    for (const [k, v] of varsMap.entries()) {
      result[k] = v.raw !== undefined ? v.raw : v.value;
    }
    return result;
  }

  /**
   * 将多态 step 解析为统一变量字典
   */
  public static resolve(step: unknown, _currentLang: string = 'java'): Map<string, ResolvedVariable> {
    const varsMap = new Map<string, ResolvedVariable>();
    if (!step || typeof step !== 'object') {
      return varsMap;
    }

    const s = step as Record<string, any>;

    // ── 0. 优先解析 step.scope / step.variables / step.locals (一等局部变量快照) ──
    const explicitScopes = [
      s.scope && typeof s.scope === 'object' ? s.scope : null,
      s.variables && typeof s.variables === 'object' && !Array.isArray(s.variables) ? s.variables : null,
      s.locals && typeof s.locals === 'object' ? s.locals : null,
    ];
    for (const sc of explicitScopes) {
      if (sc) {
        for (const [k, val] of Object.entries(sc)) {
          if (!varsMap.has(k)) {
            const entry = this.formatValueEntry(k, val);
            if (entry) {
              varsMap.set(k, entry);
            }
          }
        }
      }
    }

    // ── 0.1 优先解包 step.staticQueueState (静态队列状态权威指针) ─────
    if (s.staticQueueState && typeof s.staticQueueState === 'object') {
      const sq = s.staticQueueState;
      if (typeof sq.l === 'number' && !varsMap.has('l')) {
        varsMap.set('l', { name: 'l', value: String(sq.l), type: 'number', raw: sq.l });
      }
      if (typeof sq.r === 'number' && !varsMap.has('r')) {
        varsMap.set('r', { name: 'r', value: String(sq.r), type: 'number', raw: sq.r });
      }
      if (typeof sq.windowSize === 'number' && !varsMap.has('size')) {
        varsMap.set('size', { name: 'size', value: String(sq.windowSize), type: 'number', raw: sq.windowSize });
      }
    }

    // ── 1. 扫描 step 自身常见基础属性 ─────────────────────────────
    for (const [k, val] of Object.entries(s)) {
      if (this.IGNORED_KEYS.has(k) || this.isVisualLayoutObject(val)) continue;
      if (val === undefined || val === null || typeof val === 'function') continue;

      if (this.RELEVANT_PRIMITIVE_KEYS.has(k) || (k.length <= 12 && !k.startsWith('_'))) {
        const entry = this.formatValueEntry(k, val);
        if (entry && !varsMap.has(k)) {
          varsMap.set(k, entry);
        }
      }
    }

    // ── 2. 扫描 step.metrics 字典 ──────────────────────────────────
    if (s.metrics && typeof s.metrics === 'object') {
      for (const [key, value] of Object.entries(s.metrics)) {
        if (value === undefined || value === null) continue;
        const cleanKey = key.replace(/^metric-/, '');

        // 形式 A: 指标名本身就是变量名 (如 metrics: { l: 3, r: 4, ans: 2 })
        if (this.RELEVANT_PRIMITIVE_KEYS.has(cleanKey) && !varsMap.has(cleanKey)) {
          const entry = this.formatValueEntry(cleanKey, value);
          if (entry) varsMap.set(cleanKey, entry);
        }

        // 形式 B: 指标值包含内联表达式 (如 'status': '外层循环 l=3, r=4')
        if (typeof value === 'string') {
          this.minePairsFromText(value, varsMap);
        }
      }
    }

    // ── 3. 全文本智能反向挖掘 (从 currentCell, decision, log, message 中安全提取)
    const textSources = [s.currentCell, s.decision, s.log, s.message];
    for (const text of textSources) {
      if (typeof text === 'string' && text.length > 0) {
        this.minePairsFromText(text, varsMap);
      }
    }

    // ── 4. 环境上下文自动派生 (Auto-Derivation) ────────────────────
    this.deriveContextVariables(s, varsMap);

    // ── 5. 解析显式 step.vars (最高优先级，覆盖启发式值，支持数组与对象字典) ───
    if (s.vars) {
      if (Array.isArray(s.vars)) {
        for (const v of s.vars as StepVar[]) {
          if (v && v.name) {
            varsMap.set(v.name, {
              name: v.name,
              value: String(v.value ?? ''),
              type: v.type || this.deduceType(v.value),
              raw: v.value,
            });
          }
        }
      } else if (typeof s.vars === 'object') {
        for (const [k, val] of Object.entries(s.vars)) {
          if (val === undefined || val === null || typeof val === 'function') continue;
          if (this.isVisualLayoutObject(val)) continue;
          const entry = this.formatValueEntry(k, val);
          if (entry) {
            varsMap.set(k, entry);
          }
        }
      }
    }

    // ── 6. 跨算法语义别名等价类池映射 ──────────────────────────────
    this.applySemanticAliases(varsMap);

    // ── 7. 跨语言命名映射 (camelCase <-> snake_case) ───────────────
    this.applyNamingCaseAliases(varsMap);

    return varsMap;
  }

  /**
   * 从任意自由文本中安全挖掘变量键值对
   */
  private static minePairsFromText(text: string, varsMap: Map<string, ResolvedVariable>): void {
    // 匹配形如: l = 3, r = 4, len = 2, i: 1, s = "abc"
    // 严格限制值只能为：合法数字（含负数/浮点）、带单双引号字符串、布尔值
    const kvRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(-?\d+(?:\.\d+)?|'[^']*'|"[^"]*"|true|false)\b/g;
    let match: RegExpExecArray | null;
    while ((match = kvRegex.exec(text)) !== null) {
      const idx = match.index;
      // 避免误判算术表达式中的连续等式或减法操作数，如 "size = r - l = 1" 中误将 "- l = 1" 判定为 l=1
      const prefix = text.slice(Math.max(0, idx - 4), idx).trim();
      if (/[-+*/%]$/.test(prefix)) {
        continue;
      }

      const varName = match[1];
      const varVal = match[2].trim();
      if (
        varName !== 'Math' &&
        varName !== 'status' &&
        varName !== 'title' &&
        varName !== 'for' &&
        varName !== 'if'
      ) {
        const cleanVal = varVal.replace(/^['"]|['"]$/g, '');
        if (!varsMap.has(varName)) {
          varsMap.set(varName, {
            name: varName,
            value: cleanVal,
            type: this.deduceType(varVal),
            raw: /^-?\d+$/.test(cleanVal) ? parseInt(cleanVal, 10) : cleanVal,
          });
        }
      }
    }

    // 特殊捕获形如: for l = 3, for r = 4, for len = 2
    const loopRegex = /\bfor\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(-?\d+)\b/g;
    while ((match = loopRegex.exec(text)) !== null) {
      const varName = match[1];
      const varVal = match[2];
      if (!varsMap.has(varName)) {
        varsMap.set(varName, {
          name: varName,
          value: varVal,
          type: 'number',
          raw: parseInt(varVal, 10),
        });
      }
    }
  }

  /**
   * 依据全局对象派生环境变量 (如由 s 派生 n=s.length)
   */
  private static deriveContextVariables(s: Record<string, any>, varsMap: Map<string, ResolvedVariable>): void {
    // 1. 字符串序列长度派生
    const strObj = s.s || s.str || varsMap.get('s')?.raw || varsMap.get('s')?.value?.replace(/^['"]|['"]$/g, '');
    if (typeof strObj === 'string') {
      if (!varsMap.has('s')) {
        varsMap.set('s', { name: 's', value: `"${strObj}"`, type: 'string', raw: strObj });
      }
      if (!varsMap.has('str')) {
        varsMap.set('str', { name: 'str', value: `"${strObj}"`, type: 'string', raw: strObj });
      }
      if (!varsMap.has('n')) {
        varsMap.set('n', { name: 'n', value: String(strObj.length), type: 'number', raw: strObj.length });
      }
    }

    // 2. 双字符串 s1, s2 长度派生
    if (typeof s.s1 === 'string' && !varsMap.has('m')) {
      varsMap.set('m', { name: 'm', value: String(s.s1.length), type: 'number', raw: s.s1.length });
    }
    if (typeof s.s2 === 'string' && !varsMap.has('n')) {
      varsMap.set('n', { name: 'n', value: String(s.s2.length), type: 'number', raw: s.s2.length });
    }

    // 2.5 背包问题 capacity 与 teams 语义对齐
    if (s.capacity !== undefined && !varsMap.has('capacity')) {
      varsMap.set('capacity', { name: 'capacity', value: String(s.capacity), type: 'number', raw: s.capacity });
    }
    if (s.teams !== undefined && !varsMap.has('teams')) {
      varsMap.set('teams', { name: 'teams', value: String(s.teams), type: 'number', raw: s.teams });
    }

    // 3. 网格矩阵行与列派生 (仅在非背包/非组间DP网格中执行兜底派生，避免将 teams+1 错当成 m)
    const isKnapsackLike = varsMap.has('teams') || varsMap.has('capacity') || s.teams !== undefined || s.capacity !== undefined;
    const grid = s.grid || s.dpTable || s.memoGrid;
    if (Array.isArray(grid) && grid.length > 0 && !isKnapsackLike) {
      if (!varsMap.has('m')) {
        varsMap.set('m', { name: 'm', value: String(grid.length), type: 'number', raw: grid.length });
      }
      if (Array.isArray(grid[0]) && !varsMap.has('n')) {
        varsMap.set('n', { name: 'n', value: String(grid[0].length), type: 'number', raw: grid[0].length });
      }
    } else if (isKnapsackLike && s.capacity !== undefined && !varsMap.has('m')) {
      // 背包问题中标准 OJ 模板中 m 往往指代容量 (如 dp[teams + 1][m + 1])
      varsMap.set('m', { name: 'm', value: String(s.capacity), type: 'number', raw: s.capacity });
    }

    // 4. 区间与滑动窗口智能推导 (l, r, len 三元互推)
    this.deriveIntervalTriad(s, varsMap);

    // 5. 图论拓扑与遍历状态智能推导 (activeEdge, curNode, distList, visitedList)
    this.deriveGraphTopologyContext(s, varsMap);
  }

  /**
   * 图论拓扑与遍历状态智能推导 (activeEdge: [u, v, w] 解构, curNode -> u)
   */
  private static deriveGraphTopologyContext(s: Record<string, any>, varsMap: Map<string, ResolvedVariable>): void {
    // A. activeEdge: [u, v, w] 三元组解构
    const activeEdge = s.activeEdge || s.vars?.activeEdge || varsMap.get('activeEdge')?.raw;
    if (Array.isArray(activeEdge) && activeEdge.length >= 2) {
      const uVal = activeEdge[0];
      const vVal = activeEdge[1];
      const wVal = activeEdge[2];
      if (uVal !== undefined && !varsMap.has('u')) {
        varsMap.set('u', { name: 'u', value: String(uVal), type: 'number', raw: uVal });
      }
      if (vVal !== undefined && !varsMap.has('v')) {
        varsMap.set('v', { name: 'v', value: String(vVal), type: 'number', raw: vVal });
      }
      if (wVal !== undefined && !varsMap.has('w')) {
        varsMap.set('w', { name: 'w', value: String(wVal), type: 'number', raw: wVal });
      }
    }

    // B. curNode -> u 派生
    const curVal = s.curNode ?? s.vars?.curNode ?? varsMap.get('curNode')?.raw;
    if (curVal !== undefined && !varsMap.has('u')) {
      const num = typeof curVal === 'number' ? curVal : parseInt(String(curVal), 10);
      if (!isNaN(num)) {
        varsMap.set('u', { name: 'u', value: String(num), type: 'number', raw: num });
      }
    }

    // C. distList / visitedList -> n (全网节点数推导)
    const distList = s.distList || s.vars?.distList || varsMap.get('dist')?.raw || varsMap.get('distList')?.raw;
    const visitedList = s.visitedList || s.vars?.visitedList || varsMap.get('visited')?.raw || varsMap.get('visitedList')?.raw;
    const targetArr = Array.isArray(distList) ? distList : (Array.isArray(visitedList) ? visitedList : null);
    if (targetArr && targetArr.length > 1 && !varsMap.has('n')) {
      const derivedN = targetArr.length - 1; // 1-based node total
      varsMap.set('n', { name: 'n', value: String(derivedN), type: 'number', raw: derivedN });
    }

    // D. 识别源点参数 k (source/src/k)
    const kVal = s.k ?? s.vars?.k ?? s.source ?? s.src ?? (s.status === 'emit' ? s.activeSlot : undefined);
    if (kVal !== undefined && !varsMap.has('k')) {
      const num = typeof kVal === 'number' ? kVal : parseInt(String(kVal), 10);
      if (!isNaN(num)) {
        varsMap.set('k', { name: 'k', value: String(num), type: 'number', raw: num });
      }
    }

    // E. 邻接表与图拓扑结构智能推导 (若 step 或 step.vars 中有 graph/adj)
    const graphData = s.graph || s.adj || s.vars?.graph || s.vars?.adj || varsMap.get('graph')?.raw || varsMap.get('adj')?.raw;
    if (graphData !== undefined && !this.isVisualLayoutObject(graphData)) {
      if (!varsMap.has('graph')) {
        const entry = this.formatValueEntry('graph', graphData);
        if (entry) varsMap.set('graph', entry);
      }
      if (!varsMap.has('adj')) {
        const entry = this.formatValueEntry('adj', graphData);
        if (entry) varsMap.set('adj', entry);
      }
    }

    // F. 数据集与集合智能推导 (items, arr, nums, data, grid, matrix)
    const rawItems = s.items || s.arr || s.nums || s.rawItems || s.vars?.items || s.vars?.arr || s.vars?.nums || varsMap.get('items')?.raw || varsMap.get('arr')?.raw;
    if (rawItems !== undefined && !this.isVisualLayoutObject(rawItems)) {
      if (!varsMap.has('items')) {
        const entry = this.formatValueEntry('items', rawItems);
        if (entry) varsMap.set('items', entry);
      }
      if (!varsMap.has('arr')) {
        const entry = this.formatValueEntry('arr', rawItems);
        if (entry) varsMap.set('arr', entry);
      }
      if (!varsMap.has('nums')) {
        const entry = this.formatValueEntry('nums', rawItems);
        if (entry) varsMap.set('nums', entry);
      }
      if (Array.isArray(rawItems) && !varsMap.has('n')) {
        varsMap.set('n', { name: 'n', value: String(rawItems.length), type: 'number', raw: rawItems.length });
      }
    }

    const rawGrid = s.grid || s.matrix || s.board || s.dpTable || s.memoGrid || s.table || s.vars?.grid || s.vars?.matrix || varsMap.get('grid')?.raw || varsMap.get('matrix')?.raw;
    if (rawGrid !== undefined && !this.isVisualLayoutObject(rawGrid)) {
      const keysToSet = ['grid', 'matrix', 'board', 'table'];
      if (Array.isArray(rawGrid)) {
        keysToSet.push('dp', 'memo', 'dpTable', 'memoGrid');
      }
      for (const key of keysToSet) {
        if (!varsMap.has(key)) {
          const entry = this.formatValueEntry(key, rawGrid);
          if (entry) varsMap.set(key, entry);
        }
      }
    }

    // F.1 一维滚动状态槽位智能推导 (slotVector, slots, dp)
    const rawSlots = s.slotVector || s.slots || s.arr1D || s.vars?.slotVector || s.vars?.slots;
    if (Array.isArray(rawSlots) && !this.isVisualLayoutObject(rawSlots)) {
      for (const key of ['slots', 'slotVector', 'dp']) {
        if (!varsMap.has(key)) {
          const entry = this.formatValueEntry(key, rawSlots);
          if (entry) varsMap.set(key, entry);
        }
      }
    }

    // F. 有向边集合/网络延时输入矩阵 times
    const timesData = s.times || s.vars?.times || varsMap.get('times')?.raw;
    if (timesData !== undefined && !varsMap.has('times')) {
      const entry = this.formatValueEntry('times', timesData);
      if (entry) varsMap.set('times', entry);
    }

    // G. 链式前向星拓扑与核心数组智能推导 (head[], next[], to[], weight[], cnt, u, v, w)
    this.deriveForwardStarContext(s, varsMap);
  }

  /**
   * 链式前向星核心数据结构智能推导 (顶层抽象约束)
   * 保证 head[], next[], to[], weight[] 数组与当前步动态指针在代码悬停或求值时 100% 捕获
   */
  private static deriveForwardStarContext(s: Record<string, any>, varsMap: Map<string, ResolvedVariable>): void {
    const isForwardStar =
      Array.isArray(s.edges) ||
      Array.isArray(s.head) ||
      s.curEdgeIndex !== undefined ||
      varsMap.has('cnt') ||
      varsMap.has('ei');

    if (!isForwardStar) return;

    const edges: any[] = Array.isArray(s.edges) ? s.edges : [];
    const head: any[] = Array.isArray(s.head) ? s.head : [];

    // 1. 提取当前顶点 u, 目标顶点 v, 边权 w, 边号 cnt
    const uVal = s.u ?? s.curNode ?? (varsMap.get('u')?.raw ?? varsMap.get('u')?.value);
    const vVal = s.v ?? s.targetNode ?? (varsMap.get('v')?.raw ?? varsMap.get('v')?.value);
    const wVal = s.w ?? s.curWeight ?? (varsMap.get('w')?.raw ?? varsMap.get('w')?.value);
    const cntVal = s.cnt ?? (s.curEdgeIndex != null ? s.curEdgeIndex + 1 : (edges.length > 0 ? edges.length : 1));

    if (uVal != null && !varsMap.has('u')) {
      varsMap.set('u', { name: 'u', value: String(uVal), type: 'number', raw: Number(uVal) });
    }
    if (vVal != null && !varsMap.has('v')) {
      varsMap.set('v', { name: 'v', value: String(vVal), type: 'number', raw: Number(vVal) });
    }
    if (wVal != null && !varsMap.has('w')) {
      varsMap.set('w', { name: 'w', value: String(wVal), type: 'number', raw: Number(wVal) });
    }
    if (cntVal != null && !varsMap.has('cnt')) {
      varsMap.set('cnt', { name: 'cnt', value: String(cntVal), type: 'number', raw: Number(cntVal) });
    }

    // 2. 构建 1-based 链式前向星核心数组 (next[], to[], weight[], head[])
    const maxEdges = Math.max(edges.length + 2, Number(cntVal) + 2);
    const nextArr: number[] = new Array(maxEdges).fill(0);
    const toArr: number[] = new Array(maxEdges).fill(0);
    const weightArr: number[] = new Array(maxEdges).fill(0);

    for (let i = 0; i < edges.length; i++) {
      const ed = edges[i];
      const eIdx = ed.index != null ? ed.index + 1 : i + 1;
      toArr[eIdx] = ed.to ?? 0;
      weightArr[eIdx] = ed.weight ?? 0;
      nextArr[eIdx] = ed.next === -1 || ed.next == null ? 0 : ed.next + 1;
    }

    // 动态注入当前处理边的信息
    const cNum = Number(cntVal);
    if (!isNaN(cNum) && cNum > 0) {
      if (vVal != null) toArr[cNum] = Number(vVal);
      if (wVal != null) weightArr[cNum] = Number(wVal);
      if (s.prevHeadVal != null) {
        nextArr[cNum] = s.prevHeadVal === -1 ? 0 : s.prevHeadVal + 1;
      }
    }

    // 1-based head 数组推导
    const maxNodes = Math.max(head.length, 6);
    const headArr: number[] = new Array(maxNodes).fill(0);
    for (let node = 1; node < head.length; node++) {
      headArr[node] = head[node] === -1 || head[node] == null ? 0 : head[node] + 1;
    }
    if (s.action === 'update_head' && uVal != null && cNum > 0) {
      headArr[Number(uVal)] = cNum;
    }

    // 3. 注入 next 变量 (防止鼠标悬停代码中的 next 显示未捕获)
    const curNextVal =
      s.prevHeadVal != null
        ? (s.prevHeadVal === -1 ? 0 : s.prevHeadVal + 1)
        : (nextArr[cNum] ?? 0);
    if (!varsMap.has('next') || varsMap.get('next')?.type === 'array') {
      varsMap.set('next', {
        name: 'next',
        value: String(curNextVal),
        type: 'number',
        detail: `静态链表指针: next[${cNum}] = ${curNextVal} (指向旧表头边号)`,
        raw: nextArr,
      });
    }

    // 4. 注入 head 变量 (覆盖生硬的 [-1, -1...] 数组字符串，提供聚焦当前顶点的语义头指针)
    const uNum = Number(uVal || 1);
    const curHeadVal = headArr[uNum] ?? 0;
    if (!varsMap.has('head') || varsMap.get('head')?.type === 'array') {
      varsMap.set('head', {
        name: 'head',
        value: String(curHeadVal),
        type: 'number',
        detail: `顶点头指针: head[${uNum}] = ${curHeadVal > 0 ? `边 #${curHeadVal}` : '0 (空)'}`,
        raw: headArr,
      });
    }

    // 5. 注入 to 变量与 weight 变量
    if (!varsMap.has('to') || varsMap.get('to')?.type === 'array') {
      varsMap.set('to', {
        name: 'to',
        value: vVal != null ? String(vVal) : '0',
        type: 'number',
        detail: `目标顶点: to[${cNum}] = ${vVal ?? 0}`,
        raw: toArr,
      });
    }
    if (!varsMap.has('weight') || varsMap.get('weight')?.type === 'array') {
      varsMap.set('weight', {
        name: 'weight',
        value: wVal != null ? String(wVal) : '0',
        type: 'number',
        detail: `边权代价: weight[${cNum}] = ${wVal ?? 0}`,
        raw: weightArr,
      });
    }

    // 6. 自动预置下标复合表达式映射
    if (cNum > 0) {
      if (!varsMap.has(`to[${cNum}]`) && vVal != null) {
        varsMap.set(`to[${cNum}]`, { name: `to[${cNum}]`, value: String(vVal), type: 'number', raw: Number(vVal) });
      }
      if (!varsMap.has('to[cnt]') && vVal != null) {
        varsMap.set('to[cnt]', { name: 'to[cnt]', value: String(vVal), type: 'number', raw: Number(vVal) });
      }
      if (!varsMap.has(`weight[${cNum}]`) && wVal != null) {
        varsMap.set(`weight[${cNum}]`, { name: `weight[${cNum}]`, value: String(wVal), type: 'number', raw: Number(wVal) });
      }
      if (!varsMap.has('weight[cnt]') && wVal != null) {
        varsMap.set('weight[cnt]', { name: 'weight[cnt]', value: String(wVal), type: 'number', raw: Number(wVal) });
      }
      const nVal = nextArr[cNum] ?? 0;
      if (!varsMap.has(`next[${cNum}]`)) {
        varsMap.set(`next[${cNum}]`, { name: `next[${cNum}]`, value: String(nVal), type: 'number', raw: nVal });
      }
      if (!varsMap.has('next[cnt]')) {
        varsMap.set('next[cnt]', { name: 'next[cnt]', value: String(nVal), type: 'number', raw: nVal });
      }
    }
    if (uVal != null) {
      const uNum = Number(uVal);
      const hVal = headArr[uNum] ?? 0;
      if (!varsMap.has(`head[${uNum}]`)) {
        varsMap.set(`head[${uNum}]`, { name: `head[${uNum}]`, value: String(hVal), type: 'number', raw: hVal });
      }
      if (!varsMap.has('head[u]')) {
        varsMap.set('head[u]', { name: 'head[u]', value: String(hVal), type: 'number', raw: hVal });
      }
    }
  }

  /**
   * 区间与滑动窗口三元互推: (l, r) -> len; (l, len) -> r; (r, len) -> l
   */
  private static deriveIntervalTriad(s: Record<string, any>, varsMap: Map<string, ResolvedVariable>): void {
    const lRaw = s.l ?? s.curL ?? varsMap.get('l')?.raw ?? varsMap.get('curL')?.raw ?? varsMap.get('l')?.value ?? varsMap.get('curL')?.value;
    const rRaw = s.r ?? s.curR ?? varsMap.get('r')?.raw ?? varsMap.get('curR')?.raw ?? varsMap.get('r')?.value ?? varsMap.get('curR')?.value;
    const lenRaw = s.len ?? varsMap.get('len')?.raw ?? varsMap.get('len')?.value;

    const lNum = lRaw !== undefined && lRaw !== null ? parseInt(String(lRaw), 10) : NaN;
    const rNum = rRaw !== undefined && rRaw !== null ? parseInt(String(rRaw), 10) : NaN;
    const lenNum = lenRaw !== undefined && lenRaw !== null ? parseInt(String(lenRaw), 10) : NaN;

    // A: 有 l 和 r -> 推导 len = r - l + 1
    if (!isNaN(lNum) && !isNaN(rNum) && isNaN(lenNum) && rNum >= lNum) {
      const derivedLen = rNum - lNum + 1;
      varsMap.set('len', { name: 'len', value: String(derivedLen), type: 'number', raw: derivedLen });
      if (!varsMap.has('length')) {
        varsMap.set('length', { name: 'length', value: String(derivedLen), type: 'number', raw: derivedLen });
      }
    }

    // B: 有 l 和 len -> 推导 r = l + len - 1
    if (!isNaN(lNum) && !isNaN(lenNum) && isNaN(rNum) && lenNum >= 1) {
      const derivedR = lNum + lenNum - 1;
      varsMap.set('r', { name: 'r', value: String(derivedR), type: 'number', raw: derivedR });
      if (!varsMap.has('curR')) {
        varsMap.set('curR', { name: 'curR', value: String(derivedR), type: 'number', raw: derivedR });
      }
    }

    // C: 有 r 和 len -> 推导 l = r - len + 1
    if (!isNaN(rNum) && !isNaN(lenNum) && isNaN(lNum) && lenNum >= 1) {
      const derivedL = rNum - lenNum + 1;
      varsMap.set('l', { name: 'l', value: String(derivedL), type: 'number', raw: derivedL });
      if (!varsMap.has('curL')) {
        varsMap.set('curL', { name: 'curL', value: String(derivedL), type: 'number', raw: derivedL });
      }
    }
  }

  /**
   * 语义等价类双向别名注入
   */
  private static applySemanticAliases(varsMap: Map<string, ResolvedVariable>): void {
    // 语义组 1: 水平 / 左边界 / 行下标
    const horizontalAliases = ['l', 'curL', 'left', 'i', 'curI', 'row'];
    this.syncAliasGroup(varsMap, horizontalAliases);

    // 语义组 2: 垂直 / 右边界 / 列下标
    const verticalAliases = ['r', 'curR', 'right', 'j', 'curJ', 'col'];
    this.syncAliasGroup(varsMap, verticalAliases);

    // 语义组 3: 状态表格
    const tableAliases = ['dp', 'dpTable', 'memo', 'memoGrid', 'table'];
    this.syncAliasGroup(varsMap, tableAliases);

    // 语义组 4: 顶点 / 当前节点 / 出发点 (Graph Vertex / Current Node)
    const vertexAliases = ['u', 'curNode', 'cur', 'node', 'curr', 'uNode', 'from'];
    this.syncAliasGroup(varsMap, vertexAliases);

    // 语义组 5: 目标节点 / 下一节点 / 邻居 (Target Node / Neighbor)
    const neighborAliases = ['v', 'to', 'neighbor', 'nxt', 'nextNode', 'vNode'];
    this.syncAliasGroup(varsMap, neighborAliases);

    // 语义组 6: 边权 / 代价 / 延迟 (Edge Weight / Cost / Delay)
    const weightAliases = ['w', 'weight', 'cost', 'delay', 'edgeWeight', 'curWeight'];
    this.syncAliasGroup(varsMap, weightAliases);

    // 语义组: 链式前向星边计数器 (Forward Star Edge Counter)
    const edgeCountAliases = ['cnt', 'edgeCount', 'curEdgeIndex', 'edgeIdx'];
    this.syncAliasGroup(varsMap, edgeCountAliases);

    // 语义组: 出边迭代指针 (Forward Star Edge Pointer)
    const edgePointerAliases = ['ei', 'e', 'edgePtr', 'ePtr'];
    this.syncAliasGroup(varsMap, edgePointerAliases);

    // 语义组: 链式前向星下条边指针 (Forward Star Next Pointer)
    const forwardStarNextAliases = ['next', 'nextEdge', 'pNext', 'nxtEdge'];
    this.syncAliasGroup(varsMap, forwardStarNextAliases);

    // 语义组: 顶点头指针 (Forward Star Head Pointer)
    const headPointerAliases = ['head', 'headPtr', 'firstEdge'];
    this.syncAliasGroup(varsMap, headPointerAliases);

    // 语义组 7: 最短路 / 距离表 (Shortest Path / Distance Table)
    const distanceAliases = ['dist', 'distance', 'distList', 'dists', 'shortestDist'];
    this.syncAliasGroup(varsMap, distanceAliases);

    // 语义组 8: 访问标记 / 集合 (Visited Set / Boolean Array)
    const visitedAliases = ['visited', 'vis', 'visitedList', 'visitedMap', 'isVisited', 'seen'];
    this.syncAliasGroup(varsMap, visitedAliases);

    // 语义组 9: 优先队列 / 堆 (Priority Queue / Heap)
    const heapAliases = ['pq', 'heap', 'pqSnapshot', 'priorityQueue', 'minHeap'];
    this.syncAliasGroup(varsMap, heapAliases);

    // 语义组 10: 答案 / 统计结果 (Result / Max Delay)
    const resultAliases = ['ans', 'res', 'result', 'maxDelaySoFar', 'maxDelay', 'totalCost'];
    this.syncAliasGroup(varsMap, resultAliases);

    // 语义组 11: 源点入参 / 起点 (Source Node / Start Parameter)
    const sourceAliases = ['k', 'source', 'src', 'startNode', 'startVertex'];
    this.syncAliasGroup(varsMap, sourceAliases);

    // 语义组 12: 目标端点 / 终点 (Destination Node / Target Parameter)
    const destinationAliases = ['dest', 'destination', 'target', 'targetNode', 'endNode'];
    this.syncAliasGroup(varsMap, destinationAliases);

    // 语义组 13: 堆顶状态与边数组元组 (Current Heap Pair / Edge Pair)
    const pairAliases = ['cur', 'currentPair', 'topPair'];
    this.syncAliasGroup(varsMap, pairAliases);
    const edgePairAliases = ['edge', 'activeEdgePair', 'channel'];
    this.syncAliasGroup(varsMap, edgePairAliases);

    // 语义组 14: 当前搜索路径与路径栈 (Current Search Path / Path Stack)
    const pathAliases = ['path', 'currentPath', 'pathNodes', 'activePath'];
    this.syncAliasGroup(varsMap, pathAliases);

    // 语义组 15: 集合与核心输入数据集 (Collections / Input Arrays)
    const collectionAliases = ['arr', 'items', 'nums', 'data', 'elements', 'values', 'list'];
    this.syncAliasGroup(varsMap, collectionAliases);

    // 语义组 16: 二维网格与矩阵 (Grid / Matrix)
    const gridAliases = ['grid', 'matrix', 'board', 'table'];
    this.syncAliasGroup(varsMap, gridAliases);

    // 语义组 17: 字符串与输入序列 (Strings / Sequences)
    const stringAliases = ['s', 'str', 's1', 'text1'];
    this.syncAliasGroup(varsMap, stringAliases);

    // 语义组 18: 背包容量与额度 (Capacity / Limit)
    const capacityAliases = ['m', 'capacity', 'remCap', 'limit'];
    this.syncAliasGroup(varsMap, capacityAliases);

    // 语义组 19: 规模与元素总数 (Size / Total Count)
    const sizeAliases = ['n', 'size', 'count', 'total', 'len'];
    this.syncAliasGroup(varsMap, sizeAliases);

    // 语义组 15: 全量解路径集合 (All Paths / Result Paths)
    const pathsAliases = ['allPaths', 'paths', 'res', 'resultPaths', 'pathList'];
    this.syncAliasGroup(varsMap, pathsAliases);

    // 语义组 16: 图拓扑邻接结构 (Adjacency List / Graph Representation)
    const graphAliases = ['graph', 'adj', 'edges', 'adjacencyList'];
    this.syncAliasGroup(varsMap, graphAliases);

    // 语义组 17: 网格与二维矩阵 (Grid / Matrix)
    const matrixAliases = ['matrix', 'grid', 'board'];
    this.syncAliasGroup(varsMap, matrixAliases);

    // 语义组 18: 有向边输入列表 (Edges / Times List)
    const edgeListAliases = ['times', 'edgeList', 'flightList'];
    this.syncAliasGroup(varsMap, edgeListAliases);

    // 别名同步后再次尝试三元推导（确保 curL/curR 映射到 l/r 之后能够立即派生出 len）
    this.deriveIntervalTriad({}, varsMap);
  }

  private static syncAliasGroup(varsMap: Map<string, ResolvedVariable>, aliasKeys: string[]): void {
    let sourceEntry: ResolvedVariable | undefined;
    for (const key of aliasKeys) {
      if (varsMap.has(key)) {
        sourceEntry = varsMap.get(key);
        break;
      }
    }
    if (!sourceEntry) return;

    for (const key of aliasKeys) {
      if (!varsMap.has(key)) {
        varsMap.set(key, { ...sourceEntry, name: key });
      }
    }
  }

  private static applyNamingCaseAliases(varsMap: Map<string, ResolvedVariable>): void {
    const aliasEntries: [string, ResolvedVariable][] = [];
    for (const [name, entry] of varsMap.entries()) {
      if (name.includes('_')) {
        const camel = name.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
        if (!varsMap.has(camel)) {
          aliasEntries.push([camel, { ...entry, name: camel }]);
        }
      } else {
        const snake = name.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (snake !== name && !varsMap.has(snake)) {
          aliasEntries.push([snake, { ...entry, name: snake }]);
        }
      }
    }
    for (const [alias, entry] of aliasEntries) {
      varsMap.set(alias, entry);
    }
  }

  /**
   * 根据变量名或下标表达式在当前上下文中智能解析求值 (支持复合表达式如 dp[l][r], s.charAt(l))
   */
  public static getVariable(
    varsMap: Map<string, ResolvedVariable>,
    varName: string,
    stepContext?: any
  ): ResolvedVariable | undefined {
    if (!varsMap || !varName) return undefined;
    const cleanExpr = varName.trim();

    // 0. 特殊处理：若查询 dp / memo / table，智能求值单元格、滚动槽位或状态表格
    if (cleanExpr === 'dp' || cleanExpr === 'memo' || cleanExpr === 'dpTable' || cleanExpr === 'memoGrid' || cleanExpr === 'table') {
      const lVal = varsMap.get('l')?.value || varsMap.get('i')?.value;
      const rVal = varsMap.get('r')?.value || varsMap.get('j')?.value;
      const tableData =
        stepContext?.grid ||
        stepContext?.dpTable ||
        stepContext?.memoGrid ||
        stepContext?.table ||
        stepContext?.slotVector ||
        stepContext?.slots ||
        varsMap.get('dp')?.raw ||
        varsMap.get('grid')?.raw ||
        varsMap.get('matrix')?.raw ||
        varsMap.get('dpTable')?.raw;

      if (Array.isArray(tableData)) {
        if (Array.isArray(tableData[0])) {
          // 二维表
          if (lVal != null && rVal != null) {
            const rIdx = parseInt(lVal, 10);
            const cIdx = parseInt(rVal, 10);
            if (!isNaN(rIdx) && !isNaN(cIdx)) {
              const curCellVal = tableData[rIdx]?.[cIdx];
              const valStr = curCellVal === null || curCellVal === undefined ? '-' : String(curCellVal);
              return {
                name: cleanExpr,
                value: `[${lVal}][${rVal}] = ${valStr}`,
                type: 'expression',
                detail: `当前单元格 ${cleanExpr}[${lVal}][${rVal}] = ${valStr}`,
                raw: tableData,
              };
            }
          }
          const rows = tableData.length;
          const cols = tableData[0].length;
          return {
            name: cleanExpr,
            value: `[${rows}×${cols}]`,
            type: 'array',
            detail: `动态规划二维状态表 (${rows} 行 ${cols} 列)`,
            raw: tableData,
          };
        } else {
          // 一维滚动数组
          const idxVal = rVal ?? lVal;
          if (idxVal != null) {
            const idxNum = parseInt(idxVal, 10);
            if (!isNaN(idxNum)) {
              const cellVal = tableData[idxNum];
              const valStr = cellVal === null || cellVal === undefined ? '-' : String(cellVal);
              return {
                name: cleanExpr,
                value: `[${idxVal}] = ${valStr}`,
                type: 'expression',
                detail: `当前一维状态 ${cleanExpr}[${idxVal}] = ${valStr}`,
                raw: tableData,
              };
            }
          }
          return {
            name: cleanExpr,
            value: `[${tableData.length}]`,
            type: 'array',
            detail: `一维动态规划滚动数组 (长度 ${tableData.length})`,
            raw: tableData,
          };
        }
      }
    }

    // 0.05 特殊处理：若查询 arr / items / nums / weights / costs / values 变量，展示整个数组的全量值与结构，并关联当前下标指针
    if (
      cleanExpr === 'arr' ||
      cleanExpr === 'items' ||
      cleanExpr === 'nums' ||
      cleanExpr === 'weights' ||
      cleanExpr === 'costs' ||
      cleanExpr === 'cost' ||
      cleanExpr === 'values' ||
      cleanExpr === 'vals' ||
      cleanExpr === 'val'
    ) {
      const arrData =
        stepContext?.[cleanExpr] ||
        stepContext?.items ||
        stepContext?.arr ||
        stepContext?.vars?.[cleanExpr] ||
        stepContext?.vars?.items ||
        stepContext?.vars?.arr ||
        stepContext?.nums ||
        varsMap.get(cleanExpr)?.raw ||
        varsMap.get('items')?.raw ||
        varsMap.get('arr')?.raw ||
        varsMap.get('nums')?.raw;

      if (Array.isArray(arrData) && arrData.length > 0) {
        // 过滤占位项（如 1-indexed 数组的 index 0: null/undefined）
        const isOneIndexed = arrData[0] === null || arrData[0] === undefined;
        const validItems = isOneIndexed ? arrData.slice(1) : arrData;
        const totalCount = validItems.length;

        // 格式化整个数组值
        let arrayPreview = '';
        const is2DArray = validItems.some((it: any) => Array.isArray(it));
        if (is2DArray) {
          const formattedRows = validItems.slice(0, 6).map((it: any) => {
            if (Array.isArray(it)) {
              return `[${it.join(', ')}]`;
            }
            return String(it);
          });
          const suffix = totalCount > 6 ? `, ... (共 ${totalCount} 项)` : '';
          arrayPreview = `[${formattedRows.join(', ')}${suffix}]`;
        } else {
          const formattedItems = validItems.slice(0, 8).map((it: any) => String(it));
          const suffix = totalCount > 8 ? `, ... (共 ${totalCount} 项)` : '';
          arrayPreview = `[${formattedItems.join(', ')}${suffix}]`;
        }

        // 检测当前指针上下文 (k, i, mid)
        const idxKey = varsMap.has('k') ? 'k' : varsMap.has('i') ? 'i' : varsMap.has('mid') ? 'mid' : undefined;
        const idxVal = idxKey ? varsMap.get(idxKey)?.value : undefined;
        let pointerDetail = '';

        if (idxVal != null) {
          const idxNum = parseInt(idxVal, 10);
          if (!isNaN(idxNum) && idxNum >= 0 && idxNum < arrData.length) {
            const itemVal = arrData[idxNum];
            if (Array.isArray(itemVal) && itemVal.length >= 3) {
              pointerDetail = `。当前指针 ${idxKey}=${idxVal} 指向物品 #${idxVal} 特征三元组: 体积 ${itemVal[0]}, 价值 ${itemVal[1]}, 组号 ${itemVal[2]}`;
            } else if (itemVal !== null && itemVal !== undefined) {
              const itemPreview = Array.isArray(itemVal) ? `[${itemVal.join(', ')}]` : String(itemVal);
              pointerDetail = `。当前指针 ${idxKey}=${idxVal} 指向元素: ${cleanExpr}[${idxVal}] = ${itemPreview}`;
            }
          }
        }

        const typeDesc = is2DArray ? '二维物品数组' : '数据数组';
        return {
          name: cleanExpr,
          value: arrayPreview,
          type: 'array',
          detail: `${typeDesc} (共 ${totalCount} 项)${pointerDetail}`,
          raw: arrData,
        };
      }
    }

    // 0.08 特殊处理：若查询 piles (硬币栈集合)，展示全部硬币栈并关联当前栈指针与抽取状态
    if (cleanExpr === 'piles') {
      const pilesData =
        stepContext?.piles ||
        stepContext?.vars?.piles ||
        varsMap.get('piles')?.raw;

      if (Array.isArray(pilesData) && pilesData.length > 0) {
        const formattedPiles = pilesData.map((p: any) => (Array.isArray(p) ? `[${p.join(', ')}]` : String(p)));
        const valPreview = `[${formattedPiles.join(', ')}]`;

        const curIVal = varsMap.get('i')?.value;
        const curCVal = varsMap.get('c')?.value;
        let pointerDetail = '';
        if (curIVal != null) {
          const iNum = parseInt(curIVal, 10);
          if (!isNaN(iNum) && iNum >= 0 && iNum < pilesData.length) {
            const curPile = pilesData[iNum];
            const pileStr = Array.isArray(curPile) ? `[${curPile.join(', ')}]` : String(curPile);
            const cStr = curCVal != null ? `，当前试选抽取 c=${curCVal} 枚` : '';
            pointerDetail = `。当前指针 i=${curIVal} 指向硬币栈 #${curIVal}: ${pileStr}${cStr}`;
          }
        }

        return {
          name: 'piles',
          value: valPreview,
          type: 'array',
          detail: `硬币栈列表 (共 ${pilesData.length} 个独立栈)${pointerDetail}`,
          raw: pilesData,
        };
      }
    }

    // 0.09 特殊处理：若查询 preSum (前缀和数组)
    if (cleanExpr === 'preSum' || cleanExpr === 'presum') {
      const curIVal = varsMap.get('i')?.value;
      const pilesData = stepContext?.piles || varsMap.get('piles')?.raw;
      const curI = curIVal != null ? parseInt(curIVal, 10) : 0;
      const curPile = Array.isArray(pilesData) && curI >= 0 && curI < pilesData.length ? pilesData[curI] : null;

      let preSumArr = stepContext?.preSum || varsMap.get('preSum')?.raw;
      if (!Array.isArray(preSumArr) && Array.isArray(curPile)) {
        preSumArr = [0];
        for (let p = 0; p < curPile.length; p++) {
          preSumArr.push(preSumArr[p] + curPile[p]);
        }
      }

      if (Array.isArray(preSumArr) && preSumArr.length > 0) {
        const curCVal = varsMap.get('c')?.value;
        let cDetail = '';
        if (curCVal != null) {
          const cNum = parseInt(curCVal, 10);
          if (!isNaN(cNum) && cNum >= 0 && cNum < preSumArr.length) {
            cDetail = `。当前连续拿取 c=${curCVal} 枚面值收益 = ${preSumArr[cNum]}`;
          }
        }
        return {
          name: cleanExpr,
          value: `[${preSumArr.join(', ')}]`,
          type: 'array',
          detail: `当前栈前缀和数组 (长度 ${preSumArr.length}): 索引 c 代表连续提取 c 枚硬币的总面值${cDetail}`,
          raw: preSumArr,
        };
      }
    }

    // 0.1 特殊处理：若查询 graph / adj 且当前存在 u / curNode，丰富出边详情
    if (cleanExpr === 'graph' || cleanExpr === 'adj' || cleanExpr === 'adjacencyList') {
      const uVal = varsMap.get('u')?.value || varsMap.get('curNode')?.value;
      const graphData = stepContext?.graph || stepContext?.adj || varsMap.get('graph')?.raw || varsMap.get('adj')?.raw;
      if (uVal != null && Array.isArray(graphData)) {
        const uIdx = parseInt(uVal, 10);
        const neighbors = graphData[uIdx];
        if (Array.isArray(neighbors)) {
          const formattedNeighbors = neighbors
            .map((item: any) => {
              if (item && typeof item === 'object') {
                if ('to' in item && 'w' in item) return `(➔ N${item.to}, ${item.w}ms)`;
                if ('to' in item) return `➔ N${item.to}`;
              }
              if (Array.isArray(item) && item.length >= 2) return `(➔ N${item[0]}, ${item[1]}ms)`;
              return `➔ N${item}`;
            })
            .join(', ');
          const listStr = neighbors.length > 0 ? formattedNeighbors : '无出边 (终端节点)';
          const validRows: string[] = [];
          graphData.forEach((row: any, nodeIdx: number) => {
            if (Array.isArray(row) && row.length > 0) {
              const rowPreview = row.map((x: any) => {
                if (x && typeof x === 'object') {
                  if ('to' in x && 'w' in x) return `[${x.to}, ${x.w}]`;
                  if (Array.isArray(x)) return `[${x.join(', ')}]`;
                }
                return String(x);
              }).join(', ');
              validRows.push(`${nodeIdx}: [${rowPreview}]`);
            }
          });
          const summary = validRows.length > 0 ? `{ ${validRows.join(', ')} }` : '[]';
          return {
            name: cleanExpr,
            value: summary,
            type: 'array',
            detail: `${graphData.length} 节点邻接表: 节点 ${uVal} 出边: ${listStr} (全图: ${summary})`,
            raw: graphData,
          };
        }
      }
    }

    // 1. 精确匹配
    if (varsMap.has(cleanExpr)) {
      return this.enrichDetail(varsMap.get(cleanExpr)!, cleanExpr, stepContext);
    }

    // 2. 忽略大小写匹配
    const lower = cleanExpr.toLowerCase();
    for (const [k, v] of varsMap.entries()) {
      if (k.toLowerCase() === lower) {
        return this.enrichDetail(v, cleanExpr, stepContext);
      }
    }

    // 3. 复合二维下标求值: 如 dp[l][r], dp[i][j], arr[k][1], memo[l][r], dp[i - 1][j - arr[k][0]]
    const parsedSub = this.parseSubscriptExpression(cleanExpr);
    if (parsedSub && parsedSub.indices.length === 2) {
      const tableName = parsedSub.tableName;
      const rExpr = parsedSub.indices[0].trim();
      const cExpr = parsedSub.indices[1].trim();
      const rVal = this.evaluateIndexExpr(rExpr, varsMap, stepContext);
      const cVal = this.evaluateIndexExpr(cExpr, varsMap, stepContext);

      let tableData: any = null;
      if (tableName === 'arr' || tableName === 'items') {
        tableData = stepContext?.items || stepContext?.arr || stepContext?.vars?.items || stepContext?.vars?.arr || varsMap.get('items')?.raw || varsMap.get('arr')?.raw;
      } else if (tableName === 'dp' || tableName === 'memo' || tableName === 'dpTable' || tableName === 'memoGrid') {
        tableData = stepContext?.dpTable || stepContext?.grid || stepContext?.memoGrid || varsMap.get('dp')?.raw || varsMap.get('grid')?.raw;
      } else {
        tableData = stepContext?.[tableName] || varsMap.get(tableName)?.raw || stepContext?.grid || varsMap.get('grid')?.raw;
      }

      if (Array.isArray(tableData) && !isNaN(rVal) && !isNaN(cVal)) {
        const row = tableData[rVal];
        const cellVal = Array.isArray(row) ? row[cVal] : undefined;
        const displayVal = cellVal === null || cellVal === undefined ? '-' : String(cellVal);

        if (tableName === 'arr' || tableName === 'items') {
          let colSemantic = '';
          if (cVal === 0) {
            colSemantic = '消耗体积 (容量占用)';
          } else if (cVal === 1) {
            colSemantic = '收益价值 (价值增加)';
          } else if (cVal === 2) {
            colSemantic = '所属组号';
          }

          const tripleSummary = Array.isArray(row) && row.length >= 3
            ? `(所属三元组: [体积: ${row[0]}, 价值: ${row[1]}, 组号: ${row[2]}])`
            : '';

          const detail = colSemantic
            ? `物品 #${rVal} ${colSemantic} = ${displayVal} ${tripleSummary}`
            : `物品 #${rVal}[${cVal}] = ${displayVal} ${tripleSummary}`;

          return {
            name: `${tableName}[${rVal}][${cVal}]`,
            value: displayVal,
            type: 'expression',
            detail: detail.trim(),
            raw: cellVal,
          };
        }

        if (tableName === 'dp' || tableName === 'memo' || tableName === 'dpTable') {
          const stage = stepContext?.stage;
          let dpDetail = '';
          if (stage === 3 || stepContext?.teams != null) {
            dpDetail = `动态规划状态格 dp[${rVal}][${cVal}] = ${displayVal} (前 ${rVal} 组物品、容量为 ${cVal} 时的最大收益)`;
          } else {
            dpDetail = `动态规划状态格 ${tableName}[${rVal}][${cVal}] = ${displayVal}`;
          }
          return {
            name: `${tableName}[${rVal}][${cVal}]`,
            value: displayVal,
            type: 'expression',
            detail: dpDetail,
            raw: cellVal,
          };
        }

        return {
          name: `${tableName}[${rVal}][${cVal}]`,
          value: displayVal,
          type: 'expression',
          detail: `二维单元格 ${tableName}[${rVal}][${cVal}] = ${displayVal}`,
          raw: cellVal,
        };
      }
    }

    // 4. 一维下标求值: 如 dp[r], arr[i], nums[mid], s[l], head[u], next[cnt], dp[j], arr[k]
    if (parsedSub && parsedSub.indices.length === 1) {
      const arrName = parsedSub.tableName;
      const idxExpr = parsedSub.indices[0].trim();
      const idxVal = this.evaluateIndexExpr(idxExpr, varsMap, stepContext);

      if (!isNaN(idxVal)) {
        // 先检查 varsMap 中是否已有推导好的精确具体项 (如 head[2], next[1])
        const exactSub = varsMap.get(`${arrName}[${idxVal}]`);
        if (exactSub) {
          return {
            name: `${arrName}[${idxVal}]`,
            value: exactSub.value,
            type: 'expression',
            detail: exactSub.detail || `${cleanExpr} = ${exactSub.value}`,
          };
        }

        let arrData: any = null;
        if (arrName === 'arr' || arrName === 'items') {
          arrData = stepContext?.items || stepContext?.arr || stepContext?.vars?.items || stepContext?.vars?.arr || varsMap.get('items')?.raw || varsMap.get('arr')?.raw;
        } else if (arrName === 'dp' || arrName === 'slots' || arrName === 'slotVector') {
          arrData = stepContext?.slotVector || stepContext?.slots || varsMap.get('slots')?.raw || varsMap.get('slotVector')?.raw || varsMap.get('dp')?.raw;
        } else if (arrName === 'values') {
          arrData = stepContext?.values || stepContext?.dp1d || varsMap.get('values')?.raw || varsMap.get('dp1d')?.raw;
        } else if (arrName === 'val') {
          arrData = stepContext?.val || stepContext?.dp1d || varsMap.get('val')?.raw || varsMap.get('dp1d')?.raw;
        } else {
          arrData = varsMap.get(arrName)?.raw || stepContext?.[arrName] || stepContext?.nums || stepContext?.s || stepContext?.str;
        }

        if (typeof arrData === 'string' && idxVal >= 0 && idxVal < arrData.length) {
          const ch = arrData[idxVal];
          return {
            name: `${arrName}[${idxVal}]`,
            value: `'${ch}'`,
            type: 'expression',
            detail: `'${ch}'`,
          };
        } else if (Array.isArray(arrData)) {
          const itemVal = arrData[idxVal];
          if (Array.isArray(itemVal) && (arrName === 'arr' || arrName === 'items') && itemVal.length >= 3) {
            return {
              name: `${arrName}[${idxVal}]`,
              value: `[${itemVal.join(', ')}]`,
              type: 'expression',
              detail: `物品 #${idxVal} 特征三元组: 体积 ${itemVal[0]}, 价值 ${itemVal[1]}, 组号 ${itemVal[2]} (二维结构: ${arrName}[k][0:体积, 1:价值, 2:组号])`,
              raw: itemVal,
            };
          }
          const displayVal = itemVal === null || itemVal === undefined ? '-' : (Array.isArray(itemVal) ? `[${itemVal.join(', ')}]` : String(itemVal));
          return {
            name: `${arrName}[${idxVal}]`,
            value: displayVal,
            type: 'expression',
            detail: `${arrName}[${idxVal}] = ${displayVal}`,
            raw: itemVal,
          };
        }
      }
    }

    // 5. 字符求值: 如 s.charAt(l), str.charAt(r)
    const charAtMatch = cleanExpr.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\.charAt\(([^)]+)\)$/);
    if (charAtMatch) {
      const strName = charAtMatch[1];
      const idxExpr = charAtMatch[2].trim();
      const idxVal = parseInt(varsMap.get(idxExpr)?.value ?? idxExpr, 10);
      const strData =
        stepContext?.[strName] ||
        varsMap.get(strName)?.raw ||
        stepContext?.s ||
        stepContext?.str ||
        varsMap.get('s')?.raw ||
        varsMap.get('str')?.raw ||
        varsMap.get('s')?.value?.replace(/^['"]|['"]$/g, '');

      if (typeof strData === 'string' && !isNaN(idxVal) && idxVal >= 0 && idxVal < strData.length) {
        const ch = strData[idxVal];
        return {
          name: `${strName}.charAt(${idxVal})`,
          value: `'${ch}'`,
          type: 'expression',
          detail: `'${ch}'`,
        };
      }
    }

    // 6. Java 集合下标方法调用: 如 graph.get(u), list.get(i)
    const getMatch = cleanExpr.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\.get\(([^)]+)\)$/);
    if (getMatch) {
      const listName = getMatch[1];
      const idxExpr = getMatch[2].trim();
      const idxVal = parseInt(varsMap.get(idxExpr)?.value ?? idxExpr, 10);
      const listData = stepContext?.[listName] || varsMap.get(listName)?.raw;
      if (Array.isArray(listData) && !isNaN(idxVal) && idxVal >= 0 && idxVal < listData.length) {
        const itemVal = listData[idxVal];
        const preview = Array.isArray(itemVal)
          ? itemVal
              .map((x) => (x && typeof x === 'object' && 'to' in x ? `(N${x.to},${x.w})` : JSON.stringify(x)))
              .join(', ')
          : String(itemVal);
        return {
          name: `${listName}.get(${idxVal})`,
          value: `[${preview}]`,
          type: 'expression',
          detail: `${cleanExpr} = [${preview}]`,
          raw: itemVal,
        };
      }
    }

    // 7. 标准系统 / 算法通用常量与 I/O 句柄降级求值
    const systemHandles: Record<string, { value: string; type: ResolvedVariable['type']; detail: string }> = {
      br: { value: 'BufferedReader', type: 'object', detail: '字符缓冲输入流 (包装 System.in 提升读取性能)' },
      in: { value: 'StreamTokenizer', type: 'object', detail: '快速 I/O 分词器 (高频整数与符号极速解析)' },
      out: { value: 'PrintWriter', type: 'object', detail: '格式化输出打印流 (带缓冲批量 flush 杜绝 TLE)' },
      args: { value: 'String[]', type: 'array', detail: '主函数命令行启动入参 (String[] args)' },
      maxn: { value: '1005', type: 'number', detail: '常量: 物品/数据规模上限 (静态分配空间 1005)' },
      maxm: { value: '1005', type: 'number', detail: '常量: 背包容量/列规模上限 (静态分配空间 1005)' },
      inf: { value: '1000000000', type: 'number', detail: '无穷大哨兵常量 (1e9 / 0x3f3f3f3f)' },
      mod: { value: '1000000007', type: 'number', detail: '大质数取模常量 (1e9+7)' },
    };

    if (systemHandles[lower]) {
      const h = systemHandles[lower];
      return {
        name: cleanExpr,
        value: h.value,
        type: h.type,
        detail: h.detail,
      };
    }

    return undefined;
  }

  /**
   * 针对当前代码行生成行末内联调试提示文本（IDEA Inline Hints 格式）
   */
  public static formatInlineSummary(
    varsMap: Map<string, ResolvedVariable>,
    lineCode?: string
  ): string {
    if (!varsMap || varsMap.size === 0 || !lineCode) {
      return '';
    }

    const idents = new Set<string>();
    const matches = lineCode.match(/\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g);
    if (matches) {
      for (const m of matches) {
        idents.add(m);
      }
    }

    const matchedVars: string[] = [];
    for (const id of idents) {
      const v = this.getVariable(varsMap, id);
      if (v && v.value && !v.value.startsWith('{') && !v.value.startsWith('[')) {
        if (!matchedVars.some((item) => item.startsWith(`${v.name}:`))) {
          matchedVars.push(`${v.name}: ${v.value}`);
        }
      }
    }

    if (matchedVars.length === 0) return '';
    return `// ${matchedVars.slice(0, 4).join(', ')}`;
  }

  private static formatValueEntry(name: string, val: unknown): ResolvedVariable | undefined {
    if (val === undefined || val === null || typeof val === 'function') {
      return undefined;
    }

    if (typeof val === 'number') {
      return { name, value: String(val), type: 'number', raw: val };
    }
    if (typeof val === 'boolean') {
      return { name, value: String(val), type: 'boolean', raw: val };
    }
    if (typeof val === 'string') {
      const isQuoted = (val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"));
      const cleanVal = isQuoted ? val.slice(1, -1) : val;
      const isNumeric = /^-?\d+(\.\d+)?$/.test(cleanVal);
      return {
        name,
        value: isNumeric ? cleanVal : `"${cleanVal}"`,
        type: isNumeric ? 'number' : 'string',
        raw: val,
      };
    }
    if (Array.isArray(val)) {
      if (val.length === 0) {
        return { name, value: '[]', type: 'array', raw: val };
      }
      if (name === 'graph' || name === 'adj' || name === 'adjacencyList') {
        const validRows: string[] = [];
        val.forEach((row: any, nodeIdx: number) => {
          if (Array.isArray(row) && row.length > 0) {
            const rowPreview = row.map((x: any) => {
              if (x && typeof x === 'object') {
                if ('to' in x && 'w' in x) return `[${x.to}, ${x.w}]`;
                if (Array.isArray(x)) return `[${x.join(', ')}]`;
              }
              return String(x);
            }).join(', ');
            validRows.push(`${nodeIdx}: [${rowPreview}]`);
          }
        });
        const summary = validRows.length > 0 ? `{ ${validRows.join(', ')} }` : '[]';
        return {
          name,
          value: summary,
          type: 'array',
          detail: `${val.length} 节点邻接表: ${summary} (节点序号 -> [目标节点v, 耗时w])`,
          raw: val,
        };
      }
      if (name === 'times' || name === 'edges' || name === 'edgeList' || name === 'flightList') {
        if (Array.isArray(val[0])) {
          const preview = val.slice(0, 4).map((edge: any) => Array.isArray(edge) ? `[${edge.join(', ')}]` : String(edge)).join(', ');
          const valueStr = `[${preview}${val.length > 4 ? ', ...' : ''}]`;
          const detailStr = `${name} = ${valueStr} (共 ${val.length} 条边: [起点u, 终点v, 权重w])`;
          return {
            name,
            value: valueStr,
            type: 'array',
            detail: detailStr,
            raw: val,
          };
        }
        return {
          name,
          value: `[${val.length} 条边]`,
          type: 'array',
          raw: val,
        };
      }
      if (Array.isArray(val[0])) {
        if (name === 'matrix' || name === 'grid') {
          return { name, value: `[${val.length}×${val[0].length}]`, type: 'array', raw: val };
        }
        if (val.length <= 6) {
          const rowPreview = val.map((row: any) => Array.isArray(row) ? `[${row.slice(0, 4).join(',')}${row.length > 4 ? '..' : ''}]` : String(row)).join(', ');
          return {
            name,
            value: `[${rowPreview}]`,
            type: 'array',
            detail: `${name}: ${val.length} 项数据三元组/矩阵 [体积, 价值, 组号]`,
            raw: val,
          };
        }
        return { name, value: `[${val.length}×${val[0].length}]`, type: 'array', raw: val };
      }
      const formatItem = (x: any): string => {
        if (x === Infinity) return '∞';
        if (x === -Infinity) return '-∞';
        if (x && typeof x === 'object') {
          if ('u' in x && 'd' in x) return `(${x.u},${x.d})`;
          if ('node' in x && 'dist' in x) return `(${x.node},${x.dist})`;
          if ('to' in x && 'w' in x) return `(N${x.to},${x.w})`;
          if ('to' in x) return `N${x.to}`;
          try {
            return JSON.stringify(x);
          } catch {
            return '{...}';
          }
        }
        return String(x);
      };
      const preview = val.slice(0, 5).map(formatItem).join(', ');
      return {
        name,
        value: `[${preview}${val.length > 5 ? '...' : ''}]`,
        type: 'array',
        raw: val,
      };
    }
    if (val instanceof Set) {
      if (val.size === 0) {
        return { name, value: '∅ (空集)', type: 'object', raw: val };
      }
      const preview = Array.from(val).slice(0, 5).join(', ');
      return {
        name,
        value: `{${preview}${val.size > 5 ? '...' : ''}}`,
        type: 'object',
        raw: val,
      };
    }
    if (typeof val === 'object') {
      return { name, value: '{...}', type: 'object', raw: val };
    }
    return undefined;
  }

  private static deduceType(val: string): ResolvedVariable['type'] {
    if (/^-?\d+(\.\d+)?$/.test(val)) return 'number';
    if (val === 'true' || val === 'false') return 'boolean';
    if (val.startsWith('"') || val.startsWith("'")) return 'string';
    if (val.startsWith('[')) return 'array';
    if (val.startsWith('{')) return 'object';
    return 'expression';
  }
}
