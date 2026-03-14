import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTravelStore } from '../../store/useTravelStore';

export const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTravelStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-12 h-6 rounded-full bg-teal-100 dark:bg-slate-700 transition-colors duration-400 flex items-center p-0.5 cursor-pointer shadow-inner"
      aria-label="Toggle dark mode"
    >
      <motion.div
        layout
        className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center"
        animate={{ x: darkMode ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <motion.div
          key={darkMode ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {darkMode ? (
            <Moon size={10} className="text-teal-400" />
          ) : (
            <Sun size={10} className="text-orange-500" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
};
