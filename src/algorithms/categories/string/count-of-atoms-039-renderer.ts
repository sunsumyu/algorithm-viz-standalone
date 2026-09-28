/**
 * Class 039: 嵌套结构递归解法母题之三：原子的数量 (Count of Atoms)
 * 左程云算法通关课入门/必备篇 Class 039 / LeetCode 726 (原子的数量)
 * 核心原语：嵌套递归通用模板——遇到 '(' 深入子过程，遇到 ')' 连同原子频次字典与最新游标返回，
 * 主过程读取外部倍数乘算合并至当前层，最后按原子字典序输出
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { renderFormulaCard } from './string-100-105/string-100-105-shared';

export interface AtomStep extends StepBase {
  formula: string;
  cursor: number;
  currentChar: string;
  depth: number;
  callStackDesc: string[];
  currentMap: Record<string, number>;
  lastAtomParsed?: string;
  lastMultiplier?: number;
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const COUNT_OF_ATOMS_CODES = {
  java: `import java.util.*;

public class CountOfAtoms {
    // 递归返回值：当前括号层级内的原子计数表 + 结束下标
    public static class Info {
        public TreeMap<String, Integer> map;
        public int stop;
        public Info(TreeMap<String, Integer> m, int s) { map = m; stop = s; }
    }

    public static String countOfAtoms(String formula) {
        Info info = process(formula.toCharArray(), 0);
        StringBuilder sb = new StringBuilder();
        for (String atom : info.map.keySet()) {
            sb.append(atom);
            int count = info.map.get(atom);
            if (count > 1) sb.append(count);
        }
        return sb.toString();
    }

    private static Info process(char[] s, int i) {
        TreeMap<String, Integer> map = new TreeMap<>();
        while (i < s.length && s[i] != ')') {
            if (s[i] == '(') {
                // 遇到 '(' 深入下一层子括号处理
                Info next = process(s, i + 1);
                i = next.stop + 1;
                // 读取括号右侧的倍数系数
                int count = 0;
                while (i < s.length && Character.isDigit(s[i])) {
                    count = count * 10 + (s[i++] - '0');
                }
                count = (count == 0) ? 1 : count;
                // 倍数合并至当前层
                for (String atom : next.map.keySet()) {
                    map.put(atom, map.getOrDefault(atom, 0) + next.map.get(atom) * count);
                }
            } else {
                // 解析单一原子名称与频次
                StringBuilder atom = new StringBuilder().append(s[i++]);
                while (i < s.length && Character.isLowerCase(s[i])) atom.append(s[i++]);
                int count = 0;
                while (i < s.length && Character.isDigit(s[i])) {
                    count = count * 10 + (s[i++] - '0');
                }
                count = (count == 0) ? 1 : count;
                map.put(atom.toString(), map.getOrDefault(atom.toString(), 0) + count);
            }
        }
        return new Info(map, i);
    }
}`,
  cpp: `#include <string>
#include <map>
#include <cctype>
using namespace std;

class Solution {
    struct Info {
        map<string, int> countMap;
        int stop;
    };

    Info process(const string& s, int i) {
        map<string, int> countMap;
        while (i < s.size() && s[i] != ')') {
            if (s[i] == '(') {
                auto next = process(s, i + 1);
                i = next.stop + 1;
                int count = 0;
                while (i < s.size() && isdigit(s[i])) count = count * 10 + (s[i++] - '0');
                count = (count == 0) ? 1 : count;
                for (auto& p : next.countMap) countMap[p.first] += p.second * count;
            } else {
                string atom = "";
                atom += s[i++];
                while (i < s.size() && islower(s[i])) atom += s[i++];
                int count = 0;
                while (i < s.size() && isdigit(s[i])) count = count * 10 + (s[i++] - '0');
                count = (count == 0) ? 1 : count;
                countMap[atom] += count;
            }
        }
        return {countMap, i};
    }
public:
    string countOfAtoms(string formula) {
        auto info = process(formula, 0);
        string res = "";
        for (auto& p : info.countMap) {
            res += p.first;
            if (p.second > 1) res += to_string(p.second);
        }
        return res;
    }
};`,
  python: `class Solution:
    def countOfAtoms(self, formula: str) -> str:
        def process(i: int):
            ans = {}
            while i < len(formula) and formula[i] != ')':
                if formula[i] == '(':
                    sub, i = process(i + 1)
                    i += 1
                    cnt = 0
                    while i < len(formula) and formula[i].isdigit():
                        cnt = cnt * 10 + int(formula[i])
                        i += 1
                    cnt = 1 if cnt == 0 else cnt
                    for atom, v in sub.items():
                        ans[atom] = ans.get(atom, 0) + v * cnt
                else:
                    atom = formula[i]
                    i += 1
                    while i < len(formula) and formula[i].islower():
                        atom += formula[i]
                        i += 1
                    cnt = 0
                    while i < len(formula) and formula[i].isdigit():
                        cnt = cnt * 10 + int(formula[i])
                        i += 1
                    cnt = 1 if cnt == 0 else cnt
                    ans[atom] = ans.get(atom, 0) + cnt
            return ans, i

        final_map, _ = process(0)
        res = []
        for atom in sorted(final_map.keys()):
            res.append(atom)
            if final_map[atom] > 1:
                res.append(str(final_map[atom]))
        return "".join(res)`,
  typescript: `function countOfAtoms(formula: string): string {
    function process(i: number): [{ [k: string]: number }, number] {
        const map: { [k: string]: number } = {};
        while (i < formula.length && formula[i] !== ')') {
            if (formula[i] === '(') {
                const [sub, stop] = process(i + 1);
                i = stop + 1;
                let count = 0;
                while (i < formula.length && /[0-9]/.test(formula[i])) {
                    count = count * 10 + Number(formula[i++]);
                }
                count = count === 0 ? 1 : count;
                for (const atom of Object.keys(sub)) {
                    map[atom] = (map[atom] || 0) + sub[atom] * count;
                }
            } else {
                let atom = formula[i++];
                while (i < formula.length && /[a-z]/.test(formula[i])) atom += formula[i++];
                let count = 0;
                while (i < formula.length && /[0-9]/.test(formula[i])) {
                    count = count * 10 + Number(formula[i++]);
                }
                count = count === 0 ? 1 : count;
                map[atom] = (map[atom] || 0) + count;
            }
        }
        return [map, i];
    }
    const [finalMap] = process(0);
    return Object.keys(finalMap).sort().map(k => k + (finalMap[k] > 1 ? finalMap[k] : '')).join('');
}`
};

export const COUNT_OF_ATOMS_CODE_LINES = {
  entry: { java: 12, cpp: 41, python: 33, typescript: 28 },
  processEntry: { java: 21, cpp: 14, python: 4, typescript: 3 },
  whileLoop: { java: 23, cpp: 16, python: 6, typescript: 5 },
  openBracket: { java: 25, cpp: 17, python: 7, typescript: 6 },
  multiplierMerge: { java: 33, cpp: 23, python: 15, typescript: 14 },
  parseAtom: { java: 38, cpp: 25, python: 18, typescript: 18 },
  returnInfo: { java: 47, cpp: 35, python: 30, typescript: 26 },
};

export function generateCountOfAtomsSteps(formula: string = 'K4(ON(SO3)2)2'): AtomStep[] {
  const steps: AtomStep[] = [];
  const lines = COUNT_OF_ATOMS_CODE_LINES;

  // Step 0: 入口帧
  steps.push({
    formula,
    cursor: 0,
    currentChar: formula[0] || '',
    depth: 0,
    callStackDesc: ['Main -> process(0)'],
    currentMap: {},
    decision: '开始执行嵌套递归原子解析',
    message: `准备解析化学分子式 "${formula}"。左程云嵌套递归模板：遇 '(' 递归深入，遇 ')' 返回当前统计字典与下标，主过程乘算合并。`,
    log: `enter countOfAtoms: formula=${formula}`,
    codeLine: lines.entry,
    metrics: { '公式长度': formula.length, '调用栈': 'process(0)' },
  });

  // 内部模拟解析生成轨迹
  function simProcess(startIdx: number, depth: number, stackHistory: string[]): [{ [k: string]: number }, number] {
    const curMap: { [k: string]: number } = {};
    let i = startIdx;

    steps.push({
      formula,
      cursor: i,
      currentChar: i < formula.length ? formula[i] : 'EOF',
      depth,
      callStackDesc: [...stackHistory],
      currentMap: { ...curMap },
      decision: `进入第 ${depth} 层嵌套过程 process(${i})`,
      message: `在当前深度初始化局部频次映射字典 TreeMap<String, Integer>`,
      log: `depth ${depth}: start at index ${i}`,
      codeLine: lines.processEntry,
      metrics: { '当前下标': i, '层级': depth },
    });

    while (i < formula.length && formula[i] !== ')') {
      if (formula[i] === '(') {
        steps.push({
          formula,
          cursor: i,
          currentChar: '(',
          depth,
          callStackDesc: [...stackHistory, `遇 '(' 递归深入`],
          currentMap: { ...curMap },
          decision: `遇 '(' 深入子过程 process(${i + 1})`,
          message: `括号开始，嵌套结构递归调用：遇到嵌套符号就交给子递归，绝不在当前层纠缠匹配！`,
          log: `depth ${depth}: encounter '(', recurse to ${i + 1}`,
          codeLine: lines.openBracket,
          statusBadge: { text: `深入层级 ${depth + 1}`, type: 'info' },
        });

        const [subMap, nextI] = simProcess(i + 1, depth + 1, [...stackHistory, `process(${i + 1})`]);
        i = nextI + 1; // 跳过 ')'

        let count = 0;
        while (i < formula.length && /[0-9]/.test(formula[i])) {
          count = count * 10 + Number(formula[i++]);
        }
        count = count === 0 ? 1 : count;

        for (const atom of Object.keys(subMap)) {
          curMap[atom] = (curMap[atom] || 0) + subMap[atom] * count;
        }

        steps.push({
          formula,
          cursor: i,
          currentChar: i < formula.length ? formula[i] : 'EOF',
          depth,
          callStackDesc: [...stackHistory],
          currentMap: { ...curMap },
          lastMultiplier: count,
          decision: `子过程返回！括号倍数为 ×${count}，批量合并原子`,
          message: `子过程返回字典 ${JSON.stringify(subMap)}，外部系数为 ${count}，合并后当前层累计：${JSON.stringify(curMap)}`,
          log: `depth ${depth}: merge subMap with mult ${count} -> ${JSON.stringify(curMap)}`,
          codeLine: lines.multiplierMerge,
          statusBadge: { text: `倍数合并 ×${count}`, type: 'success' },
          metrics: { '最新下标': i, '已统计原子数': Object.keys(curMap).length },
        });
      } else {
        let atom = formula[i++];
        while (i < formula.length && /[a-z]/.test(formula[i])) {
          atom += formula[i++];
        }
        let count = 0;
        while (i < formula.length && /[0-9]/.test(formula[i])) {
          count = count * 10 + Number(formula[i++]);
        }
        count = count === 0 ? 1 : count;
        curMap[atom] = (curMap[atom] || 0) + count;

        steps.push({
          formula,
          cursor: i,
          currentChar: i < formula.length ? formula[i] : 'EOF',
          depth,
          callStackDesc: [...stackHistory],
          currentMap: { ...curMap },
          lastAtomParsed: `${atom}${count > 1 ? count : ''}`,
          decision: `识别到原子 [${atom}]，计数值 +${count}`,
          message: `解析出基础原子名 "${atom}"，独立数量 ${count}，当前层字典原子数更新为 ${curMap[atom]}`,
          log: `depth ${depth}: parsed atom ${atom} x ${count}`,
          codeLine: lines.parseAtom,
          metrics: { '当前原子': atom, '数量': count },
        });
      }
    }

    steps.push({
      formula,
      cursor: i,
      currentChar: i < formula.length ? formula[i] : 'EOF',
      depth,
      callStackDesc: [...stackHistory],
      currentMap: { ...curMap },
      decision: `层级 ${depth} 扫描遇到 '${i < formula.length ? formula[i] : 'EOF'}'，准备弹栈返回`,
      message: `打包当前层的 TreeMap 与结束位置 ${i} 返回给调用方`,
      log: `depth ${depth}: return info with map ${JSON.stringify(curMap)}, stop at ${i}`,
      codeLine: lines.returnInfo,
      statusBadge: { text: depth === 0 ? '全局完成' : '子层弹栈', type: 'info' },
    });

    return [curMap, i];
  }

  const [finalMap] = simProcess(0, 0, ['process(0)']);

  const finalFormatted = Object.keys(finalMap)
    .sort()
    .map(k => k + (finalMap[k] > 1 ? finalMap[k] : ''))
    .join('');

  steps.push({
    formula,
    cursor: formula.length,
    currentChar: 'EOF',
    depth: 0,
    callStackDesc: ['Main -> Done'],
    currentMap: { ...finalMap },
    decision: `完成全部解析，按字典序输出最终化学分子式: ${finalFormatted}`,
    message: `TreeMap 键值自动升序排列，生成符合化学规范的标准化紧凑表达式: ${finalFormatted}`,
    log: `final formatted atoms: ${finalFormatted}`,
    codeLine: lines.entry,
    statusBadge: { text: '解析完毕', type: 'success' },
    metrics: { '最终结果': finalFormatted, '独立元素数': Object.keys(finalMap).length },
  });

  return steps;
}

export function renderCountOfAtomsCanvas(container: HTMLElement, step: AtomStep): void {
  const chars = step.formula.split('');
  const formulaChips = chars.map((ch, idx) => {
    const isCur = idx === step.cursor;
    const isPassed = idx < step.cursor;
    const bg = isCur ? '#3b82f6' : isPassed ? '#1e293b' : '#0f172a';
    const border = isCur ? '#60a5fa' : isPassed ? '#334155' : '#1e293b';
    const color = isCur ? '#ffffff' : isPassed ? '#94a3b8' : '#64748b';
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 0 2px;">
        <span style="font-size: 10px; color: ${isCur ? '#60a5fa' : '#475569'}; margin-bottom: 2px;">${idx}</span>
        <div style="width: 28px; height: 32px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; font-weight: 700; color: ${color}; font-family: monospace; font-size: 14px;">
          ${ch}
        </div>
      </div>
    `;
  }).join('');

  const atoms = Object.keys(step.currentMap).sort();
  const atomBadges = atoms.length > 0 ? atoms.map(a => `
    <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #38bdf8; border-radius: 6px; padding: 6px 12px; margin: 4px; display: flex; align-items: center; gap: 8px;">
      <span style="font-weight: 800; color: #38bdf8; font-size: 15px;">${a}</span>
      <span style="background: #0284c7; color: white; padding: 2px 6px; border-radius: 10px; font-size: 12px; font-weight: 700;">${step.currentMap[a]}</span>
    </div>
  `).join('') : '<span style="color: #64748b; font-size: 13px;">暂无原子统计</span>';

  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; display: flex; flex-direction: column; gap: 14px;">
      <!-- 分子式游标滑动视图 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
        <div style="font-size: 12px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase;">
          🧪 化学分子式扫描游标 (Cursor: ${step.cursor})
        </div>
        <div style="display: flex; overflow-x: auto; padding: 6px 0; align-items: flex-end;">
          ${formulaChips}
        </div>
      </div>

      <!-- 递归状态沙盘 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <!-- 当前递归层级与调用栈 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 700; color: #a78bfa;">🥞 嵌套递归调用栈深度: Depth ${step.depth}</span>
            <span style="font-size: 11px; background: #6d28d9; color: white; padding: 2px 6px; border-radius: 4px;">递归天然解嵌套</span>
          </div>
          <div style="font-family: monospace; font-size: 12px; color: #c4b5fd; line-height: 1.6; background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 4px;">
            ${step.callStackDesc.map((s, idx) => `<div>${idx === step.callStackDesc.length - 1 ? '👉 ' : '   '}${s}</div>`).join('')}
          </div>
        </div>

        <!-- 当前 TreeMap 原子累计 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
          <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">
            ⚛️ 当前层原子频次映射 (TreeMap&lt;Atom, Count&gt;)
          </div>
          <div style="display: flex; flex-wrap: wrap; min-height: 50px; align-items: center;">
            ${atomBadges}
          </div>
        </div>
      </div>

      <!-- 公式卡片 -->
      ${renderFormulaCard(
        '左程云嵌套递归通用三步律',
        '\\text{process}(s, i) \\longrightarrow \\big\\langle \\text{ResultMap}, \\; \\text{stopIndex} \\big\\rangle',
        '所有嵌套结构（计算器括号、字符串解码方括号、分子式圆括号）在遇到左括号时全部调用子递归 process(i + 1)；子过程在遇到对应右括号时立刻结算并把结果连同最新下标 stop 一同返回；父过程乘以外部系数合并进自己的 Map，天然利用系统调用栈处理任意深度的嵌套！'
      )}
    </div>
  `;
}

export const countOfAtoms039Visualizer = registerDeclarativeAlgorithm<AtomStep>({
  id: 'count-of-atoms-039',
  aliases: ['class039-code03', 'count-atoms', 'count-of-atoms', 'leetcode-726', 'number-of-atoms'],
  name: 'Class 039: 分子式中原子的数量 (Count of Atoms)',
  category: 'string',
  icon: '🧪',
  difficulty: 3,
  levelOrder: 726,
  learningGoal: '掌握左程云嵌套递归模板在复杂分子式括号乘算与 TreeMap 字典序合并中的通用解法',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 039 / LeetCode 726)</h3>
      <p>给定一个化学分子式，输出所有原子的数量。格式要求：原子名称后紧跟该原子的数量；如果数量为 1 则不输出数字。所有原子按照<strong>字典序升序排列</strong>。</p>
      <h4>经典嵌套用例：</h4>
      <ul>
        <li><code>H2O</code> ➔ <code>H2O</code></li>
        <li><code>Mg(OH)2</code> ➔ <code>H2MgO2</code></li>
        <li><code>K4(ON(SO3)2)2</code> ➔ <code>K4N2O14S4</code></li>
      </ul>
      <p><strong>左程云黄金套路</strong>：无论是计算器还是本题，遇到 <code>(</code> 递归深入，遇到 <code>)</code> 弹栈返回 <code>{ map, stopIndex }</code>，主过程乘算后无缝累加！</p>
    </div>
  `,
  codeLanguages: COUNT_OF_ATOMS_CODES,
  inputs: [
    {
      id: 'formula',
      label: '化学分子式',
      type: 'select',
      defaultValue: 'K4(ON(SO3)2)2',
      options: [
        { label: '多重深度嵌套: K4(ON(SO3)2)2', value: 'K4(ON(SO3)2)2' },
        { label: '简单括号: Mg(OH)2', value: 'Mg(OH)2' },
        { label: '双嵌套组合: ((N42)24(H2O)10)2', value: '((N42)24(H2O)10)2' },
      ],
    },
  ],
  generateSteps: (input) => {
    const f = String(input.formula || 'K4(ON(SO3)2)2');
    return generateCountOfAtomsSteps(f);
  },
  renderCanvas: (container, step) => {
    renderCountOfAtomsCanvas(container, step);
  },
});
