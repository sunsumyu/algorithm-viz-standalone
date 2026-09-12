/**
 * 数字串翻译方案数（解码方法，LeetCode 91）双模式可视化器 — 声明式 4-Card 标准架构
 * 模式一：递归树（SVG 全量重绘 + 回填 + 重复子问题高亮）
 * 模式二：DP 迭代（一维 dp 从右往左填表 + 依赖箭头 + 决策拆解卡片）
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  buildRecursiveSteps,
  buildDpSteps,
  REC_JAVA_CODE,
  DP_JAVA_CODE,
  type DecodeRecStep,
  type DecodeDpStep,
  type DecodeTreeNode,
} from './decode-ways-steps';

const NODE_R = 22;
/** 与 decode-ways-steps.ts 的 LEVEL_HEIGHT 保持一致（悬挂死边的落点） */
const LEVEL_GAP = 92;

/** 递归模式画布步骤：附加节点表 + 累计边/回填/可见集 */
export interface RecCanvasStep extends DecodeRecStep {
  mode: 'rec';
  nodeMap: Record<number, DecodeTreeNode>;
  revealedIds: number[];
  edgeList: Array<{ fromId: number; toId: number | null; label: string; dead: boolean }>;
  backfills: Record<number, { value: number; kind: string }>;
  metrics?: Record<string, string>;
}

/** DP 模式画布步骤 */
export interface DpCanvasStep extends DecodeDpStep {
  mode: 'dp';
  inputStr: string;
  metrics?: Record<string, string>;
}

export type DwCanvasStep = RecCanvasStep | DpCanvasStep;

function parseInput(inputs: Record<string, any>): string {
  const raw = String(inputs.s ?? '226').trim();
  return /^[0-9]{1,10}$/.test(raw) ? raw : '226';
}

/** 递归步骤后处理：把增量事件折算成每步的累计画布状态 */
function withRecMetrics(steps: DecodeRecStep[], nodeMap: Record<number, DecodeTreeNode>): RecCanvasStep[] {
  const revealedIds: number[] = [0];
  const edgeList: RecCanvasStep['edgeList'] = [];
  const backfills: RecCanvasStep['backfills'] = {};

  return steps.map((st) => {
    if (st.type === 'call' && st.newNode) {
      if (!revealedIds.includes(st.nodeId)) revealedIds.push(st.nodeId);
      if (st.edge && st.edge.fromId !== null && st.edge.fromId !== undefined) {
        edgeList.push({ fromId: st.edge.fromId, toId: st.nodeId, label: st.edge.label, dead: st.edge.dead });
      } else if (st.edge && st.edge.dead) {
        edgeList.push({ fromId: st.nodeId, toId: null, label: st.edge.label, dead: true });
      }
    } else if (st.type === 'branch-2' && st.edge && st.edge.dead) {
      edgeList.push({ fromId: st.nodeId, toId: null, label: st.edge.label, dead: true });
    }

    if ((st.type === 'base-case' || st.type === 'dead-zero' || st.type === 'return') && st.returnValue !== undefined) {
      backfills[st.nodeId] = { value: st.returnValue, kind: st.type };
    }

    return {
      ...st,
      mode: 'rec' as const,
      nodeMap,
      revealedIds: [...revealedIds],
      edgeList: edgeList.map((e) => ({ ...e })),
      backfills: { ...backfills },
      log: st.message,
      metrics: {
        calls: String(st.stats.calls),
        repeats: String(st.stats.repeats),
        'two-digit': String(st.stats.twoDigitHits),
        answer: st.answer != null ? String(st.answer) : '—',
      },
    };
  });
}

/** DP 步骤后处理 */
function withDpMetrics(steps: DecodeDpStep[], inputStr: string): DpCanvasStep[] {
  return steps.map((st) => ({
    ...st,
    mode: 'dp' as const,
    inputStr,
    log: st.message,
    metrics: {
      'cur-cell': `dp[${st.i}]`,
      filled: `${st.filledCount} / ${inputStr.length + 1}`,
      formula: st.formulaSubstituted || st.formula || '—',
      answer: st.answer != null ? String(st.answer) : '—',
    },
  }));
}

/* ═══════════════════ 递归树全量重绘 ═══════════════════ */

function renderRecCanvas(container: HTMLElement, step: RecCanvasStep): void {
  const nodes = step.revealedIds
    .slice()
    .sort((a, b) => a - b)
    .map((id) => step.nodeMap[id])
    .filter(Boolean);

  if (nodes.length === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">无节点</div>';
    return;
  }

  const maxX = Math.max(...nodes.map((nd) => nd.x), 200);
  const maxY = Math.max(...nodes.map((nd) => nd.y), 200);
  const svgW = maxX + 80;
  const svgH = maxY + 80;

  // 边（先画边再画节点，边在节点下层）
  const edgesSvg = step.edgeList
    .map((e) => {
      const from = step.nodeMap[e.fromId];
      if (!from) return '';
      if (e.toId !== null) {
        const to = step.nodeMap[e.toId];
        if (!to) return '';
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.hypot(dx, dy) || 1;
        const x1 = from.x + (dx / dist) * (NODE_R + 2);
        const y1 = from.y + (dy / dist) * (NODE_R + 2);
        const x2 = to.x - (dx / dist) * (NODE_R + 4);
        const y2 = to.y - (dy / dist) * (NODE_R + 4);
        const lineStyle = e.dead
          ? 'stroke: rgba(251,113,133,0.55); stroke-dasharray: 5 4;'
          : 'stroke: rgba(148,163,255,0.45); stroke-width: 1.8;';
        const label = e.label
          ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" text-anchor="middle" style="fill: ${e.dead ? '#fda4af' : '#a5b4fc'}; font-size: 10.5px; font-family: ui-monospace, monospace; paint-order: stroke; stroke: rgba(17,15,38,0.9); stroke-width: 3px; pointer-events: none;">${e.label}</text>`
          : '';
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="${lineStyle}" />${label}`;
      }
      // 悬挂死边
      const x2 = from.x + 46;
      const y2 = from.y + LEVEL_GAP / 2;
      return `<line x1="${from.x + NODE_R + 2}" y1="${from.y + 10}" x2="${x2}" y2="${y2}" style="stroke: rgba(251,113,133,0.55); stroke-dasharray: 5 4;" /><text x="${x2 + 4}" y="${y2 - 4}" style="fill: #fda4af; font-size: 10.5px; font-family: ui-monospace, monospace; paint-order: stroke; stroke: rgba(17,15,38,0.9); stroke-width: 3px; pointer-events: none;">${e.label}</text>`;
    })
    .join('');

  // 节点
  const nodesSvg = nodes
    .map((nd) => {
      const bf = step.backfills[nd.id];
      const isActive = nd.id === step.nodeId;

      let circleStyle = 'fill: rgba(99,102,241,0.14); stroke: #818cf8; stroke-width: 2;';
      let labelFill = '#c7d2fe';
      if (nd.isRepeated) {
        circleStyle = 'fill: rgba(99,102,241,0.14); stroke: #fbbf24; stroke-width: 2; stroke-dasharray: 4 3;';
        labelFill = '#fcd34d';
      }
      if (bf?.kind === 'base-case') circleStyle = 'fill: rgba(167,243,208,0.28); stroke: #6ee7b7; stroke-width: 2;';
      else if (bf?.kind === 'dead-zero') {
        circleStyle = 'fill: rgba(244,63,94,0.25); stroke: #fb7185; stroke-width: 2;';
        labelFill = '#fda4af';
      } else if (bf?.kind === 'return') circleStyle = 'fill: rgba(52,211,153,0.22); stroke: #34d399; stroke-width: 2;';
      if (isActive) circleStyle += ' stroke: #f0abfc; stroke-width: 3;';

      const ringSvg = isActive
        ? `<circle cx="${nd.x}" cy="${nd.y}" r="${NODE_R + 1}" fill="none" stroke="#f0abfc" stroke-width="2.5" stroke-dasharray="4,3" />`
        : '';

      return `
        <g>
          ${ringSvg}
          <circle cx="${nd.x}" cy="${nd.y}" r="${NODE_R}" style="${circleStyle}" />
          <text x="${nd.x}" y="${nd.y + 5}" text-anchor="middle" style="fill: ${labelFill}; font-size: 12px; font-weight: 700; font-family: ui-monospace, monospace; pointer-events: none;">f(${nd.i})</text>
          <text x="${nd.x}" y="${nd.y - NODE_R - 8}" text-anchor="middle" style="fill: #6ee7b7; font-size: 13px; font-weight: 800; font-family: ui-monospace, monospace; pointer-events: none;">${bf ? bf.value : ''}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box; overflow: hidden;">
      <svg viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%;">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
    </div>
  `;
}

/* ═══════════════════ DP 表全量重绘 ═══════════════════ */

function renderDpCanvas(container: HTMLElement, step: DpCanvasStep): void {
  const n = step.inputStr.length;
  let fontSize = '11px';

  // 字符格（dp[i] 对 s[i]，dp[n] 为边界空位）
  const charsHtml = Array.from({ length: n + 1 }, (_, i) => {
    const isBoundary = i === n;
    const isZero = !isBoundary && step.inputStr[i] === '0';
    const isCurrent = !isBoundary && i === step.i && step.type !== 'init' && step.type !== 'done';

    let bg = 'rgba(99,102,241,0.14)';
    let border = 'rgba(148,163,255,0.3)';
    let color = '#c7d2fe';
    let boxShadow = 'none';
    if (isZero) {
      bg = 'rgba(244,63,94,0.18)';
      border = 'rgba(251,113,133,0.6)';
      color = '#fda4af';
    } else if (isBoundary) {
      bg = 'rgba(52,211,153,0.12)';
      border = 'rgba(52,211,153,0.4)';
      color = '#6ee7b7';
      fontSize = '13px';
    }
    if (isCurrent) {
      border = '#f0abfc';
      boxShadow = '0 0 0 3px rgba(240,171,252,0.2)';
    }

    return `
      <div class="dw-char-cell" data-idx="${i}" style="min-width: 40px; height: 44px; border-radius: 10px; background: ${bg}; border: 1px solid ${border}; color: ${color}; display: flex; align-items: center; justify-content: center; font-family: ui-monospace, monospace; font-size: ${fontSize}; font-weight: 700; box-shadow: ${boxShadow}; transition: all 0.2s;">${isBoundary ? '␃' : step.inputStr[i]}</div>
    `;
  }).join('');

  // dp 格
  const cellsHtml = Array.from({ length: n + 1 }, (_, i) => {
    const filled = step.filledCount > n - i;
    const isCurrent = i === step.i && step.type !== 'done';
    const isDep = step.deps?.includes(i) ?? false;
    const isZero = filled && step.dp[i] === 0 && i !== n;
    const isAnswer = step.type === 'done' && i === 0;

    let bg = 'rgba(10,10,30,0.5)';
    let border = 'rgba(148,163,255,0.22)';
    let valColor = '#c7d2fe';
    let transform = 'none';
    let boxShadow = 'none';
    if (isDep) {
      border = '#fbbf24';
      bg = 'rgba(251,191,36,0.1)';
      valColor = '#fcd34d';
    }
    if (isZero) valColor = '#fb7185';
    if (isCurrent) {
      border = '#f0abfc';
      bg = 'rgba(240,171,252,0.12)';
      transform = 'translateY(-2px)';
      boxShadow = '0 4px 14px rgba(240,171,252,0.25)';
    }
    if (isAnswer) {
      border = '#34d399';
      bg = 'rgba(52,211,153,0.15)';
      boxShadow = '0 0 16px rgba(52,211,153,0.3)';
    }

    return `
      <div class="dw-dp-cell" data-idx="${i}" style="min-width: 56px; height: 62px; border-radius: 10px; background: ${bg}; border: 1px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-family: ui-monospace, monospace; transform: ${transform}; box-shadow: ${boxShadow}; transition: all 0.2s; box-sizing: border-box;">
        <span style="font-size: 9px; color: #a5b4fc; font-weight: 700;">dp[${i}]</span>
        <span class="dw-dp-val" style="font-size: 14px; font-weight: 800; color: ${valColor};">${filled ? step.dp[i] : ''}</span>
      </div>
    `;
  }).join('');

  const formula = step.formulaSubstituted || step.formula || '';

  // 决策拆解卡片
  const branch = (b: NonNullable<DecodeDpStep['branch1']>): string => {
    const grey = b.ok ? '' : 'opacity: 0.55;';
    const body = b.ok
      ? `<div style="font-size: 11px; color: #c7d2fe; font-family: ui-monospace, monospace;">${b.formula ?? ''}</div>`
      : `<div style="font-size: 10.5px; color: #fda4af; font-weight: 700;">✗ ${b.reason ?? ''}</div>`;
    return `
      <div style="flex: 1; border: 1px solid rgba(148,163,255,0.22); border-radius: 10px; padding: 8px 10px; background: rgba(10,10,30,0.5); ${grey}">
        <div style="font-size: 10.5px; font-weight: 800; color: #818cf8; margin-bottom: 4px;">${b.title}</div>
        ${body}
      </div>
    `;
  };
  const breakdownHtml =
    step.branch1 && step.branch2
      ? `${branch(step.branch1)}${branch(step.branch2)}<div style="font-size: 12px; color: #6ee7b7; font-family: ui-monospace, monospace; font-weight: 800; text-align: center;">dp[${step.i}] = <strong>${step.dp[step.i]}</strong></div>`
      : formula
        ? `<div style="font-size: 11.5px; color: #c7d2fe; font-family: ui-monospace, monospace; text-align: center;">${formula}</div>`
        : '';

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 12px; padding: 14px; box-sizing: border-box; overflow-y: auto; position: relative;">
      <div class="dw-chars-row" style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">${charsHtml}</div>
      <div class="dw-cells-row" style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; position: relative;">${cellsHtml}</div>
      <div style="display: flex; gap: 8px; align-items: stretch;">${breakdownHtml}</div>
    </div>
  `;

  // 依赖弧线箭头覆盖层（compute/zero 步骤）
  if (step.type !== 'compute' && step.type !== 'zero') return;
  const host = container.querySelector<HTMLElement>('.dw-cells-row');
  if (!host) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.pointerEvents = 'none';
  svg.style.overflow = 'visible';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'dw-arrow-head');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '8');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto-start-reverse');
  const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  arrowPath.setAttribute('fill', '#fbbf24');
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svg.appendChild(defs);
  host.appendChild(svg);

  const hostRect = host.getBoundingClientRect();
  const target = host.querySelector<HTMLElement>(`.dw-dp-cell[data-idx="${step.i}"]`);
  if (!target) return;
  const targetRect = target.getBoundingClientRect();
  const toX = targetRect.left - hostRect.left + targetRect.width / 2;
  const toY = targetRect.top - hostRect.top + targetRect.height / 2;

  (step.deps ?? []).forEach((depIdx, order) => {
    const src = host.querySelector<HTMLElement>(`.dw-dp-cell[data-idx="${depIdx}"]`);
    if (!src) return;
    const srcRect = src.getBoundingClientRect();
    const fromX = srcRect.left - hostRect.left + srcRect.width / 2;
    const fromY = srcRect.top - hostRect.top + srcRect.height / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const lift = 34;
    const d = `M ${fromX} ${fromY - 18} Q ${fromX} ${fromY - lift} ${(fromX + toX) / 2} ${fromY - lift} T ${toX} ${toY - 18}`;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', order === 1 ? '#f0abfc' : '#fbbf24');
    path.setAttribute('stroke-width', '2.2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('marker-end', 'url(#dw-arrow-head)');
    svg.appendChild(path);
  });
}

/** 主视觉分发：按步骤 mode 渲染递归树 / DP 表 */
export function renderDecodeWaysCanvas(container: HTMLElement, step: DwCanvasStep): void {
  if (step.mode === 'dp') renderDpCanvas(container, step);
  else renderRecCanvas(container, step);
}

registerDeclarativeAlgorithm<DwCanvasStep>({
  id: 'decode-ways',
  name: '数字串翻译方案数（解码方法）',
  category: 'dynamic-programming',
  description: 'LeetCode 91 双模式演示：递归树展开 vs 一维 DP 从右往左填表',
  icon: '🔓',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握 s[i]==0 与两位 ≤26 的分支取舍，理解暴力递归到 DP 的演化',
  modes: [
    { id: 'rec', label: '🌳 模式一 · 递归树展开' },
    { id: 'dp', label: '📊 模式二 · DP 迭代填表' },
  ],
  stages: [
    {
      id: 'main',
      name: '解码方法',
      shortName: '双模式',
      codeLanguages: { java: REC_JAVA_CODE },
      modeCodeLanguages: {
        rec: { java: REC_JAVA_CODE },
        dp: { java: DP_JAVA_CODE },
      },
    },
  ],
  inputs: [
    {
      id: 's',
      label: '数字串 (1~10 位)',
      type: 'text',
      defaultValue: '226',
      placeholder: '仅数字字符',
    },
  ],
  presets: [
    { label: '示例 1 (5 种)', values: { s: '226' } },
    { label: '示例 2 (2 种)', values: { s: '11106' } },
    { label: '无解 (0 种)', values: { s: '06' } },
    { label: '单字符边界', values: { s: '10' } },
  ],
  metrics: [
    { id: 'calls', label: '递归调用数', color: '#818cf8' },
    { id: 'repeats', label: '重复子问题', color: '#fbbf24' },
    { id: 'two-digit', label: '两位命中', color: '#a855f7' },
    { id: 'filled', label: '已填格数', color: '#34d399' },
    { id: 'answer', label: '翻译方案数', color: '#6ee7b7' },
  ],
  legend: [
    { label: '重复子问题', color: '#fbbf24' },
    { label: '已回填返回值', color: '#34d399' },
    { label: '死路 (0 方案)', color: '#fb7185' },
  ],
  generateSteps: (inputs, mode) => {
    const raw = parseInput(inputs);
    if (mode === 'dp') return withDpMetrics(buildDpSteps(raw).steps, raw);
    const { steps, nodes } = buildRecursiveSteps(raw);
    const nodeMap: Record<number, DecodeTreeNode> = {};
    nodes.forEach((nd) => {
      nodeMap[nd.id] = nd;
    });
    return withRecMetrics(steps, nodeMap);
  },
  renderCanvas: (container, step) => renderDecodeWaysCanvas(container, step as DwCanvasStep),
});
