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
