export type ErrorType<T> = T;
export type BodyType<T> = T;

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function customFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  
  const headers = new Headers(init?.headers);
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!response.ok) {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    throw data;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
