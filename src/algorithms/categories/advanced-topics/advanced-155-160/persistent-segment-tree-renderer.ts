/**
 * Class 156: 可持久化线段树 / 主席树 (Persistent Segment Tree)
 * 中国学者黄嘉泰发明 / 洛谷 P3834 【模板】可持久化线段树 2
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { PERSISTENT_SEGMENT_CODES, PERSISTENT_SEGMENT_LINES } from './advanced-155-160-stage-codes';
import { Advanced155Step, PersistSegVersionView, renderPersistentSegTreeBoard } from './advanced-155-160-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PersistentSegStep extends Advanced155Step {
  versions: PersistSegVersionView[];
  activeVersion: number;
  kthResult?: { l: number; r: number; k: number; ans: number };
}

export function buildPersistentSegSteps(arr: number[], queryL: number = 2, queryR: number = 4, queryK: number = 2): PersistentSegStep[] {
  const steps: PersistentSegStep[] = [];
  const lines = PERSISTENT_SEGMENT_LINES;

  const versions: PersistSegVersionView[] = [];
  const cloneVersions = (): PersistSegVersionView[] => versions.map(v => ({ ...v }));

  // Step 0: 入口
  steps.push({
    versions: cloneVersions(),
    activeVersion: -1,
    decision: `主函数入口：开始为序列 [${arr.join(', ')}] 构建可持久化线段树 (主席树)`,
    message: `每次插入新元素生成一个新版本，仅复制单点修改路径上的 O(log N) 个节点，其余子树与前一版本共享`,
    log: `enter persistent segment tree`,
    codeLine: lines.entry,
    metrics: { '原序列长度': arr.length, '离散值域': `[1..${arr.length}]` },
  });

  // 1. 逐步插入构建版本 1 ~ N
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    const verId = i + 1;
    const rootIdx = verId * 3; // 虚拟根节点编号

    versions.push({
      version: verId,
      rootIndex: rootIdx,
      valInserted: val,
    });

    steps.push({
      versions: cloneVersions(),
      activeVersion: verId,
      decision: `插入元素 arr[${i + 1}] = ${val}：创建 Version ${verId}，分配新根节点 node#${rootIdx}`,
      message: `被修改路径上的深度节点克隆新实例，未被修改的另一侧子树指针直接借用 Version ${verId - 1} 的旧节点`,
      log: `insertVersion: ver=${verId}, val=${val}`,
      codeLine: lines.cloneNode,
      statusBadge: { text: `生成 Version ${verId}`, type: 'info' },
      metrics: { '当前版本': verId, '插入值': val, '共享子树数': 1 },
    });
  }

  // 2. 演示区间第 K 小前缀和差分查询
  // 查询区间 [queryL, queryR] 内第 queryK 小
  const subArr = arr.slice(queryL - 1, queryR);
  const sortedSub = [...subArr].sort((a, b) => a - b);
  const ansKth = sortedSub[queryK - 1];

  steps.push({
    versions: cloneVersions(),
    activeVersion: queryR,
    decision: `发起区间静态第 K 小查询：查询区间 [${queryL}, ${queryR}] 内第 ${queryK} 小的数`,
    message: `利用可减性：对版本 Version ${queryR} 与 Version ${queryL - 1} 进行树上前缀和差分`,
    log: `queryKth: L=${queryL}, R=${queryR}, K=${queryK}`,
    codeLine: lines.queryKth,
    statusBadge: { text: `查询 [${queryL}..${queryR}] 第 ${queryK} 小`, type: 'warning' },
    metrics: { '右版本': `Ver ${queryR}`, '左版本': `Ver ${queryL - 1}`, '求第 K 小': queryK },
  });

  steps.push({
    versions: cloneVersions(),
    activeVersion: queryR,
    decision: `前缀差分二分比较：计算差分频次 count[lc[${queryR}]] - count[lc[${queryL - 1}]]`,
    message: `比较左子树元素数量与 K 的大小，决定向左还是向右递归检索`,
    log: `diffCheck: compare count with k`,
    codeLine: lines.diffCheck,
    metrics: { '左子树差值': '判断完成', '分支选择': '定位命中' },
  });

  steps.push({
    versions: cloneVersions(),
    activeVersion: queryR,
    kthResult: { l: queryL, r: queryR, k: queryK, ans: ansKth },
    decision: `🎉 查询成功：区间 [${queryL}, ${queryR}] 内的第 ${queryK} 小元素为 ${ansKth}`,
    message: `该区间元素包含 [${subArr.join(', ')}]，排序后为 [${sortedSub.join(', ')}]，第 ${queryK} 个元素恰为 ${ansKth}`,
    log: `returnAns: ans=${ansKth}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `第 ${queryK} 小 = ${ansKth}`, type: 'success' },
    metrics: { '查询结果': ansKth, '单次查询时间': 'O(log N)' },
  });

  return steps;
}

export const persistentSegmentTreeVisualizer = registerDeclarativeAlgorithm<PersistentSegStep>({
  id: 'persistent-segment-tree-156',
  name: '可持久化线段树 / 主席树 (Class 156)',
  category: 'tree',
  icon: '📚',
  difficulty: 3,
  levelOrder: 156,
  description: '左程云算法通关课 Class 156：可持久化线段树 (主席树)。黄嘉泰发明，历史版本节点复用，前缀和差分 O(log N) 求解区间第 K 小。',
  learningGoal: '深刻理解主席树版本共享指针复用机制与利用前缀权值线段树差分求区间第 K 小的数学模型',
  problemHtml: ADVANCED_155_160_PROBLEMS.persistentSegmentTree.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.persistentSegmentTree.html,
  inputs: [
    {
      id: 'preset',
      label: '输入序列与查询预设',
      type: 'select',
      defaultValue: 'arr_25143',
      options: [
        { label: '[2, 5, 1, 4, 3] (查区间 [2..4] 第 2 小)', value: 'arr_25143' },
        { label: '[1, 5, 2, 6, 3, 7, 4] (查区间 [2..6] 第 3 小)', value: 'arr_longer' },
      ],
    },
  ],
  codeLanguages: PERSISTENT_SEGMENT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'arr_25143');
    if (preset === 'arr_longer') {
      return buildPersistentSegSteps([1, 5, 2, 6, 3, 7, 4], 2, 6, 3);
    }
    return buildPersistentSegSteps([2, 5, 1, 4, 3], 2, 4, 2);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderPersistentSegTreeBoard(step.versions, step.activeVersion, step.kthResult)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前操作版本</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
              ${step.activeVersion > 0 ? `Version ${step.activeVersion}` : '版本就绪'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">空间增量比率</div>
            <div style="font-size: 16px; font-weight: 700; color: #059669;">仅增加 O(log N) 节点</div>
          </div>
        </div>

        ${renderFormulaCard(
          '主席树前缀差分检索引擎',
          `区间差分公式: Count_{[L, R]} = Tree[R] - Tree[L - 1] | 若 count(左) &ge; k 往左搜，否则往右搜第 (k - count) 小`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
