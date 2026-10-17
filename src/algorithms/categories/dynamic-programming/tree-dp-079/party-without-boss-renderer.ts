/**
 * 没有上司的舞会 (Greatest Independent Set on Tree / Luogu P1352 / 左程云 Class 079 Code01)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compilePartyWithoutBoss } from '../../../../core/strategies/tree-partywithoutboss';

export {
  compilePartyWithoutBoss,
  UniversalStageVisualizer,
  UniversalStageVisualizer as PartyWithoutBossVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'party-without-boss',
  name: '没有上司的舞会 (洛谷 P1352)',
  viewId: 'party-without-boss',
  category: 'dynamic-programming',
  description: '左程云算法讲解079 Code01：洛谷 P1352 没有上司的舞会，经典树型 DP 最大权独立集：每个节点向直接上司汇报 [0:不出席, 1:出席] 二元组，上级下属互斥原则聚合全局最大快乐值。',
  icon: '🎭',
  aliases: ['class079-code01', 'luogu-p1352', 'tree-max-independent-set'],
  template: '<div id="party-without-boss" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 7901,
  learningGoal: '掌握经典树型 DP 最大权独立集建模：每个节点自底向上汇报 [notCome, come] 二元组，深刻理解上司下属互斥状态转移与全局最优解的收敛机制。',
});
