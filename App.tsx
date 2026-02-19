import React, { useState, useEffect, useRef } from 'react';
import { 
  User, CreditCard, Calendar, CheckCircle, AlertCircle, 
  Download, Printer, Lock, Shield, Mail, Phone,
  Moon, Sun, Globe, ChevronDown, Upload, DollarSign,
  Menu, X, PieChart as PieChartIcon, Eye, RefreshCw, Minus, Plus,
  Facebook, Instagram, Linkedin, ArrowRight, MessageCircle, Send,
  Sparkles, Bot
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { MOCK_ACCOUNTS, TRANSLATIONS } from './constants';
import { Language, AccountData } from './types';

// --- UI Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }> = ({ 
  className = '', variant = 'primary', children, ...props 
}) => {
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-primary/40 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
  };
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
    {children}
  </div>
);

// --- AI Chat Assistant Component ---

const AIChatAssistant: React.FC<{ lang: Language; activeAccount: AccountData; isOpen: boolean; onClose: () => void }> = ({ lang, activeAccount, isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: TRANSLATIONS['aiWelcome'][lang] }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => TRANSLATIONS[key][lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `You are a professional, friendly, and bilingual (English/Arabic) financial advisor for Qatar Foundation's PayMaster Portal. 
          Current user: Khalid.
          Selected account: ${activeAccount.name}.
          Outstanding balance: ${activeAccount.outstanding} QAR.
          Paid to date: ${activeAccount.paid} QAR.
          Account metadata: ${JSON.stringify(activeAccount.items)}.
          Respond in ${lang === 'en' ? 'English' : 'Arabic'}. 
          Keep answers concise and helpful. Refer to specific dates and items if asked.`,
          temperature: 0.7,
        }
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I'm sorry, I couldn't process that right now." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Service temporarily unavailable. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-24 ${lang === 'en' ? 'right-6' : 'left-6'} w-[380px] h-[500px] bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden`}>
      <div className="bg-primary p-4 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight">{t('aiAssistant')}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] opacity-80 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl text-xs text-slate-500 rounded-tl-none italic flex items-center gap-2">
              <Sparkles size={14} className="text-primary" /> {t('aiThinking')}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-dark-card border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('typeMessage')} 
            className="flex-grow bg-transparent border-none outline-none px-3 py-1.5 text-sm text-slate-800 dark:text-slate-200"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-all active:scale-90 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">Powered by Gemini AI Engine</p>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAccount, setActiveAccount] = useState<AccountData>(MOCK_ACCOUNTS.parent);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  // Accessibility State
  const [a11yMenuOpen, setA11yMenuOpen] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const [grayscale, setGrayscale] = useState(false);
  const a11yRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    if (grayscale) {
      document.documentElement.classList.add('grayscale');
    } else {
      document.documentElement.classList.remove('grayscale');
    }
  }, [fontScale, grayscale]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (a11yRef.current && !a11yRef.current.contains(event.target as Node)) {
        setA11yMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const t = (key: string) => TRANSLATIONS[key][lang] || key;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ar-QA', {
      style: 'currency',
      currency: 'QAR'
    }).format(amount);
  };

  const inputClasses = "w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200";

  // --- Views ---

  const DashboardView = () => {
    const chartData = [
      { name: t('paid'), value: activeAccount.paid },
      { name: t('outstanding'), value: activeAccount.outstanding },
    ];
    const COLORS = ['#10B981', '#00BCE7'];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{t('outstandingBalance')}</p>
                <p className="text-4xl font-black text-primary mt-2">{formatCurrency(activeAccount.outstanding)}</p>
                <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar size={14} className="text-primary" /> {t('dueBy')} 15/06/2025
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-2xl text-primary transform transition-transform group-hover:rotate-12">
                <AlertCircle />
              </div>
            </div>
            <Button 
              className="mt-8 w-full py-3 shadow-primary/30"
              onClick={() => setActiveTab('payment')}
            >
              <CreditCard size={18} />
              {t('payNow')}
            </Button>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{t('amountPaid')}</p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(activeAccount.paid)}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{t('lastPayment')} 01/05/2025</p>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 transform transition-transform group-hover:rotate-12">
                <CheckCircle />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{t('activeInstallments')}</p>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">{activeAccount.activeInstallments}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{t('nextInstallment')} 01/07/2025</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 transform transition-transform group-hover:rotate-12">
                <Calendar />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 flex flex-col items-center">
            <h3 className="text-lg font-bold w-full text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-primary" /> {t('paymentOverview')}
            </h3>
            <div className="flex-grow w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1E293B' : '#fff', 
                      borderRadius: '12px', 
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <RefreshCw size={20} className="text-primary" /> {t('outstandingDetails')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">
                    <th className="px-4 pb-2 w-10 text-center">Sel</th>
                    <th className="px-4 pb-2">{t('date')}</th>
                    <th className="px-4 pb-2">{t('description')}</th>
                    <th className="px-4 pb-2">{t('dueDate')}</th>
                    <th className="px-4 pb-2 text-right">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAccount.items.map((item) => (
                    <tr key={item.id} className="bg-slate-50 dark:bg-slate-900/40 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-4 rounded-l-xl text-center">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded-lg border-slate-300 accent-primary cursor-pointer" />
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{item.date}</td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{item.desc}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.sponsor}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{item.dueDate}</td>
                      <td className="p-4 text-sm font-black text-slate-900 dark:text-white text-right rounded-r-xl">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div>
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{t('totalSelected')}</p>
                 <p className="text-2xl font-black text-primary">{formatCurrency(activeAccount.outstanding)}</p>
               </div>
               <Button 
                onClick={() => {
                  setSuccessMessage(t('successMsg'));
                  setShowSuccessModal(true);
                }}
                className="px-10 py-3"
              >
                {t('paySelected')} <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const StatementView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('accountStatement')}</h2>
          <div className="flex gap-3">
            <Button variant="secondary" className="text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">
              <Download size={16} /> {t('downloadPdf')}
            </Button>
            <Button variant="secondary" className="text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">
              <Printer size={16} /> {t('print')}
            </Button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('fromDate')}</label>
              <input type="date" className={inputClasses} defaultValue="2025-01-01" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('toDate')}</label>
              <input type="date" className={inputClasses} defaultValue="2025-06-30" />
            </div>
            <Button className="w-full py-2.5 h-[46px]">{t('generateStatement')}</Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="p-5">{t('date')}</th>
                <th className="p-5">{t('transactionId')}</th>
                <th className="p-5">{t('description')}</th>
                <th className="p-5">{t('debit')}</th>
                <th className="p-5">{t('credit')}</th>
                <th className="p-5">{t('balance')}</th>
                <th className="p-5 text-center">{t('receipt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { date: '01/05/2025', id: 'TX-2025-000512', desc: 'Tuition Fee - Spring 2025', debit: '-', credit: '5,200.00', bal: '12,450.00' },
                { date: '15/03/2025', id: 'TX-2025-000387', desc: 'Activity Fee', debit: '-', credit: '1,500.00', bal: '17,650.00' },
                { date: '01/01/2025', id: 'TX-2025-000125', desc: 'Tuition Fee - Winter 2025', debit: '-', credit: '5,000.00', bal: '19,150.00' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                  <td className="p-5 text-sm text-slate-600 dark:text-slate-400">{row.date}</td>
                  <td className="p-5 text-xs text-slate-400 font-mono">{row.id}</td>
                  <td className="p-5 text-sm font-bold text-slate-900 dark:text-white">{row.desc}</td>
                  <td className="p-5 text-sm text-slate-600 dark:text-slate-400">{row.debit}</td>
                  <td className="p-5 text-sm text-emerald-600 dark:text-emerald-400 font-black">{row.credit}</td>
                  <td className="p-5 text-sm text-slate-900 dark:text-white font-black">{row.bal}</td>
                  <td className="p-5 text-center">
                    <button className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-all">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const PaymentView = () => {
    const [paymentOption, setPaymentOption] = useState('full');

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t('makePayment')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-10">
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black">1</span>
                  {t('paymentDetails')}
                </h3>
                <div className="space-y-5 pl-11">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('amountToPay')}</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors font-bold">QAR</span>
                      <input type="number" defaultValue="12450.00" className={`${inputClasses} pl-14 font-black text-xl`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('paymentMethod')}</label>
                    <select className={inputClasses}>
                      <option>Credit/Debit Card</option>
                      <option>Bank Transfer</option>
                      <option>Apple Pay</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('paymentOption')}</label>
                     {[
                        { id: 'full', label: t('payInFull') }, 
                        { id: 'advance', label: t('payInAdvance') }, 
                        { id: 'installment', label: t('payInInstallments') }
                      ].map((opt) => (
                        <label key={opt.id} className={`flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${
                          paymentOption === opt.id 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}>
                          <input 
                            type="radio" 
                            name="payOpt" 
                            checked={paymentOption === opt.id}
                            onChange={() => setPaymentOption(opt.id)}
                            className="hidden" 
                          />
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentOption === opt.id ? 'border-primary' : 'border-slate-300'}`}>
                            {paymentOption === opt.id && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                          </div>
                          <span className="text-sm font-bold">{opt.label}</span>
                        </label>
                      ))}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black">2</span>
                  {t('cardNumber')}
                </h3>
                <div className="space-y-5 pl-11">
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><CreditCard size={18}/></span>
                    <input type="text" placeholder="0000 0000 0000 0000" className={`${inputClasses} pl-12 tracking-[0.2em] font-mono`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" className={inputClasses} />
                    <input type="text" placeholder="CVC" className={inputClasses} />
                  </div>
                  <input type="text" placeholder={t('cardholderName')} className={inputClasses} />
                </div>
              </section>
            </div>

            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">{t('paymentSummary')}</h3>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500">{t('outstandingBalance')}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">QAR 12,450.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500">{t('amount')}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">QAR 12,450.00</span>
                  </div>
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('total')}</p>
                      <p className="text-3xl font-black text-primary">QAR 12,450.00</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mt-10 py-4 text-lg font-black rounded-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                  onClick={() => {
                    setSuccessMessage(t('successMsg'));
                    setShowSuccessModal(true);
                  }}
                >
                  {t('confirmPay')}
                </Button>

                <div className="mt-10 flex flex-col items-center gap-6">
                  <div className="flex flex-wrap justify-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                    <img src="https://i.ibb.co/KpWRfC5c/Payment-gateway.png" alt="Payment Logos" className="h-10 object-contain grayscale hover:grayscale-0 transition-all" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    <Lock size={12} className="text-primary" /> {t('securedPayment')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const SupportView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t('financeSupport')}</h2>
          <p className="text-slate-500 dark:text-slate-400">Our team is ready to assist you with any financial inquiries.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('subject')}</label>
              <select className={inputClasses}>
                <option>Select a subject...</option>
                <option>Tuition Fee Inquiry</option>
                <option>Activities Fee Question</option>
                <option>Invoice Clarification</option>
                <option>Refund Status</option>
                <option>Installment Plan Request</option>
                <option>Payment Confirmation</option>
                <option>Technical Issue</option>
                <option>Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('message')}</label>
              <textarea rows={6} className={`${inputClasses} resize-none`} placeholder="Describe your inquiry in detail..." />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('attachment')}</label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group">
                <div className="bg-slate-50 dark:bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-slate-400 group-hover:text-primary transition-colors" size={24} />
                </div>
                <p className="text-sm font-bold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">{t('chooseFile')}</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                className="px-12 py-3 rounded-2xl"
                onClick={() => {
                  setSuccessMessage('Support ticket created. Reference: QF-SUP-2025-092');
                  setShowSuccessModal(true);
                }}
              >
                {t('submitRequest')}
              </Button>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-10 md:pt-0 md:pl-10 space-y-10">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{t('otherContact')}</h3>
              <div className="space-y-8">
                <a href="mailto:financesupport@qf.org.qa" className="flex items-center gap-4 group">
                  <div className="bg-primary/10 p-3 rounded-2xl text-primary transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('email')}</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">financesupport@qf.org.qa</p>
                  </div>
                </a>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('phone')}</h4>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">+974 4454 0000</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Service Hours</h4>
              <ul className="space-y-2 text-xs text-slate-500 font-bold">
                <li className="flex justify-between"><span>Sunday - Thursday</span> <span className="text-slate-900 dark:text-white">7:30 AM - 3:30 PM</span></li>
                <li className="flex justify-between"><span>Friday - Saturday</span> <span className="text-slate-400">Closed</span></li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // --- Layout ---

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text font-sans selection:bg-primary selection:text-white`}>
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-[60] border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20 md:h-24">
            <div className="flex items-center gap-5 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <img src="https://i.ibb.co/ycxCB9dQ/QF-Tree-DIGITAL-WHITE-01.png" alt="Qatar Foundation" className="h-10 md:h-14 invert dark:invert-0 transition-all duration-500 group-hover:scale-105" />
              <div className="h-10 w-[2px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
              <div className="hidden md:block">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{t('portalTitle')}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Education City</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="relative" ref={a11yRef}>
                <button 
                  onClick={() => setA11yMenuOpen(!a11yMenuOpen)}
                  className={`p-3 rounded-xl transition-all ${a11yMenuOpen ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title={t('accessibility')}
                >
                  <Eye size={20} />
                </button>
                
                {a11yMenuOpen && (
                  <div className={`absolute ${lang === 'en' ? 'right-0' : 'left-0'} top-full mt-4 w-72 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 z-50`}>
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-black text-sm uppercase tracking-widest">{t('accessibility')}</span>
                      <button onClick={() => setA11yMenuOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-3">{t('textSize')}</label>
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-xl p-1.5">
                          <button onClick={() => setFontScale(Math.max(80, fontScale - 10))} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"><Minus size={14}/></button>
                          <span className="text-sm font-black font-mono">{fontScale}%</span>
                          <button onClick={() => setFontScale(Math.min(130, fontScale + 10))} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"><Plus size={14}/></button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                         <span className="text-xs font-bold">{t('grayscale')}</span>
                         <button 
                           onClick={() => setGrayscale(!grayscale)}
                           className={`w-12 h-6 rounded-full transition-all relative ${grayscale ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                         >
                           <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${grayscale ? 'translate-x-6' : 'translate-x-0'}`} />
                         </button>
                      </div>

                      <Button variant="outline" className="w-full text-xs py-2 rounded-xl" onClick={() => { setFontScale(100); setGrayscale(false); }}>
                         <RefreshCw size={14} /> {t('reset')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2"></div>

              <button onClick={() => setDarkMode(!darkMode)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Toggle Theme">
                {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
              </button>
              
              <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2 group" title="Switch Language">
                <Globe size={18} className="group-hover:rotate-45 transition-transform" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">{lang === 'en' ? 'AR' : 'EN'}</span>
              </button>

              <div className="relative group ml-4">
                <button className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                  <div className="bg-primary w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg shadow-primary/20">K</div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-none">Khalid</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Premium</p>
                  </div>
                  <ChevronDown size={16} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className={`absolute ${lang === 'en' ? 'right-0' : 'left-0'} top-full mt-3 w-56 bg-white dark:bg-dark-card rounded-2xl shadow-2xl py-3 border border-slate-100 dark:border-slate-800 hidden group-hover:block animate-in fade-in slide-in-from-top-2`}>
                  <a href="#" className="px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-sm font-bold transition-colors"><User size={16} className="text-slate-400"/> {t('profile')}</a>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                  <a href="#" className="px-5 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 flex items-center gap-3 text-sm font-bold transition-colors"><Lock size={16}/> {t('logout')}</a>
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
               <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white"
              >
                {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
              </button>
            </div>
          </div>
        </div>
        
        {isMenuOpen && (
           <div className="md:hidden bg-white dark:bg-dark-card border-t border-slate-100 dark:border-slate-800 px-6 py-8 space-y-8 animate-in slide-in-from-top-5 shadow-2xl">
              <div className="flex justify-between items-center">
                 <span className="font-black text-lg text-primary">{t('portalTitle')}</span>
                 <div className="flex gap-4">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">{darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}</button>
                    <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-xs">{lang === 'en' ? 'AR' : 'EN'}</button>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 <button onClick={() => setFontScale(100)} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-xs font-black">A</button>
                 <button onClick={() => setFontScale(120)} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-lg font-black">A+</button>
                 <button onClick={() => setGrayscale(!grayscale)} className={`bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-xs font-black ${grayscale ? 'text-primary' : ''}`}>BW</button>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <div className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white">K</div>
                    <div>
                      <span className="font-black text-slate-900 dark:text-white block">Khalid bin Ahmad</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Khalid.a@qf.org.qa</span>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </header>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 sticky top-20 md:top-24 z-50 transition-all">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {Object.values(MOCK_ACCOUNTS).map((acc) => (
              <button
                key={acc.id}
                onClick={() => setActiveAccount(acc)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                  activeAccount.id === acc.id
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30 transform scale-105'
                    : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
                }`}
              >
                {acc.name === 'All Accounts' ? t('allAccounts') : acc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-10 flex justify-center border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-12 overflow-x-auto no-scrollbar px-4" aria-label="Tabs">
            {[
              { id: 'dashboard', icon: <PieChartIcon size={20} />, label: t('overview') },
              { id: 'statement', icon: <Download size={20} />, label: t('statement') },
              { id: 'payment', icon: <CreditCard size={20} />, label: t('makePayment') },
              { id: 'support', icon: <Shield size={20} />, label: t('financeSupport') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-5 px-2 border-b-4 font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 gap-3 whitespace-nowrap relative
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}
                `}
              >
                <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-125' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[600px] pb-20">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'statement' && <StatementView />}
          {activeTab === 'payment' && <PaymentView />}
          {activeTab === 'support' && <SupportView />}
        </div>
      </main>

      {/* AI Assistant FAB */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <button 
          onClick={() => setIsAIChatOpen(!isAIChatOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 hover:scale-110 group relative ${
            isAIChatOpen ? 'bg-slate-800 text-white' : 'bg-primary text-white'
          }`}
        >
          {isAIChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
          {!isAIChatOpen && (
             <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-50 dark:border-dark-bg animate-pulse"></div>
          )}
        </button>
      </div>

      <AIChatAssistant 
        lang={lang} 
        activeAccount={activeAccount} 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
      />

      <footer className="bg-slate-950 text-slate-500 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <img src="https://i.ibb.co/ycxCB9dQ/QF-Tree-DIGITAL-WHITE-01.png" alt="Qatar Foundation" className="h-16 opacity-80 hover:opacity-100 transition-opacity" />
              <p className="text-sm font-medium leading-relaxed">
                Empowering the future through education, research, and community development.<br/>
                Doha, Qatar.
              </p>
            </div>
            
            <div>
               <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">{t('overview')}</h3>
               <ul className="space-y-4 text-sm font-bold">
                  <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-primary transition-all hover:translate-x-1 block">{t('overview')}</button></li>
                  <li><button onClick={() => setActiveTab('payment')} className="hover:text-primary transition-all hover:translate-x-1 block">{t('makePayment')}</button></li>
                  <li><button onClick={() => setActiveTab('statement')} className="hover:text-primary transition-all hover:translate-x-1 block">{t('statement')}</button></li>
               </ul>
            </div>

             <div>
               <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Resources</h3>
               <ul className="space-y-4 text-sm font-bold">
                  <li><a href="#" className="hover:text-primary transition-all hover:translate-x-1 block">Help Center</a></li>
                  <li><a href="#" className="hover:text-primary transition-all hover:translate-x-1 block">Payment Policies</a></li>
                  <li><a href="#" className="hover:text-primary transition-all hover:translate-x-1 block">ECITY Map</a></li>
               </ul>
            </div>

            <div>
               <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Follow Us</h3>
               <div className="flex gap-3">
                  <a href="#" className="bg-slate-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all hover:-translate-y-1">
                    <Facebook size={18} />
                  </a>
                  <a href="#" className="bg-slate-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all hover:-translate-y-1">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="bg-slate-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-all hover:-translate-y-1">
                    <Linkedin size={18} />
                  </a>
               </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold uppercase tracking-widest">&copy; 2025 Qatar Foundation. All Rights Reserved.</p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
               <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-white transition-colors">User Agreement</a>
               <a href="#" className="hover:text-white transition-colors">Compliance</a>
            </div>
          </div>
        </div>
      </footer>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white dark:bg-dark-card rounded-[32px] shadow-2xl p-10 max-w-sm w-full relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-center mb-8">
              <div className="bg-emerald-500/10 p-6 rounded-[24px] animate-bounce">
                <CheckCircle size={56} className="text-emerald-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-center mb-2 text-slate-900 dark:text-white">{t('success')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center font-bold mb-8">{successMessage}</p>
            <Button className="w-full py-4 rounded-2xl font-black" onClick={() => setShowSuccessModal(false)}>
              {t('close')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;