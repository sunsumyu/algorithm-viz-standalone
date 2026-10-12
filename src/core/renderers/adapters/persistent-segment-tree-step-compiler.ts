/**
 * Class 156: 可持久化线段树 / 主席树 (Persistent Segment Tree) 步进推演编译器
 * 核心：写时复制派生新版本、树节点共享与区间静态第 K 小树上前缀和差分
 */

import { Advanced155Step, PersistSegVersionView } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { PERSISTENT_SEGMENT_LINES } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-stage-codes';

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
    const rootIdx = verId * 3;

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
