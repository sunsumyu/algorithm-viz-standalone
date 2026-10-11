/**
 * 前缀优化建图 (Prefix Optimization Graph) 步进推演编译器
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：推演朴素 O(N^2) 建图与前缀中继虚点链 O(N) 优化建图的执行流
 */

/** 代码面板高亮行号锚点（1-based，与源码逐行对应） */
const lines: Record<string, number | number[]> = {
  naiveInit: 12,
  naiveChain: 24,
  naiveQuery: 44,
  naiveDone: 44,
  naiveDone2: 12,
  prefixInit: 15,
  prefixInit2: 30,
  prefixChain: 34,
  prefixChain2: 37,
  prefixChain3: 38,
  prefixQuery: 44,
  prefixQuery2: 46,
  prefixQuery3: 47,
  prefixQuery4: 51,
  prefixDone: 47,
};

export interface PrefixOptStep {
  mode: 'naive' | 'prefix';
  numOriginalNodes: number;
  numPrefixNodes: number;
  numEdges: number;
  activeNode?: number | string;
  activeEdge?: [string, string];
  queryRange?: [number, number];
  activatedPrefixChain?: number[];
  status: 'init' | 'chain' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildPrefixOptSteps(mode: 'naive' | 'prefix'): PrefixOptStep[] {
  const steps: PrefixOptStep[] = [];

  if (mode === 'naive') {
    // 21 步朴素稠密建图逐步连边过程
    steps.push({
      mode: 'naive',
      numOriginalNodes: 5,
      numPrefixNodes: 0,
      numEdges: 0,
      status: 'init',
      message: '1. [朴素建图初始化] 载入 5 个实体节点 u1..u5。朴素建图不引入任何辅助中继虚点。',
      log: '初始化：5 个实体节点，当前边数 0',
      codeLine: lines.naiveInit,
      metrics: {
        'metric-opt-mode': '朴素两两稠密建图',
        'metric-edge-count': '0 条边',
        'metric-cur-op': '初始化',
        'metric-compression-ratio': '0% (无压缩)',
      },
    });

    const naiveEdges: Array<[number, number]> = [
      [2, 1],
      [3, 1], [3, 2],
      [4, 1], [4, 2], [4, 3],
      [5, 1], [5, 2], [5, 3], [5, 4],
    ];

    let edgeCount = 0;
    for (let i = 0; i < naiveEdges.length; i++) {
      const [u, v] = naiveEdges[i];
      edgeCount++;
      steps.push({
        mode: 'naive',
        numOriginalNodes: 5,
        numPrefixNodes: 0,
        numEdges: edgeCount,
        activeNode: u,
        activeEdge: [`${u}`, `${v}`],
        status: 'chain',
        message: `${i + 2}. [朴素两两连边] 节点 ${u} 向区间节点 ${v} 建立有向边 (${u} ➔ ${v})，累积第 ${edgeCount} 条边。`,
        log: `朴素直接连边：u${u} ➔ u${v} (边数 ${edgeCount})`,
        codeLine: lines.naiveChain,
        metrics: {
          'metric-opt-mode': '朴素两两稠密建图',
          'metric-edge-count': `${edgeCount} 条边`,
          'metric-cur-op': `直连边 u${u}->u${v}`,
          'metric-compression-ratio': '0% (边数剧增)',
        },
      });
    }

    // 外部查询模拟：Query 1 向 [1..4] 连边产生 4 条边
    for (let target = 1; target <= 4; target++) {
      edgeCount++;
      steps.push({
        mode: 'naive',
        numOriginalNodes: 5,
        numPrefixNodes: 0,
        numEdges: edgeCount,
        activeNode: 'S1',
        activeEdge: ['S1', `${target}`],
        queryRange: [1, 4],
        status: 'query',
        message: `${12 + target}. [外部查询连边] 源节点 S1 向区间 [1, 4] 独立直连边：S1 ➔ ${target} (第 ${edgeCount} 条边)！`,
        log: `区间直连边：S1 ➔ u${target} (边数 ${edgeCount})`,
        codeLine: lines.naiveQuery,
        metrics: {
          'metric-opt-mode': '朴素两两稠密建图',
          'metric-edge-count': `${edgeCount} 条边`,
          'metric-cur-op': `查询连边 S1->u${target}`,
          'metric-compression-ratio': '❌ 边数 O(N^2) 爆炸',
        },
      });
    }

    // 外部查询模拟：Query 2 向 [1..2] 连边产生 2 条边
    for (let target = 1; target <= 2; target++) {
      edgeCount++;
      steps.push({
        mode: 'naive',
        numOriginalNodes: 5,
        numPrefixNodes: 0,
        numEdges: edgeCount,
        activeNode: 'S2',
        activeEdge: ['S2', `${target}`],
        queryRange: [1, 2],
        status: 'query',
        message: `${16 + target}. [外部查询连边] 源节点 S2 向区间 [1, 2] 独立直连边：S2 ➔ ${target} (第 ${edgeCount} 条边)！`,
        log: `区间直连边：S2 ➔ u${target} (边数 ${edgeCount})`,
        codeLine: lines.naiveQuery,
        metrics: {
          'metric-opt-mode': '朴素两两稠密建图',
          'metric-edge-count': `${edgeCount} 条边`,
          'metric-cur-op': `查询连边 S2->u${target}`,
          'metric-compression-ratio': '❌ 边数 O(N^2) 爆炸',
        },
      });
    }

    // 总结步骤 19..21
    steps.push({
      mode: 'naive',
      numOriginalNodes: 5,
      numPrefixNodes: 0,
      numEdges: edgeCount,
      status: 'done',
      message: '19. [朴素建图弊端分析] 5 个节点仅 2 个区间查询，总边数就激增至 16 条！',
      log: '分析：朴素建图边数高达 16 条，极大增加空间占用',
      codeLine: lines.naiveDone,
      metrics: {
        'metric-opt-mode': '朴素两两稠密建图',
        'metric-edge-count': `${edgeCount} 条边`,
        'metric-cur-op': '开销审计',
        'metric-compression-ratio': '0% (严重冗余)',
      },
    });

    steps.push({
      mode: 'naive',
      numOriginalNodes: 5,
      numPrefixNodes: 0,
      numEdges: edgeCount,
      status: 'done',
      message: '20. [规模扩展推演] 若 N=10^5，朴素建图边数将突破 10^10 条，造成不可避免的 MLE 内存超限！',
      log: '推演：N=10^5 时边数超 10^10，必须引入前缀优化建图',
      codeLine: lines.naiveDone2,
      metrics: {
        'metric-opt-mode': '朴素两两稠密建图',
        'metric-edge-count': `${edgeCount} 条边`,
        'metric-cur-op': '极限规模推演',
        'metric-compression-ratio': '❌ 内存超限 (MLE)',
      },
    });

    steps.push({
      mode: 'naive',
      numOriginalNodes: 5,
      numPrefixNodes: 0,
      numEdges: edgeCount,
      status: 'done',
      message: '21. [总结] 朴素建图宣告结束。建议切换至「前缀优化建图」模式体验 O(N) 线性压缩。',
      log: '✓ 朴素演示结束：边数 16 条 (O(N^2) 复杂度)',
      codeLine: lines.naiveDone2,
      metrics: {
        'metric-opt-mode': '朴素两两稠密建图',
        'metric-edge-count': `${edgeCount} 条边`,
        'metric-cur-op': '对比完成',
        'metric-compression-ratio': '建议使用前缀优化',
      },
    });
  } else {
    // 21 步前缀优化建图完整算法模拟
    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 0,
      numEdges: 0,
      status: 'init',
      message: '1. [前缀优化建图初始化] 载入 5 个实体节点 1..5，准备构建前缀中继辅助链 P1..P5。',
      log: '初始化：分配实体节点 1..5，启动前缀虚点链构建',
      codeLine: lines.prefixInit,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': '0 条边',
        'metric-cur-op': '分配前缀链',
        'metric-compression-ratio': '准备构建',
      },
    });

    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: 0,
      activeNode: 'P1',
      status: 'init',
      message: '2. [前缀虚点映射] 实体节点 1..5 分别映射前缀虚点 P1..P5 (编号 6..10)，代表前缀集合 [1..i]。',
      log: '映射前缀虚点：P1..P5 对应前缀区间 [1..i]',
      codeLine: lines.prefixInit2,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': '0 条边',
        'metric-cur-op': '建立前缀虚点',
        'metric-compression-ratio': '0% 压缩',
      },
    });

    // 建立下垂与级联链 (Steps 3 ~ 12)
    let edges = 0;
    const cascadeSteps = [
      { p: 1, u: 1, cascade: null },
      { p: 2, u: 2, cascade: 1 },
      { p: 3, u: 3, cascade: 2 },
      { p: 4, u: 4, cascade: 3 },
      { p: 5, u: 5, cascade: 4 },
    ];

    let stepIdx = 3;
    for (const item of cascadeSteps) {
      // 1. 下垂边 P_i -> u_i
      edges++;
      steps.push({
        mode: 'prefix',
        numOriginalNodes: 5,
        numPrefixNodes: 5,
        numEdges: edges,
        activeNode: `P${item.p}`,
        activeEdge: [`P${item.p}`, `${item.u}`],
        status: 'chain',
        message: `${stepIdx++}. [前缀下垂透传] 添加有向边 P${item.p} ➔ ${item.u}：前缀虚点向对应实体点建立透传连接。`,
        log: `下垂边：P${item.p} ➔ u${item.u} (当前总边数 ${edges})`,
        codeLine: lines.prefixChain,
        metrics: {
          'metric-opt-mode': '前缀优化建图 (O(N))',
          'metric-edge-count': `${edges} 条边`,
          'metric-cur-op': `下垂边 P${item.p}->u${item.u}`,
          'metric-compression-ratio': '线性递增',
        },
      });

      // 2. 级联边 P_i -> P_{i-1}
      if (item.cascade !== null) {
        edges++;
        steps.push({
          mode: 'prefix',
          numOriginalNodes: 5,
          numPrefixNodes: 5,
          numEdges: edges,
          activeNode: `P${item.p}`,
          activeEdge: [`P${item.p}`, `P${item.cascade}`],
          status: 'chain',
          message: `${stepIdx++}. [前缀级联继承] 添加有向边 P${item.p} ➔ P${item.cascade}：若选 P${item.p}，前缀链自动级联覆盖至 [1..${item.cascade}]！`,
          log: `级联边：P${item.p} ➔ P${item.cascade} (当前总边数 ${edges})`,
          codeLine: lines.prefixChain2,
          metrics: {
            'metric-opt-mode': '前缀优化建图 (O(N))',
            'metric-edge-count': `${edges} 条边`,
            'metric-cur-op': `级联边 P${item.p}->P${item.cascade}`,
            'metric-compression-ratio': 'O(N) 线性约束',
          },
        });
      }
    }

    // Step 12: 前缀链闭环校验
    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      status: 'chain',
      message: '12. [前缀链闭环构建完毕] 5 个虚点共消耗 9 条边 (5 条下垂边 + 4 条级联边)，完成对任意前缀区间的线性抽象！',
      log: '前缀辅助链构建完毕：9 条边实现全区间前缀传递能力',
      codeLine: lines.prefixChain3,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': '前缀链闭环',
        'metric-compression-ratio': '2N-1 条骨架边',
      },
    });

    // Step 13 ~ 15: 查询 Q1: S1 连区间 [1, 4]
    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      activeNode: 'S1',
      queryRange: [1, 4],
      status: 'query',
      message: '13. [区间连边申请 Q1] 外部源节点 S1 需要向区间 [1, 4] 内所有 4 个实体节点建立有向边。',
      log: '查询 Q1：S1 ➔ [1..4]，朴素需 4 条边',
      codeLine: lines.prefixQuery,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': 'Q1 连向 [1..4]',
        'metric-compression-ratio': '准备 O(1) 连边',
      },
    });

    edges++;
    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      activeNode: 'S1',
      activeEdge: ['S1', 'P4'],
      queryRange: [1, 4],
      activatedPrefixChain: [4, 3, 2, 1],
      status: 'query',
      message: '14. [O(1) 连边优化生效] 仅需单向连接 1 条边 S1 ➔ P4！朴素需要 4 条边，此处省去 3 条边！',
      log: '优化连边：S1 ➔ P4 (仅消耗 1 条边！)',
      codeLine: lines.prefixQuery2,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': 'S1 -> P4 (1条边)',
        'metric-compression-ratio': '省下 3 条边 (节省 75%)',
      },
    });

    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      activeNode: 'S1',
      queryRange: [1, 4],
      activatedPrefixChain: [4, 3, 2, 1],
      status: 'query',
      message: '15. [连通性等价验证] 路径展开：S1 ➔ P4 ➔ 4；同时 P4 ➔ P3 ➔ 3 ➔ P2 ➔ 2 ➔ P1 ➔ 1，完全等价于直连 [1..4]！',
      log: '验证：通过 P4 级联链无损覆盖实体节点 4, 3, 2, 1',
      codeLine: lines.prefixQuery3,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': '级联传递生效',
        'metric-compression-ratio': '完全等价覆盖',
      },
    });

    // Step 16 ~ 18: 查询 Q2: S2 连区间 [1, 2]
    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      activeNode: 'S2',
      queryRange: [1, 2],
      status: 'query',
      message: '16. [区间连边申请 Q2] 外部源节点 S2 需要向区间 [1, 2] 建立连边约束。',
      log: '查询 Q2：S2 ➔ [1..2]，朴素需 2 条边',
      codeLine: lines.prefixQuery,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': 'Q2 连向 [1..2]',
        'metric-compression-ratio': '准备 O(1) 连边',
      },
    });

    edges++;
    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      activeNode: 'S2',
      activeEdge: ['S2', 'P2'],
      queryRange: [1, 2],
      activatedPrefixChain: [2, 1],
      status: 'query',
      message: '17. [O(1) 连边优化生效] 仅需添加 1 条边 S2 ➔ P2，通过 P2 ➔ P1 自动覆盖节点 2 与 1！',
      log: '优化连边：S2 ➔ P2 (仅消耗 1 条边！)',
      codeLine: lines.prefixQuery2,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': 'S2 -> P2 (1条边)',
        'metric-compression-ratio': '省下 1 条边 (节省 50%)',
      },
    });

    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      activeNode: 'S2',
      queryRange: [1, 2],
      activatedPrefixChain: [2, 1],
      status: 'query',
      message: '18. [2-SAT 至多选一拓展] 在 2-SAT 中，若选中 u_i，则添加边 u_i ➔ ¬P_{i-1}，前缀所有互斥命题皆在 O(1) 内闭合！',
      log: '拓展：2-SAT 至多选一约束 ui ➔ ¬P_{i-1} 实现 O(N) 互斥',
      codeLine: lines.prefixQuery4,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': '2-SAT 至多选一',
        'metric-compression-ratio': 'O(N) 极致压缩',
      },
    });

    // Step 19 ~ 21: 总结
    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      status: 'done',
      message: '19. [边数大对比] 朴素模式下需 16 条边；前缀优化模式下包含全部骨架与查询仅需 11 条边，查询越多优势越明显！',
      log: '对比：总边数 11 条 vs 朴素 16 条',
      codeLine: lines.prefixDone,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': '边数节约分析',
        'metric-compression-ratio': '显著领先朴素建图',
      },
    });

    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      status: 'done',
      message: '20. [高阶拓展] 前缀优化是一维特例。针对任意区间 [l, r] 或树上路径连边，可拓展为线段树优化建图与倍增优化建图！',
      log: '拓展：线段树/倍增建图将任意区间连边压缩至 O(M log N)',
      codeLine: lines.prefixDone,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': '高阶技巧延伸',
        'metric-compression-ratio': 'O(N) ~ O(M log N)',
      },
    });

    steps.push({
      mode: 'prefix',
      numOriginalNodes: 5,
      numPrefixNodes: 5,
      numEdges: edges,
      status: 'done',
      message: '21. [前缀优化建图完毕] 完美实现严格 O(N) 边数压缩，内存安全无冗余！',
      log: '✓ 前缀优化建图全流程演示完成：总边数 11 条 (严格线性 O(N))',
      codeLine: lines.prefixDone,
      metrics: {
        'metric-opt-mode': '前缀优化建图 (O(N))',
        'metric-edge-count': `${edges} 条边`,
        'metric-cur-op': '✓ 演示完毕',
        'metric-compression-ratio': '👑 O(N) 完美压缩',
      },
    });
  }

  return steps;
}
