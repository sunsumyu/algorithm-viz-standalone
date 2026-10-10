/**
 * 旋转字符串 (Rotate String · LeetCode 796) 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 纯声明式元数据配置与委托挂载，身材保持在 65 行内
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  STRING_MIGRATION_PROBLEM_HTML,
  STRING_MIGRATION_ANALYSIS_HTML,
  STRING_MIGRATION_CODE_LANGUAGES,
} from './string-migration-problem-content';
import {
  SCStep,
  buildStringMigrationSteps,
  withMetrics,
} from './string-migration-step-compiler';
import {
  renderStringMigrationCanvas,
  renderStringMigrationCustomMetrics,
} from '../../../core/renderers/adapters/string-migration-canvas-adapter';

registerDeclarativeAlgorithm({
  id: 'string-migration',
  name: '旋转字符串 (LC 796)',
  category: 'graph',
  description: '双倍拼接与滑动窗口子串匹配：验证 goal 是否为源字符串 s 的循环旋转移位',
  icon: '🔤',
  difficulty: 1,
  levelOrder: 24,
  learningGoal: '掌握经典字符串循环旋转的双倍拼接 (s + s) 判定定理与滑动窗口单步匹配',
  inputs: [
    { id: 's', label: '源字符串 s', type: 'text', defaultValue: 'abcde' },
    { id: 'goal', label: '目标字符串 goal', type: 'text', defaultValue: 'cdeab' },
  ],
  presets: [
    { label: '示例 1 (可旋转)', values: { s: 'abcde', goal: 'cdeab' } },
    { label: '示例 2 (不可旋转)', values: { s: 'abcde', goal: 'abced' } },
    { label: '相同字符串', values: { s: 'aaa', goal: 'aaa' } },
  ],
  metrics: [
    { id: 'shift', label: '旋转移位', color: '#2563eb' },
    { id: 'window-str', label: '当前窗口子串', color: '#3b82f6' },
    { id: 'match-pos', label: '匹配位置', color: '#a855f7' },
    { id: 'result', label: '判定结果', color: '#16a34a' },
  ],
  legend: [
    { label: '窗口扫描中', state: 'comparing' },
    { label: '匹配成功', state: 'sorted' },
  ],
  codeLanguages: STRING_MIGRATION_CODE_LANGUAGES,
  problemHtml: STRING_MIGRATION_PROBLEM_HTML,
  analysisHtml: STRING_MIGRATION_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(
      buildStringMigrationSteps(
        String(inputs.s ?? 'abcde'),
        String(inputs.goal ?? 'cdeab')
      )
    ),
  renderCanvas: (container, step) => renderStringMigrationCanvas(container, step as SCStep),
  renderCustomMetrics: (container, step) => renderStringMigrationCustomMetrics(container, step as SCStep),
});

export { buildStringMigrationSteps, type SCStep };
