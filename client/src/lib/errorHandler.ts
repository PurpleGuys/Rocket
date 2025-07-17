// Global error handler for VPS deployment
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Check if it's the specific fetch parameter error
    if (event.reason?.message?.includes('is not a valid HTTP method')) {
      console.error('CRITICAL: fetch() parameter order error detected!');
      console.error('This indicates a bug in the fetch call - URL and method parameters are swapped');
      event.preventDefault();
      return;
    }
    
    // Check if it's an authentication error (401/403)
    if (event.reason?.message?.includes('401') || event.reason?.message?.includes('403')) {
      // Silently handle auth errors - they are expected when not logged in
      event.preventDefault();
      return;
    }
    
    // Check if it's a network error
    if (event.reason?.message?.includes('Failed to fetch') || 
        event.reason?.message?.includes('NetworkError')) {
      console.warn('Network error detected, but continuing...');
      event.preventDefault();
      return;
    }
    
    // For other errors, log but don't crash the application
    console.error('Application error:', event.reason);
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Prevent the error from crashing the application
    event.preventDefault();
  });
}

// Production-safe error boundary
export function withErrorBoundary<T>(fn: () => Promise<T>): Promise<T | null> {
  return fn().catch((error) => {
    console.error('Error caught by error boundary:', error);
    return null;
  });
}