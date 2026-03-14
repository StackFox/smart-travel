import { motion } from 'framer-motion';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useTravelStore } from '../../store/useTravelStore';
import { DayBlock } from './DayBlock';
import { Plus, ListTodo } from 'lucide-react';

export const ItineraryList = () => {
  const { itinerary, updateItinerary, addDay, unassignedActivities, updateUnassignedActivities } = useTravelStore();

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const isSourceUnassigned = source.droppableId === 'unassigned';
    const isDestUnassigned = destination.droppableId === 'unassigned';

    let sourceItems = isSourceUnassigned
      ? [...unassignedActivities]
      : [...itinerary.find(d => d.id === source.droppableId)!.items];

    let destItems = isDestUnassigned
      ? [...unassignedActivities]
      : source.droppableId === destination.droppableId
        ? sourceItems
        : [...itinerary.find(d => d.id === destination.droppableId)!.items];

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    if (isSourceUnassigned && isDestUnassigned) {
      updateUnassignedActivities(destItems);
    } else if (isSourceUnassigned) {
      updateUnassignedActivities(sourceItems);
      updateItinerary(itinerary.map(day =>
        day.id === destination.droppableId ? { ...day, items: destItems } : day
      ));
    } else if (isDestUnassigned) {
      updateItinerary(itinerary.map(day =>
        day.id === source.droppableId ? { ...day, items: sourceItems } : day
      ));
      updateUnassignedActivities(destItems);
    } else {
      updateItinerary(itinerary.map(day => {
        if (day.id === source.droppableId) return { ...day, items: sourceItems };
        if (day.id === destination.droppableId) return { ...day, items: destItems };
        return day;
      }));
    }
  };

  return (
    <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto py-6 pb-24 px-4 transition-all">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-display font-bold gradient-text">
          Your Itinerary
        </h1>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={addDay}
          className="p-2.5 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
        >
          <Plus size={22} />
        </motion.button>
      </motion.div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-3 top-4 text-teal-500">
              <ListTodo size={18} />
            </div>
            <DayBlock
              day={{ id: 'unassigned', dayNumber: 0, items: unassignedActivities }}
              title="Unassigned Activities"
            />
          </motion.div>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-6" />

          {itinerary.map((day, i) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <DayBlock day={day} />
            </motion.div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
