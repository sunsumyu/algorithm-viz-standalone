/**
 * Class 056: Code04 相似字符串组 (Similar String Groups)
 * LeetCode 839
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { UNION_FIND_056_PROBLEMS } from './union-find-056-problem-content';
import { CODE04_SIMILAR_STRINGS_CODES } from './union-find-056-stage-codes';
import { Step056, renderSimilarStringsBoard } from './union-find-056-shared';
import { buildSimilarStringsSteps } from './similar-string-groups-056-step-compiler';

export { buildSimilarStringsSteps };

export const similarStringGroups056Renderer = registerDeclarativeAlgorithm<Step056>({
  id: 'similar-string-groups-056',
  aliases: ['class056-code04', 'similar-string-groups-839'],
  name: '相似字符串组 (Class 056)',
  category: 'union-find',
  difficulty: 'hard',
  badge: { mode: '图连通并查集', complexity: 'O(N²·L)' },
  description: '左程云算法通关课【必备篇】Class 056：相似判定与传递连通等价类收敛，并查集动态求解连通块总数 (LeetCode 839)',
  learningGoal: '掌握两两字符串相似性判定的充要条件（差异为0或2），并结合并查集自动合并等价类连通块。',
  icon: '🔤',

  inputs: [
    {
      id: 'strs',
      label: '字符串列表 (逗号分隔，长度需相同)',
      type: 'text',
      defaultValue: 'tars, rats, arts, star',
      placeholder: '例如: tars, rats, arts, star',
    },
  ],

  presets: [
    {
      label: '经典案例: ["tars", "rats", "arts", "star"] (结果: 2)',
      values: { strs: 'tars, rats, arts, star' },
    },
    {
      label: '两对独立相似组: ["omv", "ovm", "abc", "acb"] (结果: 2)',
      values: { strs: 'omv, ovm, abc, acb' },
    },
    {
      label: '全连通组: ["blw", "bwl", "wlb"] (结果: 1)',
      values: { strs: 'blw, bwl, wlb' },
    },
    {
      label: '全部互不相似: ["abc", "def", "ghi"] (结果: 3)',
      values: { strs: 'abc, def, ghi' },
    },
  ],

  problemContent: UNION_FIND_056_PROBLEMS.similarStringGroups056,
  codeLanguages: CODE04_SIMILAR_STRINGS_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let strs = ['tars', 'rats', 'arts', 'star'];

    if (params && params.strs) {
      const parsed = String(params.strs)
        .split(/[,，\s]+/)
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
      if (parsed.length > 0) {
        strs = parsed;
      }
    }

    return buildSimilarStringsSteps(strs);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderSimilarStringsBoard(step);
  },
});
