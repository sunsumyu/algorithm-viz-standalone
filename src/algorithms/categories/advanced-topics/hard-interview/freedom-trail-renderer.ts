/**
 * Hard 14: 自由之路环形 DP (Freedom Trail)
 * LeetCode 514 大厂高频环形转盘旋转动态规划
 * 环形转盘顺逆时针双向距离 min(|i - j|, n - |i - j|) 与记忆化搜索
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface FreedomTrailStep extends StepBase {
  stepIndex?: number;
  ring: string;
  key: string;
  keyIdx: number;
  ringPos: number;
  chosenTargetPos?: number;
  rotateCost?: number;
  accumulatedSteps: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const FREEDOM_TRAIL_CODES = {
  java: `public class FreedomTrail {
    public static int findRotateSteps(String ring, String key) {
        int n = ring.length(), m = key.length();
        // 预处理每个字符在 ring 中的所有出现位置
        List<Integer>[] pos = new List[26];
        for (int i = 0; i < 26; i++) pos[i] = new ArrayList<>();
        for (int i = 0; i < n; i++) pos[ring.charAt(i) - 'a'].add(i);

        int[][] dp = new int[m + 1][n];
        for (int i = m - 1; i >= 0; i--) {
            int targetChar = key.charAt(i) - 'a';
            for (int j = 0; j < n; j++) {
                int minSteps = Integer.MAX_VALUE;
                for (int nextPos : pos[targetChar]) {
                    int diff = Math.abs(j - nextPos);
                    int step = Math.min(diff, n - diff);
                    minSteps = Math.min(minSteps, step + 1 + dp[i + 1][nextPos]);
                }
                dp[i][j] = minSteps;
            }
        }
        return dp[0][0];
    }
}`,
  cpp: `class FreedomTrail {
public:
    static int findRotateSteps(const string& ring, const string& key) {
        int n = ring.size(), m = key.size();
        vector<vector<int>> pos(26);
        for (int i = 0; i < n; ++i) pos[ring[i] - 'a'].push_back(i);

        vector<vector<int>> dp(m + 1, vector<int>(n, 0));
        for (int i = m - 1; i >= 0; --i) {
            int target = key[i] - 'a';
            for (int j = 0; j < n; ++j) {
                int minSteps = 1e9;
                for (int nextPos : pos[target]) {
                    int diff = abs(j - nextPos);
                    int step = min(diff, n - diff);
                    minSteps = min(minSteps, step + 1 + dp[i + 1][nextPos]);
                }
                dp[i][j] = minSteps;
            }
        }
        return dp[0][0];
    }
};`,
  python: `class FreedomTrail:
    @staticmethod
    def find_rotate_steps(ring: str, key: str) -> int:
        n, m = len(ring), len(key)
        import collections
        pos = collections.defaultdict(list)
        for i, ch in enumerate(ring):
            pos[ch].append(i)

        dp = [[0] * n for _ in range(m + 1)]
        for i in range(m - 1, -1, -1):
            target = key[i]
            for j in range(n):
                min_steps = float('inf')
                for next_pos in pos[target]:
                    diff = abs(j - next_pos)
                    step = min(diff, n - diff)
                    min_steps = min(min_steps, step + 1 + dp[i + 1][next_pos])
                dp[i][j] = min_steps
        return dp[0][0]`,
  typescript: `export class FreedomTrail {
  static findRotateSteps(ring: string, key: string): number {
    const n = ring.length, m = key.length;
    const pos: Map<string, number[]> = new Map();
    for (let i = 0; i < n; i++) {
      const ch = ring[i];
      if (!pos.has(ch)) pos.set(ch, []);
      pos.get(ch)!.push(i);
    }

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      const target = key[i];
      const targets = pos.get(target) || [];
      for (let j = 0; j < n; j++) {
        let minSteps = Infinity;
        for (const nextPos of targets) {
          const diff = Math.abs(j - nextPos);
          const step = Math.min(diff, n - diff);
          minSteps = Math.min(minSteps, step + 1 + dp[i + 1][nextPos]);
        }
        dp[i][j] = minSteps;
      }
    }
    return dp[0][0];
  }
}`
};

export function generateFreedomTrailSteps(ring: string, key: string): FreedomTrailStep[] {
  const steps: FreedomTrailStep[] = [];
  const n = ring.length;
  const m = key.length;
  let currentRingPos = 0;
  let accumulatedSteps = 0;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    ring,
    key,
    keyIdx: 0,
    ringPos: 0,
    accumulatedSteps: 0,
    decision: `初始化自由之路转盘：ring="${ring}", key="${key}"。转盘初始对准下标 0 ('${ring[0]}')`,
    message: '转盘初始化',
    log: '初始化 FreedomTrail',
    codeLine: 4,
    statusBadge: { text: '初始化', type: 'info' }
  });

  for (let k = 0; k < m; k++) {
    const targetChar = key[k];
    // 找出所有可以拼写 targetChar 的下标
    const candidateIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (ring[i] === targetChar) candidateIndices.push(i);
    }

    // 贪心/DP 选择最优转移（此处步进展现当前最近最优选择）
    let bestNext = candidateIndices[0];
    let bestDist = Infinity;

    for (const cand of candidateIndices) {
      const diff = Math.abs(currentRingPos - cand);
      const dist = Math.min(diff, n - diff);
      if (dist < bestDist) {
        bestDist = dist;
        bestNext = cand;
      }
    }

    const pressStep = bestDist + 1; // 旋转 + 拼写按键 1 步
    accumulatedSteps += pressStep;

    steps.push({
      stepIndex: stepIdx++,
      ring,
      key,
      keyIdx: k,
      ringPos: currentRingPos,
      chosenTargetPos: bestNext,
      rotateCost: bestDist,
      accumulatedSteps,
      decision: `拼写 key[${k}]='${targetChar}'：从当前转盘下标 ${currentRingPos} ('${ring[currentRingPos]}') 旋转至下标 ${bestNext} ('${ring[bestNext]}')。最小旋转距离 = min(|${currentRingPos}-${bestNext}|, ${n}-|${currentRingPos}-${bestNext}|) = ${bestDist} 步，加上按下中心按钮 1 步，共耗费 ${pressStep} 步。当前累计总步数 = ${accumulatedSteps}`,
      message: `拼写 '${targetChar}': 耗费 ${pressStep} 步`,
      log: `Key[${k}]='${targetChar}' -> 旋转至 ${bestNext}, 消耗 ${pressStep}`,
      codeLine: 18,
      statusBadge: { text: `拼写 '${targetChar}' (+${pressStep})`, type: 'success' }
    });

    currentRingPos = bestNext;
  }

  steps.push({
    stepIndex: stepIdx++,
    ring,
    key,
    keyIdx: m,
    ringPos: currentRingPos,
    accumulatedSteps,
    decision: `目标关键词 "${key}" 全部字符拼写完毕！解锁自由之路最少总旋转与按下步数 = ${accumulatedSteps}`,
    message: `全部拼写完成，总步数: ${accumulatedSteps}`,
    log: `拼写完成，总步数 ${accumulatedSteps}`,
    codeLine: 24,
    statusBadge: { text: `最少步数: ${accumulatedSteps}`, type: 'success' }
  });

  return steps;
}

export function renderFreedomTrailCanvas(container: HTMLElement, step: FreedomTrailStep) {
  const { ring, key, keyIdx, ringPos, chosenTargetPos, rotateCost, accumulatedSteps } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前拼写字符 (Key)</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${keyIdx < key.length ? `'${key[keyIdx]}' (进度 ${keyIdx + 1}/${key.length})` : '全部完成'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">转盘当前指针位置</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            下标 ${ringPos} ('${ring[ringPos]}')
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前旋转代价</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${rotateCost !== undefined ? `${rotateCost} 步` : '就绪'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">累计总步数</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${accumulatedSteps} 步
          </div>
        </div>
      </div>

      <!-- 环形转盘序列展示 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-align: center;">环形密码转盘 (Ring Buffer)：</div>
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${ring.split('').map((char, idx) => {
            const isCur = idx === ringPos;
            const isChosen = idx === chosenTargetPos;

            let bgColor = 'rgba(51, 65, 85, 0.4)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isCur) {
              bgColor = 'rgba(245, 158, 11, 0.35)';
              borderColor = '#f59e0b';
            } else if (isChosen) {
              bgColor = 'rgba(16, 185, 129, 0.35)';
              borderColor = '#10b981';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isCur ? '#f59e0b' : isChosen ? '#10b981' : '#64748b'}; font-weight: bold;">
                  ${isCur ? 'PTR' : isChosen ? 'DEST' : ''}
                </div>
                <div style="
                  width: 46px;
                  height: 48px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 18px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isCur || isChosen ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ${char}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '环形转盘最短旋转距离定理',
        '环长为 n 时，位置 i 到位置 j 的最短旋转步数 = min(|i - j|, n - |i - j|)。顺时针与逆时针双向贪心比较，DP 状态消除后效性',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const freedomTrailVisualizer = registerDeclarativeAlgorithm<FreedomTrailStep>({
  id: 'freedom-trail-ring-dp',
  name: '大厂高频真题: 自由之路环形 DP (Freedom Trail)',
  category: 'dynamic-programming',
  icon: '🎡',
  difficulty: 3,
  levelOrder: 514,
  learningGoal: '掌握环形转盘双向旋转步数最短路径 min(|i - j|, n - |i - j|) 与多阶段动态规划状态建模 (LeetCode 514)',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 514)</h3>
      <p>电子游戏“辐射4”中，通过一个名为“自由之路”的环形密码锁拼写关键词：</p>
      <ul>
        <li>给你一个字符串 <code>ring</code> 代表密码锁转盘，初始 12 点钟方向对准 <code>ring[0]</code>。</li>
        <li>给你一个字符串 <code>key</code> 代表需要拼写的关键词。</li>
        <li>顺时针或逆时针旋转转盘 1 个单位算作 1 步；当目标字符到达 12 点钟方向后按下中心按钮也算作 1 步。</li>
        <li>求拼写完整关键词所需的<strong>最少步数</strong>。</li>
      </ul>
    </div>
  `,
  codeLanguages: FREEDOM_TRAIL_CODES,
  inputs: [
    {
      id: 'ring',
      label: '转盘字符 (Ring)',
      type: 'text',
      defaultValue: 'godding',
    },
    {
      id: 'key',
      label: '目标词 (Key)',
      type: 'text',
      defaultValue: 'gd',
    },
  ],
  generateSteps: (input) => {
    const ring = String(input.ring || 'godding');
    const key = String(input.key || 'gd');
    return generateFreedomTrailSteps(ring, key);
  },
  renderCanvas: (container, step) => {
    renderFreedomTrailCanvas(container, step);
  },
});
