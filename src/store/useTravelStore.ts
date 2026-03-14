import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Destination, DayPlan, ItineraryItem, UserProfile, Expense } from '../types';

interface TravelState {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // User
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;

  // Budget
  budgetCap: number;
  setBudgetCap: (cap: number) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;

  // Destinations
  selectedDestinations: Destination[];
  addDestination: (dest: Destination) => void;
  removeDestination: (id: string) => void;

  // Itinerary
  itinerary: DayPlan[];
  updateItinerary: (newItinerary: DayPlan[]) => void;
  updateDayComment: (dayId: string, comment: string) => void;
  unassignedActivities: ItineraryItem[];
  updateUnassignedActivities: (activities: ItineraryItem[]) => void;
  addDay: () => void;

  // Computed
  getTotalBudget: () => number;
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: next };
        }),

      // User
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),

      // Budget
      budgetCap: 50000,
      setBudgetCap: (cap) => set({ budgetCap: cap }),

      // Expenses
      expenses: [],
      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),
      removeExpense: (id) =>
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

      // Destinations
      selectedDestinations: [],
      addDestination: (dest) =>
        set((state) => {
          if (state.selectedDestinations.find((d) => d.id === dest.id))
            return state;
          const newActivities: ItineraryItem[] = [
            {
              id: `flight-${dest.id}-${Date.now()}`,
              destinationId: dest.id,
              activityTime: '08:00 AM',
              activityName: `Flight to ${dest.name}`,
            },
            {
              id: `checkin-${dest.id}-${Date.now()}`,
              destinationId: dest.id,
              activityTime: '02:00 PM',
              activityName: `Hotel in ${dest.name}`,
            },
            {
              id: `sightsee-${dest.id}-${Date.now()}`,
              destinationId: dest.id,
              activityTime: '10:00 AM',
              activityName: `Sightseeing in ${dest.name}`,
            },
          ];
          return {
            selectedDestinations: [...state.selectedDestinations, dest],
            unassignedActivities: [
              ...state.unassignedActivities,
              ...newActivities,
            ],
          };
        }),
      removeDestination: (id) =>
        set((state) => ({
          selectedDestinations: state.selectedDestinations.filter(
            (d) => d.id !== id
          ),
          unassignedActivities: state.unassignedActivities.filter(
            (a) => a.destinationId !== id
          ),
          itinerary: state.itinerary.map((day) => ({
            ...day,
            items: day.items.filter((item) => item.destinationId !== id),
          })),
        })),

      // Itinerary
      itinerary: [{ id: 'day-1', dayNumber: 1, items: [] }],
      updateItinerary: (newItinerary) => set({ itinerary: newItinerary }),
      updateDayComment: (dayId, comment) =>
        set((state) => ({
          itinerary: state.itinerary.map((day) =>
            day.id === dayId ? { ...day, comment } : day
          ),
        })),
      unassignedActivities: [],
      updateUnassignedActivities: (activities) =>
        set({ unassignedActivities: activities }),
      addDay: () =>
        set((state) => ({
          itinerary: [
            ...state.itinerary,
            {
              id: `day-${state.itinerary.length + 1}`,
              dayNumber: state.itinerary.length + 1,
              items: [],
            },
          ],
        })),

      // Computed
      getTotalBudget: () => {
        const state = get();
        const destTotal = state.selectedDestinations.reduce(
          (acc, dest) => acc + dest.price,
          0
        );
        const expenseTotal = state.expenses.reduce(
          (acc, e) => acc + e.amount,
          0
        );
        return destTotal + expenseTotal;
      },
    }),
    {
      name: 'travel-storage',
      onRehydrateStorage: () => (state) => {
        // Apply dark mode class on rehydrate
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);
