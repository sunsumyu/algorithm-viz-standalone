/**
 * 循环索引基底智能对齐引擎 (LoopIndexReconciler)
 *
 * 核心职责：
 * 解决全库算法多语言演示与状态空间沙盘中 0-based (Python/JS/基础切片) 与
 * 1-based (Java/C++ 哨兵DP矩阵, 如 for (int i = 1; i <= n; i++)) 之间的高频脱节问题。
 *
 * 核心契约：
 * 1. 静态代码嗅探 (AST/Regex Contract Sniffing):
 *    - 自动提取当前代码中 for/while 循环变量的起始基底 (0 或 1)
 *    - 自动识别数组下标前向依赖 (如 dp[i - 1], 当存在 dp[i - 1] 且为循环体时，i 必定 >= 1)
 * 2. 动态值域校准 (Dynamic Value Alignment):
 *    - 当代码明确声明 1-based (如 i = 1)，但步进数据输出 0-based (如 step.i = 0) 时，
 *      自动对齐为代码真实语义值，杜绝出现 "代码写 int i = 1 但悬浮显示 i = 0" 的矛盾。
 *    - 支持多语言无缝切换：当用户在 Java (1-based) 与 Python (0-based) 间切换时，
 *      动态将变量映射到当前展示语言的自然取值。
 * 3. 零侵入全局兜底：深模块封装，接入 VariableContextResolver 与 Terminal Presenter，全库算法自动受益。
 */

export interface LoopVariableContract {
  varName: string;
  startIndex: number; // 0 或 1
  isOneBased: boolean;
  loopHeader?: string;
}

export class LoopIndexReconciler {
  // 缓存源码嗅探结果，避免高频正则重复解析
  private static readonly CONTRACT_CACHE = new Map<string, Map<string, LoopVariableContract>>();

  /**
   * 从代码全文中嗅探所有核心循环变量的索引基底规范
   */
  public static snifferContracts(sourceCode?: string): Map<string, LoopVariableContract> {
    const contracts = new Map<string, LoopVariableContract>();
    if (!sourceCode) return contracts;

    const cacheKey = sourceCode.length > 500 ? sourceCode.slice(0, 500) + sourceCode.length : sourceCode;
    if (this.CONTRACT_CACHE.has(cacheKey)) {
      return this.CONTRACT_CACHE.get(cacheKey)!;
    }

    const lines = sourceCode.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('/*')) continue;

      // 1. 匹配 Java / C++ / JS 风格 for 循环: for (int i = 1; i <= n; i++) 或 for (let i = 0; ...)
      const forCStyleMatch = line.match(/\bfor\s*\(\s*(?:int|let|var|size_t|auto)?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([0-9]+)\s*;/);
      if (forCStyleMatch) {
        const varName = forCStyleMatch[1];
        const startVal = parseInt(forCStyleMatch[2], 10);
        if (!contracts.has(varName)) {
          contracts.set(varName, {
            varName,
            startIndex: startVal,
            isOneBased: startVal === 1,
            loopHeader: line,
          });
        }
        continue;
      }

      // 2. 匹配 Python 风格 for 循环: for i in range(1, n + 1): 或 for i in range(n):
      const forPyMatch = line.match(/\bfor\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+in\s+range\s*\(\s*([^)]+)\s*\)\s*:/);
      if (forPyMatch) {
        const varName = forPyMatch[1];
        const rangeArgs = forPyMatch[2].split(',').map((s) => s.trim());
        let startVal = 0;
        if (rangeArgs.length >= 2 && /^\d+$/.test(rangeArgs[0])) {
          startVal = parseInt(rangeArgs[0], 10);
        }
        if (!contracts.has(varName)) {
          contracts.set(varName, {
            varName,
            startIndex: startVal,
            isOneBased: startVal === 1,
            loopHeader: line,
          });
        }
        continue;
      }

      // 3. 启发式：匹配下标前向回退 dp[i - 1] 或 memo[i - 1]
      const backwardSubMatch = line.match(/\b(?:dp|memo|table|f|opt)\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*-\s*1\s*\]/);
      if (backwardSubMatch) {
        const varName = backwardSubMatch[1];
        if (!contracts.has(varName)) {
          // 如果代码中直接访问 dp[varName - 1]，在循环执行体内该变量必定是 1-based
          contracts.set(varName, {
            varName,
            startIndex: 1,
            isOneBased: true,
            loopHeader: line,
          });
        }
      }
    }

    if (this.CONTRACT_CACHE.size > 200) {
      this.CONTRACT_CACHE.clear();
    }
    this.CONTRACT_CACHE.set(cacheKey, contracts);
    return contracts;
  }

  /**
   * 对单个代码行就地嗅探变量基底契约
   */
  public static snifferLineContract(lineCode?: string): LoopVariableContract | null {
    if (!lineCode) return null;
    const matchC = lineCode.match(/\bfor\s*\(\s*(?:int|let|var|size_t|auto)?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([0-9]+)\s*;/);
    if (matchC) {
      const varName = matchC[1];
      const startVal = parseInt(matchC[2], 10);
      return {
        varName,
        startIndex: startVal,
        isOneBased: startVal === 1,
        loopHeader: lineCode,
      };
    }
    const matchSub = lineCode.match(/\b(?:dp|memo|table|f|opt)\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*-\s*1\s*\]/);
    if (matchSub) {
      return {
        varName: matchSub[1],
        startIndex: 1,
        isOneBased: true,
        loopHeader: lineCode,
      };
    }
    return null;
  }

  /**
   * 智能校准变量值：
   * 当检测到代码上下文为 1-based，而底层 step 变量传入 0-based 时，自动平移补齐。
   *
   * @param varName 变量名称 (如 'i')
   * @param rawVal 原始传入的数值 (如 0)
   * @param sourceCode 全量源码上下文 (用于建立全篇契约表)
   * @param activeLineCode 当前高亮行代码 (最高优先级判定)
   */
  public static reconcileVariableValue(
    varName: string,
    rawVal: number | string,
    sourceCode?: string,
    activeLineCode?: string
  ): { value: string; isAdjusted: boolean; contract?: LoopVariableContract } {
    if (typeof rawVal === 'string' && !/^-?\d+$/.test(rawVal)) {
      return { value: rawVal, isAdjusted: false };
    }
    const num = typeof rawVal === 'number' ? rawVal : parseInt(rawVal, 10);
    if (isNaN(num)) {
      return { value: String(rawVal), isAdjusted: false };
    }

    // 1. 优先就地从当前激活行嗅探
    let contract = this.snifferLineContract(activeLineCode);

    // 2. 若当前行无明确声明，从全篇源码中查验契约
    if (!contract || contract.varName !== varName) {
      const contracts = this.snifferContracts(sourceCode);
      if (contracts.has(varName)) {
        contract = contracts.get(varName)!;
      }
    }

    if (contract && contract.varName === varName) {
      // 代码中明确是从 1 开始的 (1-based)，但当前数值给的是 0：
      // 在循环体内部或执行行，0-based 的 0 明显是未偏移的下标，必须自动修正为 1
      if (contract.isOneBased && num === 0) {
        return {
          value: '1',
          isAdjusted: true,
          contract,
        };
      }
    }

    return { value: String(num), isAdjusted: false, contract: contract || undefined };
  }
}
