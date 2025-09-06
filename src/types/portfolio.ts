export interface Investment {
  id: string;
  companyName: string;
  investedAmount: number;
  currentValuation: number;
  interestRate: number;
  tenure: number; // in months
  startDate: Date;
  expectedEndDate: Date;
  status: 'active' | 'completed' | 'defaulted';
  businessType: string;
  riskScore: number; // 1-10 scale
  monthlyRepayment: number;
  totalExpectedReturn: number;
  repaymentSchedule: RepaymentSchedule[];
  lastRepaymentDate?: Date;
  nextRepaymentDate: Date;
}

export interface RepaymentSchedule {
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: Date;
  transactionHash?: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalExpectedReturn: number;
  activeInvestments: number;
  completedInvestments: number;
  averageROI: number;
  monthlyCashflow: number;
  nextRepaymentDate: Date;
  riskDistribution: {
    low: number; // 1-3
    medium: number; // 4-7
    high: number; // 8-10
  };
}

export interface CashflowEvent {
  id: string;
  investmentId: string;
  companyName: string;
  amount: number;
  dueDate: Date;
  type: 'repayment' | 'interest' | 'principal';
  status: 'upcoming' | 'received' | 'overdue';
}

export interface AIInsight {
  id: string;
  type: 'risk_analysis' | 'opportunity' | 'recommendation' | 'cashflow_optimization';
  title: string;
  description: string;
  confidence: number; // 0-100
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface NotificationSettings {
  repaymentReminders: boolean;
  newOpportunities: boolean;
  riskAlerts: boolean;
  voiceReminders: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderDaysBefore: number; // days before due date
}

export interface PersonalFinanceIntegration {
  enabled: boolean;
  provider: 'mint' | 'ynab' | 'personal_capital' | 'manual';
  apiKey?: string;
  autoSync: boolean;
  lastSyncDate?: Date;
}
