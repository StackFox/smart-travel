import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './pages/Home';
import { Itinerary } from './pages/Itinerary';
import { Map } from './pages/Map';
import { Budget } from './pages/Budget';
import { Welcome } from './pages/Welcome';
import { Chatbot } from './components/chat/Chatbot';
import { useTravelStore } from './store/useTravelStore';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/map" element={<Map />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const { userProfile } = useTravelStore();

  if (!userProfile) {
    return (
      <Routes>
        <Route path="*" element={<Welcome />} />
      </Routes>
    );
  }

  return (
    <>
      <AnimatedRoutes />
      <BottomNav />
      <Chatbot />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-svh bg-[var(--color-bg)] dark:bg-[var(--color-bg-dark)] font-sans pb-20 md:pb-0 md:pl-20 selection:bg-teal-500/30 transition-colors duration-400">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
