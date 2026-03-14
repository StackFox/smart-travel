import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, MapPin, Wallet, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTravelStore } from '../store/useTravelStore';

export const Welcome = () => {
  const [name, setName] = useState('');
  const [budgetCap, setBudgetInput] = useState('50000');
  const [address, setAddress] = useState('');
  const { setUserProfile, setBudgetCap: setStoreBudget } = useTravelStore();
  const navigate = useNavigate();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const cap = parseFloat(budgetCap) || 50000;
    setUserProfile({ name, budgetCap: cap, address });
    setStoreBudget(cap);
    navigate('/');
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-[var(--color-bg)] dark:bg-[var(--color-bg-dark)] p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-400/15 dark:bg-orange-600/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0], y: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card max-w-md w-full p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="text-center mb-8 relative z-10">
          <motion.div
            initial={{ rotate: -12 }}
            animate={{ rotate: [-12, 0, -12] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-linear-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-xl shadow-teal-500/25 flex items-center justify-center mx-auto mb-6"
          >
            <Plane size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Smart Travel
          </h1>
          <p className="text-slate-500 font-medium flex items-center justify-center gap-1">
            <Sparkles size={14} className="text-orange-500" />
            Let's personalize your journey
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1.5"
          >
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Sparkles size={14} className="text-teal-500" /> What should we call you?
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1.5"
          >
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <MapPin size={14} className="text-orange-500" /> Where are you from?
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Mumbai, India"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-1.5"
          >
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Wallet size={14} className="text-emerald-500" /> Max budget (₹)?
            </label>
            <input
              type="number"
              min="0"
              required
              value={budgetCap}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 btn-primary rounded-xl text-lg"
          >
            Start Planning ✈️
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
