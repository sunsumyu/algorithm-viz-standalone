/**
 * 二叉树最近公共祖先轻量领域适配器 (Thin Domain Adapter · LeetCode 236 / Class 037 Code04)
 * 遵循 Matt Pocock 深模块规范 (LOC < 150 行)，推演编译与画布呈现委托至统一深模块：
 *   - LcaStepCompiler (推演步进编译器)
 *   - LcaCanvasAdapter (拓扑画布与看板呈现适配器)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { buildTreeFromArr as buildTree } from './tree-template';
import { LCA_PROBLEM_HTML, LCA_ANALYSIS_HTML, LCA_CODE_LANGUAGES } from './lca-problem-content';
import { LCA_STAGE1_CODE, LCA_STAGE2_PARENT_MAP_CODE, LCA_STAGE3_PATH_TRACE_CODE } from './lca-stage-codes';
import {
  LcaStepCompiler,
  LCAStep,
  LCA_CODE_LINES,
  buildLCASteps,
  buildLcaStage2ParentMapSteps,
  buildLcaStage3PathSteps,
} from '../../../core/renderers/adapters/lca-step-compiler';
import {
  LcaCanvasAdapter,
  renderLcaCanvas,
  renderLcaStage1CustomMetrics,
} from '../../../core/renderers/adapters/lca-canvas-adapter';

// 向后兼容导出
export type { LCAStep };
export {
  LcaStepCompiler,
  LCA_CODE_LINES,
  buildLCASteps,
  buildLcaStage2ParentMapSteps,
  buildLcaStage3PathSteps,
  LcaCanvasAdapter,
  renderLcaCanvas,
};

function parseInputs(inputs?: Record<string, any>) {
  const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
  const arr = parseTreeArray(raw, [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
  const root = buildTree(arr);
  const p = parseInt(String(inputs?.['input-p'] ?? inputs?.['p'] ?? '5'), 10);
  const q = parseInt(String(inputs?.['input-q'] ?? inputs?.['q'] ?? '1'), 10);
  return { root, p, q };
}

export const lcaVisualizer = registerDeclarativeAlgorithm<LCAStep>({
  id: 'lca',
  aliases: ['tree-037-lowest-common-ancestor'],
  name: '二叉树的最近公共祖先',
  category: 'tree',
  icon: '🤝',
  badge: { mode: '多阶段演化: 后序递归 · 父指针哈希 · 路径比对', complexity: 'O(N) · O(H)' },
  card1Title: '📊 二叉树拓扑与 LCA 汇聚沙盘',
  card2Title: '🧭 左右子树返回与祖先判定状态机',
  card2Desc: '后序遍历中 left 与 right 返回值归并逻辑实时监视',
  legend: [
    { label: '目标节点 p / q', color: '#fbbf24' },
    { label: '当前访问节点', color: '#3b82f6' },
    { label: '已捕获 LCA', color: '#16a34a' },
  ],
  inputs: [
    { id: 'input-tree', label: '二叉树层序', type: 'text', defaultValue: '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', width: '180px', placeholder: '3, 5, 1, 6...' },
    { id: 'input-p', label: '节点 p', type: 'number', defaultValue: 5, width: '50px' },
    { id: 'input-q', label: '节点 q', type: 'number', defaultValue: 1, width: '50px' },
  ],
  presets: [
    { label: 'LeetCode 示例 1: 根为 LCA (p=5, q=1)', values: { 'input-tree': '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', 'input-p': 5, 'input-q': 1 }, description: 'p、q 分属根节点左右两侧，LCA = 3' },
    { label: 'LeetCode 示例 2: 同侧祖先 (p=5, q=4)', values: { 'input-tree': '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', 'input-p': 5, 'input-q': 4 }, description: 'q 在 p 的子树内，LCA 为自身 (5)' },
    { label: '经典三节点树 (p=2, q=3)', values: { 'input-tree': '1, 2, 3', 'input-p': 2, 'input-q': 3 }, description: '简单满二叉树，根为 LCA (1)' },
    { label: '单链倾斜树 (p=3, q=4)', values: { 'input-tree': '1, 2, null, 3, null, 4', 'input-p': 3, 'input-q': 4 }, description: '左斜树垂直串联，LCA = 3' },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#3b82f6' },
    { id: 'left-ret', label: '左返 / 祖先集 / P路径', color: '#2563eb' },
    { id: 'right-ret', label: '右返 / Q回溯 / Q路径', color: '#0d9488' },
    { id: 'lca-val', label: '最近公共祖先 (LCA)', color: '#16a34a' },
  ],
  codeLanguages: LCA_CODE_LANGUAGES,
  problemHtml: LCA_PROBLEM_HTML,
  analysisHtml: LCA_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 递归后序汇聚 (Recursive Postorder DFS · 左右子树汇聚返回)',
      shortName: '递归后序汇聚',
      num: 1,
      badge: { mode: '自底向上后序汇聚', complexity: 'O(N) · O(H)' },
      card1Title: '📊 二叉树拓扑与 LCA 汇聚沙盘',
      card2Title: '🧭 左右子树返回与祖先判定状态机',
      card2Desc: '后序自底向上回溯中 left 与 right 返回值汇聚判定',
      codeLanguages: LCA_STAGE1_CODE,
      buildSteps: (inputs) => { const { root, p, q } = parseInputs(inputs); return buildLCASteps(root, p, q); },
      renderCanvas: (container, step) => renderLcaCanvas(container, step, 'stage-1'),
      renderCustomMetrics: renderLcaStage1CustomMetrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 父节点哈希表遍历 (Parent Pointer Hash Map · 回溯路径集合重合)',
      shortName: '父节点哈希映射',
      num: 2,
      badge: { mode: '父指针哈希表 · 祖先集合', complexity: 'O(N) · O(N)' },
      card1Title: '🗺️ 树上父指针网络拓扑沙盘',
      card2Title: '🧭 父指针映射与已访问祖先集合',
      card2Desc: '自顶向下记录父节点，自底向上回溯寻找两集合首个交汇点',
      codeLanguages: LCA_STAGE2_PARENT_MAP_CODE,
      buildSteps: (inputs) => { const { root, p, q } = parseInputs(inputs); return buildLcaStage2ParentMapSteps(root, p, q); },
      renderCanvas: (container, step) => renderLcaCanvas(container, step, 'stage-2'),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 根到节点显式路径比对 (Root-to-Node Path Trace & Intersection · 分叉前夕判定)',
      shortName: '显式双路径交汇',
      num: 3,
      badge: { mode: 'DFS双路径追踪 · 前缀交汇', complexity: 'O(N) · O(H)' },
      card1Title: '🛤️ 根至目标显式双路径拓扑沙盘',
      card2Title: '🧭 直达路径序列与分叉点比对监视器',
      card2Desc: '提取两目标节点的直达路径序列，双指针自根向下锁定分叉前夕节点',
      codeLanguages: LCA_STAGE3_PATH_TRACE_CODE,
      buildSteps: (inputs) => { const { root, p, q } = parseInputs(inputs); return buildLcaStage3PathSteps(root, p, q); },
      renderCanvas: (container, step) => renderLcaCanvas(container, step, 'stage-3'),
    },
  ],
  generateSteps: (inputs) => { const { root, p, q } = parseInputs(inputs); return buildLCASteps(root, p, q); },
  buildSteps: (inputs) => { const { root, p, q } = parseInputs(inputs); return buildLCASteps(root, p, q); },
  renderCanvas: (container, step) => renderLcaCanvas(container, step, 'stage-1'),
});