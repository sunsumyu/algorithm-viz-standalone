import http from 'http';

async function testFetch(url) {
  const t0 = Date.now();
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`[${Date.now() - t0}ms] GET ${url} -> ${res.status} (${text.length} bytes)`);
    return text;
  } catch (e) {
    console.error(`[${Date.now() - t0}ms] GET ${url} FAILED:`, e.message);
  }
}

async function main() {
  const html = await testFetch('http://127.0.0.1:3000/');
  await testFetch('http://127.0.0.1:3000/@vite/client');
  await testFetch('http://127.0.0.1:3000/src/main.ts');
  await testFetch('http://127.0.0.1:3000/src/core/plugin-loader.ts');
  await testFetch('http://127.0.0.1:3000/src/core/tauri-window-controls.ts');
  await testFetch('http://127.0.0.1:3000/src/plugins/algorithm-viz/index.ts');
  await testFetch('http://127.0.0.1:3000/src/core/algorithm-manager.ts');
  await testFetch('http://127.0.0.1:3000/src/core/algorithm-manifests-meta.ts');
  await testFetch('http://127.0.0.1:3000/src/core/algorithm-loader.ts');
}

main();
