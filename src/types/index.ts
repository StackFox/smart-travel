export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  price: number;
  coordinates: Coordinates;
  image: string;
  description: string;
  tags: string[];
  rating: number;
  reviews: number;
}

export interface ItineraryItem {
  id: string;
  destinationId: string;
  activityTime: string;
  activityName: string;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  items: ItineraryItem[];
  comment?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface UserProfile {
  name: string;
  budgetCap: number;
  address: string;
}
