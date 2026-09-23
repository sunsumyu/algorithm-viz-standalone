/**
 * 自动安装 Git Pre-commit 钩子
 * 保证每次代码提交前，必须无条件调用全部红灯测试与核心抽象门禁
 */
import * as fs from 'fs';
import * as path from 'path';

function setupGitHooks() {
  const gitHooksDir = path.resolve(process.cwd(), '.git', 'hooks');
  if (!fs.existsSync(gitHooksDir)) {
    console.log('[setup-git-hooks] .git/hooks directory not found, skipping hook installation.');
    return;
  }

  const preCommitPath = path.join(gitHooksDir, 'pre-commit');
  const hookScript = `#!/bin/sh
# 🔒 表现层与顶层抽象硬红线 Pre-commit 门禁
echo "=========================================================="
echo "🔒 [Git Pre-commit] 正在执行顶层抽象与表现层真实契约红灯死门禁..."
echo "=========================================================="

npm run test:gate
STATUS=$?

if [ $STATUS -ne 0 ]; then
  echo ""
  echo "❌ [Commit Blocked] 门禁测试未通过！严禁带着表现层缺陷或抽象违规提交代码！"
  echo "👉 请执行 npm run test:presentation 查看具体红灯报错与自愈指引。"
  echo "=========================================================="
  exit 1
fi

echo "✅ [Git Pre-commit] 门禁全线转绿通过，允许提交！"
echo "=========================================================="
exit 0
`;

  fs.writeFileSync(preCommitPath, hookScript, { encoding: 'utf-8', mode: 0o755 });
  console.log(`[setup-git-hooks] ✅ Successfully installed pre-commit gate hook to ${preCommitPath}`);
}

setupGitHooks();
