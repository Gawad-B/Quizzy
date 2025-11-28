const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Helper to get token from localStorage (or wherever you save it)
function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export async function http<T>(
  path: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }

  return (await res.json()) as T;
}
