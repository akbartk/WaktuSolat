const axios = require('axios');

async function testHijriAPI() {
  try {
    const date = new Date(2025, 2, 2); // 2 Maret 2025
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // JavaScript bulan dimulai dari 0
    const day = date.getDate().toString().padStart(2, '0');
    
    console.log(`Testing API for date: ${year}-${month}-${day}`);
    
    const url = `https://service.unisayogya.ac.id/kalender/api/masehi2hijriah/muhammadiyah/${year}/${month}/${day}`;
    console.log(`API URL: ${url}`);
    
    const response = await axios.get(url);
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data) {
      const data = response.data;
      const hijriDate = `${data.tanggal} ${data.namabulan} ${data.tahun} H`;
      console.log(`Formatted Hijri date: ${hijriDate}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testHijriAPI(); 