import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Handle auth errors specifically for VPS
    if (res.status === 401) {
      // Clear expired tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('session_token');
      }
      // Don't throw for auth errors, just return null
      return null;
    }
    
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
  // Guard against undefined url
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL provided to apiRequest:', url);
    throw new Error('URL is required for API request');
  }
  
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

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Handle auth errors specifically for VPS
    if (res.status === 401) {
      // Clear expired tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('session_token');
      }
      // Return empty object for auth endpoints
      if (url && typeof url === 'string' && url.includes('/api/auth/me')) {
        return {};
      }
      throw new Error('Authentication required');
    }

    await throwIfResNotOk(res);
    return await res.json();
  } catch (error) {
    // Handle network errors and AdBlocker issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn('Network error detected, but continuing...');
      return {};
    }
    throw error;
  }
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

    // Ensure queryKey[0] is a valid string
    const url = queryKey[0];
    if (!url || typeof url !== 'string') {
      console.error('Invalid URL in query key:', url);
      return null;
    }
    
    const res = await fetch(url, {
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
