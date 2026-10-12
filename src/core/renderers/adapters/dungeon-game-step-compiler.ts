/**
 * 地下城游戏反向 DP (LeetCode 174 / 大厂高频 Hard)
 * Step Compiler: 自右下角终点向左上角逆向推导最低初始生命值编译器
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface DungeonStep extends StepBase {
  stepIndex?: number;
  dungeon: number[][];
  dp: number[][];
  currentRow: number;
  currentCol: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const DUNGEON_GAME_CODES = {
  java: `public class DungeonGame {
    // 反向动态规划：dp[i][j] 表示进入房间 (i, j) 所需的最低生命值
    public static int calculateMinimumHP(int[][] dungeon) {
        int m = dungeon.length;
        int n = dungeon[0].length;
        int[][] dp = new int[m][n];

        // 1. 终点 (右下角公主房)
        dp[m - 1][n - 1] = Math.max(1, 1 - dungeon[m - 1][n - 1]);

        // 2. 最底下一行（只能往右走）
        for (int j = n - 2; j >= 0; j--) {
            dp[m - 1][j] = Math.max(1, dp[m - 1][j + 1] - dungeon[m - 1][j]);
        }

        // 3. 最右边一列（只能往下走）
        for (int i = m - 2; i >= 0; i--) {
            dp[i][n - 1] = Math.max(1, dp[i + 1][n - 1] - dungeon[i][n - 1]);
        }

        // 4. 一般网格自底向上、自右向左逆推
        for (int i = m - 2; i >= 0; i--) {
            for (int j = n - 2; j >= 0; j--) {
                int minNext = Math.min(dp[i + 1][j], dp[i][j + 1]);
                dp[i][j] = Math.max(1, minNext - dungeon[i][j]);
            }
        }
        return dp[0][0];
    }
}`,
  cpp: `class DungeonGame {
public:
    static int calculateMinimumHP(const vector<vector<int>>& dungeon) {
        int m = dungeon.size();
        int n = dungeon[0].size();
        vector<vector<int>> dp(m, vector<int>(n, 0));

        dp[m - 1][n - 1] = max(1, 1 - dungeon[m - 1][n - 1]);

        for (int j = n - 2; j >= 0; --j) {
            dp[m - 1][j] = max(1, dp[m - 1][j + 1] - dungeon[m - 1][j]);
        }
        for (int i = m - 2; i >= 0; --i) {
            dp[i][n - 1] = max(1, dp[i + 1][n - 1] - dungeon[i][n - 1]);
        }

        for (int i = m - 2; i >= 0; --i) {
            for (int j = n - 2; j >= 0; --j) {
                int minNext = min(dp[i + 1][j], dp[i][j + 1]);
                dp[i][j] = max(1, minNext - dungeon[i][j]);
            }
        }
        return dp[0][0];
    }
};`,
  python: `class DungeonGame:
    @staticmethod
    def calculate_minimum_hp(dungeon: list[list[int]]) -> int:
        m, n = len(dungeon), len(dungeon[0])
        dp = [[0] * n for _ in range(m)]

        dp[m - 1][n - 1] = max(1, 1 - dungeon[m - 1][n - 1])

        for j in range(n - 2, -1, -1):
            dp[m - 1][j] = max(1, dp[m - 1][j + 1] - dungeon[m - 1][j])
        for i in range(m - 2, -1, -1):
            dp[i][n - 1] = max(1, dp[i + 1][n - 1] - dungeon[i][n - 1])

        for i in range(m - 2, -1, -1):
            for j in range(n - 2, -1, -1):
                min_next = min(dp[i + 1][j], dp[i][j + 1])
                dp[i][j] = max(1, min_next - dungeon[i][j])
        return dp[0][0]`,
  typescript: `export class DungeonGame {
  static calculateMinimumHP(dungeon: number[][]): number {
    const m = dungeon.length;
    const n = dungeon[0].length;
    const dp: number[][] = Array.from({ length: m }, () => Array(n).fill(0));

    dp[m - 1][n - 1] = Math.max(1, 1 - dungeon[m - 1][n - 1]);

    for (let j = n - 2; j >= 0; j--) {
      dp[m - 1][j] = Math.max(1, dp[m - 1][j + 1] - dungeon[m - 1][j]);
    }
    for (let i = m - 2; i >= 0; i--) {
      dp[i][n - 1] = Math.max(1, dp[i + 1][n - 1] - dungeon[i][n - 1]);
    }

    for (let i = m - 2; i >= 0; i--) {
      for (let j = n - 2; j >= 0; j--) {
        const minNext = Math.min(dp[i + 1][j], dp[i][j + 1]);
        dp[i][j] = Math.max(1, minNext - dungeon[i][j]);
      }
    }
    return dp[0][0];
  }
}`
};

export const DUNGEON_GAME_CODE_LINES = {
  initDest: { java: 9, cpp: 9, python: 7, typescript: 7 },
  bottomRow: { java: 13, cpp: 12, python: 10, typescript: 10 },
  rightCol: { java: 17, cpp: 15, python: 12, typescript: 13 },
  innerCell: { java: 23, cpp: 21, python: 17, typescript: 19 },
  finish: { java: 26, cpp: 24, python: 18, typescript: 22 },
};

export function generateDungeonSteps(dungeonInput: number[][]): DungeonStep[] {
  const steps: DungeonStep[] = [];
  const m = dungeonInput.length;
  const n = dungeonInput[0].length;
  const dp: number[][] = Array.from({ length: m }, () => Array(n).fill(0));

  let stepIdx = 0;

  // 1. 初始化终点
  const bossRoom = dungeonInput[m - 1][n - 1];
  dp[m - 1][n - 1] = Math.max(1, 1 - bossRoom);

  steps.push({
    stepIndex: stepIdx++,
    dungeon: dungeonInput,
    dp: dp.map(row => [...row]),
    currentRow: m - 1,
    currentCol: n - 1,
    decision: `终点公主房 (${m - 1}, ${n - 1})，扣/加血量为 ${bossRoom}。进入该房间后至少要有 1 点血生存，故进入该格所需血量 dp[${m - 1}][${n - 1}] = max(1, 1 - (${bossRoom})) = ${dp[m - 1][n - 1]}`,
    message: `公主房最低生命值: ${dp[m - 1][n - 1]}`,
    log: `初始化终点 (${m - 1}, ${n - 1}) = ${dp[m - 1][n - 1]}`,
    codeLine: DUNGEON_GAME_CODE_LINES.initDest,
    statusBadge: { text: `终点 HP: ${dp[m - 1][n - 1]}`, type: 'info' },
    metrics: {
      focusCoord: `(${m - 1}, ${n - 1})`,
      roomCost: bossRoom >= 0 ? `+${bossRoom}` : String(bossRoom),
      hpNeed: dp[m - 1][n - 1],
      startHp: '推导中',
    },
    ans: String(dp[m - 1][n - 1]),
  });

  // 2. 底边
  for (let j = n - 2; j >= 0; j--) {
    const cost = dungeonInput[m - 1][j];
    dp[m - 1][j] = Math.max(1, dp[m - 1][j + 1] - cost);
    steps.push({
      stepIndex: stepIdx++,
      dungeon: dungeonInput,
      dp: dp.map(row => [...row]),
      currentRow: m - 1,
      currentCol: j,
      decision: `底边界房间 (${m - 1}, ${j})，只能向右走出到 (${m - 1}, ${j + 1})。下一格需要 ${dp[m - 1][j + 1]}，本格变化 ${cost}，推得 dp[${m - 1}][${j}] = max(1, ${dp[m - 1][j + 1]} - (${cost})) = ${dp[m - 1][j]}`,
      message: `底边逆推 (${m - 1}, ${j})`,
      log: `底边 dp[${m - 1}][${j}] = ${dp[m - 1][j]}`,
      codeLine: DUNGEON_GAME_CODE_LINES.bottomRow,
      statusBadge: { text: `推导 (${m - 1}, ${j})`, type: 'warning' },
      metrics: {
        focusCoord: `(${m - 1}, ${j})`,
        roomCost: cost >= 0 ? `+${cost}` : String(cost),
        hpNeed: dp[m - 1][j],
        startHp: '推导中',
      },
      ans: String(dp[m - 1][j]),
    });
  }

  // 3. 右侧边
  for (let i = m - 2; i >= 0; i--) {
    const cost = dungeonInput[i][n - 1];
    dp[i][n - 1] = Math.max(1, dp[i + 1][n - 1] - cost);
    steps.push({
      stepIndex: stepIdx++,
      dungeon: dungeonInput,
      dp: dp.map(row => [...row]),
      currentRow: i,
      currentCol: n - 1,
      decision: `右边界房间 (${i}, ${n - 1})，只能向下走出到 (${i + 1}, ${n - 1})。下一格需要 ${dp[i + 1][n - 1]}，本格变化 ${cost}，推得 dp[${i}][${n - 1}] = max(1, ${dp[i + 1][n - 1]} - (${cost})) = ${dp[i][n - 1]}`,
      message: `右边界逆推 (${i}, ${n - 1})`,
      log: `右边界 dp[${i}][${n - 1}] = ${dp[i][n - 1]}`,
      codeLine: DUNGEON_GAME_CODE_LINES.rightCol,
      statusBadge: { text: `推导 (${i}, ${n - 1})`, type: 'warning' },
      metrics: {
        focusCoord: `(${i}, ${n - 1})`,
        roomCost: cost >= 0 ? `+${cost}` : String(cost),
        hpNeed: dp[i][n - 1],
        startHp: '推导中',
      },
      ans: String(dp[i][n - 1]),
    });
  }

  // 4. 网格中间逆推
  for (let i = m - 2; i >= 0; i--) {
    for (let j = n - 2; j >= 0; j--) {
      const cost = dungeonInput[i][j];
      const rightNeed = dp[i][j + 1];
      const downNeed = dp[i + 1][j];
      const minNext = Math.min(rightNeed, downNeed);
      dp[i][j] = Math.max(1, minNext - cost);

      steps.push({
        stepIndex: stepIdx++,
        dungeon: dungeonInput,
        dp: dp.map(row => [...row]),
        currentRow: i,
        currentCol: j,
        decision: `房间 (${i}, ${j})：下一步可向右需 ${rightNeed} 点，向下需 ${downNeed} 点。贪心选较小值 minNext=${minNext}。本房间代价为 ${cost}，推得 dp[${i}][${j}] = max(1, ${minNext} - (${cost})) = ${dp[i][j]}`,
        message: `推导 (${i}, ${j})`,
        log: `网格 dp[${i}][${j}] = ${dp[i][j]}`,
        codeLine: DUNGEON_GAME_CODE_LINES.innerCell,
        statusBadge: { text: `推导 (${i}, ${j})`, type: 'warning' },
        metrics: {
          focusCoord: `(${i}, ${j})`,
          roomCost: cost >= 0 ? `+${cost}` : String(cost),
          hpNeed: dp[i][j],
          startHp: dp[0][0] > 0 ? dp[0][0] : '推导中',
        },
        ans: dp[0][0] > 0 ? String(dp[0][0]) : String(dp[i][j]),
      });
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    dungeon: dungeonInput,
    dp: dp.map(row => [...row]),
    currentRow: 0,
    currentCol: 0,
    decision: `逆推完成！骑士从起点 (0, 0) 出发至少需要 ${dp[0][0]} 点初始健康生命值，方可在全程不降到 0 点并成功拯救公主！`,
    message: `最终初始最低生命值: ${dp[0][0]}`,
    log: `计算完成，返回 ${dp[0][0]}`,
    codeLine: DUNGEON_GAME_CODE_LINES.finish,
    statusBadge: { text: `最低生命值: ${dp[0][0]}`, type: 'success' },
    metrics: {
      focusCoord: '(0, 0)',
      roomCost: dungeonInput[0][0] >= 0 ? `+${dungeonInput[0][0]}` : String(dungeonInput[0][0]),
      hpNeed: dp[0][0],
      startHp: dp[0][0],
    },
    ans: String(dp[0][0]),
  });

  return steps;
}
