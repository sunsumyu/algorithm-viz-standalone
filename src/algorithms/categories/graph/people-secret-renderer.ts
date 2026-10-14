/**
 * 找出知晓秘密的所有专家 (Find All People With Secret - LeetCode 2092) 声明式可视化器
 * 核心：按时间分组、同一时间步瞬时连通合并、未连接到 0 号已知密者的撤销重置 (father[u] = u)
 * 遵循 Matt Pocock 深模块规范，委托 StepCompiler、CanvasAdapter 与 DeductionTree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PEOPLE_SECRET_CODE_LANGUAGES,
  PEOPLE_SECRET_PROBLEM_HTML,
  PEOPLE_SECRET_ANALYSIS_HTML,
} from './people-secret-problem-content';
import {
  buildSecretExpertSteps,
  type SecretExpertStep,
} from './people-secret-step-compiler';
import {
  renderPeopleSecretCanvas,
  renderPeopleSecretCustomMetrics,
} from '../../../core/renderers/adapters/people-secret-canvas-adapter';

export { buildSecretExpertSteps, type SecretExpertStep };

const { template, Visualizer } = createDeclarativeVisualizer<SecretExpertStep>({
  id: 'people-secret',
  name: '找出知晓秘密的所有专家 (Find All People With Secret)',
  viewId: 'algo-people-secret-view',
  category: 'graph',
  icon: '🤫',
  badge: {
    mode: '时间切片 + 并查集瞬时合并与连通撤销',
    complexity: 'O(M log M + (N + M) α(N)) · O(N + M)',
  },
  card1Title: '🤫 专家社交网络与时序扩散撤销舱',
  card2Title: '📊 秘密状态监视器 (father, 当前已知专家, 撤销节点)',
  card2Desc: '展示按时间步分组 meetings、同批瞬时级联 union 与未连通 0 号节点撤销重置过程',
  hasDeductionTree: true,
  legend: [
    { label: '🤫 知晓秘密专家 (与 0 连通)', state: 'discovered' },
    { label: '⚪ 未知秘密专家', color: '#1e293b' },
    { label: '⚡ 当前正在开会', color: '#f59e0b' },
    { label: '⏪ 撤销重置节点', state: 'swapping' },
  ],
  presets: [
    { label: '6 专家撤销', values: { 'input-preset': 'classic_6expert' } },
    { label: '5 专家级联', values: { 'input-preset': 'multitime_5expert' } },
  ],
  metrics: [
    { id: 'metric-secret-time', label: '当前推演时刻', color: '#38bdf8' },
    { id: 'metric-known-count', label: '当前知密人数', color: '#10b981' },
    { id: 'metric-cur-meeting', label: '当前活跃会议', color: '#f59e0b' },
    { id: 'metric-secret-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: PEOPLE_SECRET_CODE_LANGUAGES,
  problemHtml: PEOPLE_SECRET_PROBLEM_HTML,
  analysisHtml: PEOPLE_SECRET_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_6expert') as string;
    return buildSecretExpertSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderPeopleSecretCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderPeopleSecretCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'people-secret',
  aliases: ['class057-code03', 'find-all-people-with-secret-2092', 'people-secret-2092'],
  name: '找出知晓秘密的所有专家 (Find All People With Secret)',
  viewId: 'algo-people-secret-view',
  category: 'graph',
  description: '经典并查集时间切片算法：会议按时间排序分批、同批会议瞬时级联合并、未连接到 0 号密源者即时撤销重置 (LeetCode 2092)',
  icon: '🤫',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 106,
  learningGoal: '掌握按时间分组处理静态事件技巧、并查集同层瞬时合并与无效边即时回滚机制',
});

export { Visualizer as PeopleSecretVisualizer };
