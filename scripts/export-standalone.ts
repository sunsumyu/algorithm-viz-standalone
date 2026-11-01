/**
 * Standalone Offline HTML Exporter Script
 * 自动化打包单文件离线版 HTML 可视化模板，将所有 YAML 模型与核心仓储静态内联，
 * 方便无服务器、离线直接双击分发。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as jsYaml from 'js-yaml';
import { encodeToZeroWidth } from '../src/core/security/zero-width-watermark';

/**
 * 分发门禁：导出的单文件 HTML 不经过任何授权体系（无激活、无加密），
 * 属于完全绕过防盗防线的分发通道，必须显式声明 `--allow-distribute` 才允许产出，
 * 且强制注入可见水印与零宽盲水印（买家身份可追溯）。
 */
function parseExportCliArgs(): { allowDistribute: boolean; buyer: string } {
  const argv = process.argv.slice(2);
  let allowDistribute = false;
  let buyer = process.env.ALGO_VIZ_EXPORT_BUYER?.trim() || '';
  if (argv.includes('--allow-distribute')) allowDistribute = true;
  const buyerIdx = argv.indexOf('--buyer');
  if (buyerIdx >= 0 && argv[buyerIdx + 1]) buyer = argv[buyerIdx + 1].trim();
  if (!buyer) buyer = `untracked-export:${new Date().toISOString().slice(0, 10)}`;
  return { allowDistribute, buyer };
}

/** 构建注入导出 HTML 的双水印片段（可见平铺 + 零宽盲水印） */
function buildWatermarkInjection(buyer: string): string {
  const zw = encodeToZeroWidth(buyer);
  const visibleTile = buyer.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
  <style>
    #export-watermark-overlay{position:fixed;inset:0;pointer-events:none;z-index:2147483000;opacity:.06;
      background-image:url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='380'%20height='220'%3E%3Ctext%20x='190'%20y='110'%20transform='rotate(-24%20190%20110)'%20text-anchor='middle'%20fill='%23475569'%20font-size='13'%3E${encodeURIComponent(`离线演示版 · ${visibleTile}`)}%3C/text%3E%3C/svg%3E");
      background-repeat:repeat;}
  </style>
  <div id="export-watermark-overlay" aria-hidden="true"></div>
  <!-- export-trace:${zw} -->
  <script>window.__EXPORT_BUYER__ = "${buyer.replace(/"/g, '\\"')}";</script>`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distStandaloneDir = path.resolve(rootDir, 'dist', 'standalone');
if (!fs.existsSync(distStandaloneDir)) {
  fs.mkdirSync(distStandaloneDir, { recursive: true });
}

const { allowDistribute, buyer } = parseExportCliArgs();
if (!allowDistribute) {
  console.error('======================================================');
  console.error('⛔ [Export Standalone] 已拦截：离线单文件导出不经过任何授权体系，');
  console.error('   属于完全绕过防盗防线的分发通道，禁止静默产出。');
  console.error('   如确需对外分发，请显式执行:');
  console.error('     npm run export:standalone -- --allow-distribute --buyer <订单号或用户ID>');
  console.error('   导出物将自动注入可见水印与零宽盲水印（泄露可溯源）。');
  console.error('======================================================');
  process.exit(1);
}
console.log(`[Export Standalone] 分发已授权，买家水印身份: ${buyer}`);
console.log('[Export Standalone] 开始扫描模型规范并构建离线单文件可视化页面...');

// 1. 读取所有 YAML 模型
const modelsDir = path.resolve(rootDir, 'src', 'algorithms', 'specs', 'models');
const embeddedModels: Record<string, any> = {};

if (fs.existsSync(modelsDir)) {
  const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

  modelFiles.forEach(file => {
    const fullPath = path.resolve(modelsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const parsed = jsYaml.load(content) as any;
    if (parsed && parsed.id) {
      embeddedModels[parsed.id] = parsed;
      console.log(`[Export Standalone] 已注入模型: ${parsed.id} (${parsed.name})`);
    }
  });
}

// 2. 导出精简版、精讲版与通用探索容器
const targetTemplates = [
  'unique-paths.html',
  'unique-paths-lite.html',
  'stage-explorer.html',
  'stage-explorer-lite.html',
];

targetTemplates.forEach((templateName) => {
  const templatePath = path.resolve(rootDir, templateName);
  if (!fs.existsSync(templatePath)) return;

  let html = fs.readFileSync(templatePath, 'utf-8');

  // 将 import { AlgorithmModelRepository } 替换为内联 ModelRepository
  const inlineModelScript = `
  <script>
    window.__EMBEDDED_MODELS = ${JSON.stringify(embeddedModels)};
    window.AlgorithmModelRepository = {
      hasModel(id) { return !!window.__EMBEDDED_MODELS[id]; },
      getModel(id) { return window.__EMBEDDED_MODELS[id]; },
      getAllIds() { return Object.keys(window.__EMBEDDED_MODELS); },
      getCompiledStage(id, stageKey, direction = 'forward') {
        const model = window.__EMBEDDED_MODELS[id];
        const stage = model?.stages?.[stageKey];
        if (!stage) return null;
        const name = typeof stage.name === 'string' ? stage.name : (stage.name?.[direction] || '');
        const desc = typeof stage.desc === 'string' ? stage.desc : (stage.desc?.[direction] || '');
        const card2Title = typeof stage.card2Title === 'string' ? stage.card2Title : (stage.card2Title?.[direction] || '');
        const card2Desc = typeof stage.card2Desc === 'string' ? stage.card2Desc : (stage.card2Desc?.[direction] || '');
        
        const compileSrc = (snip) => {
          if (!snip || !snip.source) return { title: '', codeHtml: '', anchorMap: {} };
          const lines = snip.source.trimEnd().split('\\n');
          const anchorMap = {};
          const htmlLines = lines.map((l, idx) => {
            const num = idx + 1;
            const m = l.match(/\\/\\/\\s*@step:([a-zA-Z0-9_\\-]+)/);
            if (m) { anchorMap[m[1]] = num; l = l.replace(/\\/\\/\\s*@step:[a-zA-Z0-9_\\-]+/, ''); }
            return '<span class="code-line" data-line="' + num + '">' + l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>';
          });
          return { title: snip.title || '', codeHtml: htmlLines.join(''), anchorMap };
        };

        const result = {
          name, desc, timeBadge: stage.timeBadge || 'O(n)', badgeBg: stage.badgeBg || '',
          card2Title, card2Desc
        };
        if (stage.code) {
          const snip = stage.code[direction] || stage.code;
          const c = compileSrc(snip);
          result.codeTitle = c.title; result.codeHtml = c.codeHtml; result.anchorMap = c.anchorMap;
        }
        if (stage.variants) {
          result.variants = {};
          for (const [k, v] of Object.entries(stage.variants)) {
            const vTitle = typeof v.title === 'string' ? v.title : (v.title?.[direction] || '');
            const snip = v.code?.[direction] || v.code;
            const c = compileSrc(snip);
            result.variants[k] = { variantLabel: v.variantLabel || vTitle, title: vTitle, codeTitle: c.title, codeHtml: c.codeHtml, anchorMap: c.anchorMap };
          }
        }
        return result;
      }
    };
  </script>`;

  // 内联主题 CSS 样式
  const themeCssPath = path.resolve(rootDir, 'src', 'styles', 'visualizer-theme.css');
  if (fs.existsSync(themeCssPath)) {
    const themeCss = fs.readFileSync(themeCssPath, 'utf-8');
    html = html.replace(
      /<link\s+rel=["']stylesheet["']\s+href=["']\/src\/styles\/visualizer-theme\.css["']\s*\/?>/i,
      `<style>\n/* Inlined visualizer-theme.css */\n${themeCss}\n</style>`
    );
  }

  // 替换 import 语句为内联支持
  html = html.replace(
    /import\s*\{\s*AlgorithmModelRepository\s*\}\s*from\s*['"][^'"]+['"];/,
    `const AlgorithmModelRepository = window.AlgorithmModelRepository;`
  );

  // 插入内联模型脚本
  html = html.replace('</head>', `${inlineModelScript}\n</head>`);

  // 注入双水印（可见平铺 + 零宽盲水印），泄露可溯源
  html = html.replace('</body>', `${buildWatermarkInjection(buyer)}\n</body>`);

  const outputPath = path.resolve(distStandaloneDir, templateName);
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`[Export Standalone] 已输出: ${outputPath}`);
});

console.log('[Export Standalone] 离线单文件全量多模型导出完成！');
