declare module 'adhan' {
  export class Coordinates {
    constructor(latitude: number, longitude: number);
    latitude: number;
    longitude: number;
  }

  export class PrayerTimes {
    constructor(coordinates: Coordinates, date: Date, params: CalculationParameters);
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
    nextFajr: Date;
  }

  export interface CalculationParameters {
    method: CalculationMethod;
    fajrAngle: number;
    ishaAngle: number;
    ishaInterval: number;
    madhab: Madhab;
    highLatitudeRule: HighLatitudeRule;
    adjustments: { [key: string]: number };
  }

  export class CalculationMethod {
    static MuslimWorldLeague(): CalculationParameters;
    static Egyptian(): CalculationParameters;
    static Karachi(): CalculationParameters;
    static UmmAlQura(): CalculationParameters;
    static Dubai(): CalculationParameters;
    static MoonsightingCommittee(): CalculationParameters;
    static NorthAmerica(): CalculationParameters;
    static Kuwait(): CalculationParameters;
    static Qatar(): CalculationParameters;
    static Singapore(): CalculationParameters;
    static Tehran(): CalculationParameters;
    static Turkey(): CalculationParameters;
    static Other(): CalculationParameters;
  }

  export enum Madhab {
    Shafi,
    Hanafi
  }

  export enum HighLatitudeRule {
    MiddleOfTheNight,
    SeventhOfTheNight,
    TwilightAngle
  }
} 