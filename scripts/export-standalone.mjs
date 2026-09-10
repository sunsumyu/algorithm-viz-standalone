/**
 * Standalone Offline HTML Exporter Script
 * 自动化打包单文件离线版 HTML 可视化模板，将所有 YAML 模型与核心仓储静态内联，
 * 方便无服务器、离线直接双击分发。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as jsYaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distStandaloneDir = path.resolve(rootDir, 'dist', 'standalone');
if (!fs.existsSync(distStandaloneDir)) {
  fs.mkdirSync(distStandaloneDir, { recursive: true });
}

console.log('[Export Standalone] 开始扫描模型规范并构建离线单文件可视化页面...');

// 1. 读取所有 YAML 模型
const modelsDir = path.resolve(rootDir, 'src', 'algorithms', 'specs', 'models');
const modelFiles = fs.readdirSync(modelsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
const embeddedModels = {};

modelFiles.forEach(file => {
  const fullPath = path.resolve(modelsDir, file);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const parsed = jsYaml.load(content);
  if (parsed && parsed.id) {
    embeddedModels[parsed.id] = parsed;
    console.log(`[Export Standalone] 已注入模型: ${parsed.id} (${parsed.name})`);
  }
});

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

  const outputPath = path.resolve(distStandaloneDir, templateName);
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`[Export Standalone] 已输出: ${outputPath}`);
});

console.log('[Export Standalone] 离线单文件全量多模型导出完成！');
