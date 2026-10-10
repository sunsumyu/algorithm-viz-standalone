/**
 * 找出知晓秘密的所有专家 (Find All People With Secret - LeetCode 2092) 步进编译器
 * 核心：按时间分组、同一时间步瞬时连通合并、未连接到 0 号已知密者的撤销重置 (father[u] = u)
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

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
