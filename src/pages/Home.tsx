import { motion } from 'framer-motion';
import { StackedCardsContainer } from '../components/cards/StackedCardsContainer';
import { useTravelStore } from '../store/useTravelStore';

export const Home = () => {
  const { userProfile } = useTravelStore();

  return (
    <div className="w-full h-svh flex flex-col justify-center items-center overflow-hidden bg-[var(--color-bg)] dark:bg-[var(--color-bg-dark)] pb-20 md:pb-0 relative">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-teal-400/10 dark:bg-teal-600/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-1/4 w-56 h-56 bg-orange-400/10 dark:bg-orange-600/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8 left-0 right-0 z-10 px-6 max-w-sm mx-auto md:max-w-xl pointer-events-none flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-1 pointer-events-auto">
            Discover
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide text-sm">
            Welcome{userProfile?.name ? `, ${userProfile.name}` : ''} 👋
          </p>
        </div>
      </motion.div>

      <StackedCardsContainer />
    </div>
  );
};
