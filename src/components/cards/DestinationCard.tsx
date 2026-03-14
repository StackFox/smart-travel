import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Plus, Check, Star, IndianRupee } from 'lucide-react';
import type { Destination } from '../../types';
import { useTravelStore } from '../../store/useTravelStore';

interface DestinationCardProps {
  dest: Destination;
  index: number;
  totalCards: number;
  onSwipe: () => void;
}

export const DestinationCard = ({ dest, index, totalCards, onSwipe }: DestinationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const { addDestination, selectedDestinations } = useTravelStore();

  const isSelected = selectedDestinations.some(d => d.id === dest.id);

  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-12, 12]);
  const opacity = useTransform(dragX, [-200, -100, 100, 200], [0, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe();
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      addDestination(dest);
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing origin-bottom"
      style={{
        x: dragX,
        rotate,
        opacity,
        zIndex: totalCards - index,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{
        scale: 1 - index * 0.04,
        y: index * 16,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl group transition-all border border-white/20 dark:border-white/5">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={dest.image}
            alt={dest.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Price Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"
        >
          <IndianRupee size={13} className="text-teal-600 dark:text-teal-400" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {dest.price.toLocaleString('en-IN')}
          </span>
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end">
          <div className="flex justify-between items-end mb-3 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-teal-300 text-xs font-semibold mb-1 tracking-wider uppercase">
                <MapPin size={12} />
                {dest.country}
              </div>
              <h2 className="text-2xl font-display font-bold leading-tight drop-shadow-md">
                {dest.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < Math.floor(dest.rating) ? 'currentColor' : 'none'}
                      className={i < Math.floor(dest.rating) ? 'text-amber-400' : 'text-white/30'}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  {dest.rating} ({dest.reviews.toLocaleString('en-IN')})
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAdd}
              className={`p-3 rounded-full shrink-0 transition-all ${
                isSelected
                  ? 'bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.5)]'
                  : 'bg-white/15 backdrop-blur hover:bg-white/25'
              }`}
            >
              {isSelected ? <Check size={22} className="text-white" /> : <Plus size={22} />}
            </motion.button>
          </div>

          {/* Expanded content */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: expanded ? 'auto' : 0,
              opacity: expanded ? 1 : 0,
              marginTop: expanded ? 12 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-slate-200 text-sm mb-3 leading-relaxed">
              {dest.description}
            </p>
            <div className="flex gap-2 flex-wrap mb-3">
              {dest.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 bg-teal-500/20 rounded-full text-xs text-teal-200 border border-teal-400/20 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); handleAdd(e); }}
              className="w-full mt-2 py-3 btn-primary rounded-xl text-sm flex justify-center items-center gap-2"
            >
              {isSelected ? '✓ Added to Trip' : 'Add to Trip'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
