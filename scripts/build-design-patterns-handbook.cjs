// scripts/build-design-patterns-handbook.cjs
const fs = require('fs');
const path = require('path');

const { patterns1 } = require('./patterns-data-1.cjs');
const { patterns2 } = require('./patterns-data-2.cjs');
const { patterns3, deepModulesSection } = require('./patterns-data-3.cjs');

const allPatterns = [...patterns1, ...patterns2, ...patterns3];

const targetHtmlPath = path.resolve(__dirname, '../docs/design-patterns-tutorial.html');

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCodeBlock(title, file, line, code) {
  return `
    <div class="code-box">
      <div class="code-header">
        <span class="file-path">📁 ${escapeHtml(file)} <span class="line-badge">${escapeHtml(line)}</span></span>
        <button class="btn-copy" onclick="copyCode(this)">复制完整源码</button>
      </div>
      <pre><code>${escapeHtml(code)}</code></pre>
    </div>
  `;
}

function renderPatternSection(p) {
  const stepsHtml = p.programmaticSteps.map(step => `
    <div class="programmatic-step">
      <div class="step-badge-title">
        <span class="step-num-pill">步骤 ${step.stepNum}</span>
        <h5 style="color:var(--text-main);font-size:1rem;margin:0;">${escapeHtml(step.stepTitle)}</h5>
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;margin:6px 0 10px 0;">${escapeHtml(step.description)}</p>
      ${renderCodeBlock(step.stepTitle, step.file, step.line, step.code)}
    </div>
  `).join('');

  const applicabilityHtml = p.applicability.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  const prosHtml = p.pros.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  const consHtml = p.cons.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  
  const relatedPatternsHtml = p.relatedPatterns.map(rp => `
    <div style="background:var(--bg-subcard);border:1px solid var(--border-color);border-radius:8px;padding:12px 16px;margin-bottom:8px;">
      <strong style="color:var(--accent-amber);">${escapeHtml(rp.name)}：</strong>
      <span style="color:var(--text-muted);font-size:0.9rem;">${escapeHtml(rp.comparison)}</span>
    </div>
  `).join('');

  return `
    <section id="${p.id}" class="pattern-section" data-keywords="${p.title} ${p.intent} ${p.alsoKnownAs}">
      <div class="pattern-header">
        <div>
          <span class="category-badge cat-${p.category.toLowerCase()}">${p.category} · ${p.categoryLabel}</span>
          <h2 style="font-size:1.65rem;color:var(--text-main);margin:8px 0 4px 0;">${escapeHtml(p.title)}</h2>
          <div style="color:var(--text-dim);font-size:0.88rem;"><strong>别名 (Also known as)：</strong>${escapeHtml(p.alsoKnownAs)}</div>
        </div>
      </div>

      <!-- 🎯 意图 (Intent) -->
      <div class="card-box" style="margin-top:16px;">
        <h3 class="section-subheading" style="color:var(--accent-blue);">🎯 意图 (Intent)</h3>
        <p style="font-size:1.02rem;color:var(--text-main);line-height:1.7;">${escapeHtml(p.intent)}</p>
      </div>

      <!-- 💡 解释 (Explanation) -->
      <div class="card-box">
        <h3 class="section-subheading" style="color:var(--accent-emerald);">💡 解释 (Explanation)</h3>
        
        <div class="analogy-box">
          <div style="font-weight:700;color:var(--accent-amber);margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            🦄 通俗比喻 (Real-world Example)
          </div>
          <p style="color:var(--text-main);font-size:0.95rem;">${escapeHtml(p.realWorldAnalogy)}</p>
        </div>

        <div style="margin:16px 0;">
          <strong style="color:var(--accent-blue);">📖 通俗解释 (In Plain Words)：</strong>
          <span style="color:var(--text-muted);">${escapeHtml(p.inPlainWords)}</span>
        </div>

        <div style="background:rgba(30,41,59,0.5);border-left:4px solid var(--accent-indigo);padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
          <strong style="color:var(--accent-indigo);">🏛️ 维基百科 / GoF 权威解释：</strong>
          <p style="color:var(--text-muted);font-size:0.92rem;margin-top:4px;">${escapeHtml(p.formalDefinition)}</p>
        </div>

        <!-- 💻 程序示例 (Programmatic Example) -->
        <div style="margin-top:24px;">
          <h4 style="color:var(--accent-blue);font-size:1.15rem;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
            💻 程序示例 (Programmatic Example)
          </h4>
          <p style="color:var(--text-dim);font-size:0.88rem;margin-bottom:16px;">
            以下源码提取自本项目真实生产环境，展示了该设计模式从抽象规范、具体实现、调度上下文到客户端调用的完整闭环：
          </p>
          ${stepsHtml}
        </div>
      </div>

      <!-- 📊 类图与架构拓扑 (Class Diagram) -->
      <div class="card-box">
        <h3 class="section-subheading" style="color:var(--accent-purple);">📊 类图与架构拓扑 (Class Diagram)</h3>
        <pre class="ascii-diagram"><code>${escapeHtml(p.classDiagram)}</code></pre>
      </div>

      <!-- 🛠️ 适用场景 (Applicability) -->
      <div class="card-box">
        <h3 class="section-subheading" style="color:var(--accent-amber);">🛠️ 适用场景 (Applicability)</h3>
        <ul class="styled-list">
          ${applicabilityHtml}
        </ul>
      </div>

      <!-- ⚖️ 优缺点权衡 (Consequences / Trade-offs) -->
      <div class="card-box">
        <h3 class="section-subheading" style="color:var(--accent-rose);">⚖️ 优缺点权衡 (Consequences)</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:8px;padding:14px;">
            <h4 style="color:var(--accent-emerald);margin-bottom:8px;">✅ 优点 (Pros)</h4>
            <ul class="styled-list" style="margin:0;padding-left:18px;">
              ${prosHtml}
            </ul>
          </div>
          <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:8px;padding:14px;">
            <h4 style="color:var(--accent-rose);margin-bottom:8px;">⚠️ 缺点 (Cons)</h4>
            <ul class="styled-list" style="margin:0;padding-left:18px;">
              ${consHtml}
            </ul>
          </div>
        </div>
        <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);border-radius:8px;padding:12px 16px;">
          <strong style="color:var(--accent-blue);">🛡️ 本项目深模块自愈消解方案：</strong>
          <span style="color:var(--text-muted);font-size:0.92rem;">${escapeHtml(p.mitigations)}</span>
        </div>
      </div>

      <!-- 🌐 真实世界案例 (Real-world Examples) -->
      <div class="card-box">
        <h3 class="section-subheading" style="color:var(--accent-blue);">🌐 真实世界案例 (Real-world Examples)</h3>
        <div style="margin-bottom:12px;">
          <strong style="color:var(--accent-amber);">☕ Java / JDK / 经典生态标准实践：</strong>
          <p style="color:var(--text-muted);font-size:0.92rem;margin-top:4px;">${escapeHtml(p.realWorldJava)}</p>
        </div>
        <div>
          <strong style="color:var(--accent-emerald);">🚀 本项目工业级生产实现：</strong>
          <p style="color:var(--text-muted);font-size:0.92rem;margin-top:4px;">${escapeHtml(p.realWorldProject)}</p>
        </div>
      </div>

      <!-- 🔗 相关模式辨析 (Related Patterns) -->
      <div class="card-box">
        <h3 class="section-subheading" style="color:var(--accent-indigo);">🔗 相关模式辨析 (Related Patterns)</h3>
        ${relatedPatternsHtml}
      </div>
    </section>
  `;
}

function buildHtml() {
  const sidebarLinks = `
    <div class="nav-group">
      <div class="nav-group-title">现代深模块架构规范</div>
      <a href="#deep-modules" class="nav-link active">00. 架构基石与身材红线</a>
    </div>

    <div class="nav-group">
      <div class="nav-group-title">行为型设计模式 (BEHAVIORAL)</div>
      <a href="#pattern-strategy" class="nav-link">01. 策略模式 (Strategy)</a>
      <a href="#pattern-mediator" class="nav-link">02. 中介者模式 (Mediator)</a>
      <a href="#pattern-observer" class="nav-link">03. 观察者模式 (Observer)</a>
      <a href="#pattern-template-method" class="nav-link">04. 模板方法 (Template Method)</a>
      <a href="#pattern-state" class="nav-link">05. 状态模式 (State / FSM)</a>
    </div>

    <div class="nav-group">
      <div class="nav-group-title">结构型与架构模式 (STRUCTURAL)</div>
      <a href="#pattern-pipes-filters" class="nav-link">06. 管道与过滤器 (Pipes & Filters)</a>
      <a href="#pattern-adapter" class="nav-link">07. 适配器模式 (Adapter)</a>
      <a href="#pattern-bridge" class="nav-link">08. 桥接模式 (Bridge)</a>
      <a href="#pattern-facade" class="nav-link">09. 外观模式 (Facade)</a>
      <a href="#pattern-presenter" class="nav-link">10. 表现器模式 (Presenter / MVP)</a>
    </div>

    <div class="nav-group">
      <div class="nav-group-title">创建型设计模式 (CREATIONAL)</div>
      <a href="#pattern-registry" class="nav-link">11. 注册表与定位器 (Registry)</a>
      <a href="#pattern-factory" class="nav-link">12. 工厂方法模式 (Factory Method)</a>
      <a href="#pattern-builder" class="nav-link">13. 建造者模式 (Builder)</a>
      <a href="#pattern-singleton" class="nav-link">14. 单例模式 (Singleton)</a>
    </div>
  `;

  const patternSectionsHtml = allPatterns.map(renderPatternSection).join('\n');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>算法可视化系统设计模式全景教学（Java-Design-Patterns 架构标准版）</title>
  <style>
    :root {
      --bg-primary: #0a0f1d;
      --bg-secondary: #111827;
      --bg-card: #1e293b;
      --bg-subcard: #151e2e;
      --bg-code: #030712;
      --border-color: #334155;
      --border-focus: #38bdf8;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --accent-blue: #38bdf8;
      --accent-indigo: #818cf8;
      --accent-emerald: #34d399;
      --accent-amber: #fbbf24;
      --accent-rose: #f87171;
      --accent-purple: #c084fc;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-main);
      line-height: 1.65;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* 侧边导航栏 */
    #sidebar {
      width: 320px;
      background-color: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100%;
    }

    .sidebar-header {
      padding: 18px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .sidebar-header h1 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--accent-blue);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sidebar-header p {
      font-size: 0.82rem;
      color: var(--text-dim);
      margin-top: 4px;
    }

    .search-box {
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .search-box input {
      width: 100%;
      background: var(--bg-subcard);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--text-main);
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-box input:focus {
      border-color: var(--border-focus);
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
    }

    .nav-group {
      margin-bottom: 18px;
    }

    .nav-group-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      padding: 6px 10px;
      font-weight: 600;
    }

    .nav-link {
      display: block;
      padding: 7px 12px;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.88rem;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-link:hover {
      background: rgba(56, 189, 248, 0.1);
      color: var(--accent-blue);
    }

    .nav-link.active {
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent-blue);
      font-weight: 600;
      border-left: 3px solid var(--accent-blue);
    }

    /* 主内容区 */
    #content {
      flex: 1;
      height: 100%;
      overflow-y: auto;
      padding: 32px 48px;
      scroll-behavior: smooth;
    }

    .content-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .hero-banner {
      background: linear-gradient(135deg, rgba(30,58,138,0.2) 0%, rgba(17,24,39,0.8) 100%);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px 28px;
      margin-bottom: 32px;
    }

    .hero-banner h1 {
      font-size: 1.8rem;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .hero-banner p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* 模式卡片 */
    .pattern-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 36px;
      scroll-margin-top: 24px;
    }

    .pattern-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .category-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .cat-behavioral { background: rgba(56,189,248,0.15); color: var(--accent-blue); border: 1px solid rgba(56,189,248,0.3); }
    .cat-structural { background: rgba(129,140,248,0.15); color: var(--accent-indigo); border: 1px solid rgba(129,140,248,0.3); }
    .cat-creational { background: rgba(52,211,153,0.15); color: var(--accent-emerald); border: 1px solid rgba(52,211,153,0.3); }
    .cat-arch { background: rgba(248,113,113,0.15); color: var(--accent-rose); border: 1px solid rgba(248,113,113,0.3); }

    .card-box {
      margin-bottom: 24px;
    }

    .section-subheading {
      font-size: 1.1rem;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .analogy-box {
      background: var(--bg-subcard);
      border: 1px solid rgba(251,191,36,0.25);
      border-left: 4px solid var(--accent-amber);
      border-radius: 0 8px 8px 0;
      padding: 16px;
      margin: 12px 0;
    }

    /* 代码块与步骤 */
    .programmatic-step {
      background: var(--bg-subcard);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .step-badge-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .step-num-pill {
      background: var(--accent-blue);
      color: #030712;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .code-box {
      background: var(--bg-code);
      border: 1px solid #1f2937;
      border-radius: 6px;
      overflow: hidden;
      margin-top: 10px;
    }

    .code-header {
      background: #111827;
      border-bottom: 1px solid #1f2937;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
    }

    .file-path {
      color: #38bdf8;
      font-family: monospace;
    }

    .line-badge {
      background: rgba(251,191,36,0.15);
      color: #fbbf24;
      padding: 1px 6px;
      border-radius: 4px;
      margin-left: 8px;
      font-size: 0.75rem;
    }

    .btn-copy {
      background: #1f2937;
      border: 1px solid #374151;
      color: #cbd5e1;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-copy:hover {
      background: #374151;
      color: #fff;
    }

    pre {
      margin: 0;
      padding: 14px;
      overflow-x: auto;
      font-family: Consolas, Monaco, "Andale Mono", monospace;
      font-size: 0.86rem;
      line-height: 1.5;
      color: #e2e8f0;
    }

    .ascii-diagram {
      background: #030712;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 16px;
      color: #38bdf8;
      font-family: monospace;
      font-size: 0.85rem;
      line-height: 1.4;
      overflow-x: auto;
    }

    .styled-list {
      padding-left: 20px;
      color: var(--text-muted);
      font-size: 0.92rem;
    }

    .styled-list li {
      margin-bottom: 6px;
    }
  </style>
</head>
<body>

  <!-- 左侧目录导航 -->
  <aside id="sidebar">
    <div class="sidebar-header">
      <h1>🌐 模式教学与源码对照</h1>
      <p>algorithm-viz-standalone 核心工程架构</p>
    </div>
    <div class="search-box">
      <input type="text" id="pattern-search" placeholder="按模式名、意图或文件名检索..." oninput="filterPatterns()">
    </div>
    <nav class="sidebar-nav">
      ${sidebarLinks}
    </nav>
  </aside>

  <!-- 主内容展示区 -->
  <main id="content">
    <div class="content-container">
      <div class="hero-banner">
        <h1>📐 算法可视化系统设计模式全景教学（架构标准版）</h1>
        <p>
          本教学严格遵循 <a href="https://java-design-patterns.com/zh/patterns/strategy/#%E8%A7%A3%E9%87%8A" target="_blank" style="color:var(--accent-blue);text-decoration:underline;">Java-Design-Patterns</a> 业界权威结构规范与 Matt Pocock 深模块哲学。
          覆盖 <strong>🎯 意图 ➔ 💡 解释 (通俗比喻 + 维基权威 + 4步完整程序示例) ➔ 📊 类图 ➔ 🛠️ 适用场景 ➔ ⚖️ 优缺点权衡 ➔ 🌐 真实案例 ➔ 🔗 相关模式辨析</strong> 完整 9 大标准维度，与真实生产源码及行号严格对照。
        </p>
      </div>

      <!-- 00. 深模块规范 -->
      <section id="deep-modules" class="pattern-section">
        <h2 style="font-size:1.65rem;color:var(--text-main);margin-bottom:12px;">00. 现代深模块哲学与身材红线 (Deep Modules & Thin Adapters)</h2>
        ${deepModulesSection.content}
      </section>

      <!-- 14 个设计模式全景展示 -->
      ${patternSectionsHtml}
    </div>
  </main>

  <script>
    // 复制代码到剪贴板
    function copyCode(btn) {
      const pre = btn.closest('.code-box').querySelector('pre');
      navigator.clipboard.writeText(pre.innerText).then(() => {
        const originalText = btn.innerText;
        btn.innerText = '已复制 ✓';
        btn.style.color = '#34d399';
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.color = '';
        }, 1800);
      });
    }

    // 搜索过滤模式
    function filterPatterns() {
      const keyword = document.getElementById('pattern-search').value.toLowerCase().trim();
      const sections = document.querySelectorAll('.pattern-section');
      const navLinks = document.querySelectorAll('.nav-link');

      sections.forEach(sec => {
        if (!keyword) {
          sec.style.display = 'block';
          return;
        }
        const text = sec.innerText.toLowerCase();
        if (text.includes(keyword)) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      });

      navLinks.forEach(link => {
        if (!keyword) {
          link.style.display = 'block';
          return;
        }
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target && target.style.display !== 'none') {
            link.style.display = 'block';
          } else {
            link.style.display = 'none';
          }
        }
      });
    }

    // 滚动时高亮侧边栏活跃链接
    const content = document.getElementById('content');
    const sections = document.querySelectorAll('.pattern-section');
    const navLinks = document.querySelectorAll('.nav-link');

    content.addEventListener('scroll', () => {
      let currentId = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - content.offsetTop;
        if (content.scrollTop >= top - 120) {
          currentId = sec.id;
        }
      });

      navLinks.forEach(link => {
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(targetHtmlPath, html, 'utf8');
  console.log('Successfully generated Java-Design-Patterns aligned tutorial HTML to:', targetHtmlPath);
  console.log('Total file size:', Buffer.byteLength(html, 'utf8'), 'bytes');
}

buildHtml();
