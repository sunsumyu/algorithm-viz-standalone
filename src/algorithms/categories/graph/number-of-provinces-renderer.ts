import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface ProvincesStep extends StepBase {
  n: number;
  matrix: number[][];
  parent: number[];
  currentI: number;
  currentJ: number;
  provincesCount: number;
  lastMerged?: [number, number];
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const NUMBER_OF_PROVINCES_CODES = {
  java: `public class Solution {
    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        int provinces = n;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (isConnected[i][j] == 1) {
                    int rootI = find(parent, i);
                    int rootJ = find(parent, j);
                    if (rootI != rootJ) {
                        parent[rootI] = rootJ;
                        provinces--;
                    }
                }
            }
        }
        return provinces;
    }
    private int find(int[] parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent, parent[i]);
    }
}`,
  cpp: `class Solution {
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size();
        vector<int> parent(n);
        for (int i = 0; i < n; i++) parent[i] = i;
        int provinces = n;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (isConnected[i][j] == 1) {
                    int rootI = findRoot(parent, i);
                    int rootJ = findRoot(parent, j);
                    if (rootI != rootJ) {
                        parent[rootI] = rootJ;
                        provinces--;
                    }
                }
            }
        }
        return provinces;
    }
    int findRoot(vector<int>& parent, int i) {
        return parent[i] == i ? i : parent[i] = findRoot(parent, parent[i]);
    }
};`,
  python: `class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        parent = list(range(n))
        provinces = n

        def find(i):
            if parent[i] == i:
                return i
            parent[i] = find(parent[i])
            return parent[i]

        for i in range(n):
            for j in range(i + 1, n):
                if isConnected[i][j] == 1:
                    root_i, root_j = find(i), find(j)
                    if root_i != root_j:
                        parent[root_i] = root_j
                        provinces -= 1
        return provinces`,
  javascript: `function findCircleNum(isConnected) {
    const n = isConnected.length;
    const parent = Array.from({ length: n }, (_, i) => i);
    let provinces = n;

    function find(i) {
        if (parent[i] === i) return i;
        return parent[i] = find(parent[i]);
    }

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (isConnected[i][j] === 1) {
                const rootI = find(i), rootJ = find(j);
                if (rootI !== rootJ) {
                    parent[rootI] = rootJ;
                    provinces--;
                }
            }
        }
    }
    return provinces;
}`
};

const CODE_LINES = {
  entry: { java: 2, cpp: 4, python: 2, javascript: 1 },
  initUf: { java: 5, cpp: 7, python: 4, javascript: 3 },
  outerLoop: { java: 7, cpp: 9, python: 13, javascript: 11 },
  checkEdge: { java: 9, cpp: 11, python: 15, javascript: 13 },
  union: { java: 13, cpp: 15, python: 18, javascript: 16 },
  returnAns: { java: 19, cpp: 21, python: 20, javascript: 21 }
};

export function buildProvincesSteps(matrix: number[][]): ProvincesStep[] {
  const steps: ProvincesStep[] = [];
  const n = matrix.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  let provinces = n;

  function find(p: number[], x: number): number {
    if (p[x] === x) return x;
    return p[x] = find(p, p[x]);
  }

  // Step 0: 入口
  steps.push({
    n,
    matrix,
    parent: [...parent],
    currentI: -1,
    currentJ: -1,
    provincesCount: provinces,
    decision: `主函数入口：城市总数 n = ${n}，准备基于并查集（Union-Find）计算独立省份数量`,
    message: '相连关系具备传递性，并查集利用路径压缩能够以近乎常数 O(α(N)) 复杂度实现集合合并',
    log: `enter findCircleNum(n=${n})`,
    codeLine: CODE_LINES.entry,
    metrics: { '城市总数': `${n}`, '当前省份数': `${provinces}`, '阶段': '初始化' }
  });

  // Step 1: 初始化
  steps.push({
    n,
    matrix,
    parent: [...parent],
    currentI: -1,
    currentJ: -1,
    provincesCount: provinces,
    decision: `并查集初始化：各城市独立自成省份 parent=[${parent.join(', ')}]，初始省份数 = ${n}`,
    message: '每个城市的初始代表元是其自身',
    log: 'initialized union-find forest',
    codeLine: CODE_LINES.initUf,
    metrics: { '初始省份数': `${n}`, '父节点指针': `[${parent.join(', ')}]` }
  });

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const isConnected = matrix[i][j] === 1;

      steps.push({
        n,
        matrix,
        parent: [...parent],
        currentI: i,
        currentJ: j,
        provincesCount: provinces,
        decision: `探测城市对 (${i}, ${j}): 邻接矩阵 isConnected[${i}][${j}] = ${matrix[i][j]}`,
        message: isConnected ? `城市 ${i} 与城市 ${j} 存在直连道路，准备执行集合合并` : `城市 ${i} 与城市 ${j} 无直连道路，跳过`,
        log: `inspect edge (${i}, ${j}): isConnected=${isConnected}`,
        codeLine: CODE_LINES.checkEdge,
        metrics: { '考察边': `(${i}, ${j})`, '连通性': isConnected ? '已连通' : '无直连' }
      });

      if (isConnected) {
        const rootI = find(parent, i);
        const rootJ = find(parent, j);

        if (rootI !== rootJ) {
          parent[rootI] = rootJ;
          provinces--;

          steps.push({
            n,
            matrix,
            parent: [...parent],
            currentI: i,
            currentJ: j,
            provincesCount: provinces,
            lastMerged: [i, j],
            decision: `🔗 发生合并！城市 ${i} (根${rootI}) 与城市 ${j} (根${rootJ}) 合并，省份总数减少为 ${provinces}`,
            message: `设置 parent[${rootI}] = ${rootJ}，两片独立区域联结为同一省份`,
            log: `union (${i}, ${j}): merged root ${rootI} into ${rootJ}, provinces now ${provinces}`,
            codeLine: CODE_LINES.union,
            metrics: { '省份总数': `${provinces}`, '新父节点数组': `[${parent.join(', ')}]` }
          });
        }
      }
    }
  }

  // 终态
  steps.push({
    n,
    matrix,
    parent: [...parent],
    currentI: -1,
    currentJ: -1,
    provincesCount: provinces,
    decision: `🎉 计算完毕！该国家/区域共有 ${provinces} 个独立的省份（连通分量）`,
    message: '全矩阵连通性扫描完毕，并查集成功收敛独立集合总数',
    log: `finished findCircleNum, result=${provinces}`,
    codeLine: CODE_LINES.returnAns,
    metrics: { '最终省份数': `${provinces}`, '连通分量数': `${provinces}`, '耗时': 'O(N²)' }
  });

  return steps;
}

export function renderProvincesCanvas(container: HTMLElement, step: ProvincesStep): void {
  const { n, matrix, parent, currentI, currentJ, provincesCount, lastMerged } = step;

  // 1. 邻接矩阵微缩图
  const matrixCells = matrix.map((row, r) => {
    const rowHtml = row.map((val, c) => {
      const isCur = (r === currentI && c === currentJ) || (r === currentJ && c === currentI);
      let bg = val === 1 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.4)';
      let border = '1px solid rgba(255, 255, 255, 0.08)';
      let color = val === 1 ? '#38bdf8' : '#64748b';

      if (isCur) {
        bg = 'rgba(244, 114, 182, 0.3)';
        border = '1px solid #f472b6';
        color = '#f472b6';
      }

      return `
        <div style="
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${bg};
          border: ${border};
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.85rem;
          color: ${color};
        ">${val}</div>
      `;
    }).join('');
    return `<div style="display:flex; gap:4px;">${rowHtml}</div>`;
  }).join('');

  // 2. 并查集代表元映射
  const parentCells = parent.map((p, idx) => {
    const isCur = idx === currentI || idx === currentJ;
    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      ">
        <div style="
          width: 44px;
          height: 48px;
          border-radius: 8px;
          background: ${isCur ? 'rgba(244, 114, 182, 0.25)' : 'rgba(52, 211, 153, 0.15)'};
          border: ${isCur ? '2px solid #f472b6' : '1px solid #34d399'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.15rem;
          color: ${isCur ? '#f472b6' : '#34d399'};
        ">${p}</div>
        <span style="font-size: 0.7rem; color: #94a3b8;">城市 ${idx}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 左侧：邻接矩阵 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
      ">
        <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; align-self: flex-start;">🗺️ 城市连通性邻接矩阵</span>
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 12px; background: rgba(2, 6, 23, 0.4); border-radius: 8px;">
          ${matrixCells}
        </div>
        <span style="font-size: 0.78rem; color: #94a3b8;">1 代表两城市存在道路，0 代表无直连</span>
      </div>

      <!-- 右侧：并查集森林与省份状态 -->
      <div style="
        flex: 1.3;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">🌳 并查集父指针数组 (Parent Pointer)</span>
          <div style="
            font-size: 1.1rem;
            font-weight: 800;
            color: #34d399;
            background: rgba(52, 211, 153, 0.15);
            padding: 4px 12px;
            border-radius: 8px;
            border: 1px solid rgba(52, 211, 153, 0.3);
          ">
            省份总数: ${provincesCount}
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px;">
          ${parentCells}
        </div>

        <!-- 动态解说卡片 -->
        <div style="
          padding: 12px 14px;
          background: rgba(30, 41, 59, 0.4);
          border-left: 3px solid #38bdf8;
          border-radius: 0 8px 8px 0;
          font-size: 0.83rem;
          color: #94a3b8;
          line-height: 1.6;
        ">
          💡 <b>并查集核心思想</b>：<br>
          每个城市初始为一个独立省份（$n$ 个集合）；<br>
          每当发现两个属于不同根节点的城市相连，调用 <code>union</code> 合并其集合代表元，省份计数减 1。
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'number-of-provinces',
  name: '大厂高频真题: 省份数量 (Number of Provinces)',
  category: 'graph',
  learningGoal: '掌握并查集（Union-Find）在连通分量与网络合并中的核心应用，理解路径压缩优化机制',
  inputs: [
    {
      id: 'matrixPreset',
      label: '图预设用例',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: '用例 1: 3城市 2省份 ([[1,1,0],[1,1,0],[0,0,1]])', value: 'case1' },
        { label: '用例 2: 3城市 3省份 ([[1,0,0],[0,1,0],[0,0,1]])', value: 'case2' },
        { label: '用例 3: 4城市 1省份 全连通', value: 'case3' }
      ]
    }
  ],
  codeLanguages: NUMBER_OF_PROVINCES_CODES,
  generateSteps: (inputs) => {
    const preset = String(inputs.matrixPreset || 'case1');
    let matrix: number[][];
    if (preset === 'case2') {
      matrix = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
    } else if (preset === 'case3') {
      matrix = [
        [1, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 1, 1],
        [0, 0, 1, 1]
      ];
    } else {
      matrix = [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 1]
      ];
    }
    return buildProvincesSteps(matrix);
  },
  renderCanvas: (container, step) => {
    renderProvincesCanvas(container, step as ProvincesStep);
  }
});
