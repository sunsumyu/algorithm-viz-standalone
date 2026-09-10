/**
 * 位运算公共可视化呈现组件与通用接口
 */

export interface BitStep {
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string>;
  // 位运算专用视效数据
  bitView?: {
    title?: string;
    num: number;
    bitsCount?: number;
    highlightMask?: number;
    secondaryMask?: number;
  };
  comparisonView?: {
    titleA: string;
    valA: number;
    op: string;
    titleB?: string;
    valB?: number;
    resTitle: string;
    resVal: number;
    bitsCount?: number;
  };
  stateView?: {
    ones?: number;
    twos?: number;
    curNum?: number;
    curIndex?: number;
  };
  groupView?: {
    diff?: number;
    diffBitPos?: number;
    groupA?: number[];
    groupB?: number[];
    curNum?: number;
    xorA?: number;
    xorB?: number;
  };
  bitsetView?: {
    bits: number[];
    targetNum?: number;
    activeBucket?: number;
    activeBit?: number;
    operation?: 'add' | 'contains' | 'remove' | 'init';
    result?: boolean;
  };
}

/**
 * 将数字格式化为补码无符号 32 位二进制串
 */
export function toBinaryString(val: number, bitsCount: number = 32): string {
  const unsigned = val >>> 0;
  return unsigned.toString(2).padStart(bitsCount, '0').slice(-bitsCount);
}

/**
 * 渲染单个数字的二进制网格
 */
export function renderBitGrid(
  container: HTMLElement,
  title: string,
  val: number,
  bitsCount: number = 16,
  highlightMask: number = 0,
  secondaryMask: number = 0
) {
  const card = document.createElement('div');
  card.style.cssText = 'padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

  const binStr = toBinaryString(val, bitsCount);
  const uVal = val >>> 0;

  const bitCells = [];
  for (let i = 0; i < bitsCount; i++) {
    const bitPos = bitsCount - 1 - i;
    const bitVal = binStr[i];
    const isHigh = Boolean(highlightMask & (1 << bitPos));
    const isSec = Boolean(secondaryMask & (1 << bitPos));

    let bg = bitVal === '1' ? '#eff6ff' : '#f8fafc';
    let border = bitVal === '1' ? '#93c5fd' : '#e2e8f0';
    let color = bitVal === '1' ? '#1d4ed8' : '#94a3b8';

    if (isHigh) {
      bg = '#fef3c7';
      border = '#f59e0b';
      color = '#b45309';
    } else if (isSec) {
      bg = '#ecfdf5';
      border = '#10b981';
      color = '#047857';
    }

    bitCells.push(`
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 22px;">
        <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">${bitPos}</span>
        <div style="width: 22px; height: 26px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${border}; border-radius: 4px; font-weight: 700; font-size: 13px; color: ${color}; font-family: monospace;">
          ${bitVal}
        </div>
      </div>
    `);
  }

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 12px; font-weight: 700; color: #1e293b;">${title}</span>
      <div style="font-size: 11px; font-family: monospace; color: #64748b;">
        十进制: <b style="color: #2563eb;">${val}</b> &nbsp;|&nbsp;
        十六进制: <b style="color: #7c3aed;">0x${uVal.toString(16).toUpperCase()}</b>
      </div>
    </div>
    <div style="display: flex; gap: 3px; overflow-x: auto; padding-bottom: 4px; justify-content: flex-start;">
      ${bitCells.join('')}
    </div>
  `;
  container.appendChild(card);
}

/**
 * 渲染位运算对齐对比卡片 (A op B = Result)
 */
export function renderBitComparison(
  container: HTMLElement,
  comp: {
    titleA: string;
    valA: number;
    op: string;
    titleB?: string;
    valB?: number;
    resTitle: string;
    resVal: number;
    bitsCount?: number;
  }
) {
  const card = document.createElement('div');
  card.style.cssText = 'padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px;';

  const bits = comp.bitsCount || 16;
  const strA = toBinaryString(comp.valA, bits);
  const strB = comp.valB !== undefined ? toBinaryString(comp.valB, bits) : null;
  const strRes = toBinaryString(comp.resVal, bits);

  const formatLine = (label: string, str: string, val: number, prefix: string = '') => {
    return `
      <div style="display: flex; align-items: center; gap: 10px; font-family: monospace;">
        <span style="width: 20px; font-weight: 800; color: #2563eb; text-align: center;">${prefix}</span>
        <span style="width: 110px; font-size: 11px; font-weight: 600; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${label}:</span>
        <div style="display: flex; gap: 3px;">
          ${str.split('').map((c) => `<span style="display: inline-block; width: 14px; text-align: center; font-size: 12px; font-weight: ${c === '1' ? '700' : '400'}; color: ${c === '1' ? '#1e293b' : '#cbd5e1'};">${c}</span>`).join('')}
        </div>
        <span style="font-size: 11px; color: #64748b; margin-left: auto;">(${val})</span>
      </div>
    `;
  };

  let html = formatLine(comp.titleA, strA, comp.valA, '');
  if (strB !== null && comp.valB !== undefined) {
    html += formatLine(comp.titleB || 'B', strB, comp.valB, comp.op);
  }
  html += `<div style="height: 1px; background: #cbd5e1; margin: 2px 0;"></div>`;
  html += formatLine(comp.resTitle, strRes, comp.resVal, '=');

  card.innerHTML = `
    <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">⚡ 位运算对齐推演</div>
    ${html}
  `;
  container.appendChild(card);
}

/**
 * 渲染位图桶与位点阵
 */
export function renderBitsetGrid(
  container: HTMLElement,
  bits: number[],
  activeBucket?: number,
  activeBit?: number
) {
  const card = document.createElement('div');
  card.style.cssText = 'padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

  const bucketCards = bits.map((bucketVal, bIdx) => {
    const isActBucket = activeBucket === bIdx;
    const binStr = toBinaryString(bucketVal, 32);

    const bitDots = [];
    for (let bit = 0; bit < 32; bit++) {
      const bitPos = 31 - bit;
      const isSet = binStr[bit] === '1';
      const isTargetBit = isActBucket && activeBit === bitPos;

      let dotBg = isSet ? '#3b82f6' : '#e2e8f0';
      if (isTargetBit) {
        dotBg = '#f59e0b';
      }

      bitDots.push(`
        <span title="bit ${bitPos} (num: ${bIdx * 32 + bitPos})" style="display: inline-block; width: 6px; height: 10px; background: ${dotBg}; border-radius: 2px; margin: 1px;"></span>
      `);
    }

    return `
      <div style="border: 1.5px solid ${isActBucket ? '#3b82f6' : '#e2e8f0'}; background: ${isActBucket ? '#f0f9ff' : '#f8fafc'}; border-radius: 6px; padding: 6px 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; font-family: monospace; margin-bottom: 4px;">
          <span>Bucket[${bIdx}] (${bIdx * 32} ~ ${bIdx * 32 + 31})</span>
          <span style="font-weight: 700; color: #1e293b;">0x${(bucketVal >>> 0).toString(16).toUpperCase()}</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 1px;">
          ${bitDots.join('')}
        </div>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px; display: flex; justify-content: space-between;">
      <span>🗄️ 位图桶视图 (每个桶 32 位):</span>
      ${activeBucket !== undefined && activeBit !== undefined ? `<span style="color: #2563eb; font-family: monospace;">定位: bucket=${activeBucket}, bit=${activeBit} (num=${activeBucket * 32 + activeBit})</span>` : ''}
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
      ${bucketCards}
    </div>
  `;
  container.appendChild(card);
}
