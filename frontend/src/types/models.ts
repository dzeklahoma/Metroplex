export type Role = "USER" | "EDITOR" | "ADMIN";

export type User = {
  id: number;
  email: string;
  role: Role;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Trip = {
  id: number;
  destination: string;
  daysCount: number;
  budget?: number | null;
  interests: string;
  createdAt: string;
  startDate: string;
  weatherDailyJson?: DayWeather[] | null;
};

export type PlannedActivity = {
  id: number;
  dayPlanId: number;
  activityId: number;
  orderIndex: number;
  activity?: {
    id: number;
    name: string;
    type: string;
    cost?: number | null;
    durationMin?: number | null;
    destination?: string;
  } | null;
};

export type DayPlan = {
  id: number;
  dayNumber: number;
  plannedActivities: PlannedActivity[];
};

export type TripDetails = Trip & {
  dayPlans: DayPlan[];
};

export type Activity = {
  id: number;
  destination: string;
  name: string;
  type: string;
  priceLevel: number;
  durationHours: number;
};

export type CreateTripInput = {
  destination: string;
  daysCount: number;
  interests: string;
  startDate: string; // required by backend schema
  budget?: number | null; // optional
};

export type DayWeather = {
  date: string; // YYYY-MM-DD
  precipitationProbability?: number;
  precipitationMm?: number;

  tempMinC?: number;
  tempMaxC?: number;
  weatherCode?: number;
};
