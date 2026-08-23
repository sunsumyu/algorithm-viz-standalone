/**
 * SVG Helper Utilities for Thematic Stages (物理舞台通用 SVG 工具类)
 */

export const SVG_NS = 'http://www.w3.org/2000/svg';

export function createSVGElement<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag);
}

export function createStageSVG(viewBox = '0 0 840 220'): SVGSVGElement {
  const svg = createSVGElement('svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.cssText = 'width: 100%; height: 100%; display: block; overflow: visible;';
  return svg;
}

export function createHUDBar(
  svg: SVGSVGElement,
  text: string,
  color = '#e2e8f0',
  x = 40,
  y = 190,
  width = 760,
  height = 24
): void {
  const hudG = createSVGElement('g');

  const hudBg = createSVGElement('rect');
  hudBg.setAttribute('x', String(x));
  hudBg.setAttribute('y', String(y));
  hudBg.setAttribute('width', String(width));
  hudBg.setAttribute('height', String(height));
  hudBg.setAttribute('rx', '6');
  hudBg.setAttribute('fill', 'rgba(15, 23, 42, 0.85)');
  hudBg.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
  hudG.appendChild(hudBg);

  const hudLabel = createSVGElement('text');
  hudLabel.setAttribute('x', String(x + 12));
  hudLabel.setAttribute('y', String(y + 16));
  hudLabel.setAttribute('font-size', '11.5');
  hudLabel.setAttribute('font-weight', '700');
  hudLabel.setAttribute('fill', color);
  hudLabel.textContent = text;
  hudG.appendChild(hudLabel);

  svg.appendChild(hudG);
}
