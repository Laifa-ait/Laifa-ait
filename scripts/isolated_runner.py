#!/usr/bin/env python3
import sys
import os
import time
import signal
import subprocess
import urllib.request
import fcntl
import ctypes
import threading
import shlex

LOCK_FILE = "/tmp/olmart_heavy_cmd.lock"

TIMEOUT_MAP = {
    "timeout_test": 3,
    "build": 300,
    "typecheck": 180,
    "lint": 180,
    "test": 180,
    "install": 300,
}

PR_SET_PDEATHSIG = 1
try:
    libc = ctypes.CDLL("libc.so.6")
except Exception:
    libc = None

if libc:
    try:
        libc.prctl(PR_SET_PDEATHSIG, signal.SIGTERM)
    except Exception:
        pass

def preexec_setup():
    os.setsid()
    if libc:
        try:
            libc.prctl(PR_SET_PDEATHSIG, signal.SIGTERM)
        except Exception:
            pass

def get_system_protected_pids():
    protected = {1, os.getpid(), os.getppid()}
    try:
        for comm in ["nginx", "control-plane-api"]:
            res = subprocess.run(["pgrep", comm], capture_output=True, text=True)
            if res.returncode == 0:
                for line in res.stdout.strip().split("\n"):
                    if line.strip() and line.strip().isdigit():
                        protected.add(int(line.strip()))
        dev_pid_path = "/app/.dev.pid"
        if os.path.exists(dev_pid_path):
            with open(dev_pid_path, "r") as f:
                pid_str = f.read().strip()
                if pid_str.isdigit():
                    protected.add(int(pid_str))
        res = subprocess.run(["pgrep", "-f", "server.ts"], capture_output=True, text=True)
        if res.returncode == 0:
            for line in res.stdout.strip().split("\n"):
                if line.strip() and line.strip().isdigit():
                    protected.add(int(line.strip()))
    except Exception as e:
        print(f"[IsolatedRunner] Warning getting protected PIDs: {e}", file=sys.stderr)
    return protected

def get_pids_in_pgid(pgid):
    pids = []
    try:
        res = subprocess.run(["ps", "-o", "pid=", "-g", str(pgid)], capture_output=True, text=True)
        if res.returncode == 0:
            for line in res.stdout.strip().split("\n"):
                line = line.strip()
                if line.isdigit():
                    pids.append(int(line))
    except Exception:
        pass
    return pids

def is_heavy_command(cmd_str):
    heavy_keywords = ["build", "typecheck", "lint", "test", "install"]
    return any(kw in cmd_str for kw in heavy_keywords)

def determine_timeout(cmd_str):
    for kw, t in TIMEOUT_MAP.items():
        if kw in cmd_str:
            return t
    return 120

def kill_process_group(pgid, protected_pids):
    if pgid <= 1:
        print(f"[IsolatedRunner] SAFETY BLOCK: Refusing to kill PGID {pgid} (protected system PGID)", file=sys.stderr)
        return

    # Dynamically refresh protected PIDs to be 100% sure
    current_protected = get_system_protected_pids()
    current_protected.update(protected_pids)

    if pgid in current_protected:
        print(f"[IsolatedRunner] SAFETY BLOCK: PGID {pgid} is a protected system PID/PGID!", file=sys.stderr)
        return

    # Check all member processes in the target PGID
    member_pids = get_pids_in_pgid(pgid)
    forbidden_members = [p for p in member_pids if p in current_protected]
    if forbidden_members:
        print(f"[IsolatedRunner] SAFETY BLOCK: Refusing to kill PGID {pgid} because it contains protected PID(s): {forbidden_members}", file=sys.stderr)
        return

    print(f"[IsolatedRunner] Cleaning up Process Group {pgid}...", file=sys.stderr)
    try:
        os.killpg(pgid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    except Exception as e:
        print(f"[IsolatedRunner] SIGTERM to PGID {pgid}: {e}", file=sys.stderr)

    start = time.time()
    while time.time() - start < 1.0:
        time.sleep(0.1)
        try:
            os.killpg(pgid, 0)
        except ProcessLookupError:
            return
        except Exception:
            pass

    try:
        os.killpg(pgid, signal.SIGKILL)
        print(f"[IsolatedRunner] Process Group {pgid} forcefully terminated (SIGKILL).", file=sys.stderr)
    except ProcessLookupError:
        pass
    except Exception as e:
        print(f"[IsolatedRunner] SIGKILL to PGID {pgid}: {e}", file=sys.stderr)

def check_server_health():
    try:
        req = urllib.request.Request("http://localhost:3000/api/v1/health")
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                print("[Health Guard] ✅ Server responds HTTP 200 (Healthy)", file=sys.stderr)
                return True
    except Exception as e:
        print(f"[Health Guard] ⚠️ Server healthcheck status check: {e}", file=sys.stderr)
        return False
    return False

def main():
    if len(sys.argv) < 2:
        print("Usage: isolated_runner.py <command_to_execute>", file=sys.stderr)
        sys.exit(1)

    if len(sys.argv) == 2:
        cmd_str = sys.argv[1]
    else:
        cmd_str = shlex.join(sys.argv[1:])

    is_heavy = is_heavy_command(cmd_str)
    timeout_sec = determine_timeout(cmd_str)

    protected_pids = get_system_protected_pids()
    parent_pid = os.getppid()

    lock_fd = None
    if is_heavy:
        try:
            lock_fd = open(LOCK_FILE, "w")
            print(f"[IsolatedRunner] 🔒 Acquiring concurrency lock for heavy command...", file=sys.stderr)
            fcntl.flock(lock_fd, fcntl.LOCK_EX)
            print(f"[IsolatedRunner] 🔓 Lock acquired for heavy command", file=sys.stderr)
        except Exception as e:
            print(f"[IsolatedRunner] Lock error: {e}", file=sys.stderr)

    shell_cmd = cmd_str if cmd_str.startswith("exec ") else f"exec {cmd_str}"

    print(f"[IsolatedRunner] 🚀 Launching in isolated Process Group (Timeout: {timeout_sec}s): {shell_cmd}", file=sys.stderr)

    proc = subprocess.Popen(
        shell_cmd,
        shell=True,
        preexec_fn=preexec_setup
    )

    pgid = proc.pid
    print(f"[IsolatedRunner] Process Group ID (PGID): {pgid}", file=sys.stderr)

    stop_watchdog = threading.Event()

    def watchdog():
        while not stop_watchdog.is_set():
            if os.getppid() != parent_pid and parent_pid != 1:
                print(f"[IsolatedRunner] Parent process {parent_pid} died. Cleaning up PGID {pgid}...", file=sys.stderr)
                kill_process_group(pgid, protected_pids)
                if lock_fd:
                    try:
                        fcntl.flock(lock_fd, fcntl.LOCK_UN)
                        lock_fd.close()
                    except Exception:
                        pass
                os._exit(1)
            time.sleep(0.3)

    wd_thread = threading.Thread(target=watchdog, daemon=True)
    wd_thread.start()

    def handle_signal(sig, frame):
        print(f"[IsolatedRunner] Received signal {sig}, terminating process group {pgid}...", file=sys.stderr)
        kill_process_group(pgid, protected_pids)
        if lock_fd:
            try:
                fcntl.flock(lock_fd, fcntl.LOCK_UN)
                lock_fd.close()
            except Exception:
                pass
        sys.exit(128 + sig)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    exit_code = 1
    try:
        exit_code = proc.wait(timeout=timeout_sec)
    except subprocess.TimeoutExpired:
        print(f"[IsolatedRunner] ⏱️ TIMEOUT ({timeout_sec}s) reached for PGID {pgid}! Cleaning up...", file=sys.stderr)
        kill_process_group(pgid, protected_pids)
        exit_code = 124

    stop_watchdog.set()
    kill_process_group(pgid, protected_pids)

    if lock_fd:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
            lock_fd.close()
        except Exception:
            pass

    check_server_health()

    sys.exit(exit_code)

if __name__ == "__main__":
    main()

