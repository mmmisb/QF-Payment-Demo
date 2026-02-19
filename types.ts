export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export interface AccountData {
  id: string;
  name: string;
  outstanding: number;
  paid: number;
  activeInstallments: string;
  items: OutstandingItem[];
}

export interface OutstandingItem {
  id: string;
  date: string;
  desc: string;
  dueDate: string;
  amount: number;
  sponsor: string;
}

export interface StatementItem {
  date: string;
  txId: string;
  desc: string;
  debit: string;
  credit: string;
  balance: string;
}