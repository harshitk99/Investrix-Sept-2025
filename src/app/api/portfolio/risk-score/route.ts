import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { companyData, investmentData } = await request.json();

    if (!companyData) {
      return NextResponse.json({ error: 'Company data is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Analyze the following SME company data and calculate a risk score from 1-10 (1 being lowest risk, 10 being highest risk):

    Company Information:
    - Company Name: ${companyData.companyName || 'Unknown'}
    - Business Type: ${companyData.businessType || 'Unknown'}
    - Loan Amount: ${companyData.loanAmount || 'Unknown'}
    - Purpose: ${companyData.purpose || 'Unknown'}
    - Interest Rate Expected: ${companyData.interestRateExpected || 'Unknown'}
    - Tenure: ${companyData.tenure || 'Unknown'}
    - Additional Details: ${companyData.additionalDetails || 'None provided'}

    Investment Context:
    ${investmentData ? JSON.stringify(investmentData, null, 2) : 'No additional investment context provided'}

    Consider the following risk factors:
    1. Business sector stability and market conditions
    2. Loan amount relative to business size
    3. Interest rate expectations
    4. Repayment tenure
    5. Business model viability
    6. Market competition
    7. Economic factors affecting the sector

    Return your analysis as a JSON object with the following structure:
    {
      "riskScore": 7,
      "riskLevel": "high|medium|low",
      "riskFactors": [
        {
          "factor": "Factor name",
          "impact": "high|medium|low",
          "description": "Explanation of the risk factor"
        }
      ],
      "recommendations": [
        "Recommendation 1",
        "Recommendation 2"
      ],
      "confidence": 85
    }

    Be thorough in your analysis and provide specific, actionable insights.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    let riskAnalysis;
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        riskAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to basic risk calculation
      riskAnalysis = generateFallbackRiskScore(companyData);
    }

    // Validate and format the response
    const formattedAnalysis = {
      riskScore: Math.min(Math.max(riskAnalysis.riskScore || 5, 1), 10),
      riskLevel: ['low', 'medium', 'high'].includes(riskAnalysis.riskLevel) 
        ? riskAnalysis.riskLevel 
        : riskAnalysis.riskScore <= 3 ? 'low' : riskAnalysis.riskScore <= 7 ? 'medium' : 'high',
      riskFactors: Array.isArray(riskAnalysis.riskFactors) ? riskAnalysis.riskFactors : [],
      recommendations: Array.isArray(riskAnalysis.recommendations) ? riskAnalysis.recommendations : [],
      confidence: Math.min(Math.max(riskAnalysis.confidence || 75, 0), 100),
      analyzedAt: new Date().toISOString()
    };

    return NextResponse.json({ riskAnalysis: formattedAnalysis });

  } catch (error) {
    console.error('Error calculating risk score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate risk score' },
      { status: 500 }
    );
  }
}

function generateFallbackRiskScore(companyData: any) {
  let riskScore = 5; // Default medium risk
  const riskFactors = [];
  const recommendations = [];

  // Basic risk assessment based on available data
  if (companyData.businessType) {
    const businessType = companyData.businessType.toLowerCase();
    
    // Higher risk sectors
    if (businessType.includes('restaurant') || businessType.includes('food')) {
      riskScore += 1;
      riskFactors.push({
        factor: 'Food Service Sector',
        impact: 'medium',
        description: 'Food service businesses face high competition and thin margins'
      });
    }
    
    if (businessType.includes('retail') || businessType.includes('shop')) {
      riskScore += 1;
      riskFactors.push({
        factor: 'Retail Sector',
        impact: 'medium',
        description: 'Retail businesses are sensitive to economic conditions and consumer spending'
      });
    }
  }

  // Loan amount analysis
  const loanAmount = parseFloat(companyData.loanAmount);
  if (loanAmount > 1000) {
    riskScore += 1;
    riskFactors.push({
      factor: 'High Loan Amount',
      impact: 'high',
      description: 'Large loan amounts increase repayment risk'
    });
  }

  // Interest rate analysis
  const interestRate = parseFloat(companyData.interestRateExpected);
  if (interestRate > 15) {
    riskScore += 1;
    riskFactors.push({
      factor: 'High Interest Rate',
      impact: 'medium',
      description: 'High interest rates may indicate higher perceived risk'
    });
  }

  // Tenure analysis
  const tenure = parseInt(companyData.tenure);
  if (tenure > 24) {
    riskScore += 1;
    riskFactors.push({
      factor: 'Long Repayment Period',
      impact: 'medium',
      description: 'Longer repayment periods increase uncertainty and risk'
    });
  }

  // Generate recommendations
  if (riskScore > 7) {
    recommendations.push('Consider requesting additional collateral or guarantees');
    recommendations.push('Monitor business performance closely during the loan period');
  } else if (riskScore < 4) {
    recommendations.push('This appears to be a relatively low-risk investment opportunity');
    recommendations.push('Consider offering competitive terms to secure the investment');
  } else {
    recommendations.push('Standard monitoring and risk management practices recommended');
    recommendations.push('Regular check-ins with the business owner are advised');
  }

  return {
    riskScore: Math.min(Math.max(riskScore, 1), 10),
    riskLevel: riskScore <= 3 ? 'low' : riskScore <= 7 ? 'medium' : 'high',
    riskFactors,
    recommendations,
    confidence: 70
  };
}
