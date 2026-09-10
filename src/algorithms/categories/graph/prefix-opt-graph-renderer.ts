/**
 * 前缀优化建图 (Prefix Optimization Graph) 声明式可视化器
 * 进阶图论: 2-SAT / 前缀点前向连边链、边数由 O(N^2) 压缩至 O(N)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PREFIX_OPT_CODE_LANGUAGES,
  PREFIX_OPT_PROBLEM_HTML,
  PREFIX_OPT_ANALYSIS_HTML,
} from './prefix-opt-graph-problem-content';

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
      codeLine: 12,
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
        codeLine: 24,
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
        codeLine: 44,
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
        codeLine: 44,
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
      codeLine: 44,
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
      codeLine: 12,
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
      codeLine: 12,
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
      codeLine: 15,
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
      codeLine: 30,
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
        codeLine: 34,
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
          codeLine: 37,
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
      codeLine: 38,
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
      codeLine: 44,
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
      codeLine: 46,
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
      codeLine: 47,
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
      codeLine: 44,
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
      codeLine: 46,
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
      codeLine: 51,
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
      codeLine: 47,
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
      codeLine: 47,
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
      codeLine: 47,
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

const { template, Visualizer } = createDeclarativeVisualizer<PrefixOptStep>({
  id: 'prefix-opt-graph',
  name: '前缀优化建图 (Prefix Opt Graph)',
  category: 'graph',
  icon: '🌐',
  badge: {
    mode: '前缀虚点链边数压缩',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🌐 原点与前缀虚点拓扑沙盘',
  card2Title: '🧭 边数对比与级联前向监视器',
  card2Desc: '前缀辅助节点 P_i、级联连边与边数压缩 O(N^2) -> O(N)',
  legend: [
    { label: '原图实体节点 (1..5)', color: '#0284c7' },
    { label: '⭐ 前缀辅助虚点 (P1..P5)', color: '#f59e0b' },
    { label: '级联链/透传边', color: '#10b981' },
    { label: '外部查询连边 (S1/S2)', color: '#ec4899' },
  ],
  inputs: [
    {
      id: 'input-opt-mode',
      label: '建图模式',
      type: 'select',
      defaultValue: 'prefix',
      options: [
        { label: '⚡ 前缀优化建图 O(N)', value: 'prefix' },
        { label: '❌ 朴素两两连边 O(N^2)', value: 'naive' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '前缀优化建图 O(N)', values: { 'input-opt-mode': 'prefix' } },
    { label: '朴素两两连边 O(N^2)', values: { 'input-opt-mode': 'naive' } },
  ],
  metrics: [
    { id: 'metric-opt-mode', label: '建图方案', color: '#2563eb' },
    { id: 'metric-edge-count', label: '总边数', color: '#10b981' },
    { id: 'metric-cur-op', label: '当前操作', color: '#f59e0b' },
    { id: 'metric-compression-ratio', label: '压缩效益', color: '#ec4899' },
  ],
  codeLanguages: PREFIX_OPT_CODE_LANGUAGES,
  problemHtml: PREFIX_OPT_PROBLEM_HTML,
  analysisHtml: PREFIX_OPT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const mode = (inputs['input-opt-mode'] || 'prefix') as 'naive' | 'prefix';
    return buildPrefixOptSteps(mode);
  },
  renderCanvas: (container, step) => {
    const isPrefix = step.mode === 'prefix';
    const activeNode = step.activeNode;
    const activeEdge = step.activeEdge;
    const isS1Active = activeNode === 'S1';
    const isS2Active = activeNode === 'S2';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 230px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 350 200">
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
            <marker id="arrow-pink" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ec4899" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
            </marker>
          </defs>

          ${
            isPrefix
              ? `
            <!-- 上方前缀虚点链 P1..P5 (级联边 P_i -> P_{i-1}) -->
            <line x1="280" y1="60" x2="220" y2="60" stroke="${activeEdge && activeEdge[0] === 'P5' && activeEdge[1] === 'P4' ? '#f59e0b' : '#10b981'}" stroke-width="${activeEdge && activeEdge[0] === 'P5' && activeEdge[1] === 'P4' ? '3' : '2'}" marker-end="url(#arrow-green)" />
            <line x1="220" y1="60" x2="160" y2="60" stroke="${activeEdge && activeEdge[0] === 'P4' && activeEdge[1] === 'P3' ? '#f59e0b' : '#10b981'}" stroke-width="${activeEdge && activeEdge[0] === 'P4' && activeEdge[1] === 'P3' ? '3' : '2'}" marker-end="url(#arrow-green)" />
            <line x1="160" y1="60" x2="100" y2="60" stroke="${activeEdge && activeEdge[0] === 'P3' && activeEdge[1] === 'P2' ? '#f59e0b' : '#10b981'}" stroke-width="${activeEdge && activeEdge[0] === 'P3' && activeEdge[1] === 'P2' ? '3' : '2'}" marker-end="url(#arrow-green)" />
            <line x1="100" y1="60" x2="40" y2="60" stroke="${activeEdge && activeEdge[0] === 'P2' && activeEdge[1] === 'P1' ? '#f59e0b' : '#10b981'}" stroke-width="${activeEdge && activeEdge[0] === 'P2' && activeEdge[1] === 'P1' ? '3' : '2'}" marker-end="url(#arrow-green)" />

            <!-- P_i -> u_i 下垂透传边 -->
            <line x1="40" y1="60" x2="40" y2="150" stroke="${activeEdge && activeEdge[0] === 'P1' && activeEdge[1] === '1' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P1' && activeEdge[1] === '1' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />
            <line x1="100" y1="60" x2="100" y2="150" stroke="${activeEdge && activeEdge[0] === 'P2' && activeEdge[1] === '2' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P2' && activeEdge[1] === '2' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />
            <line x1="160" y1="60" x2="160" y2="150" stroke="${activeEdge && activeEdge[0] === 'P3' && activeEdge[1] === '3' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P3' && activeEdge[1] === '3' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />
            <line x1="220" y1="60" x2="220" y2="150" stroke="${activeEdge && activeEdge[0] === 'P4' && activeEdge[1] === '4' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P4' && activeEdge[1] === '4' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />
            <line x1="280" y1="60" x2="280" y2="150" stroke="${activeEdge && activeEdge[0] === 'P5' && activeEdge[1] === '5' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P5' && activeEdge[1] === '5' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />

            <!-- 外部查询节点与 O(1) 连边 -->
            ${
              isS1Active || (step.numEdges >= 10 && isPrefix)
                ? `
              <line x1="220" y1="12" x2="220" y2="60" stroke="#ec4899" stroke-width="2.5" marker-end="url(#arrow-pink)" />
              <g><circle cx="220" cy="12" r="10" fill="#db2777" /><text x="220" y="16" fill="#fff" font-size="8" font-weight="bold" text-anchor="middle">S1</text></g>
            `
                : ''
            }
            ${
              isS2Active || (step.numEdges >= 11 && isPrefix)
                ? `
              <line x1="100" y1="12" x2="100" y2="60" stroke="#ec4899" stroke-width="2.5" marker-end="url(#arrow-pink)" />
              <g><circle cx="100" cy="12" r="10" fill="#db2777" /><text x="100" y="16" fill="#fff" font-size="8" font-weight="bold" text-anchor="middle">S2</text></g>
            `
                : ''
            }

            <!-- 前缀虚点 P1..P5 -->
            <g><circle cx="40" cy="60" r="12" fill="${activeNode === 'P1' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="40" y="64" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P1</text></g>
            <g><circle cx="100" cy="60" r="12" fill="${activeNode === 'P2' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="100" y="64" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P2</text></g>
            <g><circle cx="160" cy="60" r="12" fill="${activeNode === 'P3' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="160" y="64" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P3</text></g>
            <g><circle cx="220" cy="60" r="12" fill="${activeNode === 'P4' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="220" y="64" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P4</text></g>
            <g><circle cx="280" cy="60" r="12" fill="${activeNode === 'P5' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="280" y="64" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P5</text></g>
          `
              : `
            <!-- 朴素两两全连接连线 -->
            <line x1="100" y1="150" x2="40" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="160" y1="150" x2="40" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="160" y1="150" x2="100" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="220" y1="150" x2="40" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="220" y1="150" x2="100" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="220" y1="150" x2="160" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
            <line x1="280" y1="150" x2="40" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="280" y1="150" x2="100" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="280" y1="150" x2="160" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="280" y1="150" x2="220" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />

            <!-- 外部直连查询 S1/S2 -->
            ${
              step.numEdges >= 11
                ? `
              <line x1="160" y1="20" x2="40" y2="150" stroke="#db2777" stroke-width="1.5" />
              <line x1="160" y1="20" x2="100" y2="150" stroke="#db2777" stroke-width="1.5" />
              <line x1="160" y1="20" x2="160" y2="150" stroke="#db2777" stroke-width="1.5" />
              <line x1="160" y1="20" x2="220" y2="150" stroke="#db2777" stroke-width="1.5" />
              <g><circle cx="160" cy="20" r="11" fill="#db2777" /><text x="160" y="24" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">S1</text></g>
            `
                : ''
            }
          `
          }

          <!-- 下方实体节点 1..5 -->
          <g><circle cx="40" cy="150" r="13" fill="${activeNode === 1 || activeNode === '1' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="40" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">1</text></g>
          <g><circle cx="100" cy="150" r="13" fill="${activeNode === 2 || activeNode === '2' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="100" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2</text></g>
          <g><circle cx="160" cy="150" r="13" fill="${activeNode === 3 || activeNode === '3' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="160" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3</text></g>
          <g><circle cx="220" cy="150" r="13" fill="${activeNode === 4 || activeNode === '4' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="220" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">4</text></g>
          <g><circle cx="280" cy="150" r="13" fill="${activeNode === 5 || activeNode === '5' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="280" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">5</text></g>
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center; margin-top: 4px;">
          ${
            isPrefix
              ? '⭐ 前缀虚点链 P_i ➔ P_{i-1} 级联传递，连向 P_r 等价于连向 [1, r] 内所有实体节点 (O(1) 连边)'
              : '❌ 朴素两两连边：每向区间 [1..r] 连边就新增 r 条边，边数呈 O(N^2) 剧增，极易触发 MLE/TLE'
          }
        </div>
      </div>
    `;

    // 动态同步 Card 2 监视器与顶部指标
    const root =
      container.closest('#algo-prefix-opt-graph-view') ||
      container.closest('.algorithm-layout-container') ||
      container.parentElement;

    if (root) {
      const modeEl = root.querySelector('#metric-opt-mode');
      const edgeEl = root.querySelector('#metric-edge-count');
      const opEl = root.querySelector('#metric-cur-op');
      const compEl = root.querySelector('#metric-compression-ratio');

      if (modeEl) modeEl.textContent = step.metrics?.['metric-opt-mode']?.toString() || (isPrefix ? '前缀优化建图' : '朴素稠密建图');
      if (edgeEl) edgeEl.textContent = step.metrics?.['metric-edge-count']?.toString() || `${step.numEdges} 条边`;
      if (opEl) opEl.textContent = step.metrics?.['metric-cur-op']?.toString() || (step.activeNode ? `处理节点 ${step.activeNode}` : '—');
      if (compEl) compEl.textContent = step.metrics?.['metric-compression-ratio']?.toString() || (isPrefix ? 'O(N) 线性压缩' : 'O(N^2) 稠密无压缩');

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const nodeIndices = [1, 2, 3, 4, 5];
        const pSlots = nodeIndices
          .map((i) => {
            const pId = isPrefix ? `P${i}` : `—`;
            const isActive = step.activeNode === `P${i}` || step.activeNode === i;
            const bg = isActive ? '#fef08a' : '#1e293b';
            const textCol = isActive ? '#854d0e' : '#e2e8f0';
            const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

            return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
              <span style="font-size: 7.5px; color: #64748b; line-height: 1;">u[${i}]</span>
              <span style="line-height: 1.1;">${pId}</span>
            </div>`;
          })
          .join('');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: #38bdf8;">前缀虚点链 P:</span>
                <div style="display: flex; gap: 4px;">${pSlots}</div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">建图模式 / 边总数:</span>
                <strong style="color: #facc15; font-family: monospace; font-size: 11px;">${isPrefix ? `前缀优化: ${step.numEdges} 条边 (O(N) 线性)` : `朴素直连: ${step.numEdges} 条边 (O(N²) 爆炸)`}</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'prefix-opt-graph',
  name: '前缀优化建图 (Prefix Opt Graph)',
  viewId: 'algo-prefix-opt-graph-view',
  category: 'graph',
  description: '进阶图论建图优化：前缀虚点链级联传递、区间连边由 O(N^2) 稠密压缩至 O(N) 线性边数 (2-SAT 优化)',
  icon: '🌐',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 69,
  learningGoal: '掌握前缀优化建图的虚点级联构造法、2-SAT 命题前缀约束与边数线性压缩技巧',
});

export { Visualizer as PrefixOptGraphVisualizer };

