"use client";
import { AIInsight } from "@/types/portfolio";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target } from "lucide-react";

interface AIInsightsProps {
  insights: AIInsight[];
  onInsightClick: (insight: AIInsight) => void;
}

export default function AIInsights({ insights, onInsightClick }: AIInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk_analysis': return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5" />;
      case 'cashflow_optimization': return <Target className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'risk_analysis': return 'text-red-400 bg-red-500 bg-opacity-20';
      case 'opportunity': return 'text-green-400 bg-green-500 bg-opacity-20';
      case 'recommendation': return 'text-blue-400 bg-blue-500 bg-opacity-20';
      case 'cashflow_optimization': return 'text-purple-400 bg-purple-500 bg-opacity-20';
      default: return 'text-gray-400 bg-gray-500 bg-opacity-20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500 bg-opacity-10';
      case 'medium': return 'border-yellow-500 bg-yellow-500 bg-opacity-10';
      case 'low': return 'border-gray-500 bg-gray-500 bg-opacity-10';
      default: return 'border-gray-500 bg-gray-500 bg-opacity-10';
    }
  };

  const sortedInsights = insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
        <span className="px-2 py-1 bg-purple-500 bg-opacity-20 text-purple-400 text-xs rounded-full">
          Powered by Gemini
        </span>
      </div>

      <div className="space-y-4">
        {sortedInsights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No insights available at the moment</p>
            <p className="text-gray-500 text-sm">AI is analyzing your portfolio...</p>
          </div>
        ) : (
          sortedInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-gray-600 ${getPriorityColor(insight.priority)}`}
              onClick={() => onInsightClick(insight)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-medium">{insight.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.priority === 'high' ? 'bg-red-500 text-white' :
                      insight.priority === 'medium' ? 'bg-yellow-500 text-black' :
                      'bg-gray-500 text-white'
                    }`}>
                      {insight.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {insight.createdAt.toLocaleDateString()}
                    </span>
                    {insight.actionable && (
                      <span className="text-xs text-blue-400 font-medium">
                        Click for details →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Analysis Status */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400">AI Analysis Active</span>
          </div>
          <span className="text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
