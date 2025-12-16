import React from 'react';
import { MessageCircle, Search, Filter, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

const mockThreads = [
  {
    id: 't1',
    buyer: 'Acme Corp',
    subject: 'RFQ: 500 units of Wireless Headphones',
    lastMessage: 'Can you confirm lead time to EU warehouse?',
    time: '2h ago',
    unread: true,
    type: 'rfq',
  },
  {
    id: 't2',
    buyer: 'Global Retailers Ltd',
    subject: 'Order #ORD-2847 – Shipping address clarification',
    lastMessage: 'We need to update the delivery contact.',
    time: '5h ago',
    unread: false,
    type: 'message',
  },
  {
    id: 't3',
    buyer: 'Startup Hub',
    subject: 'RFQ: Annual subscription & support',
    lastMessage: 'Can you share enterprise pricing for 3 regions?',
    time: 'Yesterday',
    unread: false,
    type: 'rfq',
  },
];

const InboxPage: React.FC = () => {
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(mockThreads[0]?.id ?? null);

  const activeThread = mockThreads.find((t) => t.id === activeThreadId) ?? mockThreads[0];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <MessageCircle className="w-7 h-7 text-red-400" />
            Inbox & RFQ Communications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm transition-colors duration-300">
            Central place for buyer messages, RFQs, and negotiation threads.
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="flex-1 min-h-0 bg-white/60 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm transition-colors duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] h-full">
          {/* Thread list */}
          <div className="border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/60 flex flex-col min-h-0">
            <div className="p-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/60">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by buyer, RFQ, or order..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300">
                <Filter className="w-3 h-3" />
                Filters
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
              {mockThreads.map((thread) => {
                const isActive = thread.id === activeThread?.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left px-4 py-3 flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                      isActive ? 'bg-gray-100 dark:bg-gray-800/70' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {thread.buyer}
                      </p>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">{thread.time}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{thread.subject}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                        {thread.lastMessage}
                      </p>
                      <div className="flex items-center gap-1">
                        {thread.type === 'rfq' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-[10px] text-purple-700 dark:text-purple-300">
                            RFQ
                          </span>
                        )}
                        {thread.unread && (
                          <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation detail */}
          <div className="flex flex-col min-h-0">
            {/* Thread header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {activeThread?.buyer}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{activeThread?.subject}</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60">
                  <AlertCircle className="w-3 h-3" />
                  View RFQ
                </button>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60">
                  <Mail className="w-3 h-3" />
                  Mark as resolved
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-4 py-3 space-y-3 bg-gray-50/60 dark:bg-black/30 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
              {/* Mock messages for layout demonstration */}
              <div className="flex items-start gap-2 max-w-xl">
                <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-[11px] text-gray-800 dark:text-gray-100">
                  B
                </div>
                <div className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white">
                  Hi, we&apos;re interested in a quote for 500 units shipped to the EU. Can you share lead times and
                  payment terms?
                </div>
              </div>
              <div className="flex items-start gap-2 max-w-xl ml-auto justify-end">
                <div className="px-3 py-2 rounded-lg bg-red-500 text-white text-xs">
                  Thanks for reaching out—standard lead time is 10–14 days. For this volume we can offer Net 30 terms
                  for approved enterprise buyers.
                </div>
              </div>
              <div className="flex items-start gap-2 max-w-xl">
                <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-[11px] text-gray-800 dark:text-gray-100">
                  B
                </div>
                <div className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white">
                  That works. Please send the formal quote so we can route it internally.
                </div>
              </div>
              <div className="flex items-start gap-2 max-w-xl ml-auto justify-end">
                <div className="px-3 py-2 rounded-lg bg-red-500 text-white text-xs flex items-center gap-1">
                  Quote `RFQ-2024-001` shared
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-gray-200 dark:border-gray-700/60 px-4 py-3 bg-white/90 dark:bg-gray-900/90">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-gray-600 dark:text-gray-400">
                  Reply as <span className="font-semibold">Seller Co.</span>
                </span>
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  placeholder="Type your reply... (e.g., attach formal quote, clarify terms, or share tracking link)"
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <button className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-xs font-semibold text-white whitespace-nowrap">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;


