import React, { useState, useEffect, useRef } from 'react';
import { 
  User, CreditCard, Calendar, CheckCircle, AlertCircle, 
  Download, Printer, Lock, Shield, Mail, Phone,
  Moon, Sun, Globe, ChevronDown, Upload, DollarSign,
  Menu, X, PieChart as PieChartIcon, Eye, RefreshCw, Minus, Plus,
  Facebook, Instagram, Linkedin, ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { MOCK_ACCOUNTS, TRANSLATIONS } from './constants';
import { Language, AccountData } from './types';

// --- UI Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }> = ({ 
  className = '', variant = 'primary', children, ...props 
}) => {
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-primary/40 border border-transparent',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10'
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
  <div className={`bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 dark:hover:border-primary/20 ${className}`}>
    {children}
  </div>
);

// --- Main App ---

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAccount, setActiveAccount] = useState<AccountData>(MOCK_ACCOUNTS.parent);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Accessibility State
  const [a11yMenuOpen, setA11yMenuOpen] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const [grayscale, setGrayscale] = useState(false);
  const a11yRef = useRef<HTMLDivElement>(null);

  // Sync theme, language, and a11y with DOM
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

  // Close accessibility menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (a11yRef.current && !a11yRef.current.contains(event.target as Node)) {
        setA11yMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const t = (key: string) => TRANSLATIONS[key][lang];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ar-QA', {
      style: 'currency',
      currency: 'QAR'
    }).format(amount);
  };

  const inputClasses = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500";

  // --- Views ---

  const DashboardView = () => {
    const chartData = [
      { name: t('paid'), value: activeAccount.paid },
      { name: t('outstanding'), value: activeAccount.outstanding },
    ];
    const COLORS = ['#10B981', '#00BCE7'];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('outstandingBalance')}</p>
                <p className="text-3xl font-bold text-primary mt-2">{formatCurrency(activeAccount.outstanding)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar size={14} /> {t('dueBy')} 15/06/2025
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full transition-transform group-hover:scale-110">
                <AlertCircle className="text-red-500" />
              </div>
            </div>
            <Button 
              className="mt-6 w-full group-hover:shadow-lg group-hover:-translate-y-0.5"
              onClick={() => setActiveTab('payment')}
            >
              <CreditCard size={18} />
              {t('payNow')}
            </Button>
          </Card>

          <Card className="border-l-4 border-l-green-500 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('amountPaid')}</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{formatCurrency(activeAccount.paid)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('lastPayment')} 01/05/2025</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full transition-transform group-hover:scale-110">
                <CheckCircle className="text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('activeInstallments')}</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{activeAccount.activeInstallments}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('nextInstallment')} 01/07/2025</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full transition-transform group-hover:scale-110">
                <Calendar className="text-blue-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('paymentOverview')}</h3>
            <div className="flex-grow min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: darkMode ? '#1F2937' : '#fff', borderRadius: '8px', border: '1px solid #374151' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('outstandingDetails')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 w-10"></th>
                    <th className="p-4">{t('date')}</th>
                    <th className="p-4">{t('description')}</th>
                    <th className="p-4">{t('sponsorName')}</th>
                    <th className="p-4">{t('dueDate')}</th>
                    <th className="p-4 text-right">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activeAccount.items.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="p-4">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-gray-300 accent-primary" />
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{item.date}</td>
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{item.desc}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{item.sponsor}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{item.dueDate}</td>
                      <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 font-bold border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={5} className="p-4 text-right text-gray-600 dark:text-gray-300 uppercase text-xs">{t('totalSelected')}</td>
                    <td className="p-4 text-right text-primary text-lg">{formatCurrency(activeAccount.outstanding)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => {
                  setSuccessMessage(t('successMsg'));
                  setShowSuccessModal(true);
                }}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accountStatement')}</h2>
          <div className="flex gap-3">
            <Button variant="secondary" className="text-sm">
              <Download size={16} /> {t('downloadPdf')}
            </Button>
            <Button variant="secondary" className="text-sm">
              <Printer size={16} /> {t('print')}
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg mb-8 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('fromDate')}</label>
              <input type="date" className={inputClasses} defaultValue="2025-01-01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('toDate')}</label>
              <input type="date" className={inputClasses} defaultValue="2025-06-30" />
            </div>
            <Button className="w-full">{t('generateStatement')}</Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4">{t('date')}</th>
                <th className="p-4">{t('transactionId')}</th>
                <th className="p-4">{t('description')}</th>
                <th className="p-4">{t('debit')}</th>
                <th className="p-4">{t('credit')}</th>
                <th className="p-4">{t('balance')}</th>
                <th className="p-4 text-center">{t('receipt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-dark-card">
              {[
                { date: '01/05/2025', id: 'TX-2025-000512', desc: 'Tuition Fee - Spring 2025', debit: '-', credit: '5,200.00', bal: '12,450.00' },
                { date: '15/03/2025', id: 'TX-2025-000387', desc: 'Activity Fee', debit: '-', credit: '1,500.00', bal: '17,650.00' },
                { date: '01/01/2025', id: 'TX-2025-000125', desc: 'Tuition Fee - Winter 2025', debit: '-', credit: '5,000.00', bal: '19,150.00' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{row.date}</td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{row.id}</td>
                  <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{row.desc}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{row.debit}</td>
                  <td className="p-4 text-sm text-green-600 dark:text-green-400 font-semibold">{row.credit}</td>
                  <td className="p-4 text-sm text-gray-900 dark:text-white font-bold">{row.bal}</td>
                  <td className="p-4 text-center">
                    <button className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-primary/10 transition-colors">
                      <Download size={16} />
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('makePayment')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</span>
                  {t('paymentDetails')}
                </h3>
                <div className="space-y-4 pl-10">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('amountToPay')}</label>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"><DollarSign size={16}/></span>
                      <input type="number" defaultValue="12450.00" className={`${inputClasses} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('paymentMethod')}</label>
                    <select className={inputClasses}>
                      <option>Credit/Debit Card</option>
                      <option>Bank Transfer</option>
                      <option>Apple Pay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('paymentOption')}</label>
                    <div className="space-y-3">
                      {[
                        { id: 'full', label: t('payInFull') }, 
                        { id: 'advance', label: t('payInAdvance') }, 
                        { id: 'installment', label: t('payInInstallments') }
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group hover:border-primary/30">
                          <input 
                            type="radio" 
                            name="payOpt" 
                            checked={paymentOption === opt.id}
                            onChange={() => setPaymentOption(opt.id)}
                            className="text-primary focus:ring-primary w-4 h-4 accent-primary" 
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {paymentOption === 'installment' && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('numberOfInstallments')}</label>
                      <select className={inputClasses}>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>6</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                  {t('cardNumber')}
                </h3>
                <div className="space-y-4 pl-10">
                  <input type="text" placeholder="0000 0000 0000 0000" className={`${inputClasses} tracking-wider`} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" className={inputClasses} />
                    <input type="text" placeholder="CVC" className={inputClasses} />
                  </div>
                  <input type="text" placeholder={t('cardholderName')} className={inputClasses} />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 h-fit border border-gray-100 dark:border-gray-700 sticky top-24 transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('paymentSummary')}</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('outstandingBalance')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">QAR 12,450.00</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('amount')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">QAR 12,450.00</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>{t('total')}</span>
                  <span className="text-primary">QAR 12,450.00</span>
                </div>
              </div>

              <Button 
                className="w-full mt-8 py-3 text-lg animate-pulse hover:animate-none"
                onClick={() => {
                  setSuccessMessage(t('successMsg'));
                  setShowSuccessModal(true);
                }}
              >
                {t('confirmPay')}
              </Button>

              <div className="flex justify-center w-full mt-6">
                <img src="https://i.ibb.co/KpWRfC5c/Payment-gateway.png" alt="Payment Options" className="w-full max-w-[280px] object-contain opacity-90 hover:opacity-100 transition-all hover:scale-105" />
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Lock size={12} /> {t('securedPayment')}
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
      <Card className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('financeSupport')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">We are here to help with any payment related inquiries.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('subject')}</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('message')}</label>
              <textarea rows={6} className={`${inputClasses} resize-none`} placeholder="Type your message..." />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('attachment')}</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition-all bg-gray-50 dark:bg-gray-800/30 group">
                <Upload className="mx-auto text-gray-400 mb-2 group-hover:text-primary transition-colors transform group-hover:scale-110" size={24} />
                <p className="text-sm text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">{t('chooseFile')}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                className="px-8"
                onClick={() => {
                  setSuccessMessage('Your support request has been submitted.');
                  setShowSuccessModal(true);
                }}
              >
                {t('submitRequest')}
              </Button>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-8 md:pt-0 md:pl-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('otherContact')}</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group cursor-pointer">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full transition-transform group-hover:scale-110">
                  <Mail className="text-orange-500" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{t('email')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 hover:underline">financesupport@qf.org.qa</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group cursor-pointer">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full transition-transform group-hover:scale-110">
                  <Phone className="text-yellow-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{t('phone')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">+974 4454 0000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // --- Layout ---

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text font-sans transition-colors duration-300`}>
      <header className="bg-[#53565A] dark:bg-slate-900 text-white sticky top-0 z-50 shadow-lg transition-colors duration-300 border-b border-transparent dark:border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <img src="https://i.ibb.co/ycxCB9dQ/QF-Tree-DIGITAL-WHITE-01.png" alt="Qatar Foundation" className="h-10 md:h-14 transition-transform group-hover:scale-105" />
              <div className="h-8 w-px bg-gray-400 hidden md:block"></div>
              <span className="text-lg md:text-xl font-bold hidden md:block tracking-tight">{t('portalTitle')}</span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="relative" ref={a11yRef}>
                <button 
                  onClick={() => setA11yMenuOpen(!a11yMenuOpen)}
                  className={`p-2 rounded-full transition-colors ${a11yMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  title={t('accessibility')}
                >
                  <Eye size={20} />
                </button>
                
                {a11yMenuOpen && (
                  <div className={`absolute ${lang === 'en' ? 'right-0' : 'left-0'} top-full mt-3 w-64 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 text-gray-800 dark:text-white animate-in fade-in zoom-in-95 z-50`}>
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="font-bold text-sm">{t('accessibility')}</span>
                      <button onClick={() => setA11yMenuOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={16}/></button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">{t('textSize')}</label>
                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                          <button onClick={() => setFontScale(Math.max(80, fontScale - 10))} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50" disabled={fontScale <= 80}><Minus size={14}/></button>
                          <span className="text-sm font-mono font-medium">{fontScale}%</span>
                          <button onClick={() => setFontScale(Math.min(130, fontScale + 10))} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50" disabled={fontScale >= 130}><Plus size={14}/></button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                         <span className="text-sm">{t('grayscale')}</span>
                         <button 
                           onClick={() => setGrayscale(!grayscale)}
                           className={`w-10 h-6 rounded-full transition-colors relative ${grayscale ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                         >
                           <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${grayscale ? 'translate-x-4' : 'translate-x-0'}`} />
                         </button>
                      </div>

                      <Button variant="outline" className="w-full text-xs py-1.5 h-auto" onClick={() => { setFontScale(100); setGrayscale(false); }}>
                         <RefreshCw size={12} /> {t('reset')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-600 mx-1"></div>

              <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Toggle Theme">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 group" title="Switch Language">
                <Globe size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-medium uppercase tracking-wider">{lang === 'en' ? 'AR' : 'EN'}</span>
              </button>

              <div className="relative group z-40">
                <button className="flex items-center gap-3 hover:bg-white/10 pl-3 pr-4 py-2 rounded-lg transition-colors">
                  <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm text-white border border-white/20">K</div>
                  <span className="font-medium">Khalid</span>
                  <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className={`absolute ${lang === 'en' ? 'right-0' : 'left-0'} top-full mt-2 w-48 bg-white dark:bg-dark-card rounded-xl shadow-xl py-2 text-gray-800 dark:text-white hidden group-hover:block transform origin-top-right animate-in fade-in slide-in-from-top-2 border border-gray-100 dark:border-gray-700`}>
                  <a href="#" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"><User size={16}/> {t('profile')}</a>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                  <a href="#" className="px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-3 transition-colors"><Lock size={16}/> {t('logout')}</a>
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
               <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {isMenuOpen && (
           <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-4 space-y-4 animate-in slide-in-from-top-5">
              <div className="flex justify-between items-center">
                 <span className="font-bold text-lg">{t('portalTitle')}</span>
                 <div className="flex gap-4">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-700 rounded-full">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                    <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="p-2 bg-gray-700 rounded-full font-bold text-xs w-8 h-8 flex items-center justify-center">{lang === 'en' ? 'AR' : 'EN'}</button>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                 <button onClick={() => setFontScale(100)} className="bg-gray-700 p-2 rounded text-xs">A</button>
                 <button onClick={() => setFontScale(115)} className="bg-gray-700 p-2 rounded text-sm">A+</button>
                 <button onClick={() => setGrayscale(!grayscale)} className={`bg-gray-700 p-2 rounded text-xs ${grayscale ? 'text-primary' : ''}`}>BW</button>
              </div>
              <div className="pt-4 border-t border-gray-700">
                 <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Account</p>
                 <div className="flex items-center gap-3 text-white bg-gray-700/50 p-3 rounded-lg">
                    <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">K</div>
                    <span className="font-medium">Khalid</span>
                 </div>
              </div>
           </div>
        )}
      </header>

      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-[64px] md:top-[80px] z-40 transition-colors duration-300">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {Object.values(MOCK_ACCOUNTS).map((acc) => (
              <button
                key={acc.id}
                onClick={() => setActiveAccount(acc)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeAccount.id === acc.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'
                }`}
              >
                {acc.name === 'All Accounts' ? t('allAccounts') : acc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
            {[
              { id: 'dashboard', icon: <PieChartIcon size={18} />, label: t('overview') },
              { id: 'statement', icon: <Download size={18} />, label: t('statement') },
              { id: 'payment', icon: <CreditCard size={18} />, label: t('makePayment') },
              { id: 'support', icon: <Shield size={18} />, label: t('financeSupport') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 gap-2 whitespace-nowrap relative
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'}
                `}
              >
                <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                   <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-primary animate-in fade-in slide-in-from-left-5 duration-300"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'statement' && <StatementView />}
          {activeTab === 'payment' && <PaymentView />}
          {activeTab === 'support' && <SupportView />}
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <img src="https://i.ibb.co/ycxCB9dQ/QF-Tree-DIGITAL-WHITE-01.png" alt="Qatar Foundation" className="h-16 opacity-90 hover:opacity-100 transition-opacity" />
              <p className="text-sm">Education City, Doha, Qatar</p>
            </div>
            
            <div>
               <h3 className="text-white font-bold mb-4 border-l-2 border-primary pl-3">Quick Links</h3>
               <ul className="space-y-2 text-sm">
                  <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-primary transition-all hover:pl-2 block">{t('overview')}</button></li>
                  <li><button onClick={() => setActiveTab('payment')} className="hover:text-primary transition-all hover:pl-2 block">{t('makePayment')}</button></li>
                  <li><button onClick={() => setActiveTab('statement')} className="hover:text-primary transition-all hover:pl-2 block">{t('statement')}</button></li>
               </ul>
            </div>

             <div>
               <h3 className="text-white font-bold mb-4 border-l-2 border-primary pl-3">Resources</h3>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-primary transition-all hover:pl-2 block">FAQ</a></li>
                  <li><a href="#" className="hover:text-primary transition-all hover:pl-2 block">Policies</a></li>
                  <li><a href="#" className="hover:text-primary transition-all hover:pl-2 block">Terms</a></li>
               </ul>
            </div>

            <div>
               <h3 className="text-white font-bold mb-4 border-l-2 border-primary pl-3">Connect</h3>
               <div className="flex gap-4">
                  <a href="https://www.facebook.com/QatarFoundation" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg hover:bg-[#1877F2] hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg group">
                    <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="https://www.instagram.com/qatarfoundation" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg hover:bg-[#E4405F] hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg group">
                    <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                  </a>
                  <a href="https://www.linkedin.com/company/qatar-foundation" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg hover:bg-[#0A66C2] hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg group">
                    <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                  </a>
                   <a href="https://www.qf.org.qa" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-lg hover:bg-primary hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg group">
                    <Globe size={18} className="group-hover:scale-110 transition-transform" />
                  </a>
               </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2025 Qatar Foundation. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-8 max-w-sm w-full relative z-10 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                <CheckCircle size={48} className="text-green-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{t('success')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{successMessage}</p>
            <Button className="w-full" onClick={() => setShowSuccessModal(false)}>
              {t('close')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;