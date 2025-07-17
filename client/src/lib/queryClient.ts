import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    } catch (e) {
      // Handle cases where response body is not readable
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  url: string,
  method: string = "GET",
  data?: unknown | undefined,
): Promise<any> {
  const headers: Record<string, string> = {};
  
  // Add auth headers
  const token = localStorage.getItem("auth_token");
  const sessionToken = localStorage.getItem("session_token");
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (sessionToken) {
    headers["x-session-token"] = sessionToken;
  }
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add auth headers for queries
    const token = localStorage.getItem("auth_token");
    const sessionToken = localStorage.getItem("session_token");
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (sessionToken) {
      headers["x-session-token"] = sessionToken;
    }

    const res = await fetch(queryKey[0] as string, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && (res.status === 401 || res.status === 403)) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: false,
      throwOnError: false, // Prevent unhandled promise rejections
    },
    mutations: {
      retry: false,
      throwOnError: false, // Prevent unhandled promise rejections
    },
  },
});
