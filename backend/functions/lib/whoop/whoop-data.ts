export interface WhoopData {
  today: DailyWhoopData;
  yesterday: DailyWhoopData;
}

export interface DailyWhoopData {
  id: number;
  date: string;
  recoveryScore: number;
  sleepScore: number;
  strainScore: number;
}
