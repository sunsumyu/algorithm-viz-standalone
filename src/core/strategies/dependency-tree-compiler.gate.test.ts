/**
 * 状态依赖树展开策略门禁测试 (State Dependency Tree Strategy Gates)
 *
 * 铁律：顶层强制约束和公用的必须在顶层实现。
 * DAG→树展开策略（胜者链追溯基底 / 落选分支预算截断 / 节点上限）的唯一实现是
 * StateDependencyTreeCompiler (src/core/strategies/dependency-tree-compiler.ts)。
 *
 * 门禁 1：算法渲染器内禁止出现自写深度/节点截断常量
 *        （MAX_TREE_DEPTH= / maxExpandDepth= / MAX_NODES= 字面量 → 红灯）。
 *        历史教训：dp-067 LCS 依赖树被 maxExpandDepth=2 拦腰截断、
 *        strategy-helpers 三胞胎的 MAX_TREE_DEPTH=4 在 m+n>6 时断链——
 *        同一策略散落 N 处即同一 bug 以 N 种姿态复发。
 *
 * 门禁 2：引擎展开策略核心语义回归（胜者链闭合到基底、落选分支截断、节点上限保险丝）。
 *
 * 门禁 3：树依赖生成禁止使用运行时 modelId 字符串分发
 *        （modelId === 'xxx' / modelId.startsWith('xxx') → 红灯）。
 *        历史教训：1D DP builder 用 if/else on modelId 分发依赖边规则，散点难维护、
 *        新增模型容易遗漏分支。必须改用静态 LINEAR_DEP_RULES 表查询。
 *
 * 门禁 4：算法渲染器内禁止自写树克隆函数体
 *        （cloneTree/cloneLcsTree 等本地递归克隆定义 → 红灯）。
 *        历史教训：9 处结构近相同的本地克隆实现，一处遗漏字段即状态串扰；
 *        统一为 core/strategies/tree-clone.ts 的 cloneStateDepTree 唯一实现。
 *        委托形式（function cloneTree(...) { return cloneStateDepTree(...); }）合规。
 *
 * 门禁 5：递归阶段（阶段 1）步骤生成器必须接入 RecursionTraceTracker
 *        （同文件内同时出现 `steps.length >= maxSteps` 保险丝与
 *        `callStack: [...callStack]` 栈快照却未 import tracker → 红灯）。
 *        历史教训：target-sum/buy-goods/bounded-knapsack 各自手写五项骨架
 *        （保险丝/栈快照/stepIndex/totalSteps 回填/树克隆），散落即漏写。
 */
import { describe, it, expect } from 'vitest';
import { compileStateDependencyTree, type StateDependencyRule } from './dependency-tree-compiler';

// 全量算法源码文本（Vite raw glob，与 algorithm-loader 同一文件宇宙；tsc 作用域内无 node 类型，禁用 node:fs）
const algorithmSources = import.meta.glob<string>('../../algorithms/**/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
});
// 顶层策略模块源码（含 core/strategies，算法可视化策略层聚集地）
const coreStrategySources = import.meta.glob<string>('./*.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
});
// 非测试文件集合（门检守卫）
const nonTestFiles = Object.keys(algorithmSources).filter((f) => !f.endsWith('.test.ts'));

describe('StateDependencyTreeCompiler — 渲染器防退化门禁', () => {
  it('算法渲染器内禁止自写深度/节点截断常量（违者改用顶层引擎）', () => {
    expect(nonTestFiles.length).toBeGreaterThan(500);

    const violations: string[] = [];
    // 与「DAG→树展开策略」同义的截断字面量：声明即违例（含默认参数形式）
    const capPatterns = [
      /MAX_TREE_DEPTH\s*=\s*\d+/g,
      /maxExpandDepth\s*=\s*\d+/g,
      /MAX_NODES\s*=\s*\d+/g,
    ];
    for (const [file, src] of Object.entries(algorithmSources)) {
      if (file.endsWith('.test.ts')) continue;
      for (const pat of capPatterns) {
        pat.lastIndex = 0;
        const hits = src.match(pat);
        if (hits) {
          violations.push(`${file}: ${hits.join(', ')}`);
        }
      }
    }
    expect(
      violations,
      `检测到算法层自写树展开截断策略，必须迁移到 StateDependencyTreeCompiler:\n${violations.join('\n')}`
    ).toEqual([]);
  });

  it('树依赖生成禁止出现运行时 modelId 字符串分发（违者改用静态规则表）', () => {
    // 仅扫描树依赖生成聚集处：strategy-helpers.ts（含 1D builder） + engine
    // 注意：其他策略文件里的 modelId === 仅用于步骤码/表格选型，与树依赖分发无关，合法。
    const treeBuilderSources = Object.fromEntries(
      Object.entries(coreStrategySources).filter(([f]) =>
        f === './strategy-helpers.ts' || f === './dependency-tree-compiler.ts' || f === './tree-clone.ts'
      )
    );
    expect(Object.keys(treeBuilderSources).length).toBeGreaterThanOrEqual(1);

    const violations: string[] = [];
    // modelId 字符串精确/前缀匹配是运行时分发 — 静态表查阅应作为唯一合规路径
    const dispatchPatterns = [
      /modelId\s*===\s*['"][a-z-]/g,
      /modelId\.startsWith\s*\(/g,
    ];
    for (const [file, src] of Object.entries(treeBuilderSources)) {
      for (const pat of dispatchPatterns) {
        pat.lastIndex = 0;
        const hits = src.match(pat);
        if (hits) {
          violations.push(`${file}: ${hits.join(', ')}`);
        }
      }
    }
    expect(
      violations,
      `检测到运行时 modelId 分发在树依赖生成中，必须改用静态 LINEAR_DEP_RULES 表查询:\n${violations.join('\n')}`
    ).toEqual([]);
  });

  it('LCS 依赖树禁止 childDepth 运行时分支（违者改用声明式边呈现表）', () => {
    // childDepth === 1 / rootAdjacent 分支是表达“根邻接层 vs 更深层标签差异”的隐式 if/else —
    // 必须被声明式 2-row 表查替，不能在依赖生成中裸写 if(childDepth===1) 或三目分支。
    // 允许在注释/参数传递/表查阅 (p = TABLE[idx]) 中出现。
    // 注：LCS 依赖树生成权已移交顶层编译器 sequence-lcs-compiler.ts（历史手写 renderer 已删除），
    // 门禁扫描对象随之重定向到 core/strategies 策略层源码集合。
    const lcsSources = Object.fromEntries(
      Object.entries(coreStrategySources).filter(([f]) =>
        f.includes('sequence-lcs-compiler')
      )
    );
    expect(Object.keys(lcsSources).length).toBe(1);

    const violations: string[] = [];
    const branchPatterns = [
      /if\s*\(\s*childDepth\s*===\s*1\s*\)/g,
      /childDepth\s*===\s*1\s*\?/,
      /rootAdjacent\s*[?:]/,
    ];
    for (const [file, src] of Object.entries(lcsSources)) {
      for (const pat of branchPatterns) {
        pat.lastIndex = 0;
        const hits = src.match(pat);
        if (hits) {
          violations.push(`${file}: ${hits.join(', ')}`);
        }
      }
    }
    expect(
      violations,
      `LCS 依赖生成中不允许 childDepth/rootAdjacent 分支，改用声明式边呈现表:\n${violations.join('\n')}`
    ).toEqual([]);
  });

  it('算法渲染器禁止手写网格深拷贝（违者改用 snapshotGrid2D）', () => {
    expect(nonTestFiles.length).toBeGreaterThan(500);

    const violations: string[] = [];
    // 手写网格深拷贝模式 — 易遗漏嵌套行拷贝引发状态串扰
    // 合规路径：调用 snapshotGrid2D / clone2d / snapshotDpGrid
    const inlineClonePatterns = [
      /\.map\(\(row\)\s*=>\s*\[\.\.\.row\]\)/g,
      /\.map\(\(r\)\s*=>\s*\[\.\.\.r\]\)/g,
      /JSON\.parse\(JSON\.stringify\(/g,
    ];
    for (const [file, src] of Object.entries(algorithmSources)) {
      if (file.endsWith('.test.ts')) continue;
      if (!file.includes('/dynamic-programming/') && !file.includes('/grid-') && !file.includes('/graph/')) continue;
      for (const pat of inlineClonePatterns) {
        pat.lastIndex = 0;
        const hits = src.match(pat);
        if (hits) {
          violations.push(`${file}: ${hits.join(', ')}`);
        }
      }
    }
    expect(
      violations,
      `检测到手写网格深拷贝，必须改用 snapshotGrid2D:\n${violations.join('\n')}`
    ).toEqual([]);
  });

  it('算法渲染器禁止自写树克隆函数体（违者改用 cloneStateDepTree 委托）', () => {
    expect(nonTestFiles.length).toBeGreaterThan(500);

    const violations: string[] = [];
    // 自写克隆签名 — 含递归字段列举体的本地实现（委托体只 return cloneStateDepTree(...) 合规）
    const localClonePatterns = [
      /function\s+(clone\w*Tree\w*)\s*\(\s*\w+[^)]*\)\s*:\s*[\w<>. |]+\s*\{(?![^}]*return\s+cloneStateDepTree)/g,
    ];
    for (const [file, src] of Object.entries(algorithmSources)) {
      if (file.endsWith('.test.ts')) continue;
      for (const pat of localClonePatterns) {
        pat.lastIndex = 0;
        const hits = src.match(pat);
        if (hits) {
          violations.push(`${file}: ${hits.join(', ')}`);
        }
      }
    }
    expect(
      violations,
      `检测到本地树克隆实现，必须改用 cloneStateDepTree 委托:\n${violations.join('\n')}`
    ).toEqual([]);
  });

  it('递归阶段生成器必须接入 RecursionTraceTracker（pushStep 体含手写骨架字面量却无 tracker.pushStep → 红灯）', () => {
    // 检测粒度 = pushStep 函数体（非文件级），避免误伤 memo/2D 段的手写 stepIndex/totalSteps。
    // 递归阶段骨架标志（出现在 pushStep 体 = 引擎托管字段被手写）：
    //   - callStack: [...callStack]   （栈快照）
    //   - treeRoot: cloneXxx(          （树快照 — binary-split 段）
    // 已接入引擎的 pushStep 体必含 tracker.pushStep 调用 → 豁免。
    expect(nonTestFiles.length).toBeGreaterThan(500);

    const violations: string[] = [];
    // 仅递归骨架字段（callStack 栈快照 / treeRoot 树克隆）—— memo/2D 段不含这两者，不误伤
    const recursionSkeleton = [
      /callStack:\s*\[\.\.\.callStack\]/,
      /treeRoot:\s*clone\w*\s*\(/,
    ];
    const pushStepRegex = /(?:const|let|var|function)\s+pushStep\s*(?:=\s*)?(?:\([^)]*\)|[\w\s,|?:]*?)\s*(?:=>)?\s*\{/g;

    for (const [file, src] of Object.entries(algorithmSources)) {
      if (file.endsWith('.test.ts')) continue;
      // 排除 universal-stage-engine 系（IStrictRecursionStep / UniversalTreeNode / LpsRecStep 等），
      // 它们由独立的 UniversalStep 策略管辖，不归入 RecursionTraceTracker 骨架。
      if (/IStrictRecursionStep|UniversalTreeNode|LpsRecStep|universal-stage-engine/.test(src)) continue;

      let m: RegExpExecArray | null;
      pushStepRegex.lastIndex = 0;
      while ((m = pushStepRegex.exec(src))) {
        // 定位 pushStep 函数体起始 '{'
        const braceStart = m.index + m[0].length - 1;
        let depth = 0;
        let bodyEnd = braceStart;
        for (let i = braceStart; i < src.length; i++) {
          const ch = src[i];
          if (ch === '{') depth++;
          else if (ch === '}') { depth--; if (depth === 0) { bodyEnd = i; break; } }
          else if (ch === '"' || ch === "'" || ch === '`') {
            // 跳过字符串（含转义）
            const q = ch; i++;
            while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; }
          }
          else if (ch === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; }
          else if (ch === '/' && src[i + 1] === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i++; }
        }
        const body = src.slice(braceStart, bodyEnd + 1);
        const hasSkeleton = recursionSkeleton.some((p) => p.test(body));
        const hasTracker = /tracker\.pushStep/.test(body);
        if (hasSkeleton && !hasTracker) {
          violations.push(`${file}: pushStep 内含手写递归骨架（callStack 栈快照 / treeRoot 树克隆）却未调用 tracker.pushStep，须迁移到 RecursionTraceTracker`);
        }
      }
    }
    expect(
      violations,
      `递归阶段骨架散落实现:\n${violations.join('\n')}`
    ).toEqual([]);
  });
});

describe('StateDependencyTreeCompiler — 展开策略核心语义回归', () => {
  interface Cell {
    r: number;
    c: number;
  }

  /** 二维网格依赖规则：首个依赖为脊柱胜者链，其余分支预算截断 */
  const gridRule = (m: number, n: number): StateDependencyRule<Cell> => ({
    key: (s) => `dp-${s.r}-${s.c}`,
    coord: (s) => ({ r: s.r, c: s.c }),
    label: (s) => ({ val: `dp[${s.r}][${s.c}]` }),
    isBase: (s) => s.r === 0 && s.c === 0,
    dependencies: (s) => {
      const deps: Array<{ state: Cell; edgeLabel: string; isWinner?: boolean }> = [];
      if (s.r > 0) deps.push({ state: { r: s.r - 1, c: s.c }, edgeLabel: '上' });
      if (s.c > 0) deps.push({ state: { r: s.r, c: s.c - 1 }, edgeLabel: '左' });
      // 脊柱胜者链：首个可用依赖接棒（上有则上，撞墙后左）
      if (deps.length > 0) deps[0].isWinner = true;
      return deps;
    },
  });

  it('胜者链不受深度预算限制，从根一路闭合到边界基底', () => {
    // 8×8 网格：脊柱链长 15 > 任何合理预算；预算设 3 验证链仍闭合
    const tree = compileStateDependencyTree({ r: 7, c: 7 }, gridRule(8, 8), { maxExpandDepth: 3, maxNodes: 100 });
    // 胜者链：网格规则将首个依赖标记为脊柱（上有则上，撞墙后左），即 children[0]
    const chain: string[] = ['7,7'];
    let cursor = tree;
    while (cursor.children.length > 0) {
      cursor = cursor.children[0];
      chain.push(`${cursor.r},${cursor.c}`);
    }
    expect(chain).toEqual(['7,7', '6,7', '5,7', '4,7', '3,7', '2,7', '1,7', '0,7', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1', '0,0']);
    expect(cursor.status).toBe('base');
  });

  it('落选分支严格按 maxExpandDepth 截断', () => {
    const tree = compileStateDependencyTree({ r: 5, c: 5 }, gridRule(6, 6), { maxExpandDepth: 2, maxNodes: 100 });
    // 根邻接的落选分支（左）深度 1，其子深度 2 后不再展开
    const rejected = tree.children.find((ch) => ch.edgeLabel === '左')!;
    expect(rejected.children.length).toBeGreaterThan(0);
    for (const leaf of rejected.children) {
      expect(leaf.children.length).toBe(0);
    }
  });

  it('maxNodes 全局保险丝：节点总数不超过上限', () => {
    const tree = compileStateDependencyTree({ r: 20, c: 20 }, gridRule(21, 21), { maxExpandDepth: 2, maxNodes: 15 });
    const count = (node: typeof tree): number => 1 + node.children.reduce((acc, ch) => acc + count(ch), 0);
    expect(count(tree)).toBeLessThanOrEqual(15);
  });

  it('基底节点由 isBase 终止且 status 缺省为 base', () => {
    const tree = compileStateDependencyTree({ r: 1, c: 0 }, gridRule(2, 2), {});
    expect(tree.children.length).toBe(1);
    const baseNode = tree.children[0];
    expect(`${baseNode.r},${baseNode.c}`).toBe('0,0');
    expect(baseNode.status).toBe('base');
    expect(baseNode.children.length).toBe(0);
  });
});
