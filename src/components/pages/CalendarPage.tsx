import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertCircle,
  Tag,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const CalendarPage: React.FC = () => {
  const { transactions, debts, incomeSources, currency, openQuickAdd } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Transactions matching this date
    const dayTransactions = transactions.filter((t) => t.date === formattedDate);

    // Debts with due date matching this day
    const dayDebts = debts.filter((d) => d.dueDateDay === day);

    return {
      transactions: dayTransactions,
      debts: dayDebts,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Cash Flow Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            Visualize recurring salary dates, bill due cycles, and ledger transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-[#e5e7eb] rounded-xl p-1 shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-[#f3f4f6] rounded-lg text-[#6b7280] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-[#111827]">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-[#f3f4f6] rounded-lg text-[#6b7280] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openQuickAdd('EXPENSE')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-[#e5e7eb] bg-[#f9fafb] text-center text-xs font-bold text-[#6b7280] py-3">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#e5e7eb]">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-[#fafafa]/50 p-2" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const { transactions: dayTx, debts: dayDebts } = getEventsForDay(dayNum);
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[90px] sm:min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-[#f8fafc] ${
                  isToday ? 'bg-[#f3f1fc]/30 ring-1 ring-inset ring-[#5a42e8]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                      isToday
                        ? 'bg-[#5a42e8] text-white'
                        : 'text-[#111827]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {(dayTx.length > 0 || dayDebts.length > 0) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5a42e8]" />
                  )}
                </div>

                <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px] scrollbar-none">
                  {dayDebts.map((d) => (
                    <div
                      key={`debt-${d.id}`}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#fee2e2] text-[#dc2626] truncate"
                      title={`Debt Due: ${d.name} (${formatCurrency(d.minimumPayment, currency)})`}
                    >
                      Due: {d.name}
                    </div>
                  ))}

                  {dayTx.map((t) => (
                    <div
                      key={`tx-${t.id}`}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate ${
                        t.type === 'INCOME'
                          ? 'bg-[#dcfce7] text-[#16a34a]'
                          : 'bg-[#f3f4f6] text-[#374151]'
                      }`}
                      title={`${t.category}: ${formatCurrency(t.amount, currency)}`}
                    >
                      {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount, currency)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
