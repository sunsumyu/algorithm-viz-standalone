/**
 * Class 180: 动态点分治 / 点分树 (Dynamic Centroid Tree)
 * 重心树父子关系 + 树高 O(log N) 倍增上跳 + 容斥修正 / 洛谷 P6329 【模板】点分树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { DYNAMIC_CENTROID_TREE_CODES, DYNAMIC_CENTROID_TREE_LINES } from './advanced-179-184-stage-codes';
import { Advanced179Step, renderDynamicCentroidBoard } from './advanced-179-184-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface DynamicCentroidStep extends Advanced179Step {
  nodes: number[];
  ctParent: Record<number, number>;
  activeJumpPath: number[];
  queryAns: number;
  stage: string;
}

export function buildDynamicCentroidSteps(): DynamicCentroidStep[] {
  const steps: DynamicCentroidStep[] = [];
  const lines = DYNAMIC_CENTROID_TREE_LINES;

  const nodes = [1, 2, 3, 4, 5];
  const ctParent: Record<number, number> = {
    2: 0,
    1: 2,
    4: 2,
    3: 4,
    5: 4,
  };

  // Step 0: 入口帧
  steps.push({
    nodes,
    ctParent,
    activeJumpPath: [],
    queryAns: 0,
    stage: '点分树构建完毕：准备查询/修改',
    decision: `主函数入口：点分树重构完成，树高被严格限制在 O(log N) 深度以支持动态单点修改与邻域统计`,
    message: `每一个点分树节点 cur 维护两个动态开点线段树/树状数组：tree1 维护自身子树距离，tree2 维护父亲容斥抵消`,
    log: `enter dynamic centroid tree: n=5, ctRoot=2`,
    codeLine: lines.entry,
    metrics: { '点分树深度': 3, '点分树根': 2, '维护节点数': 5 },
  });

  // Step 1: 节点 3 发生点权更新 update(3, +10)
  steps.push({
    nodes,
    ctParent,
    activeJumpPath: [3],
    queryAns: 0,
    stage: '动态修改：节点 3 点权增加 10 (阶段 1)',
    decision: `执行 update(u=3, val=10)：首先更新点分树节点 3 自身的距离点权数据结构`,
    message: `在 tree1[3] 中累加 dist(3, 3)=0 处的权值，同时准备向点分树父节点 CT_4 容斥上跳`,
    log: `update: u=3, val=+10, update tree1[3]`,
    codeLine: lines.addTrees,
    statusBadge: { text: '更新节点 3 本地结构', type: 'info' },
    metrics: { '修改节点': 3, '当前上跳点': 3, '已跳步数': 0 },
  });

  // Step 2: 上跳到父节点 CT_4
  steps.push({
    nodes,
    ctParent,
    activeJumpPath: [3, 4],
    queryAns: 0,
    stage: '动态修改：上跳至父重心 CT_4 (阶段 2)',
    decision: `cur 上跳至 CT_4：计算原树距离 dist(3, 4)=1，在 tree1[4] 中增加距离 1 的权值，并在 tree2[3] 中记录父亲容斥量`,
    message: `tree2[3] 记录 3 对父节点 4 的贡献，后续当询问从 4 往下容斥时即可准确扣除`,
    log: `update: cur=4, dist(3,4)=1, update tree1[4] & tree2[3]`,
    codeLine: lines.jumpFa,
    statusBadge: { text: '上跳至父重心 CT_4', type: 'warning' },
    metrics: { '当前上跳点': 4, '原树距离': 1, '已跳步数': 1 },
  });

  // Step 3: 上跳到点分树根节点 CT_2
  steps.push({
    nodes,
    ctParent,
    activeJumpPath: [3, 4, 2],
    queryAns: 0,
    stage: '动态修改：上跳至点分树根 CT_2 (阶段 3)',
    decision: `cur 继续上跳至全局根 CT_2：计算原树距离 dist(3, 2)=2，更新 tree1[2] 与 tree2[4]`,
    message: `到达点分树根节点 (faCT[2]=0)，整条更新链条结束，总共仅耗费 O(log N) 次上跳`,
    log: `update: cur=2 (root), dist(3,2)=2, finished`,
    codeLine: lines.jumpFa,
    statusBadge: { text: '完成全链路更新', type: 'success' },
    metrics: { '当前上跳点': 2, '原树距离': 2, '已跳步数': 2 },
  });

  // Step 4: 邻域查询 query(u=5, k=2)
  steps.push({
    nodes,
    ctParent,
    activeJumpPath: [5, 4, 2],
    queryAns: 10,
    stage: '邻域询问：query(u=5, k=2) 容斥求和',
    decision: `从节点 5 出发，统计原树距离 <= 2 的所有点权和：先取 tree1[5] 距离 <= 2 范围，再沿点分树不断上跳`,
    message: `在父节点 4 处加入 tree1[4].query(k - dist(5,4)) 并扣除 tree2[5].query(...) 重复部分，成功捕获节点 3 的点权 10`,
    log: `query: u=5, k=2, ans=10`,
    codeLine: lines.queryInclusion,
    statusBadge: { text: '容斥求和成功: ans=10', type: 'success' },
    metrics: { '查询点': 5, '查询半径': 2, '当前统计和': 10 },
  });

  // Step 5: 查询终态返回
  steps.push({
    nodes,
    ctParent,
    activeJumpPath: [5, 4, 2],
    queryAns: 10,
    stage: '点分树查询完成',
    decision: `🎉 动态点分树查询完成：节点 5 在半径 2 内的点权和为 10`,
    message: `动态点分治将静态点分治改造成高度不超过 O(log N) 的有根树，单次修改与查询均可在 O(log^2 N) 内完成`,
    log: `dynamic centroid tree finished: ans=10`,
    codeLine: lines.returnAns,
    statusBadge: { text: '查询成功: 10', type: 'success' },
    metrics: { '最终结果': 10, '时间复杂度': 'O(log^2 N)', '状态': '求解完成' },
  });

  return steps;
}

export const dynamicCentroidTreeVisualizer = registerDeclarativeAlgorithm<DynamicCentroidStep>({
  id: 'dynamic-centroid-tree-180',
  name: '动态点分治 / 点分树 (Dynamic Centroid Tree / Class 180)',
  category: 'tree',
  icon: '🌳',
  difficulty: 3,
  levelOrder: 180,
  description: '左程云算法通关课 Class 180：动态点分治 (点分树)。将点分治构建为树高不超过 O(log N) 的重构树，向上容斥支持动态单点修改与邻域点权和查询。',
  learningGoal: '掌握点分树父子拓扑维护、两层动态数据结构容斥抵消与 O(log^2 N) 向上逐层上跳',
  problemHtml: ADVANCED_179_184_PROBLEMS.dynamicCentroidTree.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.dynamicCentroidTree.html,
  inputs: [
    {
      id: 'preset',
      label: '点分树操作序列',
      type: 'select',
      defaultValue: 'update3_query5',
      options: [
        { label: '单点修改 update(3, +10) -> 邻域查询 query(5, k=2)', value: 'update3_query5' },
      ],
    },
  ],
  codeLanguages: DYNAMIC_CENTROID_TREE_CODES,
  generateSteps: () => buildDynamicCentroidSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderDynamicCentroidBoard(
          step.nodes,
          step.ctParent,
          step.activeJumpPath,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #15803d;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">点分树高限制</div>
            <div style="font-size: 15px; font-weight: 700; color: #0284c7;">至多 log N 层上跳</div>
          </div>
        </div>

        ${renderFormulaCard(
          '点分树容斥核心公式',
          'Ans = tree1[u].query(k) + sum ( tree1[fa].query(k - d) - tree2[cur].query(k - d) )',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
