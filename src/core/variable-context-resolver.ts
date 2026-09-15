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
    's1', 's2', 'a', 'b', 's', 'str', 'nums', 'arr', 'dp', 'memo', 'n', 'm',
  ]);

  /** 忽略的非业务属性名 */
  private static readonly IGNORED_KEYS = new Set([
    'treeRoot', 'graph', 'matrix', 'activeNodeId', 'children', 'status',
    'type', 'index', 'stepIndex', 'snapshot', 'codeLanguages', 'modeCodeLanguages',
    'decision', 'message', 'log', 'currentCell', 'depCells', 'visitedMap', 'activeTrail', 'activeStack',
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

    // ── 0. 优先解析 step.scope (一等局部变量快照) ───────────────────
    if (s.scope && typeof s.scope === 'object') {
      for (const [k, val] of Object.entries(s.scope)) {
        const entry = this.formatValueEntry(k, val);
        if (entry) {
          varsMap.set(k, entry);
        }
      }
    }

    // ── 1. 扫描 step 自身常见基础属性 ─────────────────────────────
    for (const [k, val] of Object.entries(s)) {
      if (this.IGNORED_KEYS.has(k)) continue;
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

    // ── 5. 解析显式 step.vars (最高优先级，覆盖启发式值) ───────────
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

    // 3. 网格矩阵行与列派生
    const grid = s.grid || s.dpTable || s.memoGrid;
    if (Array.isArray(grid) && grid.length > 0) {
      if (!varsMap.has('m')) {
        varsMap.set('m', { name: 'm', value: String(grid.length), type: 'number', raw: grid.length });
      }
      if (Array.isArray(grid[0]) && !varsMap.has('n')) {
        varsMap.set('n', { name: 'n', value: String(grid[0].length), type: 'number', raw: grid[0].length });
      }
    }

    // 4. 区间与滑动窗口智能推导 (l, r, len 三元互推)
    this.deriveIntervalTriad(s, varsMap);
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

    // 0. 特殊处理：若查询 dp / memo 且当前存在 l 和 r，优先丰富关联单元格详情
    if (cleanExpr === 'dp' || cleanExpr === 'memo' || cleanExpr === 'dpTable') {
      const lVal = varsMap.get('l')?.value || varsMap.get('i')?.value;
      const rVal = varsMap.get('r')?.value || varsMap.get('j')?.value;
      const tableData = stepContext?.dpTable || stepContext?.memoGrid || varsMap.get('dp')?.raw || varsMap.get('dpTable')?.raw;
      if (lVal != null && rVal != null && Array.isArray(tableData)) {
        const curCellVal = tableData[parseInt(lVal, 10)]?.[parseInt(rVal, 10)];
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

    // 1. 精确匹配
    if (varsMap.has(cleanExpr)) {
      return varsMap.get(cleanExpr);
    }

    // 2. 忽略大小写匹配
    const lower = cleanExpr.toLowerCase();
    for (const [k, v] of varsMap.entries()) {
      if (k.toLowerCase() === lower) {
        return v;
      }
    }

    // 3. 复合二维下标求值: 如 dp[l][r], dp[i][j], arr[i][j], memo[l][r]
    const index2DMatch = cleanExpr.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\[([^\]]+)\]\[([^\]]+)\]$/);
    if (index2DMatch) {
      const tableName = index2DMatch[1];
      const rExpr = index2DMatch[2].trim();
      const cExpr = index2DMatch[3].trim();
      const rVal = parseInt(varsMap.get(rExpr)?.value ?? rExpr, 10);
      const cVal = parseInt(varsMap.get(cExpr)?.value ?? cExpr, 10);

      const tableData = stepContext?.dpTable || stepContext?.memoGrid || varsMap.get(tableName)?.raw || varsMap.get('dp')?.raw || varsMap.get('dpTable')?.raw;
      if (Array.isArray(tableData) && !isNaN(rVal) && !isNaN(cVal)) {
        const cellVal = tableData[rVal]?.[cVal];
        const displayVal = cellVal === null || cellVal === undefined ? '-' : String(cellVal);
        return {
          name: `${tableName}[${rVal}][${cVal}]`,
          value: displayVal,
          type: 'expression',
          detail: `${cleanExpr} = ${displayVal}`,
        };
      }
    }

    // 4. 一维下标求值: 如 dp[r], arr[i], nums[mid], s[l]
    const index1DMatch = cleanExpr.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\[([^\]]+)\]$/);
    if (index1DMatch) {
      const arrName = index1DMatch[1];
      const idxExpr = index1DMatch[2].trim();
      const idxVal = parseInt(varsMap.get(idxExpr)?.value ?? idxExpr, 10);
      const arrData =
        stepContext?.[arrName] ||
        varsMap.get(arrName)?.raw ||
        stepContext?.s ||
        stepContext?.str ||
        varsMap.get('s')?.raw ||
        varsMap.get('str')?.raw ||
        varsMap.get('s')?.value?.replace(/^['"]|['"]$/g, '');

      if (!isNaN(idxVal)) {
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
          const displayVal = itemVal === null || itemVal === undefined ? '-' : String(itemVal);
          return {
            name: `${arrName}[${idxVal}]`,
            value: displayVal,
            type: 'expression',
            detail: `${cleanExpr} = ${displayVal}`,
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
      if (Array.isArray(val[0])) {
        return { name, value: `[${val.length}×${val[0].length}]`, type: 'array', raw: val };
      }
      const preview = val.slice(0, 5).join(', ');
      return {
        name,
        value: `[${preview}${val.length > 5 ? '...' : ''}]`,
        type: 'array',
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
