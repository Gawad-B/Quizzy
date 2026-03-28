const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Helper to get token from localStorage (or wherever you save it)
function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export async function http<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {}
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
    let errorMessage = res.statusText;

    try {
      const errorJson = (await res.json()) as { message?: string; error?: string };
      errorMessage = errorJson?.message || errorJson?.error || errorMessage;
    } catch {
      const errorText = await res.text();
      if (errorText) errorMessage = errorText;
    }

    throw new Error(errorMessage || 'Request failed');
  }

  return (await res.json()) as T;
}
