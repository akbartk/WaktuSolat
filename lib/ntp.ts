import axios from 'axios';

// Variabel untuk menyimpan cache waktu
interface TimeCache {
  offset: number;
  timestamp: number;
  expiresAt: number;
}

let timeCache: TimeCache | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 menit dalam milidetik
const REQUEST_TIMEOUT = 5000; // 5 detik timeout

// Fungsi untuk mendapatkan waktu dari API waktu publik
export async function getNetworkTime(): Promise<Date> {
  try {
    // Daftar API waktu publik
    const timeApis = [
      'https://worldtimeapi.org/api/timezone/Asia/Jakarta',
      'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Jakarta',
      'https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Jakarta'
    ];
    
    // Coba API satu per satu sampai berhasil
    for (const api of timeApis) {
      try {
        const response = await axios.get(api, { 
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        let networkTime: Date;
        
        if (api.includes('worldtimeapi.org')) {
          // Format worldtimeapi.org
          networkTime = new Date(response.data.datetime);
        } else if (api.includes('timeapi.io')) {
          // Format timeapi.io
          const { year, month, day, hour, minute, seconds } = response.data;
          networkTime = new Date(year, month - 1, day, hour, minute, seconds);
        } else {
          // Format default
          networkTime = new Date(response.data.datetime || response.data.dateTime);
        }
        
        if (isNaN(networkTime.getTime())) {
          throw new Error('Invalid date received from API');
        }
        
        console.log(`Waktu dari ${api}: ${networkTime.toISOString()}`);
        return networkTime;
      } catch (error) {
        console.error(`Gagal mendapatkan waktu dari API ${api}:`, error);
        // Lanjut ke API berikutnya
      }
    }
    
    // Jika semua API gagal, gunakan waktu lokal
    console.warn('Semua API waktu gagal, menggunakan waktu lokal');
    return new Date();
  } catch (error) {
    console.error('Error mendapatkan waktu dari API:', error);
    return new Date();
  }
}

// Fungsi untuk mendapatkan offset waktu antara waktu lokal dan waktu jaringan
export async function getTimeOffset(): Promise<number> {
  try {
    // Periksa cache terlebih dahulu
    const now = Date.now();
    if (timeCache && now < timeCache.expiresAt) {
      console.log('Menggunakan offset waktu dari cache');
      return timeCache.offset;
    }
    
    const networkTime = await getNetworkTime();
    const localTime = new Date();
    const offset = networkTime.getTime() - localTime.getTime();
    
    // Simpan ke cache
    timeCache = {
      offset,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };
    
    return offset;
  } catch (error) {
    console.error('Error mendapatkan offset waktu:', error);
    
    // Jika ada cache yang sudah kedaluwarsa, gunakan itu daripada mengembalikan 0
    if (timeCache) {
      console.warn('Menggunakan cache kedaluwarsa sebagai fallback');
      return timeCache.offset;
    }
    
    return 0;
  }
}

// Fungsi untuk mendapatkan waktu yang dikoreksi
export function getCorrectedTime(offset: number): Date {
  const now = new Date();
  return new Date(now.getTime() + offset);
} 