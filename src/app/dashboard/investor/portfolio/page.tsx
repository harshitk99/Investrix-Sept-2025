"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import PortfolioSummary from "@/components/portfolio/PortfolioSummary";
import InvestmentCard from "@/components/portfolio/InvestmentCard";
import CashflowCalendar from "@/components/portfolio/CashflowCalendar";
import AIInsights from "@/components/portfolio/AIInsights";
import NotificationCenter from "@/components/portfolio/NotificationCenter";
import ROIComparisonChart from "@/components/portfolio/ROIComparisonChart";
import { 
  Investment, 
  PortfolioSummary as PortfolioSummaryType, 
  CashflowEvent, 
  AIInsight, 
  NotificationSettings 
} from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { Settings, Download, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function PortfolioDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummaryType | null>(null);
  const [cashflowEvents, setCashflowEvents] = useState<CashflowEvent[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    repaymentReminders: true,
    newOpportunities: true,
    riskAlerts: true,
    voiceReminders: false,
    emailNotifications: true,
    pushNotifications: true,
    reminderDaysBefore: 3
  });
  const [isLoading, setIsLoading] = useState(true);
  const [unreadNotifications] = useState(3);

  const fetchPortfolioData = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch finalized bids (investments)
      const bidsSnapshot = await getDocs(collection(db, "bids"));
      const userInvestments: Investment[] = [];
      const events: CashflowEvent[] = [];

      for (const bidDoc of bidsSnapshot.docs) {
        const bidData = bidDoc.data();
        if (bidData.userId === userId && (bidData.status === 'finalized' || bidData.status === 'completed')) {
          // Get application details
          let companyName = "Unknown Company";
          let businessType = "Unknown";
          
          if (bidData.applicationId) {
            const appDoc = await getDoc(doc(db, "applications", bidData.applicationId));
            if (appDoc.exists()) {
              const appData = appDoc.data();
              companyName = appData.companyName || companyName;
              businessType = appData.businessType || businessType;
            }
          }

          const investedAmount = parseFloat(bidData.loanAmount || "0");
          const interestRate = parseFloat(bidData.interestRate || "10");
          const tenure = parseInt(bidData.tenure || "12");
          const startDate = new Date(bidData.createdAt?.toDate() || new Date());
          const expectedEndDate = new Date(startDate);
          expectedEndDate.setMonth(expectedEndDate.getMonth() + tenure);

          // Calculate current valuation (simplified - in real app, this would be more complex)
          const monthsElapsed = Math.max(0, (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
          const monthlyInterest = (investedAmount * interestRate / 100) / 12;
          const currentValuation = investedAmount + (monthlyInterest * monthsElapsed);

          const investment: Investment = {
            id: bidDoc.id,
            companyName,
            investedAmount,
            currentValuation,
            interestRate,
            tenure,
            startDate,
            expectedEndDate,
            status: bidData.status === 'completed' ? 'completed' : 'active',
            businessType,
            riskScore: Math.floor(Math.random() * 10) + 1, // Mock risk score
            monthlyRepayment: investedAmount / tenure + monthlyInterest,
            totalExpectedReturn: investedAmount + (monthlyInterest * tenure),
            repaymentSchedule: generateRepaymentSchedule(startDate, tenure, investedAmount / tenure + monthlyInterest),
            nextRepaymentDate: getNextRepaymentDate(startDate)
          };

          userInvestments.push(investment);

          // Generate cashflow events
          const nextRepayment = getNextRepaymentDate(startDate, tenure);
          if (nextRepayment <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) { // Next 30 days
            events.push({
              id: `${bidDoc.id}-next`,
              investmentId: bidDoc.id,
              companyName,
              amount: investment.monthlyRepayment,
              dueDate: nextRepayment,
              type: 'repayment',
              status: nextRepayment < new Date() ? 'overdue' : 'upcoming'
            });
          }
        }
      }

      setInvestments(userInvestments);
      setCashflowEvents(events);
      
      // Calculate portfolio summary
      const summary = calculatePortfolioSummary(userInvestments);
      setPortfolioSummary(summary);

      // Generate mock AI insights
      const insights = generateMockAIInsights(userInvestments);
      setAIInsights(insights);

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchPortfolioData(user.uid);
      } else {
        router.push("/login");
      }
    });
  }, [router, fetchPortfolioData]);

  const generateRepaymentSchedule = (startDate: Date, tenure: number, monthlyAmount: number) => {
    const schedule = [];
    for (let i = 0; i < tenure; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      schedule.push({
        dueDate,
        amount: monthlyAmount,
        status: dueDate < new Date() ? 'paid' : 'pending' as 'pending' | 'paid' | 'overdue'
      });
    }
    return schedule;
  };

  const getNextRepaymentDate = (startDate: Date) => {
    const now = new Date();
    const monthsElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const nextRepayment = new Date(startDate);
    nextRepayment.setMonth(nextRepayment.getMonth() + monthsElapsed + 1);
    return nextRepayment;
  };

  const calculatePortfolioSummary = (investments: Investment[]): PortfolioSummaryType => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValuation, 0);
    const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.totalExpectedReturn, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    const completedInvestments = investments.filter(inv => inv.status === 'completed').length;
    const averageROI = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;
    const monthlyCashflow = investments.reduce((sum, inv) => sum + inv.monthlyRepayment, 0);
    
    const nextRepaymentDate = investments.length > 0 
      ? new Date(Math.min(...investments.map(inv => inv.nextRepaymentDate.getTime())))
      : new Date();

    const riskDistribution = {
      low: investments.filter(inv => inv.riskScore <= 3).length,
      medium: investments.filter(inv => inv.riskScore > 3 && inv.riskScore <= 7).length,
      high: investments.filter(inv => inv.riskScore > 7).length
    };

    return {
      totalInvested,
      totalCurrentValue,
      totalExpectedReturn,
      activeInvestments,
      completedInvestments,
      averageROI,
      monthlyCashflow,
      nextRepaymentDate,
      riskDistribution
    };
  };

  const generateMockAIInsights = (investments: Investment[]): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Risk analysis insight
    const highRiskInvestments = investments.filter(inv => inv.riskScore > 7);
    if (highRiskInvestments.length > 0) {
      insights.push({
        id: 'risk-analysis-1',
        type: 'risk_analysis',
        title: 'High Risk Investment Alert',
        description: `You have ${highRiskInvestments.length} investment(s) with high risk scores. Consider diversifying your portfolio.`,
        confidence: 85,
        actionable: true,
        priority: 'high',
        createdAt: new Date(),
        data: { highRiskCount: highRiskInvestments.length }
      });
    }

    // Cashflow optimization insight
    const totalMonthlyCashflow = investments.reduce((sum, inv) => sum + inv.monthlyRepayment, 0);
    if (totalMonthlyCashflow > 100) {
      insights.push({
        id: 'cashflow-opt-1',
        type: 'cashflow_optimization',
        title: 'Strong Cashflow Position',
        description: `Your monthly cashflow of ${totalMonthlyCashflow.toFixed(2)} APT provides good liquidity for new opportunities.`,
        confidence: 92,
        actionable: true,
        priority: 'medium',
        createdAt: new Date(),
        data: { monthlyCashflow: totalMonthlyCashflow }
      });
    }

    // Opportunity insight
    insights.push({
      id: 'opportunity-1',
      type: 'opportunity',
      title: 'Food & Beverage Sector Opportunity',
      description: 'Based on your investment history, consider short-term food business investments for upcoming travel cashflow needs.',
      confidence: 78,
      actionable: true,
      priority: 'medium',
      createdAt: new Date(),
      data: { sector: 'food_beverage', duration: 'short_term' }
    });

    return insights;
  };

  const handleInvestmentDetails = (investmentId: string) => {
    // Navigate to detailed investment view
    router.push(`/dashboard/investor/portfolio/investment/${investmentId}`);
  };

  const handleCashflowEventClick = (event: CashflowEvent) => {
    // Show event details modal or navigate to relevant page
    toast.success(`Repayment from ${event.companyName}: ${event.amount.toFixed(2)} APT`);
  };

  const handleAIInsightClick = (insight: AIInsight) => {
    // Show detailed insight modal
    toast.info(`Insight: ${insight.title}`);
  };

  const handleExportPortfolio = () => {
    // Export portfolio data
    const dataStr = JSON.stringify({ investments, portfolioSummary }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-data.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Portfolio data exported successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Investment Portfolio</h1>
            <p className="text-gray-400 mt-2">Track your SME investments and optimize returns</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter
              settings={notificationSettings}
              onSettingsChange={setNotificationSettings}
              unreadCount={unreadNotifications}
            />
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
              onClick={handleExportPortfolio}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
              onClick={() => router.push('/dashboard/investor/portfolio/settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
              onClick={() => fetchPortfolioData(userId!)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        {portfolioSummary && (
          <PortfolioSummary summary={portfolioSummary} />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investments List */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Investments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {investments.length === 0 ? (
                  <div className="col-span-2 p-8 text-center border border-gray-700 rounded-lg">
                    <p className="text-gray-400 mb-4">No investments found</p>
                    <Button
                      onClick={() => router.push('/dashboard/investor')}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      Browse Investment Opportunities
                    </Button>
                  </div>
                ) : (
                  investments.map((investment) => (
                    <InvestmentCard
                      key={investment.id}
                      investment={investment}
                      onViewDetails={handleInvestmentDetails}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Cashflow Calendar */}
            <CashflowCalendar
              events={cashflowEvents}
              onEventClick={handleCashflowEventClick}
            />
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            <AIInsights
              insights={aiInsights}
              onInsightClick={handleAIInsightClick}
            />
          </div>
        </div>

        {/* ROI Comparison Charts */}
        {investments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6">Investment Analytics</h2>
            <ROIComparisonChart investments={investments} />
          </div>
        )}
      </div>
    </div>
  );
}
