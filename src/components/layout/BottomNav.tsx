import { NavLink } from 'react-router-dom';
import { Compass, CalendarDays, Map as MapIcon, Wallet, LogOut } from 'lucide-react';
import { useTravelStore } from '../../store/useTravelStore';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Compass, label: 'Discover', path: '/' },
  { icon: CalendarDays, label: 'Itinerary', path: '/itinerary' },
  { icon: MapIcon, label: 'Map', path: '/map' },
  { icon: Wallet, label: 'Budget', path: '/budget' },
];

export const BottomNav = () => {
  const { setUserProfile, setBudgetCap } = useTravelStore();

  const handleLogout = () => {
    setUserProfile(null);
    setBudgetCap(50000);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-teal-100/30 dark:border-slate-800 md:top-0 md:bottom-0 md:w-20 md:border-t-0 md:border-r md:flex md:flex-col md:justify-between">
      <div className="flex justify-between items-center px-4 py-2 pb-6 md:pb-6 md:pt-6 md:flex-col md:gap-4 w-full md:h-full">
        {/* Logo + Theme for desktop */}
        <div className="hidden md:flex flex-col items-center gap-3 mb-2">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <Compass size={28} className="text-teal-500" />
          </motion.div>
          <ThemeToggle />
        </div>

        {/* Mobile theme toggle */}
        <div className="md:hidden absolute -top-14 left-4">
          <ThemeToggle />
        </div>

        <div className="flex justify-between w-full md:flex-col md:gap-4 flex-1 md:justify-center">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all duration-300 relative group ${
                  isActive
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-1 md:-right-3 w-8 h-1 md:w-1 md:h-8 bg-teal-500 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                  <span className="text-[9px] font-medium tracking-wider uppercase">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="hidden md:flex flex-col items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors"
        >
          <LogOut size={20} strokeWidth={2} />
          <span className="text-[9px] font-medium tracking-wider uppercase">Exit</span>
        </motion.button>
      </div>
    </nav>
  );
};
