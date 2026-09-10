/**
 * Hard 12: 地下城游戏反向 DP (Dungeon Game / Knight Princess)
 * LeetCode 174 大厂高频经典反向动态规划
 * 为什么正向 DP 具有后效性？为什么必须从右下角公主房向左上角逆推？
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface DungeonStep extends StepBase {
  stepIndex?: number;
  dungeon: number[][];
  dp: number[][];
  currentRow: number;
  currentCol: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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
    codeLine: 9,
    statusBadge: { text: `终点 HP: ${dp[m - 1][n - 1]}`, type: 'info' }
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
      codeLine: 13,
      statusBadge: { text: `推导 (${m - 1}, ${j})`, type: 'warning' }
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
      codeLine: 18,
      statusBadge: { text: `推导 (${i}, ${n - 1})`, type: 'warning' }
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
        codeLine: 24,
        statusBadge: { text: `推导 (${i}, ${j})`, type: 'warning' }
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
    codeLine: 27,
    statusBadge: { text: `最低生命值: ${dp[0][0]}`, type: 'success' }
  });

  return steps;
}

export function renderDungeonCanvas(container: HTMLElement, step: DungeonStep) {
  const { dungeon, dp, currentRow, currentCol } = step;
  const m = dungeon.length;
  const n = dungeon[0].length;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前逆推房间坐标</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            (${currentRow}, ${currentCol})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前房间加/扣血</div>
          <div style="font-size: 14px; font-weight: bold; color: ${dungeon[currentRow][currentCol] >= 0 ? '#10b981' : '#ef4444'};">
            ${dungeon[currentRow][currentCol] >= 0 ? `+${dungeon[currentRow][currentCol]}` : dungeon[currentRow][currentCol]}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">所需最低生命值 dp[i][j]</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${dp[currentRow][currentCol]}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">起点初始生命值 dp[0][0]</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${dp[0][0] > 0 ? dp[0][0] : '推导中...'}
          </div>
        </div>
      </div>

      <!-- 地下城房间网格展示 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; gap: 12px; overflow-x: auto;">
        <div style="display: grid; grid-template-columns: repeat(${n}, 90px); gap: 10px;">
          ${Array.from({ length: m }).map((_, r) => {
            return Array.from({ length: n }).map((_, c) => {
              const isCur = r === currentRow && c === currentCol;
              const hpNeed = dp[r][c];
              const cost = dungeon[r][c];

              let border = '1px solid rgba(255,255,255,0.1)';
              let bg = 'rgba(30, 41, 59, 0.5)';

              if (isCur) {
                border = '2px solid #38bdf8';
                bg = 'rgba(56, 189, 248, 0.25)';
              } else if (hpNeed > 0) {
                bg = 'rgba(51, 65, 85, 0.4)';
              }

              return `
                <div style="
                  height: 80px;
                  background: ${bg};
                  border: ${border};
                  border-radius: 8px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                  box-shadow: ${isCur ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  <div style="font-size: 10px; color: #94a3b8;">(${r}, ${c})</div>
                  <div style="font-size: 13px; font-weight: bold; color: ${cost >= 0 ? '#10b981' : '#ef4444'};">
                    ${cost >= 0 ? `+${cost}` : cost}
                  </div>
                  <div style="font-size: 11px; font-weight: bold; color: ${hpNeed > 0 ? '#f59e0b' : '#64748b'};">
                    ${hpNeed > 0 ? `需 ≥ ${hpNeed}` : '未算'}
                  </div>
                </div>
              `;
            }).join('');
          }).join('')}
        </div>
      </div>

      <!-- 核心数学与无后效性原理卡片 -->
      ${renderFormulaCard(
        '反向动态规划逆推原理 (Reverse DP)',
        '正向计算时“当前剩余血量”与“所需初始最低血量”互相牵制存在后效性；反向定义 dp[i][j] 为进入该格的最低生存点数，dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) - dungeon[i][j])',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const dungeonGameVisualizer = registerDeclarativeAlgorithm<DungeonStep>({
  id: 'dungeon-game-reverse-dp',
  name: '大厂高频真题: 地下城游戏反向 DP (Dungeon Game)',
  category: 'dynamic-programming',
  icon: '🏰',
  difficulty: 3,
  levelOrder: 174,
  learningGoal: '透彻理解正向 DP 的后效性死局，掌握从终点公主房向起点逆向推导最低初始健康值的经典建模技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 174)</h3>
      <p>恶魔抓走了公主并关在地下城右下角 <code>(m - 1, n - 1)</code>。骑士从左上角 <code>(0, 0)</code> 出发拯救公主：</p>
      <ul>
        <li>骑士初始有一个健康点数，每次只能<strong>向右</strong>或<strong>向下</strong>移动一步。</li>
        <li>房间中数值为负数表示扣血，非负数表示加血。任何时刻骑士的血量都不能降到 <code>0</code> 或以下（必须 $\\ge 1$）。</li>
        <li><strong>为什么正向 DP 失败</strong>：走到某格时，如果之前耗血少但当前血少，和之前耗血多但当前血多，无法单向贪心比较优劣。</li>
        <li><strong>逆向 DP 破局</strong>：定义 <code>dp[i][j]</code> 为进入 <code>(i, j)</code> 所需要的<strong>最低初始生命值</strong>，彻底解耦后效性。</li>
      </ul>
    </div>
  `,
  codeLanguages: DUNGEON_GAME_CODES,
  inputs: [
    {
      id: 'dungeon',
      label: '地下城 3x3 房间数值 (格式: -2,-3,3; -5,-10,1; 10,30,-5)',
      type: 'text',
      defaultValue: '-2,-3,3; -5,-10,1; 10,30,-5',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.dungeon || '-2,-3,3; -5,-10,1; 10,30,-5');
    const grid: number[][] = raw.split(';').map(rowStr => {
      return rowStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }).filter(row => row.length > 0);
    return generateDungeonSteps(grid.length > 0 && grid[0].length > 0 ? grid : [
      [-2, -3, 3],
      [-5, -10, 1],
      [10, 30, -5]
    ]);
  },
  renderCanvas: (container, step) => {
    renderDungeonCanvas(container, step);
  },
});
