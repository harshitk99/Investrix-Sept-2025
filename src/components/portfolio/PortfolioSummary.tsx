"use client";
import { PortfolioSummary as PortfolioSummaryType } from "@/types/portfolio";
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle } from "lucide-react";

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const roiColor = summary.averageROI >= 0 ? "text-green-400" : "text-red-400";
  const roiIcon = summary.averageROI >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Invested */}
      <div className="p-6 rounded-lg border border-gray-700 bg-gray-900 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Invested</p>
            <p className="text-2xl font-bold text-white">{summary.totalInvested.toFixed(2)} APT</p>
            <p className="text-gray-500 text-sm">₹{(summary.totalInvested * 777.36).toFixed(2)}</p>
          </div>
          <DollarSign className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      {/* Current Value */}
      <div className="p-6 rounded-lg border border-gray-700 bg-gray-900 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Current Value</p>
            <p className="text-2xl font-bold text-white">{summary.totalCurrentValue.toFixed(2)} APT</p>
            <p className="text-gray-500 text-sm">₹{(summary.totalCurrentValue * 777.36).toFixed(2)}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-400" />
        </div>
      </div>

      {/* Average ROI */}
      <div className="p-6 rounded-lg border border-gray-700 bg-gray-900 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Average ROI</p>
            <p className={`text-2xl font-bold ${roiColor}`}>{summary.averageROI.toFixed(2)}%</p>
            <p className="text-gray-500 text-sm">Expected: {summary.totalExpectedReturn.toFixed(2)} APT</p>
          </div>
          {roiIcon === TrendingUp ? (
            <TrendingUp className="w-8 h-8 text-green-400" />
          ) : (
            <TrendingDown className="w-8 h-8 text-red-400" />
          )}
        </div>
      </div>

      {/* Monthly Cashflow */}
      <div className="p-6 rounded-lg border border-gray-700 bg-gray-900 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Monthly Cashflow</p>
            <p className="text-2xl font-bold text-white">{summary.monthlyCashflow.toFixed(2)} APT</p>
            <p className="text-gray-500 text-sm">Next: {summary.nextRepaymentDate.toLocaleDateString()}</p>
          </div>
          <Calendar className="w-8 h-8 text-purple-400" />
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="p-6 rounded-lg border border-gray-700 bg-gray-900 hover:border-gray-600 transition-colors md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Risk Distribution</h3>
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto mb-2">
              <span className="text-green-400 font-bold">{summary.riskDistribution.low}</span>
            </div>
            <p className="text-gray-400 text-sm">Low Risk</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center mx-auto mb-2">
              <span className="text-yellow-400 font-bold">{summary.riskDistribution.medium}</span>
            </div>
            <p className="text-gray-400 text-sm">Medium Risk</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center mx-auto mb-2">
              <span className="text-red-400 font-bold">{summary.riskDistribution.high}</span>
            </div>
            <p className="text-gray-400 text-sm">High Risk</p>
          </div>
        </div>
      </div>

      {/* Active vs Completed */}
      <div className="p-6 rounded-lg border border-gray-700 bg-gray-900 hover:border-gray-600 transition-colors md:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Investment Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-400 font-bold text-xl">{summary.activeInvestments}</span>
            </div>
            <p className="text-gray-400 text-sm">Active</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-500 bg-opacity-20 flex items-center justify-center mx-auto mb-2">
              <span className="text-gray-400 font-bold text-xl">{summary.completedInvestments}</span>
            </div>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
