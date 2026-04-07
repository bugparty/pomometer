/**
 * Direct Google Tasks REST checks (same list name as app: "AA Pomometer").
 * Used by logged-in E2E after UI sync; requires a valid OAuth access token (Tasks scope).
 */

const GOOGLE_TASKS_API = 'https://www.googleapis.com/tasks/v1';
const POMOMETER_LIST_TITLE = 'AA Pomometer';

type GoogleTaskItem = {
  id?: string;
  title?: string;
  status?: string;
  completed?: string | null;
};

function isTaskCompleted(task: GoogleTaskItem): boolean {
  return task.status === 'completed' || !!task.completed;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(url: string, accessToken: string): Promise<{ ok: boolean; status: number; data: T | null; text: string }> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data, text };
}

export async function getPomometerListId(accessToken: string): Promise<string | null> {
  const { ok, data } = await fetchJson<{ items?: Array<{ id: string; title: string }> }>(
    `${GOOGLE_TASKS_API}/users/@me/lists`,
    accessToken,
  );
  if (!ok || !data?.items) return null;
  const list = data.items.find((l) => l.title === POMOMETER_LIST_TITLE);
  return list?.id ?? null;
}

export async function listTasksInList(accessToken: string, listId: string): Promise<GoogleTaskItem[]> {
  const params = new URLSearchParams({
    showHidden: 'true',
    maxResults: '100',
    showDeleted: 'false',
  });
  const { ok, data } = await fetchJson<{ items?: Array<{ title?: string; id?: string }> }>(
    `${GOOGLE_TASKS_API}/lists/${listId}/tasks?${params.toString()}`,
    accessToken,
  );
  if (!ok) return [];
  return data?.items ?? [];
}

/**
 * Polls until a task whose title contains `titleSubstring` exists in AA Pomometer, or timeout.
 */
export async function waitForTaskTitleInPomometerList(
  accessToken: string,
  titleSubstring: string,
  options?: { timeoutMs?: number; pollIntervalMs?: number },
): Promise<boolean> {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const pollIntervalMs = options?.pollIntervalMs ?? 2_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const listId = await getPomometerListId(accessToken);
    if (listId) {
      const tasks = await listTasksInList(accessToken, listId);
      const hit = tasks.some((t) => (t.title ?? '').includes(titleSubstring));
      if (hit) return true;
    }
    await sleep(pollIntervalMs);
  }
  return false;
}

export async function waitForTaskCompletionsInPomometerList(
  accessToken: string,
  titleSubstrings: string[],
  options?: { timeoutMs?: number; pollIntervalMs?: number },
): Promise<boolean> {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const pollIntervalMs = options?.pollIntervalMs ?? 2_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const listId = await getPomometerListId(accessToken);
    if (listId) {
      const tasks = await listTasksInList(accessToken, listId);
      const allCompleted = titleSubstrings.every((expectedTitle) => {
        const hit = tasks.find((t) => (t.title ?? '').includes(expectedTitle));
        return hit ? isTaskCompleted(hit) : false;
      });
      if (allCompleted) return true;
    }
    await sleep(pollIntervalMs);
  }
  return false;
}
