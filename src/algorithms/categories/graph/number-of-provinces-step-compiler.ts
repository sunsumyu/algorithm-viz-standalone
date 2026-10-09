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

export const CODE_LINES = {
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
    p[x] = find(p, p[x]);
    return p[x];
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
