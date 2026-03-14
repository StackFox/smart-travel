import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DestinationCard } from './DestinationCard';
import { mockDestinations } from '../../data/mockData';
import { useTravelStore } from '../../store/useTravelStore';
import { Search, X } from 'lucide-react';

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kochi: { lat: 9.9312, lng: 76.2673 },
};

function getDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

export const StackedCardsContainer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { userProfile } = useTravelStore();

  const filteredAndSortedCards = useMemo(() => {
    let result = [...mockDestinations];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(lower) ||
          d.country.toLowerCase().includes(lower) ||
          d.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    if (userProfile?.address && !searchTerm) {
      const addrLower = userProfile.address.toLowerCase();
      const matchedCity = Object.keys(CITY_COORDS).find((city) =>
        addrLower.includes(city)
      );
      if (matchedCity) {
        const userCoords = CITY_COORDS[matchedCity];
        result.sort(
          (a, b) =>
            getDistance(userCoords, a.coordinates) -
            getDistance(userCoords, b.coordinates)
        );
      }
    }

    return result;
  }, [searchTerm, userProfile?.address]);

  const [cards, setCards] = useState(filteredAndSortedCards);

  useEffect(() => {
    setCards(filteredAndSortedCards);
  }, [filteredAndSortedCards]);

  const handleSwipe = () => {
    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const newCards = [...prev];
      const item = newCards.shift();
      if (item) newCards.push(item);
      return newCards;
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm md:max-w-lg lg:max-w-xl px-6 mb-6 relative z-20"
      >
        <div className="relative group">
          <input
            type="text"
            placeholder="Search destinations, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-11 pr-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-teal-100/50 dark:border-slate-700 shadow-sm focus:shadow-lg focus:shadow-teal-500/10 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm font-medium"
          />
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors"
          />
          {searchTerm && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="relative w-full max-w-sm md:max-w-lg lg:max-w-xl h-[55svh] md:h-[65svh] lg:h-[70svh] flex justify-center items-center transition-all">
        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-400 text-center"
          >
            <p className="text-lg mb-1">No destinations found</p>
            <p className="text-sm">Try a different search term</p>
          </motion.div>
        ) : (
          <>
            {cards.map((dest, i) => (
              <DestinationCard
                key={dest.id + '-' + i}
                dest={dest}
                index={i}
                totalCards={cards.length}
                onSwipe={handleSwipe}
              />
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-14 text-slate-400 text-xs text-center"
            >
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                Swipe to explore ↔
              </motion.span>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
