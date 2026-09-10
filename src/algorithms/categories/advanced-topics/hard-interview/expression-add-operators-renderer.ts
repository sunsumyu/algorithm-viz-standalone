/**
 * Hard 16: 表达式添加运算符 (Expression Add Operators)
 * LeetCode 282 顶级回溯搜索与乘法结合律优先级处理
 * prevNum 结合律撤销补偿技术：无需构建 AST 语法树，在 O(1) 状态参数中搞定乘法优先级
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ExpressionStep extends StepBase {
  stepIndex?: number;
  numStr: string;
  target: number;
  expr: string;
  index: number;
  currentVal: number;
  prevNum: number;
  solutions: string[];
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const EXPRESSION_ADD_CODES = {
  java: `public class ExpressionAddOperators {
    public static List<String> addOperators(String num, int target) {
        List<String> res = new ArrayList<>();
        if (num == null || num.length() == 0) return res;
        dfs(num, target, 0, 0, 0, new StringBuilder(), res);
        return res;
    }

    private static void dfs(String num, int target, int index, long eval, long multed,
                            StringBuilder path, List<String> res) {
        if (index == num.length()) {
            if (eval == target) res.add(path.toString());
            return;
        }
        int len = path.length();
        for (int i = index; i < num.length(); i++) {
            if (i != index && num.charAt(index) == '0') break; // 拒绝前导零
            long cur = Long.parseLong(num.substring(index, i + 1));
            if (index == 0) {
                dfs(num, target, i + 1, cur, cur, path.append(cur), res);
                path.setLength(len);
            } else {
                // 加法
                dfs(num, target, i + 1, eval + cur, cur, path.append('+').append(cur), res);
                path.setLength(len);
                // 减法
                dfs(num, target, i + 1, eval - cur, -cur, path.append('-').append(cur), res);
                path.setLength(len);
                // 乘法优先级核心：撤销先前累加，结合乘法 eval - multed + multed * cur
                dfs(num, target, i + 1, eval - multed + multed * cur, multed * cur,
                    path.append('*').append(cur), res);
                path.setLength(len);
            }
        }
    }
}`,
  cpp: `class ExpressionAddOperators {
public:
    static vector<string> addOperators(string num, int target) {
        vector<string> res;
        if (num.empty()) return res;
        string path;
        dfs(num, target, 0, 0, 0, path, res);
        return res;
    }

    static void dfs(const string& num, int target, int index, long long eval, long long multed,
                    string& path, vector<string>& res) {
        if (index == (int)num.size()) {
            if (eval == target) res.push_back(path);
            return;
        }
        int len = path.size();
        for (int i = index; i < (int)num.size(); ++i) {
            if (i != index && num[index] == '0') break;
            string part = num.substr(index, i - index + 1);
            long long cur = stoll(part);
            if (index == 0) {
                path += part;
                dfs(num, target, i + 1, cur, cur, path, res);
                path.resize(len);
            } else {
                path += "+" + part;
                dfs(num, target, i + 1, eval + cur, cur, path, res);
                path.resize(len);

                path += "-" + part;
                dfs(num, target, i + 1, eval - cur, -cur, path, res);
                path.resize(len);

                path += "*" + part;
                dfs(num, target, i + 1, eval - multed + multed * cur, multed * cur, path, res);
                path.resize(len);
            }
        }
    }
};`,
  python: `class ExpressionAddOperators:
    @staticmethod
    def add_operators(num: str, target: int) -> list[str]:
        res = []
        if not num: return res

        def dfs(index, eval_val, multed, path):
            if index == len(num):
                if eval_val == target:
                    res.append(path)
                return
            for i in range(index, len(num)):
                if i != index and num[index] == '0':
                    break
                part = num[index:i + 1]
                cur = int(part)
                if index == 0:
                    dfs(i + 1, cur, cur, part)
                else:
                    dfs(i + 1, eval_val + cur, cur, path + '+' + part)
                    dfs(i + 1, eval_val - cur, -cur, path + '-' + part)
                    dfs(i + 1, eval_val - multed + multed * cur, multed * cur, path + '*' + part)

        dfs(0, 0, 0, "")
        return res`,
  typescript: `export class ExpressionAddOperators {
  static addOperators(num: string, target: number): string[] {
    const res: string[] = [];
    if (!num) return res;

    const dfs = (index: number, evalVal: number, multed: number, path: string) => {
      if (index === num.length) {
        if (evalVal === target) res.push(path);
        return;
      }
      for (let i = index; i < num.length; i++) {
        if (i !== index && num[index] === '0') break;
        const part = num.slice(index, i + 1);
        const cur = Number(part);
        if (index === 0) {
          dfs(i + 1, cur, cur, part);
        } else {
          dfs(i + 1, evalVal + cur, cur, path + '+' + part);
          dfs(i + 1, evalVal - cur, -cur, path + '-' + part);
          dfs(i + 1, evalVal - multed + multed * cur, multed * cur, path + '*' + part);
        }
      }
    };

    dfs(0, 0, 0, '');
    return res;
  }
}`
};

export function generateExpressionSteps(numStr: string, target: number): ExpressionStep[] {
  const steps: ExpressionStep[] = [];
  const solutions: string[] = [];
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    numStr,
    target,
    expr: '',
    index: 0,
    currentVal: 0,
    prevNum: 0,
    solutions: [],
    decision: `开始回溯搜索：在数字串 "${numStr}" 中插入运算符，以达成目标值 ${target}`,
    message: '算法初始化',
    log: `初始化 num="${numStr}", target=${target}`,
    codeLine: 4,
    statusBadge: { text: '初始化', type: 'info' }
  });

  const dfs = (index: number, evalVal: number, multed: number, path: string) => {
    if (index === numStr.length) {
      if (evalVal === target) {
        solutions.push(path);
        steps.push({
          stepIndex: stepIdx++,
          numStr,
          target,
          expr: path,
          index,
          currentVal: evalVal,
          prevNum: multed,
          solutions: [...solutions],
          decision: `成功达成目标值！表达式 "${path} = ${evalVal}" 成立！捕获第 ${solutions.length} 个解`,
          message: `命中目标: ${path}`,
          log: `Match: ${path} = ${target}`,
          codeLine: 12,
          statusBadge: { text: `命中: ${path}`, type: 'success' }
        });
      }
      return;
    }

    for (let i = index; i < numStr.length; i++) {
      if (i !== index && numStr[index] === '0') break;
      const part = numStr.slice(index, i + 1);
      const cur = Number(part);

      if (index === 0) {
        steps.push({
          stepIndex: stepIdx++,
          numStr,
          target,
          expr: part,
          index: i + 1,
          currentVal: cur,
          prevNum: cur,
          solutions: [...solutions],
          decision: `首个操作数选取 "${part}"，当前累计值 = ${cur}`,
          message: `首项: ${part}`,
          log: `First item: ${part}`,
          codeLine: 18,
          statusBadge: { text: `首项 ${part}`, type: 'info' }
        });
        dfs(i + 1, cur, cur, part);
      } else {
        // +
        dfs(i + 1, evalVal + cur, cur, path + '+' + part);
        // -
        dfs(i + 1, evalVal - cur, -cur, path + '-' + part);
        // *
        const nextEval = evalVal - multed + multed * cur;
        steps.push({
          stepIndex: stepIdx++,
          numStr,
          target,
          expr: path + '*' + part,
          index: i + 1,
          currentVal: nextEval,
          prevNum: multed * cur,
          solutions: [...solutions],
          decision: `尝试乘法运算: "${path} * ${part}"。乘法结合律优先级处理：先撤销先前项 ${multed}，计算累加值 = ${evalVal} - ${multed} + (${multed} * ${cur}) = ${nextEval}`,
          message: `乘法结合律: ${path} * ${part}`,
          log: `Multiply: ${nextEval}`,
          codeLine: 28,
          statusBadge: { text: `乘法结合`, type: 'warning' }
        });
        dfs(i + 1, nextEval, multed * cur, path + '*' + part);
      }
    }
  };

  dfs(0, 0, 0, '');

  steps.push({
    stepIndex: stepIdx++,
    numStr,
    target,
    expr: '',
    index: numStr.length,
    currentVal: target,
    prevNum: 0,
    solutions: [...solutions],
    decision: `回溯搜索完毕！共找到 ${solutions.length} 个完全契合目标值 ${target} 的合法运算表达式：${solutions.join(', ')}`,
    message: `搜索完成，找到 ${solutions.length} 个解`,
    log: `完成，解数 ${solutions.length}`,
    codeLine: 35,
    statusBadge: { text: `完成: ${solutions.length} 个解`, type: 'success' }
  });

  return steps;
}

export function renderExpressionCanvas(container: HTMLElement, step: ExpressionStep) {
  const { numStr, target, expr, currentVal, solutions } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">输入数字串 / 目标</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            "${numStr}" ➔ ${target}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前路径计算值</div>
          <div style="font-size: 14px; font-weight: bold; color: ${currentVal === target ? '#10b981' : '#f59e0b'};">
            ${currentVal}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">已寻得解个数</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${solutions.length} 个
          </div>
        </div>
      </div>

      <!-- 当前表达式分支视图 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div style="font-size: 12px; color: #94a3b8;">当前探测表达式分支：</div>
        <div style="
          padding: 12px 24px;
          background: rgba(30, 41, 59, 0.7);
          border: 2px solid #38bdf8;
          border-radius: 8px;
          font-size: 20px;
          font-weight: bold;
          color: #f8fafc;
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.3);
        ">
          ${expr ? expr : '初始化中...'}
        </div>
      </div>

      <!-- 成功命中解列表 -->
      <div style="background: rgba(30, 41, 59, 0.4); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold;">成功解集 (Target Match):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${solutions.length > 0 ? solutions.map(sol => `
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 10px; font-size: 13px; font-weight: bold; color: #f8fafc;">
              ${sol} = ${target}
            </div>
          `).join('') : '<div style="font-size: 12px; color: #64748b;">暂未发现解</div>'}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '乘法结合律优先级与前导零控制定理',
        '遇到乘法时当前累积值为 eval - multed + multed * cur，维护上一个乘法项 multed；同时必须判定 i != index && num[index] == 0 剔除前导零',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const expressionAddOperatorsVisualizer = registerDeclarativeAlgorithm<ExpressionStep>({
  id: 'expression-add-operators',
  name: '大厂高频真题: 表达式添加运算符 (Expression Add Operators)',
  category: 'backtracking',
  icon: '🔣',
  difficulty: 3,
  levelOrder: 282,
  learningGoal: '透彻掌握回溯搜索中利用 prevNum 结合律撤销机制搞定乘法运算优先级的高阶技巧 (LeetCode 282)',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 282)</h3>
      <p>给定一个仅包含数字的字符串 <code>num</code> 和一个目标值 <code>target</code>：</p>
      <ul>
        <li>在 <code>num</code> 的数字之间添加二元运算符 <code>'+'</code>、<code>'-'</code> 或 <code>'*'</code>，返回所有能够求得目标值的表达式。</li>
        <li><strong>核心挑战</strong>：<code>*</code> 具有乘法优先结合律。例如前面算好了 <code>2 + 3 = 5</code>，后面跟上 <code>* 4</code> 时，必须把先前加上的 <code>3</code> 撤销，变为 <code>5 - 3 + (3 * 4) = 14</code>。</li>
        <li><strong>前导零约束</strong>：多位数（如 <code>"05"</code>）不合法，必须及时剪枝。</li>
      </ul>
    </div>
  `,
  codeLanguages: EXPRESSION_ADD_CODES,
  inputs: [
    {
      id: 'numStr',
      label: '输入数字串',
      type: 'text',
      defaultValue: '123',
    },
    {
      id: 'target',
      label: '目标值 (Target)',
      type: 'number',
      defaultValue: 6,
    },
  ],
  generateSteps: (input) => {
    const numStr = String(input.numStr || '123');
    const target = Number(input.target) || 6;
    return generateExpressionSteps(numStr, target);
  },
  renderCanvas: (container, step) => {
    renderExpressionCanvas(container, step);
  },
});
