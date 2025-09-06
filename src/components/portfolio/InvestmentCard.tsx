"use client";
import { Investment } from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface InvestmentCardProps {
  investment: Investment;
  onViewDetails: (investmentId: string) => void;
}

export default function InvestmentCard({ investment, onViewDetails }: InvestmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'defaulted': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'defaulted': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'text-green-400';
    if (riskScore <= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const calculateProgress = () => {
    const now = new Date();
    const start = new Date(investment.startDate);
    const end = new Date(investment.expectedEndDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const progress = calculateProgress();
  const currentValue = investment.currentValuation;
  const roi = ((currentValue - investment.investedAmount) / investment.investedAmount) * 100;

  return (
    <div className="p-6 rounded-lg border border-gray-700 bg-gray-900 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {investment.companyName.split(' ').map(word => word[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{investment.companyName}</h3>
            <p className="text-gray-400 text-sm">{investment.businessType}</p>
          </div>
        </div>
        <span className={`px-3 py-1 ${getStatusColor(investment.status)} text-black text-sm rounded-full flex items-center gap-1`}>
          {getStatusIcon(investment.status)}
          {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Investment Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm">Invested Amount</p>
          <p className="text-white font-medium">{investment.investedAmount.toFixed(2)} APT</p>
          <p className="text-gray-500 text-xs">₹{(investment.investedAmount * 777.36).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Current Value</p>
          <p className="text-white font-medium">{currentValue.toFixed(2)} APT</p>
          <p className="text-gray-500 text-xs">₹{(currentValue * 777.36).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">ROI</p>
          <p className={`font-medium ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Risk Score</p>
          <p className={`font-medium ${getRiskColor(investment.riskScore)}`}>
            {investment.riskScore}/10
          </p>
        </div>
      </div>

      {/* Repayment Info */}
      <div className="border-t border-gray-700 pt-4 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Next Repayment</span>
          </div>
          <span className="text-white">
            {investment.nextRepaymentDate.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-400">Monthly Payment</span>
          <span className="text-white font-medium">
            {investment.monthlyRepayment.toFixed(2)} APT
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => onViewDetails(investment.id)}
        className="w-full bg-white text-black hover:bg-gray-200"
      >
        View Details
      </Button>
    </div>
  );
}
