/**
 * 稳定婚姻问题与 Gale-Shapley 延迟接受算法 (Stable Marriage Problem)
 * 经典博弈图论匹配: 诺贝尔奖机制设计、男士求婚女士抉择、延迟接受与 O(n^2) 强稳定匹配
 */

export const STABLE_MARRIAGE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 稳定婚姻问题 (Gale-Shapley 延迟接受算法)',
    '// 核心：男士按偏好向女士求婚，女士择优延迟接受，证明必定收敛于稳定匹配',
    'class GaleShapley {',
    'public:',
    '    int n;',
    '    vector<vector<int>> menPref;   // menPref[m][k]: 男士 m 第 k 喜欢的女士',
    '    vector<vector<int>> womenRank; // womenRank[w][m]: 女士 w 对男士 m 的排名 (值越小越喜欢)',
    '    vector<int> husband;           // husband[w]: 女士 w 当前的未婚夫',
    '    vector<int> wife;              // wife[m]: 男士 m 当前的未婚妻',
    '    vector<int> nextPropose;       // nextPropose[m]: 男士 m 下一个要求婚的偏好索引',
    '    ',
    '    GaleShapley(int n, vector<vector<int>>& mPref, vector<vector<int>>& wPref) : n(n), menPref(mPref) {',
    '        womenRank.assign(n + 1, vector<int>(n + 1, 0));',
    '        for (int w = 1; w <= n; ++w) {',
    '            for (int rank = 0; rank < n; ++rank) {',
    '                int m = wPref[w][rank];',
    '                womenRank[w][m] = rank; // 建立 O(1) 排名查表',
    '            }',
    '        }',
    '        husband.assign(n + 1, 0);',
    '        wife.assign(n + 1, 0);',
    '        nextPropose.assign(n + 1, 0);',
    '    }',
    '    ',
    '    void solve() {',
    '        queue<int> freeMen;',
    '        for (int m = 1; m <= n; ++m) freeMen.push(m);',
    '        ',
    '        while (!freeMen.empty()) {',
    '            int m = freeMen.front();',
    '            freeMen.pop();',
    '            ',
    '            int w = menPref[m][nextPropose[m]++];',
    '            if (husband[w] == 0) { // 女士当前单身',
    '                husband[w] = m;',
    '                wife[m] = w;',
    '            } else {',
    '                int currentHusband = husband[w];',
    '                if (womenRank[w][m] < womenRank[w][currentHusband]) {',
    '                    // 女士移情别恋新追求者 m',
    '                    husband[w] = m;',
    '                    wife[m] = w;',
    '                    wife[currentHusband] = 0;',
    '                    freeMen.push(currentHusband); // 前未婚夫恢复单身',
    '                } else {',
    '                    // 女士拒绝 m',
    '                    freeMen.push(m);',
    '                }',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package class079;',
    '',
    'import java.util.*;',
    '',
    '// 稳定婚姻 Gale-Shapley 算法标准实现',
    'public class Code01_GaleShapley {',
    '    public static int n;',
    '    public static int[][] menPref;',
    '    public static int[][] womenRank;',
    '    public static int[] husband, wife, nextPropose;',
    '    ',
    '    public static void solve() {',
    '        Queue<Integer> freeMen = new LinkedList<>();',
    '        for (int i = 1; i <= n; i++) freeMen.offer(i);',
    '        ',
    '        while (!freeMen.isEmpty()) {',
    '            int m = freeMen.poll();',
    '            int w = menPref[m][nextPropose[m]++];',
    '            if (husband[w] == 0) {',
    '                husband[w] = m;',
    '                wife[m] = w;',
    '            } else {',
    '                int cur = husband[w];',
    '                if (womenRank[w][m] < womenRank[w][cur]) {',
    '                    husband[w] = m;',
    '                    wife[m] = w;',
    '                    wife[cur] = 0;',
    '                    freeMen.offer(cur);',
    '                } else {',
    '                    freeMen.offer(m);',
    '                }',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class GaleShapley:',
    '    def __init__(self, n: int, men_pref: list[list[int]], women_pref: list[list[int]]):',
    '        self.n = n',
    '        self.men_pref = men_pref',
    '        self.women_rank = [[0] * (n + 1) for _ in range(n + 1)]',
    '        for w in range(1, n + 1):',
    '            for rank, m in enumerate(women_pref[w]):',
    '                self.women_rank[w][m] = rank',
    '        self.husband = [0] * (n + 1)',
    '        self.wife = [0] * (n + 1)',
    '        self.next_propose = [0] * (n + 1)',
    '        ',
    '    def solve(self):',
    '        free_men = list(range(1, self.n + 1))',
    '        while free_men:',
    '            m = free_men.pop(0)',
    '            w = self.men_pref[m][self.next_propose[m]]',
    '            self.next_propose[m] += 1',
    '            ',
    '            if self.husband[w] == 0:',
    '                self.husband[w] = m',
    '                self.wife[m] = w',
    '            else:',
    '                cur = self.husband[w]',
    '                if self.women_rank[w][m] < self.women_rank[w][cur]:',
    '                    self.husband[w] = m',
    '                    self.wife[m] = w',
    '                    self.wife[cur] = 0',
    '                    free_men.append(cur)',
    '                else:',
    '                    free_men.append(m)',
  ],
  javascript: [
    '// 稳定婚姻问题 (JavaScript 版)',
    'class GaleShapley {',
    '  constructor(n, menPref, womenPref) {',
    '    this.n = n;',
    '    this.menPref = menPref;',
    '    this.womenRank = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));',
    '    for (let w = 1; w <= n; w++) {',
    '      womenPref[w].forEach((m, rank) => {',
    '        this.womenRank[w][m] = rank;',
    '      });',
    '    }',
    '    this.husband = Array(n + 1).fill(0);',
    '    this.wife = Array(n + 1).fill(0);',
    '    this.nextPropose = Array(n + 1).fill(0);',
    '  }',
    '}',
  ],
};

export const STABLE_MARRIAGE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💍 稳定婚姻问题 (Stable Marriage Problem)</h3>
    <p>
      有 $n$ 名男士和 $n$ 名女士，每个人都对异性有一个从最喜欢到最不喜欢的<b>严格偏好排行榜</b>。
    </p>
    <p>
      <b>不稳定阻碍对 (Blocking Pair)</b>：若存在男士 $M$ 与女士 $W$，他们各自比起自己当前的配偶更喜欢对方，则这段婚姻存在破裂风险！
    </p>
    <p>
      求一种一一对应的<b>稳定匹配方案</b>，使得不存在任何不稳定阻碍对（2012 年诺贝尔经济学奖机制设计理论）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">💌 延迟接受算法 (Gale-Shapley)</div>
      <div style="font-size: 11.5px; color: #334155;">
        男士按偏好向心仪女士依次求婚；女士<b>延迟接受</b>（始终保留当前遇到的最好人选，遇到更好的立即移情别恋）。算法在最多 $O(n^2)$ 步内必收敛，且对<b>提议方（男士）全局最优</b>！
      </div>
    </div>
  </div>
`;

export const STABLE_MARRIAGE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 Gale-Shapley 算法数学证明与工程应用</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 单调性与无死循环证明</div>
      <div style="font-size: 12px; color: #1e40af;">
        男士每次求婚的女士排名单调递减（从最喜欢向下尝试）；女士持有的未婚夫排名单调递增（只会越来越好，绝不单身）。总求婚次数不超过 $n^2$，必定终止！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 现实世界的顶级机制</div>
      <div style="font-size: 12px; color: #15803d;">
        该算法广泛应用于<b>高考志愿平行录取匹配</b>、<b>美国住院医师规培匹配 (NRMP)</b>、波士顿公立学校选校系统等千万级真实运筹分配场景！
      </div>
    </div>
  </div>
`;
