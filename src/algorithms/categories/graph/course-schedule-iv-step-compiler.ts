/**
 * 课程表 IV (Course Schedule IV · LeetCode 1462) 步进编译器
 * 纯逻辑与状态步进推演，零 DOM 依赖与零视觉内联
 * 核心考点：有向无环图拓扑排序、传递闭包 (Transitive Closure) 状态传播与 O(1) 可达性查询
 */

import { StepBase } from '../../../core/step-visualizer';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

/** 代码面板高亮行号锚点（1-based，与源码逐行对应） */
const lines: Record<string, number> = {
  init: 4,
  propagate: 24,
  query: 29,
  finish: 31,
};

export interface CourseScheduleIVStep extends StepBase {
  numCourses: number;
  prerequisites: [number, number][];
  closure: boolean[][];
  activeU: number;
  activeV: number;
  queryResults: { u: number; v: number; ans: boolean }[];
  phase: 'init' | 'propagate' | 'query' | 'finish';
  message: string;
  log: string;
  codeLine: number;
}

export const COURSE_SCHEDULE_IV_CODES = {
  java: `public class Solution {
    public List<Boolean> checkIfPrerequisite(int numCourses, int[][] prerequisites, int[][] queries) {
        boolean[][] isPre = new boolean[numCourses][numCourses];
        List<Integer>[] graph = new ArrayList[numCourses];
        int[] inDegree = new int[numCourses];
        for (int i = 0; i < numCourses; i++) graph[i] = new ArrayList<>();
        
        for (int[] p : prerequisites) {
            graph[p[0]].add(p[1]);
            isPre[p[0]][p[1]] = true;
            inDegree[p[1]]++;
        }
        
        // 拓扑排序传播可达性状态
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) queue.offer(i);
        
        while (!queue.isEmpty()) {
            int cur = queue.poll();
            for (int nxt : graph[cur]) {
                for (int i = 0; i < numCourses; i++) {
                    if (isPre[i][cur]) isPre[i][nxt] = true;
                }
                if (--inDegree[nxt] == 0) queue.offer(nxt);
            }
        }
        List<Boolean> ans = new ArrayList<>();
        for (int[] q : queries) ans.add(isPre[q[0]][q[1]]);
        return ans;
    }
}`,
  cpp: `class Solution {
public:
    vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
        vector<vector<bool>> isPre(numCourses, vector<bool>(numCourses, false));
        vector<vector<int>> graph(numCourses);
        vector<int> inDegree(numCourses, 0);
        for (auto& p : prerequisites) {
            graph[p[0]].push_back(p[1]);
            isPre[p[0]][p[1]] = true;
            inDegree[p[1]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; ++i) if (inDegree[i] == 0) q.push(i);
        while (!q.empty()) {
            int cur = q.front(); q.pop();
            for (int nxt : graph[cur]) {
                for (int i = 0; i < numCourses; ++i) {
                    if (isPre[i][cur]) isPre[i][nxt] = true;
                }
                if (--inDegree[nxt] == 0) q.push(nxt);
            }
        }
        vector<bool> ans;
        for (auto& query : queries) ans.push_back(isPre[query[0]][query[1]]);
        return ans;
    }
};`,
  python: `class Solution:
    def checkIfPrerequisite(self, numCourses: int, prerequisites: list[list[int]], queries: list[list[int]]) -> list[bool]:
        is_pre = [[False] * numCourses for _ in range(numCourses)]
        graph = [[] for _ in range(numCourses)]
        in_degree = [0] * numCourses
        for u, v in prerequisites:
            graph[u].append(v)
            is_pre[u][v] = True
            in_degree[v] += 1
        q = collections.deque([i for i in range(numCourses) if in_degree[i] == 0])
        while q:
            cur = q.popleft()
            for nxt in graph[cur]:
                for i in range(numCourses):
                    if is_pre[i][cur]:
                        is_pre[i][nxt] = True
                in_degree[nxt] -= 1
                if in_degree[nxt] == 0:
                    q.append(nxt)
        return [is_pre[u][v] for u, v in queries]`,
  javascript: `var checkIfPrerequisite = function(numCourses, prerequisites, queries) {
    const isPre = Array.from({ length: numCourses }, () => new Array(numCourses).fill(false));
    const graph = Array.from({ length: numCourses }, () => []);
    const inDegree = new Array(numCourses).fill(0);
    for (const [u, v] of prerequisites) {
        graph[u].push(v);
        isPre[u][v] = true;
        inDegree[v]++;
    }
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) queue.push(i);
    }
    while (queue.length > 0) {
        const cur = queue.shift();
        for (const nxt of graph[cur]) {
            for (let i = 0; i < numCourses; i++) {
                if (isPre[i][cur]) isPre[i][nxt] = true;
            }
            if (--inDegree[nxt] === 0) queue.push(nxt);
        }
    }
    return queries.map(([u, v]) => isPre[u][v]);
};`,
};

export function buildCourseScheduleIVSteps(
  numCourses: number = 4,
  prerequisites: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
  ],
  queries: [number, number][] = [
    [0, 2],
    [1, 3],
    [3, 0],
    [0, 3],
  ]
): CourseScheduleIVStep[] {
  const steps: CourseScheduleIVStep[] = [];

  const closure: boolean[][] = Array.from({ length: numCourses }, () =>
    new Array(numCourses).fill(false)
  );
  const graph: number[][] = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  // 初始化直接依赖
  for (const [u, v] of prerequisites) {
    graph[u].push(v);
    closure[u][v] = true;
    inDegree[v]++;
  }

  // Step 0: Init
  steps.push({
    numCourses,
    prerequisites,
    closure: snapshotGrid2D(closure),
    activeU: -1,
    activeV: -1,
    queryResults: [],
    phase: 'init',
    message: `算法启动：课程总数 ${numCourses}，直接先修依赖有 ${prerequisites.length} 条。建立入度数组与邻接表。`,
    log: `初始化先修图，直接先修标记就绪`,
    codeLine: lines.init,
  });

  // 拓扑排序传播
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;

    for (const nxt of graph[cur]) {
      // 传播闭包
      for (let i = 0; i < numCourses; i++) {
        if (closure[i][cur] && !closure[i][nxt]) {
          closure[i][nxt] = true;
          steps.push({
            numCourses,
            prerequisites,
            closure: snapshotGrid2D(closure),
            activeU: i,
            activeV: nxt,
            queryResults: [],
            phase: 'propagate',
            message: `传递闭包更新：因为课程 ${i} 是课程 ${cur} 的先修，而 ${cur} -> ${nxt}，故课程 ${i} 也是课程 ${nxt} 的先修！`,
            log: `传递闭包: isPre[${i}][${nxt}] = true`,
            codeLine: lines.propagate,
          });
        }
      }

      inDegree[nxt]--;
      if (inDegree[nxt] === 0) {
        queue.push(nxt);
      }
    }
  }

  // 校验查询
  const queryResults: { u: number; v: number; ans: boolean }[] = [];
  for (const [qu, qv] of queries) {
    const ans = closure[qu][qv];
    queryResults.push({ u: qu, v: qv, ans });
    steps.push({
      numCourses,
      prerequisites,
      closure: snapshotGrid2D(closure),
      activeU: qu,
      activeV: qv,
      queryResults: [...queryResults],
      phase: 'query',
      message: `执行查询 [${qu} -> ${qv}]：闭包矩阵 isPre[${qu}][${qv}] = ${ans}。课程 ${qu} ${ans ? '是' : '不是'} 课程 ${qv} 的先修。`,
      log: `查询 query(${qu}, ${qv}) => ${ans}`,
      codeLine: lines.query,
    });
  }

  // Finish
  steps.push({
    numCourses,
    prerequisites,
    closure: snapshotGrid2D(closure),
    activeU: -1,
    activeV: -1,
    queryResults: [...queryResults],
    phase: 'finish',
    message: `全部先修查询处理完毕！通过传递闭包矩阵在 O(1) 内完成了每项可达性回答。`,
    log: `算法执行完毕，返回查询结果集`,
    codeLine: lines.finish,
  });

  return steps;
}
