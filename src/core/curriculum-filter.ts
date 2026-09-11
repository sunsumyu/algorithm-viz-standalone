/**
 * 算法课程归属与筛选领域服务 (Curriculum Filter Deep Module)
 * 职责：
 * 精准识别算法是否属于大厂高频题、左程云《算法通关课》或经典题库，
 * 提供分类、统计与过滤流水线。
 */

import type { AlgorithmMetadata } from './registry';

export type CourseType = 'all' | 'bigtech' | 'zuo' | 'standard';

export interface CourseFilterStats {
  total: number;
  bigtech: number;
  zuo: number;
  standard: number;
}

/**
 * 显式收录的大厂高频真题集合（包括 Hard 篇、大厂真题系列及常考题王）
 */
const EXPLICIT_BIGTECH_IDS = new Set([
  // hard-interview 系列
  'basic-calculator-full', 'burst-balloons', 'dungeon-game-reverse-dp', 'expression-add-operators',
  'freedom-trail-ring-dp', 'hard-largest-rectangle-histogram', 'lfu-cache', 'longest-valid-parentheses',
  'maximal-rectangle', 'median-two-sorted-arrays', 'merge-k-sorted-lists', 'min-window-substring',
  'n-queens-bitwise-speed', 'regex-matching', 'hard-regex-matching', 'hard-russian-doll-envelopes',
  'sliding-window-median', 'stock-trading-state-machine', 'substring-concatenation-words', 'the-skyline-problem',
  'trapping-rain-water-ii',
  // batch-2 大厂高频与扩展系列
  'reverse-nodes-in-k-group', 'first-missing-positive', 'linked-list-cycle-ii-041', 'copy-list-random-pointer-042',
  'count-submatrices-all-ones-1504', 'min-remove-valid-parentheses', 'find-peak-element', 'koko-eating-bananas',
  'course-schedule-iv', 'longest-consecutive-sequence', 'remove-k-digits', 'subarray-sum-equals-k',
  'longest-repeating-character-replacement', 'next-permutation', 'valid-parenthesis-string',
  'subarray-product-less-than-k', 'find-all-anagrams-in-a-string', 'task-scheduler', 'shuffle-an-array',
  'find-duplicate-subtrees', 'verify-preorder-sequence-in-bst', 'min-stack',
  'find-min-rotated-sorted-array-ii', 'palindrome-partitioning-ii', 'max-points-on-a-line', 'divide-two-integers',
  'find-duplicate-number-287', 'word-break-ii', 'binary-tree-maximum-path-sum',
  // 经典大厂核心常考
  'lru-cache', 'trapping-rain-water', 'three-sum', 'two-sum', 'sliding-window-max', 'top-k-frequent'
]);

/**
 * 判断算法是否属于大厂高频面试真题
 */
export function isBigTechAlgorithm(algo: Partial<AlgorithmMetadata> | null | undefined): boolean {
  if (!algo) return false;

  const id = algo.id || '';
  if (EXPLICIT_BIGTECH_IDS.has(id)) return true;

  const name = algo.name || '';
  const desc = algo.description || '';
  const goal = algo.learningGoal || '';
  const fullText = `${id} ${name} ${desc} ${goal}`.toLowerCase();

  // 匹配大厂高频特征词或 Hard 题号
  if (fullText.includes('大厂') || fullText.includes('高频真题') || /hard\s*[0-9]+/i.test(fullText)) {
    return true;
  }

  return false;
}

/**
 * 提取大厂题标签文字
 * 例如: "Hard 21" 或 "大厂高频"
 */
export function extractBigTechTag(algo: Partial<AlgorithmMetadata>): string | null {
  if (!isBigTechAlgorithm(algo)) return null;

  const name = algo.name || '';
  const hardMatch = name.match(/Hard\s*([0-9]+)/i);
  if (hardMatch) {
    return `Hard ${hardMatch[1]}`;
  }

  return '大厂高频';
}

/**
 * 判断算法是否属于左程云《算法通关课》
 */
export function isZuoCourseAlgorithm(algo: Partial<AlgorithmMetadata> | null | undefined): boolean {
  if (!algo) return false;

  const id = algo.id || '';
  const name = algo.name || '';
  const desc = algo.description || '';
  const goal = algo.learningGoal || '';
  const fullText = `${id} ${name} ${desc} ${goal}`.toLowerCase();

  // 1. 显式中文关键词
  if (fullText.includes('左神') || fullText.includes('左程云') || fullText.includes('通关课')) {
    return true;
  }

  // 2. Class 课号匹配 (e.g. "class 073", "class064", "class 090")
  if (/class\s*0?[0-9]+/i.test(fullText)) {
    return true;
  }

  // 3. 专属分类: math (097-099 课) 与 bit (030-033 课) 全部为通关课专门新增
  if (algo.category === 'math' || algo.category === 'bit') {
    return true;
  }

  // 4. 特殊课号 ID 后缀匹配 (e.g. "-089", "-090", ... "-099", "-047", "-048")
  if (/-(0[0-9]{2}|[0-9]{3})$/.test(id)) {
    return true;
  }

  // 5. 显式位运算与差分特定 ID
  const explicitZuoIds = new Set([
    'diff-array-1d-047',
    'diff-array-2d-048',
    'diff-array-1d',
    'diff-array-2d',
    'bit-tricks',
    'single-number-ii',
    'single-number-iii',
    'bitset-array',
    'tree-dp-theory',
  ]);
  if (explicitZuoIds.has(id)) {
    return true;
  }

  return false;
}

/**
 * 提取算法的左神课程课号标记 (若存在)
 * 例如: "Class 095" 或 "Class 073" 或 "通关课"
 */
export function extractZuoCourseTag(algo: Partial<AlgorithmMetadata>): string | null {
  if (!isZuoCourseAlgorithm(algo)) return null;

  const desc = algo.description || '';
  const id = algo.id || '';

  // 从 ID 提取尾部三位课号 (e.g. bash-game-095 -> 第095课)
  const idMatch = id.match(/-(0[0-9]{2}|[0-9]{3})$/);
  if (idMatch) {
    const num = parseInt(idMatch[1], 10);
    return `第${num}课`;
  }

  // 从描述提取 class 课号 (e.g. "class 073", "class064", "讲解089")
  const classMatch = desc.match(/(?:class\s*0?|讲解0?|第\s*0?)([0-9]{2,3})/i);
  if (classMatch) {
    const num = parseInt(classMatch[1], 10);
    return `第${num}课`;
  }

  // 专属位运算课号映射
  if (id === 'bit-tricks') return '第030课';
  if (id === 'single-number-ii') return '第031课';
  if (id === 'single-number-iii') return '第032课';
  if (id === 'bitset-array') return '第033课';

  return '通关课';
}

/**
 * 计算当前算法列表的课程分类统计
 */
export function getCourseStats(algorithms: AlgorithmMetadata[]): CourseFilterStats {
  let bigtech = 0;
  let zuo = 0;
  let standard = 0;

  for (const algo of algorithms) {
    if (isBigTechAlgorithm(algo)) {
      bigtech++;
    }
    if (isZuoCourseAlgorithm(algo)) {
      zuo++;
    } else {
      standard++;
    }
  }

  return {
    total: algorithms.length,
    bigtech,
    zuo,
    standard,
  };
}

/**
 * 根据所选课程过滤算法列表
 */
export function filterAlgorithmsByCourse(
  algorithms: AlgorithmMetadata[],
  course: CourseType
): AlgorithmMetadata[] {
  if (course === 'all') return algorithms;
  if (course === 'bigtech') {
    return algorithms.filter((a) => isBigTechAlgorithm(a));
  }
  if (course === 'zuo') {
    return algorithms.filter((a) => isZuoCourseAlgorithm(a));
  }
  return algorithms.filter((a) => !isZuoCourseAlgorithm(a));
}
