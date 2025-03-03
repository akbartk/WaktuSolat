import axios from 'axios';

// Interface untuk data kota
export interface City {
  id: string;
  name: string;
}

// Interface untuk waktu sholat
export interface PrayerTime {
  tanggal: string;
  imsyak: string;
  shubuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashr: string;
  magrib: string;
  isya: string;
}

// Interface untuk hasil konversi tanggal Hijriah
export interface HijriDate {
  status: string;
  data: {
    masehi: string;
    hijriah: string;
  };
}

// Base URL untuk data jadwal sholat
const BASE_URL = 'https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master';

// Base URL untuk API konversi tanggal Hijriah UNISA Yogyakarta
const HIJRI_API_URL = 'https://service.unisayogya.ac.id/kalender/api/masehi2hijriah/muhammadiyah';

// Cache untuk menyimpan hasil konversi tanggal Hijriah
const hijriDateCache: Record<string, string> = {};

// Fungsi untuk mendapatkan tanggal Hijriah dari API UNISA Yogyakarta
export async function getHijriDate(date: Date = new Date()): Promise<string> {
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript bulan dimulai dari 0
    const day = date.getDate();
    
    // Format tanggal untuk API dan cache key
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    console.log(`[DEBUG] Fetching Hijri date for: ${formattedDate}`);
    
    // Cek apakah hasil sudah ada di cache
    if (hijriDateCache[formattedDate]) {
      console.log(`[DEBUG] Using cached Hijri date for: ${formattedDate}`);
      return hijriDateCache[formattedDate];
    }
    
    // Gunakan URL API yang benar dengan format /tahun/bulan/tanggal
    const url = `${HIJRI_API_URL}/${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
    
    console.log(`[DEBUG] API URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 5000, // Timeout 5 detik
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log(`[DEBUG] API Response:`, JSON.stringify(response.data));
    
    if (response.data) {
      // Format hasil dari API
      const data = response.data;
      
      // Format tanggal Hijriah
      // Pastikan nama bulan menggunakan format yang konsisten dengan yang digunakan di aplikasi
      let bulanHijriah = data.namabulan;
      
      // Konversi nama bulan jika perlu untuk konsistensi
      if (bulanHijriah === "Ramadhan") {
        bulanHijriah = "Ramadan";
      } else if (bulanHijriah === "Dzulqaidah") {
        bulanHijriah = "Dzulkaidah";
      } else if (bulanHijriah === "Dzulhijjah") {
        bulanHijriah = "Dzulhijjah";
      } else if (bulanHijriah === "Rabiul Awwal") {
        bulanHijriah = "Rabiul Awal";
      } else if (bulanHijriah === "Rabiul Akhir") {
        bulanHijriah = "Rabiul Akhir";
      } else if (bulanHijriah === "Jumadil Awwal") {
        bulanHijriah = "Jumadil Awal";
      } else if (bulanHijriah === "Jumadil Akhir") {
        bulanHijriah = "Jumadil Akhir";
      } else if (bulanHijriah === "Sya'ban") {
        bulanHijriah = "Syaban";
      }
      
      const hijriDate = `${data.tanggal} ${bulanHijriah} ${data.tahun} H`;
      
      console.log(`[DEBUG] Formatted Hijri date: ${hijriDate}`);
      
      // Simpan hasil di cache
      hijriDateCache[formattedDate] = hijriDate;
      
      return hijriDate;
    } else {
      throw new Error('Format respons API tidak sesuai');
    }
  } catch (error) {
    console.error('Error fetching Hijri date:', error);
    return ''; // Kembalikan string kosong jika gagal
  }
}

// Fungsi untuk mendapatkan daftar kota
export async function getCities(): Promise<City[]> {
  try {
    const response = await axios.get(`${BASE_URL}/kota.json`);
    const cityIds = response.data;
    
    // Ubah ID kota menjadi objek City dengan nama yang diformat
    return cityIds.map((id: string) => ({
      id,
      name: formatCityName(id)
    }));
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan jadwal sholat bulanan
export async function getMonthlyPrayerTimes(cityId: string, year: number, month: number): Promise<PrayerTime[]> {
  try {
    const formattedMonth = month.toString().padStart(2, '0');
    const url = `${BASE_URL}/adzan/${cityId}/${year}/${formattedMonth}.json`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching prayer times for ${cityId}/${year}/${month}:`, error);
    return [];
  }
}

// Fungsi untuk mendapatkan jadwal sholat hari ini
export async function getTodayPrayerTimes(cityId: string): Promise<PrayerTime | null> {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JavaScript bulan dimulai dari 0
    const day = today.getDate();
    
    const monthlyTimes = await getMonthlyPrayerTimes(cityId, year, month);
    const todayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return monthlyTimes.find(time => time.tanggal === todayStr) || null;
  } catch (error) {
    console.error(`Error fetching today's prayer times for ${cityId}:`, error);
    return null;
  }
}

// Fungsi untuk mendapatkan jadwal sholat hari ini langsung dari API
export async function getTodayPrayerTimesFromAPI(cityId: string): Promise<PrayerTime | null> {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JavaScript bulan dimulai dari 0
    const day = today.getDate();
    
    // Format tanggal untuk pencarian
    const todayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    console.log(`[DEBUG] Fetching prayer times for date: ${todayStr}`);
    
    // URL untuk data bulanan
    const url = `${BASE_URL}/adzan/${cityId}/${year}/${month.toString().padStart(2, '0')}.json`;
    
    console.log(`[DEBUG] Fetching prayer times from API: ${url}`);
    
    // Ambil data langsung dari API
    const response = await axios.get(url, {
      timeout: 5000, // Timeout 5 detik
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log(`[DEBUG] API response status: ${response.status}`);
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`[DEBUG] Found ${response.data.length} prayer times in the month`);
      
      // Cari data untuk hari ini
      const todayData = response.data.find((item: PrayerTime) => item.tanggal === todayStr);
      
      if (todayData) {
        console.log(`[DEBUG] Found today's prayer times: ${JSON.stringify(todayData)}`);
        return todayData;
      } else {
        console.error(`[ERROR] Today's prayer time not found in data. Available dates: ${response.data.map((item: PrayerTime) => item.tanggal).join(', ')}`);
        return null;
      }
    } else {
      console.error(`[ERROR] Invalid API response format: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching today's prayer times from API for ${cityId}:`, error);
    return null;
  }
}

// Fungsi untuk memformat nama kota
function formatCityName(cityId: string): string {
  // Ubah format seperti "bandung" menjadi "Bandung"
  // atau "bandarlampung" menjadi "Bandar Lampung"
  
  // Pisahkan kata berdasarkan pola camelCase atau kata yang digabung
  const words = cityId.replace(/([a-z])([A-Z])/g, '$1 $2')
                      .replace(/([a-zA-Z])(\d)/g, '$1 $2')
                      .split(/(?=[A-Z])|(?<=[a-z])(?=[0-9])/);
  
  // Gabungkan kata-kata dengan spasi dan kapitalisasi huruf pertama
  return words.map(word => {
    // Jika kata adalah singkatan seperti "dki", buat huruf besar semua
    if (word.length <= 3 && word.toLowerCase() === word) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

// Fungsi untuk mencari kota berdasarkan nama
export function findCityByName(cities: City[], name: string): City | undefined {
  // Normalisasi nama untuk pencarian
  const normalizedName = name.toLowerCase().trim();
  
  // Cari kecocokan persis
  let city = cities.find(city => city.name.toLowerCase() === normalizedName);
  
  // Jika tidak ditemukan, cari yang mengandung nama tersebut
  if (!city) {
    city = cities.find(city => city.name.toLowerCase().includes(normalizedName));
  }
  
  return city;
}

// Fungsi untuk mengkonversi waktu string "HH:MM" menjadi objek Date
export function timeStringToDate(timeStr: string, date: Date = new Date(), timezoneOffset?: number): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Buat objek Date baru dengan waktu yang diberikan
  // Waktu dari API sudah dalam zona waktu lokal, jadi tidak perlu penyesuaian tambahan
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  
  return result;
}

// Fungsi untuk mendapatkan waktu sholat berikutnya
export function getNextPrayer(prayerTime: PrayerTime, timezoneOffset?: number): { name: string; time: Date } | null {
  if (!prayerTime) return null;
  
  // Dapatkan waktu saat ini
  const now = new Date();
  const today = new Date(prayerTime.tanggal);
  
  // Daftar waktu sholat
  const prayers = [
    { name: "Subuh", time: timeStringToDate(prayerTime.shubuh, today) },
    { name: "Dzuhur", time: timeStringToDate(prayerTime.dzuhur, today) },
    { name: "Ashar", time: timeStringToDate(prayerTime.ashr, today) },
    { name: "Maghrib", time: timeStringToDate(prayerTime.magrib, today) },
    { name: "Isya", time: timeStringToDate(prayerTime.isya, today) }
  ];
  
  // Cari waktu sholat berikutnya
  for (const prayer of prayers) {
    if (prayer.time > now) {
      return prayer;
    }
  }
  
  // Jika semua waktu sholat hari ini sudah lewat, kembalikan null
  // (aplikasi akan menangani kasus ini dengan mengambil waktu Subuh besok)
  return null;
} 