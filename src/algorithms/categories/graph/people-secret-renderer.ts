/**
 * 找出知晓秘密的所有专家 (Find All People With Secret - LeetCode 2092) 声明式可视化器
 * 核心：按时间分组、同一时间步瞬时连通合并、未连接到 0 号已知密者的撤销重置 (father[u] = u)
 * 架构重构：引入四语言代码高亮映射字典、双层社交网络与时间切片扩散舱沙盘、并查集状态监视器
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PEOPLE_SECRET_CODE_LANGUAGES,
  PEOPLE_SECRET_PROBLEM_HTML,
  PEOPLE_SECRET_ANALYSIS_HTML,
} from './people-secret-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface SecretExpertStep {
  n: number;
  curTime: number;
  knownExperts: number[];
  activeMeeting: [number, number, number] | null;
  father: number[];
  resetNodes: number[];
  activeArray?: 'father' | 'known';
  activeSlot?: number;
  status: 'init' | 'batch_merge' | 'cascade' | 'rollback' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildSecretExpertSteps(preset: string = 'classic_6expert'): SecretExpertStep[] {
  const steps: SecretExpertStep[] = [];
  const isMultiTime = preset === 'multitime_5expert';

  const n = isMultiTime ? 5 : 6;
  const firstPerson = 1;
  const rawMeetings: Array<[number, number, number]> = isMultiTime
    ? [
        [1, 2, 2],
        [2, 3, 3],
        [3, 4, 4],
      ]
    : [
        [4, 5, 2],
        [1, 2, 5],
        [2, 3, 5],
        [4, 5, 5],
      ];

  const father: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) father[i] = i;

  function find(i: number): number {
    if (father[i] !== i) father[i] = find(father[i]);
    return father[i];
  }

  function union(x: number, y: number): void {
    const fx = find(x);
    const fy = find(y);
    if (fx !== fy) father[fx] = fy;
  }

  function getKnown(): number[] {
    const root0 = find(0);
    const res: number[] = [];
    for (let i = 0; i < n; i++) {
      if (find(i) === root0) res.push(i);
    }
    return res;
  }

  let curTime = 0;
  let activeMeeting: [number, number, number] | null = null;
  let resetNodes: number[] = [];

  const lines = {
    init: { cpp: 9, java: 19, python: 3, javascript: 2 },
    initFather: { cpp: 15, java: 21, python: 4, javascript: 3 },
    unionFirst: { cpp: 27, java: 22, python: 17, javascript: 15 },
    sort: { cpp: 10, java: 24, python: 4, javascript: 3 },
    timeBatch: { cpp: 30, java: 27, python: 22, javascript: 21 },
    merge: { cpp: 35, java: 31, python: 26, javascript: 24 },
    rollback: { cpp: 41, java: 36, python: 30, javascript: 28 },
    done: { cpp: 48, java: 43, python: 36, javascript: 34 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'batch_merge' | 'cascade' | 'rollback' | 'done',
    activeArray?: 'father' | 'known',
    activeSlot?: number
  ): void {
    const known = getKnown();
    const timeStr = curTime === 0 ? '时刻 0 (初始化)' : `时刻 t = ${curTime}`;
    const knownStr = `${known.length} 人 (${known.map((x) => `E${x}`).join(',')})`;
    const meetingStr =
      activeMeeting !== null
        ? `[E${activeMeeting[0]}, E${activeMeeting[1]}, t=${activeMeeting[2]}]`
        : '无活跃会议';

    const phaseStr =
      status === 'done'
        ? '知密全员锁定'
        : status === 'rollback'
          ? '无效连通撤销重置'
          : status === 'cascade'
            ? '秘密同批瞬时扩散'
            : status === 'batch_merge'
              ? '同时间会议连通'
              : '算法初始化';

    steps.push({
      n,
      curTime,
      knownExperts: [...known],
      activeMeeting: activeMeeting ? [...activeMeeting] : null,
      father: [...father],
      resetNodes: [...resetNodes],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-secret-time': timeStr,
        'metric-known-count': knownStr,
        'metric-cur-meeting': meetingStr,
        'metric-secret-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.init, `🚀 [算法初始化] 建立包含 ${n} 名专家的系统，0 号专家初始掌握秘密，先与专家 ${firstPerson} 共享。`, 'findAllPeople 入口', 'init');

  for (let i = 0; i < n; i++) {
    makeStep(lines.initFather, `📌 [并查集初始化] father[${i}] = ${i}。`, `father[${i}]=${i}`, 'init', 'father', i);
  }

  // 初始分享
  union(0, firstPerson);
  makeStep(lines.unionFirst, `🤝 [初始分享] 0 号与专家 ${firstPerson} 连通共享秘密！`, `union(0, ${firstPerson})`, 'init', 'known', firstPerson);

  // 会议按时间排序
  const meetings = rawMeetings.map(([u, v, t]) => [u, v, t] as [number, number, number]);
  meetings.sort((a, b) => a[2] - b[2]);
  makeStep(lines.sort, '⏱️ [会议按时刻升序排序] 确保秘密传播严格遵循时间因果律，无法向过去时刻倒流。', '排序会议列表', 'init');

  // 2. 按相同时间戳分批处理
  const m = meetings.length;
  for (let l = 0, r = 0; l < m; l = r) {
    makeStep(lines.timeBatch, `🔁 [外层时间窗口循环] for (int l = ${l}, r = ${r}; l < ${m}; l = r)。`, `for l=${l}`, 'batch_merge');

    while (r < m && meetings[r][2] === meetings[l][2]) {
      makeStep(lines.timeBatch, `  ↳ [扩展同批次会议] while (meetings[${r}][2] == ${meetings[l][2]}) -> 纳入会议 #${r} (t=${meetings[r][2]})。`, `while r=${r}`, 'batch_merge');
      r++;
    }

    curTime = meetings[l][2];
    resetNodes = [];
    makeStep(lines.timeBatch, `📅 [推进至时刻 t=${curTime}] 本时间切片包含 [${l}..${r - 1}] 共 ${r - l} 场并发会议。`, `时刻 t=${curTime}`, 'batch_merge');

    // 阶段 1: 同批次会议全部合并
    for (let i = l; i < r; i++) {
      makeStep(lines.merge, `  🔁 [同批合并循环] for (int i = ${i}; i < ${r}; i++)。`, `for i=${i}`, 'cascade');
      const [u, v, t] = meetings[i];
      activeMeeting = [u, v, t];
      union(u, v);
      makeStep(lines.merge, `  🔗 [会议瞬时连通] union(${u}, ${v})：专家 E${u} 与 E${v} 在时刻 ${t} 会晤，并查集临时合并两者所在的连通块！`, `union(${u}, ${v})`, 'cascade', 'father', find(u));
    }

    // 阶段 2: 检查连通性，若未能连接到 0 号未知密，撤销重置
    for (let i = l; i < r; i++) {
      makeStep(lines.rollback, `  🔁 [连通有效性检验循环] for (int i = ${i}; i < ${r}; i++)。`, `for i=${i}`, 'rollback');
      const u = meetings[i][0];
      const v = meetings[i][1];

      const uKnown = find(u) === find(0);
      makeStep(lines.rollback, `  🔎 [核验专家 E${u} 密源连通] if (find(${u}) != find(0)) -> (${find(u)} != ${find(0)}: ${!uKnown})。`, `check find(${u})`, 'rollback');
      if (!uKnown) {
        father[u] = u;
        resetNodes.push(u);
        makeStep(lines.rollback, `  ⏪ [无效接触撤销重置] 专家 E${u} 未能连通至 0 号源头！撤销合并，重置 father[${u}] = ${u}！`, `reset father[${u}]=${u}`, 'rollback', 'father', u);
      }

      const vKnown = find(v) === find(0);
      makeStep(lines.rollback, `  🔎 [核验专家 E${v} 密源连通] if (find(${v}) != find(0)) -> (${find(v)} != ${find(0)}: ${!vKnown})。`, `check find(${v})`, 'rollback');
      if (!vKnown) {
        father[v] = v;
        resetNodes.push(v);
        makeStep(lines.rollback, `  ⏪ [无效接触撤销重置] 专家 E${v} 未能连通至 0 号源头！撤销合并，重置 father[${v}] = ${v}！`, `reset father[${v}]=${v}`, 'rollback', 'father', v);
      }
    }
  }

  // 3. 终态收集
  activeMeeting = null;
  resetNodes = [];
  makeStep(lines.done, '📊 [统计知密名单] List<Integer> ans = new ArrayList<>()；遍历全员 0..n-1 收集结果。', 'ans = new ArrayList()', 'done');

  for (let i = 0; i < n; i++) {
    makeStep(lines.done, `🔄 [结果检验循环] for (int i = ${i}; i < ${n}; i++)。`, `for i=${i}`, 'done');
    const isKnown = find(i) === find(0);
    makeStep(lines.done, `🔎 [知密判定] if (find(${i}) == find(0)) -> (${find(i)} == ${find(0)}: ${isKnown})。`, `check E${i}`, 'done');
    if (isKnown) {
      makeStep(lines.done, `✨ [收集知密专家] ans.add(${i})：确认专家 E${i} 掌握秘密！`, `ans.add(${i})`, 'done', 'known', i);
    }
  }

  makeStep(lines.done, `🎉 [返回知密名单] return ans: [${getKnown().map((x) => `E${x}`).join(', ')}]！并查集时序切片算法圆满结束！`, 'return ans', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SecretExpertStep>({
  id: 'people-secret',
  name: '找出知晓秘密的所有专家 (Find All People With Secret)',
  viewId: 'algo-people-secret-view',
  category: 'graph',
  icon: '🤫',
  badge: {
    mode: '时间切片 + 并查集瞬时合并与连通撤销',
    complexity: 'O(M log M + (N + M) α(N)) · O(N + M)',
  },
  card1Title: '🤫 专家社交网络与时序扩散撤销舱',
  card2Title: '📊 秘密状态监视器 (father, 当前已知专家, 撤销节点)',
  card2Desc: '展示按时间步分组 meetings、同批瞬时级联 union 与未连通 0 号节点撤销重置过程',
  legend: [
    { label: '🤫 知晓秘密专家 (与 0 连通)', color: '#10b981' },
    { label: '⚪ 未知秘密专家', color: '#1e293b' },
    { label: '⚡ 当前正在开会', color: '#f59e0b' },
    { label: '⏪ 撤销重置节点', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设专家会议记录',
      type: 'select',
      defaultValue: 'classic_6expert',
      options: [
        { label: '6 专家含无效开会撤销 (最终知密 [0,1,2,3])', value: 'classic_6expert' },
        { label: '5 专家多时间步级联 (最终全员知密 [0,1,2,3,4])', value: 'multitime_5expert' },
      ],
    },
  ],
  presets: [
    { label: '6 专家撤销', values: { 'input-preset': 'classic_6expert' } },
    { label: '5 专家级联', values: { 'input-preset': 'multitime_5expert' } },
  ],
  metrics: [
    { id: 'metric-secret-time', label: '当前推演时刻', color: '#38bdf8' },
    { id: 'metric-known-count', label: '当前知密人数', color: '#10b981' },
    { id: 'metric-cur-meeting', label: '当前活跃会议', color: '#f59e0b' },
    { id: 'metric-secret-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: PEOPLE_SECRET_CODE_LANGUAGES,
  problemHtml: PEOPLE_SECRET_PROBLEM_HTML,
  analysisHtml: PEOPLE_SECRET_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_6expert') as string;
    return buildSecretExpertSteps(preset);
  },
  renderCanvas: (container, step) => {
    const n = step.n;
    const is5 = n === 5;

    const nodeCoords: Record<number, { x: number; y: number }> = is5
      ? {
          0: { x: 45, y: 75 },
          1: { x: 105, y: 45 },
          2: { x: 165, y: 75 },
          3: { x: 225, y: 45 },
          4: { x: 275, y: 75 },
        }
      : {
          0: { x: 45, y: 55 },
          1: { x: 115, y: 55 },
          2: { x: 185, y: 55 },
          3: { x: 255, y: 55 },
          4: { x: 115, y: 115 },
          5: { x: 185, y: 115 },
        };

    let svgEdges = '';
    if (step.activeMeeting) {
      const u = step.activeMeeting[0];
      const v = step.activeMeeting[1];
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (p1 && p2) {
        svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#facc15" stroke-width="3.5" />`;
      }
    }

    let svgNodes = '';
    for (let i = 0; i < n; i++) {
      const p = nodeCoords[i];
      if (!p) continue;
      const isKnown = step.knownExperts.includes(i);
      const isReset = step.resetNodes.includes(i);
      const isActive =
        step.activeMeeting !== null &&
        (step.activeMeeting[0] === i || step.activeMeeting[1] === i);

      const bg = isKnown ? '#065f46' : isReset ? '#831843' : '#1e293b';
      const border = isActive
        ? '#facc15'
        : isReset
          ? '#ef4444'
          : isKnown
            ? '#10b981'
            : '#475569';

      svgNodes += `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isActive || isKnown ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">E${i}</text>
          <text x="${p.x}" y="${p.y + 24}" fill="${border}" font-size="8" font-weight="700" text-anchor="middle">${isKnown ? '知密' : isReset ? '撤销' : '未知'}</text>
        </g>
      `;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #f8fafc; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #374151; font-weight: 700;">🤫 专家社交时序网络</span>
          <span style="font-size: 11px; color: #1e293b; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
            当前知密人数: <b style="color: #10b981;">${step.knownExperts.length}</b> 人
          </span>
        </div>

        <div style="width: 100%; min-height: 140px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 140px;" viewBox="0 0 310 140">
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部时序扩散与撤销舱 -->
        <div style="background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #374151;">⏳ 时序扩散与因果撤销舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              当前时间切片: <b>t = ${step.curTime}</b>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <div style="background: rgba(6, 95, 70, 0.4); border: 1px solid #10b981; border-radius: 6px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px;">
              <span style="font-size: 10.5px; color: #a7f3d0; font-weight: 700;">知密专家集合 (已连通 0 号):</span>
              <span style="font-size: 11px; color: #ffffff; font-family: monospace;">[${step.knownExperts.map((x) => `E${x}`).join(', ')}]</span>
            </div>

            ${
              step.resetNodes.length > 0
                ? `<div style="background: rgba(153, 27, 27, 0.4); border: 1px solid #ef4444; border-radius: 6px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px;">
                    <span style="font-size: 10.5px; color: #fca5a5; font-weight: 700;">⏪ 本批次撤销重置专家 (未连通 0):</span>
                    <span style="font-size: 11px; color: #ffffff; font-family: monospace;">[${step.resetNodes.map((x) => `E${x}`).join(', ')}]</span>
                  </div>`
                : ''
            }
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const n = step.father.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
      const cells = indices
        .map((u) => {
          const val = arr[u] ?? 0;
          const isActive = step.activeArray === activeName && step.activeSlot === u;
          const isKnown = step.knownExperts.includes(u);
          const bg = isActive ? '#78350f' : isKnown ? 'rgba(6, 95, 70, 0.5)' : '#1e293b';
          const textCol = isActive ? '#fde047' : isKnown ? '#34d399' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : isKnown ? '1px solid #10b981' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #64748b; line-height: 1;">E[${u}]</span>
              <span style="line-height: 1.1;">${val}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const fatherRow = renderRow('father[] (父指针)', step.father, 'father', '#38bdf8');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #374151; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          ${fatherRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">当前已确认掌握秘密人数:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 12px;">${step.knownExperts.length} 人 (${step.knownExperts.map((x) => `E${x}`).join(', ')})</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'people-secret',
  name: '找出知晓秘密的所有专家 (Find All People With Secret)',
  viewId: 'algo-people-secret-view',
  category: 'graph',
  description: '经典并查集时间切片算法：会议按时间排序分批、同批会议瞬时级联合并、未连接到 0 号密源者即时撤销重置 (LeetCode 2092)',
  icon: '🤫',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 106,
  learningGoal: '掌握按时间分组处理静态事件技巧、并查集同层瞬时合并与无效边即时回滚机制',
});

export { Visualizer as PeopleSecretVisualizer };
