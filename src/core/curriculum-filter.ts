/**
 * 算法课程归属与筛选领域服务 (Curriculum Filter Deep Module)
 * 职责：
 * 精准识别算法是否属于左程云《算法通关课》或经典代码随想录/基础题库，
 * 提供课程分类、统计与过滤流水线。
 */

import type { AlgorithmMetadata } from './registry';

export type CourseType = 'all' | 'zuo' | 'standard';

export interface CourseFilterStats {
  total: number;
  zuo: number;
  standard: number;
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
  let zuo = 0;
  let standard = 0;

  for (const algo of algorithms) {
    if (isZuoCourseAlgorithm(algo)) {
      zuo++;
    } else {
      standard++;
    }
  }

  return {
    total: algorithms.length,
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
  if (course === 'zuo') {
    return algorithms.filter((a) => isZuoCourseAlgorithm(a));
  }
  return algorithms.filter((a) => !isZuoCourseAlgorithm(a));
}
