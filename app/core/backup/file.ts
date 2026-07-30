import type { CafeBackup } from "~/types/backup";

/**
 * 백업 파일 주고받기.
 *
 * 아이폰이 까다롭다. 홈 화면에 추가한 standalone 모드에서는 <a download> 가
 * 조용히 아무 일도 안 하는 경우가 있어서, 공유 시트를 먼저 시도한다.
 */

/** cafemap-backup-2026-07-30.json */
export function backupFileName(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `cafemap-backup-${date}.json`;
}

export type SaveResult = "shared" | "downloaded" | "unsupported";

/**
 * 백업을 파일로 내보낸다.
 *
 * 1) 공유 시트 — 아이폰에서 "파일에 저장"으로 갈 수 있는 가장 확실한 길
 * 2) <a download> — 데스크톱에서 확실
 * 3) 둘 다 안 되면 부르는 쪽이 본문을 화면에 띄워 복사하게 한다
 */
export async function saveBackupFile(backup: CafeBackup): Promise<SaveResult> {
  const name = backupFileName();
  const json = JSON.stringify(backup, null, 2);

  if (typeof navigator !== "undefined" && typeof File !== "undefined") {
    const file = new File([json], name, { type: "application/json" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name });
        return "shared";
      } catch (err) {
        // 사용자가 공유 시트를 닫은 것뿐이면 다운로드로 또 떠넘기지 않는다
        if (err instanceof DOMException && err.name === "AbortError") {
          return "shared";
        }
      }
    }
  }

  if (
    typeof document === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return "unsupported";
  }

  const url = URL.createObjectURL(
    new Blob([json], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // 곧바로 지우면 사파리가 다운로드를 시작하기 전에 사라진다
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "downloaded";
}

export function readBackupFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("파일을 읽지 못함"));
    reader.readAsText(file);
  });
}

/** 저장소가 얼마나 찼는지 — "2.4MB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
