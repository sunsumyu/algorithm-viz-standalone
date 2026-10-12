import { StepBase, HighlightTarget } from '../../step-visualizer';

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
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
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

export const EXPRESSION_ADD_CODE_LINES = {
  init: { java: 6, cpp: 8, python: 5, typescript: 6 },
  match: { java: 12, cpp: 14, python: 9, typescript: 8 },
  firstItem: { java: 20, cpp: 23, python: 18, typescript: 16 },
  multiply: { java: 30, cpp: 35, python: 22, typescript: 20 },
  finish: { java: 6, cpp: 8, python: 25, typescript: 26 },
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
    codeLine: EXPRESSION_ADD_CODE_LINES.init,
    statusBadge: { text: '初始化', type: 'info' },
    metrics: {
      inputTarget: `"${numStr}" ➔ ${target}`,
      currentVal: 0,
      prevNum: 0,
      solCount: '0 个',
    },
    ans: '-',
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
          codeLine: EXPRESSION_ADD_CODE_LINES.match,
          statusBadge: { text: `命中: ${path}`, type: 'success' },
          metrics: {
            inputTarget: `"${numStr}" ➔ ${target}`,
            currentVal: evalVal,
            prevNum: multed,
            solCount: `${solutions.length} 个`,
          },
          ans: `[${solutions.join(', ')}]`,
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
          codeLine: EXPRESSION_ADD_CODE_LINES.firstItem,
          statusBadge: { text: `首项 ${part}`, type: 'info' },
          metrics: {
            inputTarget: `"${numStr}" ➔ ${target}`,
            currentVal: cur,
            prevNum: cur,
            solCount: `${solutions.length} 个`,
          },
          ans: solutions.length > 0 ? `[${solutions.join(', ')}]` : '-',
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
          codeLine: EXPRESSION_ADD_CODE_LINES.multiply,
          statusBadge: { text: `乘法结合`, type: 'warning' },
          metrics: {
            inputTarget: `"${numStr}" ➔ ${target}`,
            currentVal: nextEval,
            prevNum: multed * cur,
            solCount: `${solutions.length} 个`,
          },
          ans: solutions.length > 0 ? `[${solutions.join(', ')}]` : '-',
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
    codeLine: EXPRESSION_ADD_CODE_LINES.finish,
    statusBadge: { text: `完成: ${solutions.length} 个解`, type: 'success' },
    metrics: {
      inputTarget: `"${numStr}" ➔ ${target}`,
      currentVal: target,
      prevNum: 0,
      solCount: `${solutions.length} 个`,
    },
    ans: solutions.length > 0 ? `[${solutions.join(', ')}]` : '无解',
  });

  return steps;
}
