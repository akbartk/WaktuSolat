declare module 'hijri-date/lib/safe' {
  class HijriDate {
    constructor(date?: Date);
    getDate(): number;
    getMonth(): number;
    getFullYear(): number;
    getDay(): number;
  }
  export default HijriDate;
} 