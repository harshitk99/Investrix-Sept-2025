"use client";
import { Investment } from "@/types/portfolio";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ROIComparisonChartProps {
  investments: Investment[];
}

export default function ROIComparisonChart({ investments }: ROIComparisonChartProps) {
  // Prepare data for different chart types
  const barChartData = investments.map(inv => ({
    name: inv.companyName.length > 10 ? inv.companyName.substring(0, 10) + '...' : inv.companyName,
    fullName: inv.companyName,
    roi: ((inv.currentValuation - inv.investedAmount) / inv.investedAmount) * 100,
    invested: inv.investedAmount,
    current: inv.currentValuation,
    riskScore: inv.riskScore
  }));

  const pieChartData = investments.reduce((acc, inv) => {
    const existing = acc.find(item => item.name === inv.businessType);
    if (existing) {
      existing.value += inv.investedAmount;
    } else {
      acc.push({
        name: inv.businessType,
        value: inv.investedAmount
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const lineChartData = investments.map(inv => {
    const monthsElapsed = Math.max(0, (new Date().getTime() - new Date(inv.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    const expectedValue = inv.investedAmount + (inv.investedAmount * inv.interestRate / 100 * monthsElapsed / 12);
    
    return {
      name: inv.companyName.length > 8 ? inv.companyName.substring(0, 8) + '...' : inv.companyName,
      invested: inv.investedAmount,
      current: inv.currentValuation,
      expected: expectedValue,
      monthsElapsed: Math.floor(monthsElapsed)
    };
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-white font-medium">{label}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-blue-400">
            Amount: {data.value.toFixed(2)} APT
          </p>
          <p className="text-gray-400 text-sm">
            {((data.value / investments.reduce((sum, inv) => sum + inv.investedAmount, 0)) * 100).toFixed(1)}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  if (investments.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 text-center">
        <p className="text-gray-400 mb-4">No investment data available for comparison</p>
        <p className="text-gray-500 text-sm">Start investing to see ROI comparisons</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ROI Comparison Bar Chart */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">ROI Comparison by Investment</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="roi" 
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Distribution by Business Type */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance vs Expected */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance vs Expected</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                label={{ value: 'Value (APT)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                        <p className="text-white font-medium">{label}</p>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {payload.map((entry: any, index: number) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.dataKey}: {entry.value.toFixed(2)} APT
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="invested" 
                stroke="#6B7280" 
                strokeWidth={2}
                name="Invested"
                dot={{ fill: '#6B7280', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Current"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expected" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Expected"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk vs Return Scatter Plot */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk vs Return Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                      <p className="text-white font-medium">{data.fullName}</p>
                      <p className="text-red-400">Risk Score: {data.riskScore}/10</p>
                      <p className="text-blue-400">ROI: {data.roi.toFixed(2)}%</p>
                      <p className="text-gray-400">Invested: {data.invested.toFixed(2)} APT</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="riskScore" 
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
