import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { GripVertical, MapPin, Clock, MessageSquare } from 'lucide-react';
import type { DayPlan } from '../../types';
import { useTravelStore } from '../../store/useTravelStore';

export const DayBlock = ({ day, title }: { day: DayPlan; title?: string }) => {
  const { updateDayComment } = useTravelStore();
  const [showComment, setShowComment] = useState(!!day.comment);
  const isUnassigned = day.id === 'unassigned';

  return (
    <div className="glass rounded-2xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4 pl-4">
        <h2 className="text-lg font-display font-semibold text-slate-800 dark:text-slate-200">
          {title || `Day ${day.dayNumber}`}
        </h2>
        {!isUnassigned && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowComment(!showComment)}
            className={`p-1.5 rounded-lg transition-colors ${
              showComment || day.comment
                ? 'text-teal-500 bg-teal-50 dark:bg-teal-900/20'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="Add comment"
          >
            <MessageSquare size={15} />
          </motion.button>
        )}
      </div>

      {showComment && !isUnassigned && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mb-4 px-4 overflow-hidden"
        >
          <textarea
            placeholder="Add notes for this day..."
            value={day.comment || ''}
            onChange={(e) => updateDayComment(day.id, e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500/50 resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
          />
        </motion.div>
      )}

      <Droppable droppableId={day.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[80px] rounded-xl transition-colors duration-200 ${
              snapshot.isDraggingOver
                ? 'bg-teal-50/50 dark:bg-teal-900/10 ring-2 ring-teal-400/30 ring-dashed'
                : ''
            }`}
          >
            {day.items.length === 0 ? (
              <div className="h-[80px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                Drag activities here
              </div>
            ) : (
              <div className="space-y-2">
                {day.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ ...provided.draggableProps.style }}
                        className={`flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all ${
                          snapshot.isDragging
                            ? 'shadow-xl shadow-teal-500/10 rotate-1 scale-[1.03] z-50 border-teal-400/50'
                            : 'hover:shadow-md'
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="text-slate-300 hover:text-teal-500 cursor-grab active:cursor-grabbing transition-colors"
                        >
                          <GripVertical size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                            {item.activityName}
                          </h4>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {item.destinationId}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {item.activityTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
