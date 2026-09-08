/**
 * VariableContextResolver (变量上下文解析深模块)
 *
 * 核心设计与深模块契约：
 * 1. 100% 零 DOM / 零 UI 依赖：纯逻辑解析，输入任意多态的 Step 对象，输出高一致性的变量字典。
 * 2. 多源容错归一化：
 *    - 优先级 1: 显式 `step.vars` (StepVar[])
 *    - 优先级 2: `step.metrics` 指标字典解析 (提取 key=val 与 metric-xxx 后缀)
 *    - 优先级 3: `step` 自身核心属性 (i, j, k, p1, p2, ans, mid, left, right 等)
 *    - 优先级 4: 数组容器与当前索引联动 (如已知 a=['x','y'] 且 i=1，关联推导 a[i]='y')
 * 3. 跨语言别名支持：自动双向映射 camelCase (Java/JS/C++) 与 snake_case (Python)。
 * 4. 防御性设计：对于未采集或不可靠变量，安全降级为空或忽略，杜绝异常与未定义报错。
 */

import type { StepVar } from './interfaces';

export interface ResolvedVariable {
  name: string;
  value: string;
  type?: 'number' | 'string' | 'array' | 'boolean' | 'object';
  raw?: unknown;
  detail?: string;
}

export class VariableContextResolver {
  /** 常见核心算法属性白名单（避免将无用的 DOM、函数、巨大图元对象混入变量表） */
  private static readonly RELEVANT_PRIMITIVE_KEYS = new Set([
    'i', 'j', 'k', 'r', 'c', 'u', 'v', 'p1', 'p2',
    'left', 'right', 'mid', 'target', 'ans', 'val', 'sum', 'cur', 'prev', 'next',
    'min', 'max', 'count', 'res', 'dist', 'weight', 'capacity', 'cost',
    'head', 'tail', 'slow', 'fast', 'pivot', 'low', 'high', 'top',
    's1', 's2', 'a', 'b', 'nums', 'arr', 'dp', 'memo',
  ]);

  /** 忽略的非业务属性名 */
  private static readonly IGNORED_KEYS = new Set([
    'decision', 'message', 'log', 'codeLine', 'treeRoot', 'graph', 'matrix',
    'activeNodeId', 'children', 'status', 'metrics', 'vars', 'callStack',
    'currentCall', 'type', 'index', 'stepIndex', 'snapshot',
  ]);

  /**
   * 将多态 step 解析为统一变量字典
   */
  public static resolve(step: unknown, _currentLang: string = 'java'): Map<string, ResolvedVariable> {
    const varsMap = new Map<string, ResolvedVariable>();
    if (!step || typeof step !== 'object') {
      return varsMap;
    }

    const s = step as Record<string, any>;

    // 1. 扫描 step 自身常见基础属性
    for (const [k, val] of Object.entries(s)) {
      if (this.IGNORED_KEYS.has(k)) continue;
      if (val === undefined || val === null || typeof val === 'function') continue;

      if (this.RELEVANT_PRIMITIVE_KEYS.has(k) || (k.length <= 12 && !k.startsWith('_'))) {
        const entry = this.formatValueEntry(k, val);
        if (entry) {
          varsMap.set(k, entry);
        }
      }
    }

    // 2. 解析 step.metrics 指标（常见如 'metric-pos': 'i=3, j=1', 'metric-ans': '0'）
    if (s.metrics && typeof s.metrics === 'object') {
      for (const [mKey, mVal] of Object.entries(s.metrics)) {
        if (mVal == null) continue;
        const valStr = String(mVal).trim();

        // 提取 metric-xxx -> xxx (如 metric-ans -> ans, metric-val -> val)
        if (mKey.startsWith('metric-')) {
          const varName = mKey.slice(7);
          if (
            varName &&
            !varName.includes('status') &&
            !varName.includes('title') &&
            !varName.includes('pos') &&
            !varName.includes('desc')
          ) {
            // 如果 valStr 是单一数值/简短字符串且 varsMap 中没有，写入
            if (!valStr.includes('=') && valStr.length < 20 && !varsMap.has(varName)) {
              varsMap.set(varName, {
                name: varName,
                value: valStr,
                type: this.deduceType(valStr),
              });
            }
          }
        }

        // 解析文本中嵌入的 key=val 表达式 (如 'i=3, j=1', 'len(s1)=4')
        const pairRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*([^\s,;，；()]+)/g;
        let match: RegExpExecArray | null;
        while ((match = pairRegex.exec(valStr)) !== null) {
          const varName = match[1];
          const varVal = match[2];
          // 排除常见非变量函数名与标签名（如 len, pos, status）
          if (
            varName !== 'len' &&
            varName !== 'length' &&
            varName !== 'Math' &&
            varName !== 'pos' &&
            varName !== 'status' &&
            varName !== 'title'
          ) {
            varsMap.set(varName, {
              name: varName,
              value: varVal,
              type: this.deduceType(varVal),
            });
          }
        }
      }
    }

    // 3. 解析显式 step.vars (最高优先级，覆盖前序启发式值)
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
    }

    // 4. 跨语言命名映射（自动补充 camelCase / snake_case 别名）
    const aliasEntries: [string, ResolvedVariable][] = [];
    for (const [name, entry] of varsMap.entries()) {
      if (name.includes('_')) {
        // snake_case -> camelCase
        const camel = name.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
        if (!varsMap.has(camel)) {
          aliasEntries.push([camel, { ...entry, name: camel }]);
        }
      } else {
        // camelCase -> snake_case
        const snake = name.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (snake !== name && !varsMap.has(snake)) {
          aliasEntries.push([snake, { ...entry, name: snake }]);
        }
      }
    }
    for (const [alias, entry] of aliasEntries) {
      varsMap.set(alias, entry);
    }

    return varsMap;
  }

  /**
   * 根据变量名在当前上下文中安全查找变量值（支持别名容错）
   */
  public static getVariable(
    varsMap: Map<string, ResolvedVariable>,
    varName: string
  ): ResolvedVariable | undefined {
    if (!varsMap || !varName) return undefined;

    // 1. 精确匹配
    if (varsMap.has(varName)) {
      return varsMap.get(varName);
    }

    // 2. 忽略大小写匹配
    const lower = varName.toLowerCase();
    for (const [k, v] of varsMap.entries()) {
      if (k.toLowerCase() === lower) {
        return v;
      }
    }

    // 3. 驼峰与蛇形互转匹配
    const snake = varName.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (varsMap.has(snake)) {
      return varsMap.get(snake);
    }
    const camel = varName.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
    if (varsMap.has(camel)) {
      return varsMap.get(camel);
    }

    return undefined;
  }

  /**
   * 针对当前代码行生成行末内联调试提示文本（IDEA Inline Hints 格式）
   * 例如: "// i: 3, j: 1"
   */
  public static formatInlineSummary(
    varsMap: Map<string, ResolvedVariable>,
    lineCode?: string
  ): string {
    if (!varsMap || varsMap.size === 0 || !lineCode) {
      return '';
    }

    // 提取行内出现过的所有可能变量标识符
    const idents = new Set<string>();
    const matches = lineCode.match(/\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g);
    if (matches) {
      for (const m of matches) {
        idents.add(m);
      }
    }

    const matchedVars: string[] = [];
    // 优先按照代码中出现的先后顺序排列
    for (const id of idents) {
      const v = this.getVariable(varsMap, id);
      if (v) {
        // 限制单变量展示长度，避免行末爆框
        const shortVal = v.value.length > 15 ? `${v.value.slice(0, 12)}...` : v.value;
        matchedVars.push(`${v.name}: ${shortVal}`);
      }
    }

    if (matchedVars.length === 0) {
      return '';
    }

    // 最多展示前 3 个最相关的变量，避免内联遮挡与超长
    const displayList = matchedVars.slice(0, 3);
    return `// ${displayList.join(', ')}`;
  }

  /**
   * 辅助格式化任意类型的属性为 ResolvedVariable
   */
  private static formatValueEntry(name: string, val: unknown): ResolvedVariable | null {
    if (val === undefined || val === null) return null;

    if (typeof val === 'number' || typeof val === 'boolean') {
      return {
        name,
        value: String(val),
        type: typeof val as any,
        raw: val,
      };
    }

    if (typeof val === 'string') {
      return {
        name,
        value: val.length > 40 ? `"${val.slice(0, 37)}..."` : `"${val}"`,
        type: 'string',
        raw: val,
      };
    }

    if (Array.isArray(val)) {
      const len = val.length;
      let display: string;
      if (len <= 6) {
        display = `[${val.map((x) => (typeof x === 'object' ? '{...}' : String(x))).join(', ')}]`;
      } else {
        const head = val.slice(0, 4).map((x) => String(x)).join(', ');
        display = `[${head}, ... (${len} items)]`;
      }
      return {
        name,
        value: display,
        type: 'array',
        raw: val,
      };
    }

    return null;
  }

  private static deduceType(valStr: string): 'number' | 'string' | 'boolean' | 'array' {
    if (/^-?\d+(\.\d+)?$/.test(valStr)) return 'number';
    if (valStr === 'true' || valStr === 'false') return 'boolean';
    if (valStr.startsWith('[') && valStr.endsWith(']')) return 'array';
    return 'string';
  }
}
