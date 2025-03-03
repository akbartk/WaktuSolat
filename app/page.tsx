"use client"

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Moon, Sun, MapPin } from "lucide-react"
import HijriDate from "hijri-date/lib/safe"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { getTimeOffset, getCorrectedTime } from "@/lib/ntp"
import { debounce, throttle, memoize } from "@/lib/performance"
import { sanitizeInput, setupFrameProtection } from "@/lib/security"
import axios from "axios"
import { 
  getCities, 
  getTodayPrayerTimes, 
  getTodayPrayerTimesFromAPI,
  getNextPrayer, 
  timeStringToDate,
  getHijriDate,
  City,
  PrayerTime,
  findCityByName
} from "@/lib/jadwalsholat"

// Definisikan zona waktu untuk berbagai wilayah di Indonesia
const TIMEZONE_MAPPING: Record<string, number> = {
  // WIB (GMT+7)
  "jakarta": 7,
  "bandung": 7,
  "surabaya": 7,
  "semarang": 7,
  "yogyakarta": 7,
  "medan": 7,
  "palembang": 7,
  "padang": 7,
  "pekanbaru": 7,
  "pontianak": 7,
  
  // WITA (GMT+8)
  "makassar": 8,
  "denpasar": 8,
  "mataram": 8,
  "banjarmasin": 8,
  "balikpapan": 8,
  "samarinda": 8,
  "manado": 8,
  "palu": 8,
  
  // WIT (GMT+9)
  "jayapura": 9,
  "ambon": 9,
  "sorong": 9,
  "merauke": 9,
  "ternate": 9
};

// Fungsi untuk mendapatkan offset zona waktu berdasarkan kota
function getTimezoneOffset(cityId: string): number {
  // Default ke WIB (GMT+7)
  let timezoneHours = 7;
  
  // Cari kota dalam mapping
  for (const [cityPattern, offset] of Object.entries(TIMEZONE_MAPPING)) {
    if (cityId.toLowerCase().includes(cityPattern)) {
      timezoneHours = offset;
      break;
    }
  }
  
  return timezoneHours;
}

// Definisikan interface untuk state lokasi
interface LocationState {
  city: string;
  cityId: string;
  isLoading: boolean;
  error: string | null;
}

// Memoize fungsi untuk format waktu
const formatTimeMemoized = memoize((date: Date, showSeconds: boolean = false): string => {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: false
  });
}, undefined, 500);

// Memoize fungsi untuk format tanggal
const formatDateMemoized = memoize((date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}, undefined, 60000);

// Memoize fungsi untuk format tanggal Hijriah
const formatHijriDateMemoized = memoize((date: Date): string => {
  // Dapatkan tanggal Gregorian
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth(); // 0-11
  const gregorianDay = date.getDate();
  
  // Hardcode penanggalan Hijriah yang benar untuk bulan Maret 2024 dan 2025
  // Berdasarkan kalender Hijriah resmi
  if (gregorianYear === 2024 && gregorianMonth === 2) { // Maret = 2 (0-indexed)
    // Pemetaan tanggal Masehi ke Hijriah untuk bulan Maret 2024
    const hijriDates: Record<number, string> = {
      1: "20 Sya'ban 1445",
      2: "21 Sya'ban 1445",
      3: "22 Sya'ban 1445",
      4: "23 Sya'ban 1445",
      5: "24 Sya'ban 1445",
      6: "25 Sya'ban 1445",
      7: "26 Sya'ban 1445",
      8: "27 Sya'ban 1445",
      9: "28 Sya'ban 1445",
      10: "29 Sya'ban 1445",
      11: "1 Ramadan 1445",
      12: "2 Ramadan 1445",
      13: "3 Ramadan 1445",
      14: "4 Ramadan 1445",
      15: "5 Ramadan 1445",
      16: "6 Ramadan 1445",
      17: "7 Ramadan 1445",
      18: "8 Ramadan 1445",
      19: "9 Ramadan 1445",
      20: "10 Ramadan 1445",
      21: "11 Ramadan 1445",
      22: "12 Ramadan 1445",
      23: "13 Ramadan 1445",
      24: "14 Ramadan 1445",
      25: "15 Ramadan 1445",
      26: "16 Ramadan 1445",
      27: "17 Ramadan 1445",
      28: "18 Ramadan 1445",
      29: "19 Ramadan 1445",
      30: "20 Ramadan 1445",
      31: "21 Ramadan 1445"
    };
    
    // Jika tanggal ada dalam pemetaan, gunakan nilai yang sudah ditentukan
    if (hijriDates[gregorianDay]) {
      return `${hijriDates[gregorianDay]} H`;
    }
  } else if (gregorianYear === 2025 && gregorianMonth === 2) { // Maret 2025
    // Pemetaan tanggal Masehi ke Hijriah untuk bulan Maret 2025
    // Berdasarkan API UNISA Yogyakarta
    const hijriDates: Record<number, string> = {
      1: "1 Ramadhan 1446",
      2: "2 Ramadhan 1446",
      3: "3 Ramadhan 1446",
      4: "4 Ramadhan 1446",
      5: "5 Ramadhan 1446",
      6: "6 Ramadhan 1446",
      7: "7 Ramadhan 1446",
      8: "8 Ramadhan 1446",
      9: "9 Ramadhan 1446",
      10: "10 Ramadhan 1446",
      11: "11 Ramadhan 1446",
      12: "12 Ramadhan 1446",
      13: "13 Ramadhan 1446",
      14: "14 Ramadhan 1446",
      15: "15 Ramadhan 1446",
      16: "16 Ramadhan 1446",
      17: "17 Ramadhan 1446",
      18: "18 Ramadhan 1446",
      19: "19 Ramadhan 1446",
      20: "20 Ramadhan 1446",
      21: "21 Ramadhan 1446",
      22: "22 Ramadhan 1446",
      23: "23 Ramadhan 1446",
      24: "24 Ramadhan 1446",
      25: "25 Ramadhan 1446",
      26: "26 Ramadhan 1446",
      27: "27 Ramadhan 1446",
      28: "28 Ramadhan 1446",
      29: "29 Ramadhan 1446",
      30: "30 Ramadhan 1446",
      31: "1 Syawal 1446"
    };
    
    // Jika tanggal ada dalam pemetaan, gunakan nilai yang sudah ditentukan
    if (hijriDates[gregorianDay]) {
      return `${hijriDates[gregorianDay]} H`;
    }
  }
  
  // Jika tidak ada dalam pemetaan hardcode, gunakan library HijriDate
  // dengan koreksi manual
  const hijriDate = new HijriDate(date);
  
  // Pastikan nilai yang didapat valid
  const day = hijriDate.getDate() || 1;
  const month = hijriDate.getMonth() >= 0 ? hijriDate.getMonth() : 0;
  const year = hijriDate.getFullYear() || 1445;
  
  const months = [
    "Muharram",
    "Safar",
    "Rabiul Awal",
    "Rabiul Akhir",
    "Jumadil Awal",
    "Jumadil Akhir",
    "Rajab",
    "Syaban",
    "Ramadan",
    "Syawal",
    "Dzulkaidah",
    "Dzulhijjah",
  ];
  
  // Koreksi default untuk library HijriDate
  // Biasanya library ini bisa off by 1-2 hari
  const hijriCorrection = -1;
  
  let correctedDay = day + hijriCorrection;
  let correctedMonth = month;
  let correctedYear = year;
  
  // Jika koreksi menyebabkan hari menjadi 0 atau negatif, sesuaikan bulan
  if (correctedDay <= 0) {
    correctedMonth -= 1;
    
    // Jika bulan menjadi negatif, sesuaikan tahun
    if (correctedMonth < 0) {
      correctedMonth = 11; // Dzulhijjah
      correctedYear -= 1;
    }
    
    // Jumlah hari dalam bulan Hijriah (perkiraan sederhana)
    // Dalam kalender Hijriah, bulan bisa 29 atau 30 hari
    // Untuk sederhananya, kita gunakan 30 hari
    correctedDay = 30 + correctedDay;
  }
  
  return `${correctedDay} ${months[correctedMonth]} ${correctedYear} H`;
}, undefined, 60000);

// Komponen untuk menampilkan jam realtime
const RealtimeClock = React.memo(({ currentTime, formatCurrentTime }: { 
  currentTime: Date; 
  formatCurrentTime: (date: Date) => string 
}) => {
  return (
    <div className="flex items-center justify-center gap-1 mb-1">
      <Clock className="h-4 w-4 text-primary" />
      <h2 className="text-2xl font-bold">{formatCurrentTime(currentTime)}</h2>
    </div>
  );
});
RealtimeClock.displayName = "RealtimeClock";

export default function AdzanCountdown() {
  // Mencegah clickjacking
  useEffect(() => {
    setupFrameProtection();
  }, []);

  // Ref untuk menyimpan interval ID
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date())
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null)
  const [timeOffset, setTimeOffset] = useState<number>(0)
  const [isTimeSynced, setIsTimeSynced] = useState<boolean>(false)
  const [location, setLocation] = useState<LocationState>({
    city: "Jakarta Selatan",
    cityId: "jakartaselatan",
    isLoading: false,
    error: null
  })
  const [isAutoDetect, setIsAutoDetect] = useState<boolean>(false)
  const [cities, setCities] = useState<City[]>([])
  const [timezoneOffset, setTimezoneOffset] = useState<number>(7) // Default ke WIB (GMT+7)
  const [hijriDate, setHijriDate] = useState<string>("") // State untuk tanggal Hijriah
  const { theme, setTheme } = useTheme()

  // Ambil daftar kota saat komponen dimuat
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesData = await getCities();
        setCities(citiesData);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  // Deteksi lokasi pengguna berdasarkan IP - dengan throttle untuk mengurangi permintaan API
  useEffect(() => {
    if (!isAutoDetect || cities.length === 0) return; // Skip jika mode manual dipilih atau daftar kota belum tersedia
    
    const detectUserLocationByIP = async () => {
      try {
        console.log("Memulai deteksi lokasi berdasarkan IP...")
        
        // Coba beberapa API lokasi secara berurutan
        const locationApis = [
          {
            url: 'https://ipapi.co/json/',
            handler: (data: any) => {
              if (data && data.city) {
                return {
                  city: data.city
                };
              }
              return null;
            }
          },
          {
            url: 'https://ipwho.is/',
            handler: (data: any) => {
              if (data && data.success && data.city) {
                return {
                  city: data.city
                };
              }
              return null;
            }
          },
          {
            url: 'https://ipinfo.io/json',
            handler: (data: any) => {
              if (data && data.city) {
                return {
                  city: data.city
                };
              }
              return null;
            }
          }
        ];
        
        // Coba setiap API secara berurutan
        for (const api of locationApis) {
          try {
            console.log(`Mencoba API lokasi: ${api.url}`);
            const response = await axios.get(api.url, {
              timeout: 8000, // Timeout 8 detik
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            const locationData = api.handler(response.data);
            
            if (locationData) {
              const { city } = locationData;
              console.log(`Lokasi terdeteksi: ${city}`);
              
              // Cari kota yang cocok dalam daftar kota
              const cityName = sanitizeInput(city);
              const matchedCity = cities.find(c => 
                c.name.toLowerCase().includes(cityName.toLowerCase()) || 
                cityName.toLowerCase().includes(c.name.toLowerCase())
              );
              
              if (matchedCity) {
                setLocation({
                  city: matchedCity.name,
                  cityId: matchedCity.id,
                  isLoading: false,
                  error: null
                });
                return;
              } else {
                // Jika tidak ditemukan, gunakan Jakarta Selatan sebagai default
                const defaultCity = cities.find(c => c.id === "jakartaselatan") || cities[0];
                setLocation({
                  city: defaultCity.name,
                  cityId: defaultCity.id,
                  isLoading: false,
                  error: `Lokasi ${cityName} tidak ditemukan. Menggunakan ${defaultCity.name} sebagai default.`
                });
                return;
              }
            }
          } catch (error) {
            console.error(`Error mendapatkan lokasi dari ${api.url}:`, error);
            // Lanjut ke API berikutnya
          }
        }
        
        // Jika semua API gagal, gunakan lokasi default
        throw new Error("Semua API lokasi gagal");
      } catch (error) {
        console.error("Error mendapatkan lokasi:", error);
        
        // Gunakan Jakarta Selatan sebagai default
        const defaultCity = cities.find(c => c.id === "jakartaselatan") || cities[0];
        if (defaultCity) {
          setLocation({
            city: defaultCity.name,
            cityId: defaultCity.id,
            isLoading: false,
            error: "Gagal mendapatkan lokasi. Menggunakan lokasi default."
          });
        }
      }
    };

    // Gunakan throttle untuk membatasi permintaan API
    const throttledDetectLocation = throttle(detectUserLocationByIP, 10000);
    throttledDetectLocation();
  }, [isAutoDetect, cities]);

  // Fungsi untuk mengubah lokasi secara manual
  const handleCityChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = event.target.value;
    
    if (cityId === "auto") {
      setIsAutoDetect(true);
      setLocation(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));
      return;
    }
    
    setIsAutoDetect(false);
    
    const selectedCity = cities.find(city => city.id === cityId);
    
    if (selectedCity) {
      setLocation({
        city: selectedCity.name,
        cityId: selectedCity.id,
        isLoading: false,
        error: null
      });
    }
  }, [cities]);

  // Sinkronisasi dengan server waktu
  useEffect(() => {
    const syncWithTimeServer = async () => {
      try {
        const offset = await getTimeOffset();
        setTimeOffset(offset);
        setIsTimeSynced(true);
        console.log(`Offset waktu: ${offset}ms`);
      } catch (error) {
        console.error('Gagal sinkronisasi dengan server waktu:', error);
      }
    };

    syncWithTimeServer();
    
    // Sinkronisasi ulang setiap jam
    const interval = setInterval(syncWithTimeServer, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Update waktu saat ini
  useEffect(() => {
    console.log("Setting up time update interval");
    
    const updateCurrentTime = () => {
      // Dapatkan waktu saat ini
      const now = new Date();
      
      // Jika menggunakan sinkronisasi waktu server
      const syncedTime = isTimeSynced ? getCorrectedTime(timeOffset) : now;
      
      // Sesuaikan waktu berdasarkan zona waktu kota yang dipilih
      const localTime = new Date(syncedTime);
      
      // Dapatkan offset zona waktu lokal pengguna (dalam menit)
      const userTimezoneOffsetMinutes = localTime.getTimezoneOffset();
      
      // Konversi ke UTC
      const utcTime = new Date(localTime.getTime() + userTimezoneOffsetMinutes * 60 * 1000);
      
      // Konversi ke zona waktu kota yang dipilih (dalam jam)
      const cityTime = new Date(utcTime.getTime() + timezoneOffset * 60 * 60 * 1000);
      
      // Perbarui state waktu saat ini
      setCurrentTime(cityTime);
    };
    
    // Update pertama kali
    updateCurrentTime();
    
    // Bersihkan interval sebelumnya jika ada
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    
    // Update setiap detik
    timeIntervalRef.current = setInterval(updateCurrentTime, 1000);
    console.log("Time update interval set with ID:", timeIntervalRef.current);
    
    return () => {
      if (timeIntervalRef.current) {
        console.log("Clearing time update interval:", timeIntervalRef.current);
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    };
  }, [timeOffset, isTimeSynced, timezoneOffset]);

  // Update zona waktu saat lokasi berubah
  useEffect(() => {
    if (location.cityId) {
      const newTimezoneOffset = getTimezoneOffset(location.cityId);
      setTimezoneOffset(newTimezoneOffset);
    }
  }, [location.cityId]);

  // Ambil jadwal sholat saat lokasi berubah
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      if (location.isLoading || !location.cityId) return;
      
      try {
        // Gunakan fungsi baru yang mengambil data langsung dari API
        const todayPrayerTimes = await getTodayPrayerTimesFromAPI(location.cityId);
        
        if (todayPrayerTimes) {
          setPrayerTimes(todayPrayerTimes);
        } else {
          // Jika gagal mengambil dari API, gunakan fungsi lama sebagai fallback
          console.log('Fallback to cached prayer times');
          const cachedPrayerTimes = await getTodayPrayerTimes(location.cityId);
          setPrayerTimes(cachedPrayerTimes);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        
        // Jika terjadi kesalahan, gunakan fungsi lama sebagai fallback
        try {
          console.log('Fallback to cached prayer times after error');
          const cachedPrayerTimes = await getTodayPrayerTimes(location.cityId);
          setPrayerTimes(cachedPrayerTimes);
        } catch (fallbackError) {
          console.error('Error fetching fallback prayer times:', fallbackError);
        }
      }
    };
    
    fetchPrayerTimes();
  }, [location.cityId, location.isLoading]);

  // Calculate next prayer time
  useEffect(() => {
    const calculateNextPrayer = () => {
      if (!prayerTimes) return;

      // Dapatkan waktu saat ini dengan zona waktu yang sesuai
      const now = isTimeSynced ? getCorrectedTime(timeOffset) : new Date();
      
      // Sesuaikan waktu berdasarkan zona waktu kota yang dipilih
      const localTime = new Date(now);
      const userTimezoneOffsetMinutes = now.getTimezoneOffset();
      const utcTime = new Date(localTime.getTime() + userTimezoneOffsetMinutes * 60 * 1000);
      const cityTime = new Date(utcTime.getTime() + timezoneOffset * 60 * 60 * 1000);
      
      // Dapatkan waktu sholat berikutnya dengan menyesuaikan zona waktu
      // Gunakan langsung fungsi getNextPrayer dengan parameter timezoneOffset
      let next = getNextPrayer(prayerTimes, timezoneOffset);
      
      // Jika tidak ada waktu sholat berikutnya hari ini, ambil waktu Subuh besok
      if (!next) {
        // Buat tanggal untuk besok
        const tomorrow = new Date(cityTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Untuk sementara, gunakan waktu Subuh dari data hari ini
        // Dalam implementasi sebenarnya, kita perlu mengambil data untuk besok
        const tomorrowDate = new Date(prayerTimes.tanggal);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        
        next = {
          name: "Subuh",
          time: timeStringToDate(prayerTimes.shubuh, tomorrowDate, timezoneOffset)
        };
      }
      
      setNextPrayer(next);
    };

    calculateNextPrayer();
    
    // Update setiap menit
    const interval = setInterval(calculateNextPrayer, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [prayerTimes, timeOffset, isTimeSynced, timezoneOffset]);

  // Calculate time remaining to next prayer
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!nextPrayer) return;
      
      // Dapatkan waktu saat ini dengan zona waktu yang sesuai
      const now = isTimeSynced ? getCorrectedTime(timeOffset) : new Date();
      
      // Sesuaikan waktu berdasarkan zona waktu kota yang dipilih
      const localTime = new Date(now);
      const userTimezoneOffsetMinutes = now.getTimezoneOffset();
      const utcTime = new Date(localTime.getTime() + userTimezoneOffsetMinutes * 60 * 1000);
      const cityTime = new Date(utcTime.getTime() + timezoneOffset * 60 * 60 * 1000);
      
      const diff = nextPrayer.time.getTime() - cityTime.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("Waktu Sholat Tiba");
        return;
      }
      
      // Konversi ke jam, menit, detik
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Format string waktu tersisa
      let timeString = "";
      
      if (hours > 0) {
        timeString += `${hours} jam `;
      }
      
      if (minutes > 0 || hours > 0) {
        timeString += `${minutes} menit `;
      }
      
      timeString += `${seconds} detik`;
      
      setTimeRemaining(timeString);
    };

    // Hitung pertama kali
    calculateTimeRemaining();
    
    // Update setiap detik
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [nextPrayer, timeOffset, isTimeSynced, timezoneOffset]);

  // Gunakan fungsi memoized untuk format waktu
  const formatTime = useCallback((timeStr: string) => {
    // Waktu dari API sudah dalam zona waktu lokal, jadi tidak perlu penyesuaian tambahan
    const date = timeStringToDate(timeStr);
    return formatTimeMemoized(date, false);
  }, []);

  // Fungsi untuk format waktu saat ini (tidak menggunakan memoize untuk waktu yang selalu berubah)
  const formatCurrentTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }, []);

  // Gunakan fungsi memoized untuk format tanggal
  const formatDate = useCallback((date: Date) => {
    return formatDateMemoized(date);
  }, []);

  // Gunakan fungsi memoized untuk format tanggal Hijriah
  const formatHijriDate = useCallback((date: Date) => {
    return formatHijriDateMemoized(date);
  }, []);

  // Ambil tanggal Hijriah dari API
  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        console.log(`[DEBUG] Calling getHijriDate with currentTime:`, currentTime);
        // Gunakan currentTime yang sudah disesuaikan dengan zona waktu
        const hijri = await getHijriDate(currentTime);
        console.log(`[DEBUG] getHijriDate result:`, hijri);
        if (hijri) {
          console.log(`[DEBUG] Setting hijriDate state to:`, hijri);
          setHijriDate(hijri);
        } else {
          // Jika API gagal, gunakan fungsi formatHijriDateMemoized sebagai fallback
          const fallbackDate = formatHijriDateMemoized(currentTime);
          console.log(`[DEBUG] API failed, using fallback:`, fallbackDate);
          setHijriDate(fallbackDate);
        }
      } catch (error) {
        console.error('Error fetching Hijri date:', error);
        // Gunakan fungsi formatHijriDateMemoized sebagai fallback
        const fallbackDate = formatHijriDateMemoized(currentTime);
        console.log(`[DEBUG] Error caught, using fallback:`, fallbackDate);
        setHijriDate(fallbackDate);
      }
    };

    // Gunakan debounce untuk mengurangi jumlah permintaan API
    // ketika currentTime berubah dengan cepat
    const debouncedFetchHijriDate = debounce(fetchHijriDate, 1000);
    
    // Panggil fungsi fetchHijriDate
    debouncedFetchHijriDate();
    
    // Cleanup function
    return () => {
      // Tidak perlu melakukan apa-apa karena debounce dari lib/performance
      // mungkin tidak memiliki metode cancel
    };
  }, [currentTime]);

  // Toggle theme dengan debounce untuk menghindari multiple calls
  const toggleTheme = useCallback(
    debounce(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    }, 300),
    [theme, setTheme]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-2">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-3 px-4 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <CardTitle className="text-center text-xl font-bold">
              {location.isLoading ? "Mendeteksi Lokasi..." : `Jadwal Sholat ${location.city}`}
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          >
            {theme === "dark" ? 
              <Sun className="h-4 w-4" /> : 
              <Moon className="h-4 w-4" />
            }
          </Button>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-0.5">{formatDate(currentTime)}</p>
            <p className="text-muted-foreground text-sm mb-1">{hijriDate}</p>
            <RealtimeClock currentTime={currentTime} formatCurrentTime={formatCurrentTime} />
            <p className="text-xs text-muted-foreground">
              Waktu Indonesia ({timezoneOffset === 7 ? "WIB" : timezoneOffset === 8 ? "WITA" : "WIT"}/GMT+{timezoneOffset})
            </p>
          </div>

          {nextPrayer && (
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Waktu {nextPrayer.name} dalam</p>
              <p className="font-bold text-primary">{timeRemaining}</p>
            </div>
          )}

          {/* Pemilihan Kota */}
          <div className="bg-muted/50 rounded-lg p-2">
            <label htmlFor="city-select" className="block text-xs text-muted-foreground mb-1">
              Pilih Wilayah:
            </label>
            <select
              id="city-select"
              className="w-full p-2 rounded-md bg-background border border-input text-sm"
              value={isAutoDetect ? "auto" : location.cityId}
              onChange={handleCityChange}
              aria-label="Pilih wilayah untuk jadwal sholat"
            >
              <option value="auto">Deteksi Otomatis</option>
              <optgroup label="Kota-kota di Indonesia">
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {location.error && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-center text-sm text-amber-800">
              {location.error}
            </div>
          )}

          {location.isLoading && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center text-sm text-blue-800">
              Mendeteksi lokasi Anda berdasarkan IP...
            </div>
          )}

          {/* Jadwal Sholat Hari Ini */}
          <div>
            <h3 className="text-center font-semibold mb-2">Jadwal Sholat Hari Ini</h3>
            <div className="grid grid-cols-5 gap-1 text-center">
              <div className="text-xs">
                <p className="text-primary text-xs font-medium mb-0.5">Subuh</p>
                <p className="font-bold">{prayerTimes ? formatTime(prayerTimes.shubuh) : "--:--"}</p>
              </div>
              <div className="text-xs">
                <p className="text-primary text-xs font-medium mb-0.5">Dzuhur</p>
                <p className="font-bold">{prayerTimes ? formatTime(prayerTimes.dzuhur) : "--:--"}</p>
              </div>
              <div className="text-xs">
                <p className="text-primary text-xs font-medium mb-0.5">Ashar</p>
                <p className="font-bold">{prayerTimes ? formatTime(prayerTimes.ashr) : "--:--"}</p>
              </div>
              <div className="text-xs">
                <p className="text-primary text-xs font-medium mb-0.5">Maghrib</p>
                <p className="font-bold">{prayerTimes ? formatTime(prayerTimes.magrib) : "--:--"}</p>
              </div>
              <div className="text-xs">
                <p className="text-primary text-xs font-medium mb-0.5">Isya</p>
                <p className="font-bold">{prayerTimes ? formatTime(prayerTimes.isya) : "--:--"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


