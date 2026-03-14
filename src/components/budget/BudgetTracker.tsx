import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTravelStore } from '../../store/useTravelStore';
import { Wallet, AlertTriangle, TrendingUp, Plus, Trash2, Receipt, IndianRupee } from 'lucide-react';

export const BudgetTracker = () => {
  const { budgetCap, setBudgetCap, getTotalBudget, expenses, addExpense, removeExpense } = useTravelStore();
  const [editingCap, setEditingCap] = useState(budgetCap);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const total = getTotalBudget();
  const percent = Math.min((total / budgetCap) * 100, 100);
  const remaining = budgetCap - total;

  const isOver = total > budgetCap;
  const isWarning = percent > 80 && !isOver;

  let colorClass = 'text-emerald-500';
  let bgClass = 'bg-linear-to-r from-emerald-400 to-teal-500';
  if (isOver) {
    colorClass = 'text-rose-500';
    bgClass = 'bg-linear-to-r from-rose-400 to-pink-500 animate-pulse';
  } else if (isWarning) {
    colorClass = 'text-amber-500';
    bgClass = 'bg-linear-to-r from-amber-400 to-orange-500';
  }

  const handleAddExpense = () => {
    const name = expenseName.trim();
    const amount = parseFloat(expenseAmount);
    if (!name || isNaN(amount) || amount <= 0) return;
    addExpense({ id: `exp-${Date.now()}`, name, amount });
    setExpenseName('');
    setExpenseAmount('');
  };

  return (
    <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto py-6 pb-24 px-4 flex flex-col gap-6 transition-all">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <h1 className="text-3xl font-display font-bold gradient-text flex justify-center items-center gap-2">
          <Wallet size={30} className="text-teal-500" />
          Budget Tracker
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Track spending across your trip</p>
      </motion.div>

      {/* Main Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-6 relative overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-100 dark:bg-slate-800">
          <motion.div
            className={`h-full ${bgClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Budget Cap</span>
            <div className="flex items-center mt-1 text-2xl font-light text-slate-800 dark:text-slate-200">
              <IndianRupee size={18} className="text-slate-400" />
              <input
                type="number"
                value={editingCap}
                onChange={(e) => setEditingCap(Number(e.target.value))}
                onBlur={() => setBudgetCap(editingCap)}
                className="bg-transparent w-28 border-b border-slate-200 dark:border-slate-700 focus:border-teal-500 outline-none ml-1 font-medium"
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Spent</span>
            <div className={`text-3xl font-bold mt-1 ${colorClass}`}>
              ₹{total.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="range"
            min="5000"
            max="500000"
            step="1000"
            value={editingCap}
            onChange={(e) => {
              const val = Number(e.target.value);
              setEditingCap(val);
              setBudgetCap(val);
            }}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="bg-white/60 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
              <TrendingUp size={10} /> Remaining
            </span>
            <span className={`text-xl font-bold ${remaining < 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
              ₹{remaining.toLocaleString('en-IN')}
            </span>
          </div>

          <div className={`p-3 rounded-2xl flex flex-col items-center transition-colors ${
            isOver
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
              : isWarning
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
          }`}>
            <span className="text-xs opacity-70 mb-0.5 flex items-center gap-1">
              <AlertTriangle size={10} /> Status
            </span>
            <span className="text-lg font-bold">
              {isOver ? 'Over Budget!' : isWarning ? 'Warning' : 'On Track'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Additional Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-3xl p-5"
      >
        <h2 className="text-base font-display font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Receipt size={18} className="text-orange-500" />
          Additional Expenses
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="e.g. Travel Insurance"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          <input
            type="number"
            placeholder="₹ Amt"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
            className="w-24 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddExpense}
            className="p-2.5 rounded-xl btn-primary shrink-0"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No expenses added yet
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {expenses.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-3 py-2.5 bg-white/60 dark:bg-slate-800/50 rounded-xl group hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{exp.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    onClick={() => removeExpense(exp.id)}
                    className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
