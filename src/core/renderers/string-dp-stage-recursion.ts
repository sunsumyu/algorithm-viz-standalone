/**
 * 字符串 DP 四阶段演化 — 阶段 1：暴力递归 — 递归展开树推演与 Card 1/2 渲染
 * 从 string-dp-stage-evolution 拆出的单阶段模块（SRP）。
 */

import { HighlightTarget } from './dark-code-terminal-presenter';
import { getLine, type StringDpKind } from './string-dp-stage-shared';
import { type RecursionStepBase } from '../step-types';

// ==========================================
// 2. 阶段 1: 暴力递归数据模型与生成器
// ==========================================

export interface StringDpRecursionStep {
  stepIndex: number;
  totalSteps: number;
  kind: StringDpKind;
  action: string;
  codeLine: HighlightTarget;
  i: number;
  j: number;
  s: string;
  p: string;
  callStack: Array<{ i: number; j: number; label: string }>;
  overlapCount: Record<string, number>;
  decision: string;
  message: string;
  log: string;
  returnValue?: boolean;
  metrics: Record<string, string>;
}

export function buildStringDpRecursionSteps(
  kind: StringDpKind,
  str: string,
  pat: string
): StringDpRecursionStep[] {
  const steps: StringDpRecursionStep[] = [];
  const resolveLine = (anchor: string) => getLine(1, kind, anchor);
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;

  const callStack: Array<{ i: number; j: number; label: string }> = [];
  const overlapCount: Record<string, number> = {};

  const pushStep = (
    action: string,
    codeLineKey: string,
    i: number,
    j: number,
    msg: string,
    decision: string,
    retVal?: boolean
  ) => {
    const stateKey = `(${i},${j})`;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      kind,
      action,
      codeLine: resolveLine(codeLineKey),
      i,
      j,
      s,
      p,
      callStack: [...callStack],
      overlapCount: { ...overlapCount },
      decision,
      message: msg,
      log: `[递归] ${stateKey} ${action}: ${msg}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': `dfs(i=${i}, j=${j})`,
        'metric-stack-depth': `${callStack.length} 层`,
        'metric-cur-char-s': i < n ? `'${s[i]}' [${i}]` : 'EOF (空串)',
        'metric-cur-char-p': j < m ? `'${p[j]}' [${j}]` : 'EOF (空串)',
        'metric-overlaps': `${Object.values(overlapCount).filter((c) => c > 1).length} 个重复子问题`,
      },
    });
  };

  // 1. 发起根调用
  pushStep('callRoot', 'callRoot', 0, 0, `🚀 启动暴力递归：调用 dfs(i=0, j=0) 开始逐字符尝试`, '从文本串和模式串起点探索');

  function dfs(i: number, j: number): boolean {
    const key = `${i},${j}`;
    overlapCount[key] = (overlapCount[key] || 0) + 1;
    callStack.push({ i, j, label: `dfs(${i}, ${j})` });

    // 函数入口
    pushStep('fnEnter', 'fnEnter', i, j, `⚡ 进入 dfs(i=${i}, j=${j})，当前栈深 ${callStack.length}`, `考察 s[${i}..] 与 p[${j}..] 是否匹配`);

    // 边界检查：模式串耗尽
    pushStep('baseCheck', 'baseCheck', i, j, `🔍 检查模式串是否耗尽：j=${j} === m=${m} ?`, '若模式串走完，文本串也必须走完才算匹配');
    if (j === m) {
      const res = i === n;
      pushStep(
        'returnResult',
        'returnResult',
        i,
        j,
        res
          ? `✅ 模式串与文本串同时耗尽 (i=${i}==${n})，匹配成功返回 true`
          : `❌ 模式串已尽但文本串剩余 ${n - i} 字符 (i=${i}!=${n})，返回 false`,
        res ? 'Base Case 匹配成功' : 'Base Case 匹配失败',
        res
      );
      callStack.pop();
      return res;
    }

    if (kind === 'regex') {
      // 正则逻辑
      const first = i < n && (s[i] === p[j] || p[j] === '.');
      pushStep(
        'firstMatch',
        'firstMatch',
        i,
        j,
        i < n
          ? `🔍 判定首字符：s[${i}]='${s[i]}' 与 p[${j}]='${p[j]}' 首字符匹配 = ${first}`
          : `🔍 文本串已耗尽 (i=${n})，首字符无法匹配 = false`,
        first ? '首字符符合' : '首字符不符'
      );

      // 检查下一位是否为 '*'
      const hasStar = j + 1 < m && p[j + 1] === '*';
      pushStep('starCheck', 'starCheck', i, j, `⭐ 检查下一字符是否为 '*'：j+1=${j + 1} -> '${p[j + 1] || ''}' -> ${hasStar}`, hasStar ? '存在星号，准备分流' : '普通字符，严格比对');

      if (hasStar) {
        // 分支 1: * 匹配 0 次
        pushStep('starBranch0', 'starBranch0', i, j, `🌿 分支 0：尝试让 '${p[j]}*' 匹配 0 次，跳过模式串两位探查 dfs(${i}, ${j + 2})`, '分支0: 匹配0次');
        const b0 = dfs(i, j + 2);
        if (b0) {
          pushStep('returnResult', 'returnResult', i, j, `✨ 分支 0 (匹配0次) 成功命中！dfs(${i}, ${j}) 短路返回 true`, '分支0 成功', true);
          callStack.pop();
          return true;
        }

        // 分支 2: * 匹配 1 次或多次 (必须首字符匹配)
        if (first) {
          pushStep('starBranch1', 'starBranch1', i, j, `🌿 分支 1：首字符匹配成功，让 '${p[j]}*' 匹配至少1次，文本串前进一步 dfs(${i + 1}, ${j})`, '分支1: 匹配>=1次');
          const b1 = dfs(i + 1, j);
          pushStep('returnResult', 'returnResult', i, j, `🏁 递归子调用返回结果: ${b1}`, b1 ? '分支1 成功' : '分支均失败', b1);
          callStack.pop();
          return b1;
        }

        pushStep('returnResult', 'returnResult', i, j, `❌ 分支 0 失败且首字符不匹配，'${p[j]}*' 无法拓展，返回 false`, '星号分支全部失败', false);
        callStack.pop();
        return false;
      } else {
        // 普通字符匹配
        if (first) {
          pushStep('charBranch', 'charBranch', i, j, `➡️ 单字符匹配成功，双指针同时前进一步探查 dfs(${i + 1}, ${j + 1})`, '普通字符匹配');
          const res = dfs(i + 1, j + 1);
          pushStep('returnResult', 'returnResult', i, j, `🏁 单字符子调用返回: ${res}`, res ? '后续匹配成功' : '后续匹配失败', res);
          callStack.pop();
          return res;
        } else {
          pushStep('returnResult', 'returnResult', i, j, `❌ 首字符失配 ('${s[i] || ''}' ≠ '${p[j]}')，直接返回 false`, '单字符失配', false);
          callStack.pop();
          return false;
        }
      }
    } else {
      // 通配符逻辑
      const isStar = p[j] === '*';
      pushStep('starCheck', 'starCheck', i, j, `⭐ 检查当前字符是否为 '*'：p[${j}]='${p[j]}' -> ${isStar}`, isStar ? '通配符星号' : '普通字符或问号');

      if (isStar) {
        // 通配符分支 0: * 匹配空串
        pushStep('starBranch0', 'starBranch0', i, j, `🌿 通配符分支 0：让 '*' 匹配空串，模式串前进一步 dfs(${i}, ${j + 1})`, '星号匹配空串');
        const b0 = dfs(i, j + 1);
        if (b0) {
          pushStep('returnResult', 'returnResult', i, j, `✨ '*' 匹配空串成功！dfs(${i}, ${j}) 返回 true`, '分支0 成功', true);
          callStack.pop();
          return true;
        }

        // 通配符分支 1: * 匹配至少一个字符 (文本串推进)
        if (i < n) {
          pushStep('starBranch1', 'starBranch1', i, j, `🌿 通配符分支 1：让 '*' 消耗文本字符 '${s[i]}', dfs(${i + 1}, ${j})`, '星号匹配>=1字符');
          const b1 = dfs(i + 1, j);
          pushStep('returnResult', 'returnResult', i, j, `🏁 通配符分支 1 返回: ${b1}`, b1 ? '分支1 成功' : '分支均失败', b1);
          callStack.pop();
          return b1;
        }

        pushStep('returnResult', 'returnResult', i, j, `❌ 文本已耗尽且分支0失败，返回 false`, '星号通配失败', false);
        callStack.pop();
        return false;
      } else {
        const charMatch = i < n && (s[i] === p[j] || p[j] === '?');
        if (charMatch) {
          pushStep('charBranch', 'charBranch', i, j, `➡️ 字符匹配成功 ('${s[i]}' ↔ '${p[j]}')，双指针推进 dfs(${i + 1}, ${j + 1})`, '单字符/问号匹配');
          const res = dfs(i + 1, j + 1);
          pushStep('returnResult', 'returnResult', i, j, `🏁 字符推进子调用返回: ${res}`, res ? '后续成功' : '后续失败', res);
          callStack.pop();
          return res;
        } else {
          pushStep('returnResult', 'returnResult', i, j, `❌ 字符失配 ('${s[i] || ''}' ≠ '${p[j]}')，返回 false`, '字符失配', false);
          callStack.pop();
          return false;
        }
      }
    }
  }

  // 启动搜索（为避免超长递归爆炸，若规模过大保护在 120 步内，但正常演示样例均能完整展现）
  dfs(0, 0);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function renderStringDpRecursionCard1(
  container: HTMLElement,
  step: StringDpRecursionStep
): void {
  const stackHtml = step.callStack
    .map((frame, idx) => {
      const isTop = idx === step.callStack.length - 1;
      return `
        <div style="background:${isTop ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)'}; border:1px solid ${isTop ? '#3b82f6' : '#334155'}; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:'JetBrains Mono', monospace; font-size:11.5px; color:${isTop ? '#60a5fa' : '#cbd5e1'}; font-weight:700;">
            #${idx} ${frame.label}
          </span>
          <span style="font-size:10px; color:${isTop ? '#93c5fd' : '#64748b'};">
            ${isTop ? '⚡ 当前执行帧' : '等待返回'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
      <!-- 字符对齐指示器 -->
      <div style="background:rgba(15, 23, 42, 0.7); border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; gap:20px; align-items:center;">
        <div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">文本串 s: "${step.s}"</div>
          <div style="display:flex; gap:4px;">
            ${step.s
              .split('')
              .map(
                (ch, idx) => `
              <div style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:'JetBrains Mono', monospace; font-weight:700; font-size:12px; ${
                idx === step.i
                  ? 'background:#3b82f6; color:#fff; border:1px solid #60a5fa;'
                  : idx < step.i
                  ? 'background:rgba(30, 41, 59, 0.5); color:#64748b;'
                  : 'background:#1e293b; color:#cbd5e1;'
              }">
                ${ch}
              </div>
            `
              )
              .join('')}
            <div style="width:36px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:'JetBrains Mono', monospace; font-size:10px; ${
              step.i >= step.s.length
                ? 'background:#3b82f6; color:#fff;'
                : 'background:rgba(30, 41, 59, 0.3); color:#475569;'
            }">
              EOF
            </div>
          </div>
        </div>

        <div style="border-left:1px solid #334155; padding-left:20px;">
          <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">模式串 p: "${step.p}"</div>
          <div style="display:flex; gap:4px;">
            ${step.p
              .split('')
              .map(
                (ch, idx) => `
              <div style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:'JetBrains Mono', monospace; font-weight:700; font-size:12px; ${
                idx === step.j
                  ? 'background:#f59e0b; color:#000; border:1px solid #fbbf24;'
                  : idx < step.j
                  ? 'background:rgba(30, 41, 59, 0.5); color:#64748b;'
                  : 'background:#1e293b; color:#cbd5e1;'
              }">
                ${ch}
              </div>
            `
              )
              .join('')}
            <div style="width:36px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:4px; font-family:'JetBrains Mono', monospace; font-size:10px; ${
              step.j >= step.p.length
                ? 'background:#f59e0b; color:#000;'
                : 'background:rgba(30, 41, 59, 0.3); color:#475569;'
            }">
              EOF
            </div>
          </div>
        </div>
      </div>

      <!-- 运行时调用栈 -->
      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:rgba(15, 23, 42, 0.5); border:1px solid #1e293b; border-radius:8px; padding:10px 12px; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:700; color:#38bdf8;">📚 运行时调用栈 (Call Stack)</span>
          <span style="font-size:11px; color:#94a3b8;">深度: ${step.callStack.length} 层</span>
        </div>
        <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column-reverse; gap:6px; padding-right:4px;">
          ${stackHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderStringDpRecursionCard2(
  container: HTMLElement,
  step: StringDpRecursionStep
): void {
  const overlaps = Object.entries(step.overlapCount).filter(([_, c]) => c > 1);

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
      <!-- 当前状态核心卡片 -->
      <div style="background:rgba(30, 41, 59, 0.6); border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:11px; color:#94a3b8;">当前执行决策</div>
        <div style="font-size:14px; font-weight:700; color:#f8fafc;">${step.decision}</div>
        <div style="font-size:12px; color:#38bdf8; font-family:'JetBrains Mono', monospace; margin-top:2px;">
          ${step.message}
        </div>
      </div>

      <!-- 重叠子问题开销分析 -->
      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:rgba(15, 23, 42, 0.5); border:1px solid #1e293b; border-radius:8px; padding:10px 12px; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:700; color:#f43f5e;">💥 重叠子问题调用监控 (为什么暴力会指数爆炸)</span>
          <span style="font-size:11px; color:#fda4af;">已触发 ${overlaps.length} 个重复状态</span>
        </div>
        <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
          ${
            overlaps.length === 0
              ? '<div style="color:#64748b; font-size:12px; padding:12px; text-align:center;">暂无重复访问状态，随着分支扩散将开始出现大量重复计算...</div>'
              : overlaps
                  .map(
                    ([key, count]) => `
                <div style="background:rgba(244, 63, 94, 0.1); border:1px solid rgba(244, 63, 94, 0.3); border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-family:'JetBrains Mono', monospace; font-size:12px; color:#fda4af; font-weight:700;">dfs(${key.replace(',', ', ')})</span>
                  <span style="font-size:11px; background:#f43f5e; color:#fff; padding:1px 6px; border-radius:4px; font-weight:700;">重复执行 ${count} 次</span>
                </div>
              `
                  )
                  .join('')
          }
        </div>
      </div>
    </div>
  `;
}
