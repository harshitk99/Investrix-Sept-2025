import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { investments, userId } = await request.json();

    if (!investments || !Array.isArray(investments)) {
      return NextResponse.json({ error: 'Invalid investments data' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare investment data for AI analysis
    const investmentSummary = investments.map(inv => ({
      companyName: inv.companyName,
      businessType: inv.businessType,
      investedAmount: inv.investedAmount,
      currentValuation: inv.currentValuation,
      interestRate: inv.interestRate,
      tenure: inv.tenure,
      riskScore: inv.riskScore,
      status: inv.status,
      monthlyRepayment: inv.monthlyRepayment
    }));

    const prompt = `
    Analyze the following SME investment portfolio and provide AI-powered insights:

    Investment Portfolio:
    ${JSON.stringify(investmentSummary, null, 2)}

    Please provide insights in the following categories:
    1. Risk Analysis: Identify high-risk investments and diversification opportunities
    2. Cashflow Optimization: Analyze monthly cashflow patterns and suggest optimizations
    3. Investment Opportunities: Suggest new investment opportunities based on current portfolio
    4. ROI Analysis: Compare performance across different investments and sectors

    Return the response as a JSON array of insights with the following structure:
    [
      {
        "id": "unique-id",
        "type": "risk_analysis|opportunity|recommendation|cashflow_optimization",
        "title": "Insight Title",
        "description": "Detailed description of the insight",
        "confidence": 85,
        "actionable": true,
        "priority": "low|medium|high",
        "data": {}
      }
    ]

    Focus on actionable insights that can help optimize the investment portfolio.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    let insights;
    try {
      // Extract JSON from the response (AI might include extra text)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to mock insights if parsing fails
      insights = generateFallbackInsights(investments);
    }

    // Add timestamps and ensure proper formatting
    const formattedInsights = insights.map((insight: any) => ({
      ...insight,
      id: insight.id || `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      confidence: Math.min(Math.max(insight.confidence || 75, 0), 100),
      actionable: insight.actionable !== false,
      priority: ['low', 'medium', 'high'].includes(insight.priority) ? insight.priority : 'medium'
    }));

    return NextResponse.json({ insights: formattedInsights });

  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function generateFallbackInsights(investments: any[]) {
  const insights = [];

  // Risk analysis
  const highRiskInvestments = investments.filter(inv => inv.riskScore > 7);
  if (highRiskInvestments.length > 0) {
    insights.push({
      id: 'risk-analysis-fallback',
      type: 'risk_analysis',
      title: 'High Risk Investment Alert',
      description: `You have ${highRiskInvestments.length} investment(s) with high risk scores. Consider diversifying your portfolio to reduce overall risk.`,
      confidence: 85,
      actionable: true,
      priority: 'high',
      data: { highRiskCount: highRiskInvestments.length }
    });
  }

  // Cashflow optimization
  const totalMonthlyCashflow = investments.reduce((sum, inv) => sum + (inv.monthlyRepayment || 0), 0);
  if (totalMonthlyCashflow > 0) {
    insights.push({
      id: 'cashflow-optimization-fallback',
      type: 'cashflow_optimization',
      title: 'Cashflow Analysis',
      description: `Your monthly cashflow of ${totalMonthlyCashflow.toFixed(2)} APT provides ${totalMonthlyCashflow > 100 ? 'strong' : 'moderate'} liquidity for new opportunities.`,
      confidence: 80,
      actionable: true,
      priority: 'medium',
      data: { monthlyCashflow: totalMonthlyCashflow }
    });
  }

  // Investment opportunity
  insights.push({
    id: 'opportunity-fallback',
    type: 'opportunity',
    title: 'Portfolio Diversification Opportunity',
    description: 'Consider diversifying into different business sectors to reduce risk and potentially increase returns.',
    confidence: 75,
    actionable: true,
    priority: 'medium',
    data: { recommendation: 'diversification' }
  });

  return insights;
}
