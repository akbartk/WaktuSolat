/**
 * Utilitas untuk meningkatkan keamanan aplikasi
 */

// Fungsi untuk sanitasi input pengguna
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Menghapus tag HTML dan karakter berbahaya
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Fungsi untuk validasi input
export function validateInput(input: string, pattern: RegExp): boolean {
  if (!input) return false;
  return pattern.test(input);
}

// Fungsi untuk mencegah XSS pada URL
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Hanya izinkan protokol http dan https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    
    return parsed.toString();
  } catch (e) {
    // URL tidak valid
    return '';
  }
}

// Fungsi untuk mencegah clickjacking
export function setupFrameProtection(): void {
  if (typeof window !== 'undefined') {
    // Mencegah situs dibuka dalam iframe
    if (window.self !== window.top && window.top) {
      window.top.location.href = window.self.location.href;
    }
  }
}

// Fungsi untuk mendeteksi dan mencegah serangan brute force
export class BruteForceProtection {
  private attempts: Map<string, { count: number, lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private lockoutTime: number; // dalam milidetik
  
  constructor(maxAttempts: number = 5, lockoutTimeMinutes: number = 15) {
    this.maxAttempts = maxAttempts;
    this.lockoutTime = lockoutTimeMinutes * 60 * 1000;
  }
  
  public recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return;
    }
    
    // Reset jika waktu lockout sudah berlalu
    if (now - record.lastAttempt > this.lockoutTime) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return;
    }
    
    // Tambah hitungan percobaan
    this.attempts.set(identifier, { 
      count: record.count + 1, 
      lastAttempt: now 
    });
  }
  
  public isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    
    if (!record) return false;
    
    const now = Date.now();
    
    // Jika waktu lockout sudah berlalu, reset dan izinkan
    if (now - record.lastAttempt > this.lockoutTime) {
      this.attempts.set(identifier, { count: 0, lastAttempt: now });
      return false;
    }
    
    return record.count >= this.maxAttempts;
  }
  
  public getRemainingLockoutTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    
    if (!record || record.count < this.maxAttempts) return 0;
    
    const now = Date.now();
    const elapsed = now - record.lastAttempt;
    
    if (elapsed > this.lockoutTime) return 0;
    
    return Math.ceil((this.lockoutTime - elapsed) / 1000); // dalam detik
  }
  
  public reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
} 