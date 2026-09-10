/**
 * Class 157: 可持久化平衡树 (Persistent Treap)
 * 基于 FHQ-Treap 的写时复制 (COW) / 洛谷 P3835 【模板】可持久化平衡树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { PERSISTENT_TREAP_CODES, PERSISTENT_TREAP_LINES } from './advanced-155-160-stage-codes';
import { Advanced155Step, renderPersistentTreapBoard } from './advanced-155-160-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PersistentTreapStep extends Advanced155Step {
  versionCount: number;
  curVersion: number;
  clonedNodes: number[];
  actionName: string;
}

export function buildPersistentTreapSteps(): PersistentTreapStep[] {
  const steps: PersistentTreapStep[] = [];
  const lines = PERSISTENT_TREAP_LINES;

  // Step 0: 入口
  steps.push({
    versionCount: 1,
    curVersion: 0,
    clonedNodes: [],
    actionName: '初始化 Ver 0',
    decision: `主函数入口：开始演示可持久化平衡树 (Persistent Treap) 的版本派生与写时复制 (COW)`,
    message: `传统旋转平衡树无法优雅可持久化，而 FHQ-Treap 凭借无旋 split 与 merge，每次只需克隆路径节点即可完美保留全部历史`,
    log: `enter persistent treap`,
    codeLine: lines.entry,
    metrics: { '当前历史版本数': 1, '当前操作版本': 'Ver 0' },
  });

  // Step 1: 在 Ver 0 基础上插入新值 25 生成 Ver 1
  steps.push({
    versionCount: 2,
    curVersion: 1,
    clonedNodes: [101, 102],
    actionName: 'Ver 0 派生 Ver 1 (写时复制)',
    decision: `在历史版本 Ver 0 基础上插入键值 25：触发 split(key=25) 分裂与 COW 克隆`,
    message: `沿途复制节点分配新 ID [101, 102]，原 Ver 0 的节点内容严格只读、零被破坏`,
    log: `cowInsert: clone nodes [101, 102]`,
    codeLine: lines.cowClone,
    statusBadge: { text: '派生新版本 Ver 1', type: 'info' },
    metrics: { '克隆节点数': 2, '派生版本': 'Ver 1' },
  });

  steps.push({
    versionCount: 2,
    curVersion: 1,
    clonedNodes: [101, 102, 103],
    actionName: '合并产生 Ver 1 新根',
    decision: `执行 merge 组装为 Version 1：成功生成包含键值 25 的崭新平衡树`,
    message: `Ver 1 新根指针指向 node#103，与旧版本 Ver 0 共享未修改子树`,
    log: `mergeVer1: root=103`,
    codeLine: lines.mergeCow,
    statusBadge: { text: 'Ver 1 构建完毕', type: 'success' },
    metrics: { 'Ver 1 新根': 103, 'Ver 0 状态': '完全冻结安全' },
  });

  // Step 2: 派生 Ver 2 (删除操作或分裂)
  steps.push({
    versionCount: 3,
    curVersion: 2,
    clonedNodes: [201, 202],
    actionName: 'Ver 1 派生 Ver 2 (按值分裂)',
    decision: `基于 Ver 1 进行按值分裂操作生成 Version 2：分裂出左树与右树`,
    message: `再次通过 COW 克隆节点 [201, 202]，保持 Ver 1 历史快照独立完好`,
    log: `cowSplit: ver2`,
    codeLine: lines.splitPath,
    statusBadge: { text: '派生版本 Ver 2', type: 'warning' },
    metrics: { '当前总版本数': 3, '最新版本': 'Ver 2' },
  });

  // Step 3: 回溯历史验证 Ver 0
  steps.push({
    versionCount: 3,
    curVersion: 0,
    clonedNodes: [],
    actionName: '回溯访问历史 Ver 0',
    decision: `回溯查询初始版本 Ver 0：确认 Ver 0 的结构与内容完全未受任何后续版本影响`,
    message: `可持久化平衡树天然支持“时光倒流”，可作为撤销机制（Undo）与版本分支管理底座`,
    log: `rollbackVer0`,
    codeLine: lines.returnAns,
    statusBadge: { text: '历史版本 Ver 0 完整无损', type: 'success' },
    metrics: { '历史安全': '100% 验证', '单次操作额外空间': 'O(log N)' },
  });

  return steps;
}

export const persistentTreapVisualizer = registerDeclarativeAlgorithm<PersistentTreapStep>({
  id: 'persistent-treap-157',
  name: '可持久化平衡树 (Class 157)',
  category: 'tree',
  icon: '🎋',
  difficulty: 3,
  levelOrder: 157,
  description: '左程云算法通关课 Class 157：有序表专题 8 - 可持久化平衡树。基于 FHQ-Treap 的写时复制 (Copy-on-Write)，单次操作仅克隆 O(log N) 节点。',
  learningGoal: '深刻理解非旋 Treap 在 split 与 merge 过程中进行写时复制 (COW) 产生历史快照的工程机制',
  problemHtml: ADVANCED_155_160_PROBLEMS.persistentTreap.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.persistentTreap.html,
  inputs: [
    {
      id: 'demoMode',
      label: '可持久化演进场景',
      type: 'select',
      defaultValue: 'cow_standard',
      options: [
        { label: '标准派生演示 (Ver 0 -> Ver 1 -> Ver 2 并回溯)', value: 'cow_standard' },
      ],
    },
  ],
  codeLanguages: PERSISTENT_TREAP_CODES,
  generateSteps: () => {
    return buildPersistentTreapSteps();
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderPersistentTreapBoard(step.versionCount, step.curVersion, step.clonedNodes, step.actionName)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前聚焦版本</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">Version ${step.curVersion}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">历史总版本数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.versionCount} 个版本</div>
          </div>
        </div>

        ${renderFormulaCard(
          '可持久化 Treap COW 引擎',
          `写时复制准则: 途经节点一律克隆新节点 clone(u) | 0 回写破坏 | 历史可检索/可分叉/可撤销`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
