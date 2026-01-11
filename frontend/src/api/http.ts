const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export type ApiError = {
  status: number;
  message: string;
};

function getToken() {
  return localStorage.getItem("mp_token");
}

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw { status: res.status, message } satisfies ApiError;
  }

  return data as T;
}
