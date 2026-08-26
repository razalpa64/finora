import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Trash2,
  Tv,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const CalendarPage: React.FC = () => {
  const {
    bills,
    addBill,
    toggleBillPaid,
    deleteBill,
    transactions,
    debts,
    currency,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('Utilities');
  const [isSubscription, setIsSubscription] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Due this week count
  const todayStr = new Date().toISOString().slice(0, 10);
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const dueThisWeek = bills.filter((b) => !b.paid && b.dueDate >= todayStr && b.dueDate <= in7Days);

  const subscriptions = bills.filter((b) => b.subscription);

  const getEventsForDay = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBills = bills.filter((b) => b.dueDate === formattedDate);
    const dayDebts = debts.filter((d) => d.dueDateDay === day);
    const dayTxs = transactions.filter((t) => t.date === formattedDate);
    return { dayBills, dayDebts, dayTxs };
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    addBill({
      name: name.trim(),
      amount: num,
      dueDate,
      category,
      recurring: true,
      paid: false,
      subscription: isSubscription,
    });

    setIsModalOpen(false);
    setName('');
    setAmount('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            OBLIGATION TIMELINE
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Bills & Calendar
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Upcoming payment timelines, due dates, and digital recurring subscriptions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-br from-[#765df1] to-[#6045df] hover:bg-[#6349e4] text-white shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bill or Subscription</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            DUE THIS WEEK
          </div>
          <div className="mt-2 text-2xl font-black text-[#dc2626]">
            {dueThisWeek.length} bill{dueThisWeek.length === 1 ? '' : 's'}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Totaling {formatCurrency(dueThisWeek.reduce((s, b) => s + b.amount, 0), currency)}
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            DIGITAL SUBSCRIPTIONS
          </div>
          <div className="mt-2 text-2xl font-black text-[#5a42e8]">
            {subscriptions.length} active
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            {formatCurrency(subscriptions.reduce((s, b) => s + b.amount, 0), currency)}/month
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            ALL RECORDED BILLS
          </div>
          <div className="mt-2 text-2xl font-black text-[#111827]">
            {bills.length}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            {bills.filter((b) => b.paid).length} marked paid this cycle
          </div>
        </div>
      </div>

      {/* Interactive Calendar Month Grid */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#f3f4f6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#5a42e8]" />
            <h2 className="text-sm font-bold text-[#111827]">
              {monthNames[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#e5e7eb] bg-[#f9fafb] text-center text-[11px] font-bold text-[#6b7280] py-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#e5e7eb]">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] sm:min-h-[100px] bg-[#fafafa]/50 p-1.5" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const { dayBills, dayDebts, dayTxs } = getEventsForDay(dayNum);
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[85px] sm:min-h-[100px] p-1.5 flex flex-col justify-between transition-colors hover:bg-[#f8fafc] ${
                  isToday ? 'bg-[#f3f1fc]/30 ring-1 ring-inset ring-[#5a42e8]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                      isToday ? 'bg-[#5a42e8] text-white' : 'text-[#111827]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {(dayBills.length > 0 || dayDebts.length > 0) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[60px] scrollbar-none">
                  {dayBills.map((b) => (
                    <div
                      key={b.id}
                      className={`text-[9px] font-bold px-1 py-0.5 rounded truncate ${
                        b.paid ? 'bg-[#ecfdf5] text-[#065f46] line-through opacity-70' : 'bg-[#fee2e2] text-[#dc2626]'
                      }`}
                    >
                      {b.name}: {formatCurrency(b.amount, currency)}
                    </div>
                  ))}

                  {dayDebts.map((d) => (
                    <div
                      key={d.id}
                      className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#fffbeb] text-[#92400e] truncate"
                    >
                      Due: {d.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscriptions & Bills List */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#f3f4f6] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#111827]">
            Recorded Bills & Subscriptions
          </h3>
          <span className="text-xs text-[#6b7280]">{bills.length} entries</span>
        </div>

        {bills.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6b7280]">
            No bills or subscriptions scheduled. Click "Add Bill or Subscription" to track due dates.
          </div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {bills.map((b) => (
              <div
                key={b.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f9fafb] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleBillPaid(b.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                      b.paid
                        ? 'bg-[#10b981] border-[#10b981] text-white'
                        : 'border-[#d1d5db] hover:border-[#5a42e8]'
                    }`}
                  >
                    {b.paid && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className={`font-extrabold text-sm ${b.paid ? 'line-through text-[#9ca3af]' : 'text-[#111827]'}`}>
                      {b.name}
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      Due: {b.dueDate} · {b.category} {b.subscription && '· Digital Subscription'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-base font-black text-[#111827]">
                      {formatCurrency(b.amount, currency)}
                    </div>
                    <div className="text-[10px] text-[#6b7280]">
                      {b.paid ? 'Marked as Paid' : 'Pending Payment'}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteBill(b.id)}
                    className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-4">
              Add Bill or Subscription
            </h3>

            <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Bill / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Electricity, Internet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#374151] mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#374151] mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#374151] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none"
                >
                  <option value="Utilities">Utilities & Power</option>
                  <option value="Internet">Internet & Telecom</option>
                  <option value="Subscriptions">Software / Subscriptions</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Rent">Rent / Housing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sub-cb"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5a42e8] border-[#d1d5db]"
                />
                <label htmlFor="sub-cb" className="text-xs text-[#374151] font-medium">
                  This is a recurring digital subscription
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3f4f6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f3f4f6] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#5a42e8] text-white rounded-xl hover:bg-[#4a34db] transition-colors cursor-pointer"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
