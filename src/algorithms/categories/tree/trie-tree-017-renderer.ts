/**
 * Class 017: 前缀树 (Trie) 基础结构设计与频次统计
 * 左程云算法通关课入门篇 Class 017 / 洛谷 P2580 / LeetCode 208
 *
 * 架构规范：纯领域适配器 (Thin Domain Adapter, LOC < 120 行)
 * 核心推演委托给 GeneralTrieStepCompiler，视觉呈现委托给 GeneralTrieCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  GeneralTrieCanvasAdapter,
  GeneralTrieNodeSnapshot,
} from '../../../core/renderers/adapters/general-trie-canvas-adapter';
import {
  GeneralTrieStepCompiler,
  GeneralTrieStep,
} from '../../../core/renderers/adapters/general-trie-step-compiler';
import { TRIE_TREE_017_PROBLEM_CONTENT } from './trie-tree-017-problem-content';
import {
  TRIE_017_CODES,
  TRIE_017_CODE_LINES,
  TRIE_STAGE2_STATIC_CODES,
  TRIE_STAGE2_CODE_LINES,
} from './trie-tree-017-stage-codes';

// 兼容既有门禁与外部引用的导出接口与委托
export type TrieNodeSnapshot = GeneralTrieNodeSnapshot;
export type Trie017Step = GeneralTrieStep;
export {
  TRIE_017_CODES,
  TRIE_017_CODE_LINES,
  TRIE_STAGE2_STATIC_CODES,
  TRIE_STAGE2_CODE_LINES,
};

export const buildTrie017Steps = (
  words: string[],
  queryWord: string,
  isPrefixQuery: boolean = false
): GeneralTrieStep[] =>
  GeneralTrieStepCompiler.compileDynamicPointerSteps(words, queryWord, isPrefixQuery, TRIE_017_CODE_LINES);

export const buildStage2StaticSteps = (
  words: string[] = ['code', 'coder', 'coding', 'codec'],
  queryWord: string = 'code'
): GeneralTrieStep[] =>
  GeneralTrieStepCompiler.compileStaticArraySteps(words, queryWord, TRIE_STAGE2_CODE_LINES);

export const buildStage3MultiQuerySteps = (): GeneralTrieStep[] =>
  GeneralTrieStepCompiler.compileMultiQuerySteps(TRIE_017_CODE_LINES);

export const renderTrieCanvas = GeneralTrieCanvasAdapter.renderTrieCanvas;
export const renderTrieCard2 = GeneralTrieCanvasAdapter.renderTrieCard2;

// =========================================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// =========================================================================
export const trieTree017Visualizer = registerDeclarativeAlgorithm<GeneralTrieStep>({
  id: 'trie-tree-017',
  name: 'Class 017: 前缀树基础结构与频次统计',
  category: 'tree',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 17,
  aliases: ['class017-code01', 'trie-tree-017', 'trie-prefix-tree', 'leetcode-208'],
  learningGoal: '深入掌握前缀树节点 pass 与 end 核心设计，理解多模式串共享公共前缀的快速统计与静态数组优化',
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 面向对象动态指针实现 (Object Pointer Trie)',
      shortName: '动态指针实现',
      card2Title: '前缀树构建与词频拓扑追踪',
      card2Desc: '动态指针链表推进：节点 pass 统计经过数，end 记录以其结尾的词频',
      codeLanguages: TRIE_017_CODES,
      generateSteps: () => buildTrie017Steps(['apple', 'app', 'apply', 'banana'], 'app', true),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 静态连续数组竞赛版 (Static Array Trie)',
      shortName: '静态连续数组',
      card2Title: '静态内存映射表与连续索引推演',
      card2Desc: '基于 tree[N][26] 静态分配表，展示二维平坦化指针跳转与 CPU 缓存友好设计',
      codeLanguages: TRIE_STAGE2_STATIC_CODES,
      generateSteps: () => buildStage2StaticSteps(['code', 'coder', 'coding', 'codec'], 'code'),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 多模态检索与前缀探测推演 (Multi-Query Probing)',
      shortName: '多模态检索探测',
      card2Title: '完整词查找 vs 前缀匹配与分支断裂剪枝',
      card2Desc: '对比 search 与 prefixNumber；展示分支缺失时快速失败提前返回 0 的剪枝公理',
      codeLanguages: TRIE_017_CODES,
      generateSteps: () => buildStage3MultiQuerySteps(),
    },
  ],
  codeLanguages: TRIE_017_CODES,
  problemHtml: TRIE_TREE_017_PROBLEM_CONTENT.description + TRIE_TREE_017_PROBLEM_CONTENT.mechanisms,
  presets: [
    {
      label: '经典四词库 + 前缀查询 (apple, app, apply, banana ➔ prefix: app)',
      values: { words: 'apple, app, apply, banana', query: 'app', isPrefix: 'prefix' },
    },
    {
      label: '重叠前缀与多词 (cat, caterpillar, car, dog, cart ➔ prefix: ca)',
      values: { words: 'cat, caterpillar, car, dog, cart', query: 'ca', isPrefix: 'prefix' },
    },
    {
      label: '单词冲突与词频统计 (code, coder, coding, codec, code ➔ search: code)',
      values: { words: 'code, coder, coding, codec, code', query: 'code', isPrefix: 'exact' },
    },
    {
      label: '路径缺失断裂探测 (tree, trie, trace ➔ search: truth)',
      values: { words: 'tree, trie, trace', query: 'truth', isPrefix: 'exact' },
    },
  ],
  inputs: [
    {
      id: 'words',
      label: '插入单词库 (逗号分隔)',
      type: 'text',
      defaultValue: 'apple, app, apply, banana',
      placeholder: '请输入单词列表，如 apple, app, banana',
    },
    {
      id: 'query',
      label: '查询字符串',
      type: 'text',
      defaultValue: 'app',
      placeholder: '输入待检索的单词或前缀',
    },
    {
      id: 'isPrefix',
      label: '查询类型',
      type: 'select',
      defaultValue: 'prefix',
      options: [
        { label: '前缀词频统计 (prefixNumber)', value: 'prefix' },
        { label: '完整单词查找 (search)', value: 'exact' },
      ],
    },
  ],
  generateSteps: (inputs) => {
    const raw = String(inputs?.words || 'apple, app, apply, banana');
    const words = raw.split(',').map((s) => s.trim().toLowerCase()).filter((w) => w.length > 0);
    const query = String(inputs?.query || 'app').trim().toLowerCase();
    const isPrefix = inputs?.isPrefix !== 'exact';
    return buildTrie017Steps(words.length > 0 ? words : ['apple', 'app'], query, isPrefix);
  },
  renderCanvas: (container, step) => {
    GeneralTrieCanvasAdapter.renderTrieCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    GeneralTrieCanvasAdapter.renderTrieCard2(container, step);
  },
});
