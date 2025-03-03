/**
 * Utilitas untuk optimasi performa aplikasi
 */

// Fungsi debounce untuk mengurangi jumlah pemanggilan fungsi
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

// Fungsi throttle untuk membatasi jumlah pemanggilan fungsi dalam interval waktu tertentu
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Fungsi memoize untuk menyimpan hasil pemanggilan fungsi
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string,
  maxAge?: number
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, { value: ReturnType<T>, timestamp: number }>();
  
  return function(...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    const now = Date.now();
    
    if (cache.has(key)) {
      const cached = cache.get(key)!;
      if (!maxAge || now - cached.timestamp < maxAge) {
        return cached.value;
      }
      cache.delete(key);
    }
    
    const result = func(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  };
}

// Fungsi untuk mengukur waktu eksekusi fungsi
export function measurePerformance<T extends (...args: any[]) => any>(
  func: T,
  name: string = 'Function'
): (...args: Parameters<T>) => ReturnType<T> {
  return function(...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start}ms to execute`);
    
    return result;
  };
}

// Fungsi untuk lazy loading komponen atau data
export function lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
  let result: T | null = null;
  let promise: Promise<T> | null = null;
  
  return function(): Promise<T> {
    if (result !== null) {
      return Promise.resolve(result);
    }
    
    if (promise !== null) {
      return promise;
    }
    
    promise = loader().then(data => {
      result = data;
      promise = null;
      return data;
    });
    
    return promise;
  };
} 