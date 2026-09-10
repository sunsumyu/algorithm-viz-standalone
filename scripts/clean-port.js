import { execSync } from 'child_process';

const PORT = process.env.PORT || 3000;

function cleanPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync('netstat -ano', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // Proto, Local Address, Foreign Address, State, PID
        if (parts.length >= 5) {
          const localAddr = parts[1];
          const state = parts[3];
          const pid = parts[parts.length - 1];
          // 仅杀死真正处于 LISTENING 状态且本地端口为目标端口的服务端进程
          if (state === 'LISTENING' && localAddr.endsWith(`:${port}`)) {
            if (pid && pid !== '0' && pid !== String(process.pid)) {
              pids.add(pid);
            }
          }
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[clean-port] Successfully terminated listening process ${pid} on port ${port}`);
        } catch {
          // ignore already terminated
        }
      }
    } else {
      const pid = execSync(`lsof -t -i:${port} -sTCP:LISTEN`, { encoding: 'utf-8' }).trim();
      if (pid) {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`[clean-port] Successfully terminated listening process ${pid} on port ${port}`);
      }
    }
  } catch {
    // Port is not occupied
  }
}

cleanPort(PORT);
