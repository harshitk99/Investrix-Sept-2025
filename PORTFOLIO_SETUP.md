# Investment Portfolio Dashboard Setup

## Overview
This implementation adds a comprehensive investment portfolio dashboard to your Investrix platform with the following features:

1. **Unified Investment Portfolio Dashboard**
   - Invested amount tracking
   - Current valuation monitoring
   - Repayment progress visualization
   - Expected ROI timeline

2. **Cashflow Calendar**
   - Visual calendar showing repayment due dates
   - Personal finance app sync capability
   - Color-coded event status (upcoming, received, overdue)

3. **Investment Reminders & Notifications**
   - Repayment due date reminders
   - New opportunity notifications
   - Risk alerts
   - Voice reminder options
   - Email and push notification settings

4. **Smart AI Insights (Gemini-Powered)**
   - Risk score analysis for each SME
   - Personalized investment suggestions
   - ROI comparison charts
   - Cashflow optimization recommendations

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Gemini AI Configuration (Required for AI insights)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Personal Finance Integration
YNAB_API_KEY=your_ynab_api_key_here
```

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install @google/generative-ai
   ```

2. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

3. **Optional: YNAB Integration**
   - Get your YNAB API key from YNAB Settings → Developer Settings
   - Add it to your `.env.local` file

## New Files Created

### Components
- `src/components/portfolio/PortfolioSummary.tsx` - Portfolio overview cards
- `src/components/portfolio/InvestmentCard.tsx` - Individual investment cards
- `src/components/portfolio/CashflowCalendar.tsx` - Calendar widget
- `src/components/portfolio/AIInsights.tsx` - AI-powered insights panel
- `src/components/portfolio/NotificationCenter.tsx` - Notification settings
- `src/components/portfolio/ROIComparisonChart.tsx` - Analytics charts

### Pages
- `src/app/dashboard/investor/portfolio/page.tsx` - Main portfolio dashboard
- `src/app/dashboard/investor/portfolio/settings/page.tsx` - Settings page

### API Routes
- `src/app/api/portfolio/insights/route.ts` - AI insights generation
- `src/app/api/portfolio/risk-score/route.ts` - Risk scoring
- `src/app/api/portfolio/notifications/route.ts` - Notification management

### Types & Utilities
- `src/types/portfolio.ts` - TypeScript interfaces
- `src/lib/personalFinance.ts` - Personal finance integration utilities

## Features Implemented

### 1. Investment Portfolio Dashboard
- ✅ Unified view of all SME investments
- ✅ Invested amount tracking
- ✅ Current valuation monitoring
- ✅ Repayment progress visualization
- ✅ Expected ROI timeline

### 2. Cashflow Calendar
- ✅ Visual calendar showing repayment dates
- ✅ Personal finance app sync capability
- ✅ Color-coded event status
- ✅ Export functionality

### 3. Investment Reminders & Notifications
- ✅ Repayment reminder system
- ✅ New opportunity notifications
- ✅ Risk alerts
- ✅ Voice reminder options
- ✅ Email and push notification settings
- ✅ Customizable reminder timing

### 4. Smart AI Insights
- ✅ Gemini-powered risk analysis
- ✅ Personalized investment suggestions
- ✅ ROI comparison charts
- ✅ Cashflow optimization recommendations
- ✅ Risk score calculation (1-10 scale)

## Usage

1. **Access Portfolio Dashboard**
   - Navigate to `/dashboard/investor/portfolio`
   - View your investment summary and analytics

2. **Configure Settings**
   - Go to `/dashboard/investor/portfolio/settings`
   - Set up personal finance integration
   - Configure notification preferences

3. **View AI Insights**
   - AI insights appear automatically in the sidebar
   - Click on insights for detailed information
   - Insights update based on your portfolio

4. **Monitor Cashflow**
   - Use the calendar to track upcoming repayments
   - Set up automatic sync with personal finance apps
   - Export data for manual entry

## API Endpoints

### GET `/api/portfolio/insights`
Generate AI-powered insights for your portfolio

### POST `/api/portfolio/risk-score`
Calculate risk score for a specific investment

### GET/POST `/api/portfolio/notifications`
Manage notifications and reminders

## Personal Finance Integration

Supported platforms:
- **Manual Export**: Download JSON files for manual entry
- **YNAB**: Direct API integration with You Need A Budget
- **Mint**: Limited API access (simulated)
- **Personal Capital**: API integration (simulated)

## AI Features

The Gemini AI integration provides:
- Risk assessment and scoring
- Investment opportunity matching
- Portfolio optimization suggestions
- Cashflow analysis
- Personalized recommendations

## Customization

All components are fully customizable:
- Modify color schemes in Tailwind classes
- Adjust chart types in `ROIComparisonChart.tsx`
- Customize AI prompts in API routes
- Add new personal finance providers in `personalFinance.ts`

## Troubleshooting

1. **AI Insights Not Loading**
   - Check if `GEMINI_API_KEY` is set correctly
   - Verify API key has proper permissions

2. **Personal Finance Sync Issues**
   - Ensure API keys are valid
   - Check network connectivity
   - Verify provider-specific requirements

3. **Notifications Not Working**
   - Check browser notification permissions
   - Verify Firebase configuration
   - Test notification settings

## Future Enhancements

Potential additions:
- Real-time market data integration
- Advanced portfolio rebalancing
- Tax optimization suggestions
- Mobile app notifications
- Advanced AI model fine-tuning
- Integration with more personal finance apps
