import React, { useState, useMemo, useRef, useEffect } from 'react';

/**
 * MOCK TIME SERIES & ANALYTICS GENERATOR
 */
const generateHistoricalData = (yearsCount = 5) => {
  const points = yearsCount * 12; // monthly points
  const labels = [];
  const treasuryIncome = [];
  const treasuryExpenses = [];
  const treasuryNet = [];
  const treasuryDebt = [];
  
  const rciDemandR = [];
  const rciDemandC = [];
  const rciDemandI = [];

  const popGrowth = [];
  const aqiLevels = [];
  const trafficCongestion = [];

  let baseIncome = 120000;
  let baseExpense = 95000;
  let baseDebt = 500000;
  let basePop = 24000;

  for (let i = 0; i < points; i++) {
    const yr = 2026 + Math.floor(i / 12);
    const mo = (i % 12) + 1;
    const label = `Y${yr - 2025} M${mo < 10 ? '0' + mo : mo}`;
    labels.push(label);

    const incNoise = (Math.random() - 0.45) * 8000;
    const expNoise = (Math.random() - 0.48) * 6000;
    
    baseIncome += Math.floor(1200 + incNoise);
    baseExpense += Math.floor(900 + expNoise);
    baseDebt = Math.max(0, baseDebt - (baseIncome - baseExpense) * 0.2);
    basePop += Math.floor(150 + Math.random() * 200);

    treasuryIncome.push(baseIncome);
    treasuryExpenses.push(baseExpense);
    treasuryNet.push(baseIncome - baseExpense);
    treasuryDebt.push(Math.round(baseDebt));

    // RCI demand curves oscillate (-100 to +100)
    rciDemandR.push(Math.round(Math.sin(i * 0.3) * 45 + 35 + (Math.random() - 0.5) * 10));
    rciDemandC.push(Math.round(Math.cos(i * 0.25) * 40 + 25 + (Math.random() - 0.5) * 12));
    rciDemandI.push(Math.round(Math.sin(i * 0.2 + 1) * 35 + 15 + (Math.random() - 0.5) * 15));

    popGrowth.push(basePop);
    aqiLevels.push(Math.round(35 + Math.sin(i * 0.15) * 20 + (Math.random() - 0.5) * 8));
    trafficCongestion.push(Math.round(42 + (i / points) * 25 + Math.sin(i * 0.4) * 10));
  }

  return {
    labels,
    treasury: { income: treasuryIncome, expenses: treasuryExpenses, net: treasuryNet, debt: treasuryDebt },
    rci: { residential: rciDemandR, commercial: rciDemandC, industrial: rciDemandI },
    environment: { population: popGrowth, aqi: aqiLevels, traffic: trafficCongestion }
  };
};

/**
 * 1. POPULATION DEMOGRAPHIC PYRAMID COMPONENT (SVG/Canvas Renderer)
 */
const DemographicPyramidChart = () => {
  const ageGroups = [
    { label: '90+', male: 320, female: 540 },
    { label: '80-89', male: 890, female: 1240 },
    { label: '70-79', male: 1850, female: 2310 },
    { label: '60-69', male: 3400, female: 3820 },
    { label: '50-59', male: 5200, female: 5480 },
    { label: '40-49', male: 7800, female: 7920 },
    { label: '30-39', male: 9400, female: 9150 },
    { label: '20-29', male: 8600, female: 8400 },
    { label: '10-19', male: 6100, female: 5950 },
    { label: '0-9', male: 4800, female: 4620 }
  ];

  const totalMale = ageGroups.reduce((acc, curr) => acc + curr.male, 0);
  const totalFemale = ageGroups.reduce((acc, curr) => acc + curr.female, 0);
  const totalPop = totalMale + totalFemale;

  const maxVal = Math.max(...ageGroups.map(a => Math.max(a.male, a.female)));
  const barHeight = 22;
  const chartWidth = 500;
  const halfWidth = chartWidth / 2 - 40;

  const [hoveredGroup, setHoveredGroup] = useState(null);

  return (
    <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#4285f4', fontWeight: '700' }}>
            👥 Population Demographic Pyramid
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Age Cohort & Gender Distribution Breakdown</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
          <span style={{ color: '#4285f4' }}>Male: <strong>{totalMale.toLocaleString()} ({((totalMale / totalPop) * 100).toFixed(1)}%)</strong></span>
          <span style={{ color: '#ec407a' }}>Female: <strong>{totalFemale.toLocaleString()} ({((totalFemale / totalPop) * 100).toFixed(1)}%)</strong></span>
        </div>
      </div>

      <svg width="100%" height={ageGroups.length * (barHeight + 6) + 40} viewBox={`0 0 ${chartWidth} ${ageGroups.length * (barHeight + 6) + 40}`}>
        {/* Central Axis */}
        <line x1={chartWidth / 2} y1="10" x2={chartWidth / 2} y2={ageGroups.length * (barHeight + 6) + 10} stroke="#2d3a4f" strokeWidth="2" />

        {ageGroups.map((group, idx) => {
          const y = idx * (barHeight + 6) + 10;
          const maleBarW = (group.male / maxVal) * halfWidth;
          const femaleBarW = (group.female / maxVal) * halfWidth;
          const isHovered = hoveredGroup === group.label;

          return (
            <g
              key={group.label}
              onMouseEnter={() => setHoveredGroup(group.label)}
              onMouseLeave={() => setHoveredGroup(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Male Bar (Left) */}
              <rect
                x={chartWidth / 2 - 35 - maleBarW}
                y={y}
                width={maleBarW}
                height={barHeight}
                fill={isHovered ? '#64b5f6' : '#1a73e8'}
                rx="3"
                opacity={hoveredGroup && !isHovered ? 0.4 : 1}
              />
              <text
                x={chartWidth / 2 - 40 - maleBarW}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fill="#9aa0a6"
                fontSize="10"
              >
                {group.male.toLocaleString()}
              </text>

              {/* Age Label (Center) */}
              <rect
                x={chartWidth / 2 - 30}
                y={y}
                width="60"
                height={barHeight}
                fill="#243044"
                rx="4"
              />
              <text
                x={chartWidth / 2}
                y={y + barHeight / 2 + 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="600"
              >
                {group.label}
              </text>

              {/* Female Bar (Right) */}
              <rect
                x={chartWidth / 2 + 35}
                y={y}
                width={femaleBarW}
                height={barHeight}
                fill={isHovered ? '#f48fb1' : '#ec407a'}
                rx="3"
                opacity={hoveredGroup && !isHovered ? 0.4 : 1}
              />
              <text
                x={chartWidth / 2 + 40 + femaleBarW}
                y={y + barHeight / 2 + 4}
                textAnchor="start"
                fill="#9aa0a6"
                fontSize="10"
              >
                {group.female.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Info Footer */}
      <div style={{ marginTop: '10px', background: '#0f1419', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: '#9aa0a6', display: 'flex', justifyContent: 'space-between' }}>
        <span>Workforce Ratio (Ages 20-64): <strong style={{ color: '#34a853' }}>68.4%</strong></span>
        <span>Elderly Dependency Ratio: <strong style={{ color: '#fbbc04' }}>14.2%</strong></span>
        <span>Youth Dependency Ratio: <strong style={{ color: '#4285f4' }}>17.4%</strong></span>
      </div>
    </div>
  );
};

/**
 * 2. TREASURY CASH FLOW LINE CHART COMPONENT (Canvas Renderer)
 */
const TreasuryCashFlowChart = ({ data, timeRange }) => {
  const canvasRef = useRef(null);
  const [activeSeries, setActiveSeries] = useState({ income: true, expenses: true, net: true, debt: true });
  const [hoverIndex, setHoverIndex] = useState(null);

  const labels = data.labels;
  const income = data.treasury.income;
  const expenses = data.treasury.expenses;
  const net = data.treasury.net;
  const debt = data.treasury.debt;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Padding
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    // Find min and max for scaling
    let allVals = [];
    if (activeSeries.income) allVals.push(...income);
    if (activeSeries.expenses) allVals.push(...expenses);
    if (activeSeries.net) allVals.push(...net);
    if (activeSeries.debt) allVals.push(...debt);
    if (allVals.length === 0) allVals = [0, 100000];

    const maxVal = Math.max(...allVals) * 1.1;
    const minVal = Math.min(0, Math.min(...allVals));

    // Draw Gridlines
    ctx.strokeStyle = '#2d3a4f';
    ctx.lineWidth = 1;
    const gridRows = 5;
    for (let i = 0; i <= gridRows; i++) {
      const y = paddingTop + (chartH / gridRows) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      const val = Math.round(maxVal - ((maxVal - minVal) / gridRows) * i);
      ctx.fillStyle = '#9aa0a6';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`$${(val / 1000).toFixed(0)}k`, paddingLeft - 8, y + 3);
    }

    // Helper to draw smooth series line
    const drawSeries = (seriesData, color, isDashed = false) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      if (isDashed) ctx.setLineDash([4, 4]); else ctx.setLineDash([]);

      const stepX = chartW / (seriesData.length - 1);
      seriesData.forEach((val, idx) => {
        const x = paddingLeft + idx * stepX;
        const y = paddingTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    };

    if (activeSeries.income) drawSeries(income, '#34a853');
    if (activeSeries.expenses) drawSeries(expenses, '#ea4335');
    if (activeSeries.net) drawSeries(net, '#1a73e8');
    if (activeSeries.debt) drawSeries(debt, '#fbbc04', true);

    // Draw Hover Crosshair
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < labels.length) {
      const stepX = chartW / (labels.length - 1);
      const hoverX = paddingLeft + hoverIndex * stepX;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hoverX, paddingTop);
      ctx.lineTo(hoverX, height - paddingBottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw X Axis Labels
    const stepLabel = Math.ceil(labels.length / 8);
    labels.forEach((label, idx) => {
      if (idx % stepLabel === 0 || idx === labels.length - 1) {
        const x = paddingLeft + idx * (chartW / (labels.length - 1));
        ctx.fillStyle = '#9aa0a6';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, height - paddingBottom + 16);
      }
    });

  }, [data, activeSeries, hoverIndex]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const paddingLeft = 60;
    const chartW = canvas.width - 60 - 30;
    const idx = Math.round(((x - paddingLeft) / chartW) * (labels.length - 1));
    if (idx >= 0 && idx < labels.length) {
      setHoverIndex(idx);
    }
  };

  return (
    <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#34a853', fontWeight: '700' }}>
            📈 Treasury Cash Flow & Financial Trajectory
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Monthly Revenue, Expenditures & Municipal Bonds</span>
        </div>

        {/* Legend Toggles */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { key: 'income', label: 'Income', color: '#34a853' },
            { key: 'expenses', label: 'Expenses', color: '#ea4335' },
            { key: 'net', label: 'Net Surplus', color: '#1a73e8' },
            { key: 'debt', label: 'Debt Balance', color: '#fbbc04' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSeries(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{
                background: activeSeries[item.key] ? item.color : '#243044',
                color: activeSeries[item.key] ? '#fff' : '#9aa0a6',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ● {item.label}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={750}
        height={260}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        style={{ width: '100%', height: '260px', display: 'block', background: '#0f1419', borderRadius: '6px' }}
      />

      {/* Tooltip Data Display */}
      {hoverIndex !== null && (
        <div style={{
          marginTop: '10px',
          background: '#243044',
          padding: '8px 14px',
          borderRadius: '6px',
          display: 'flex',
          justify: 'space-between',
          fontSize: '0.8rem',
          color: '#fff'
        }}>
          <span>Period: <strong>{labels[hoverIndex]}</strong></span>
          <span style={{ color: '#34a853' }}>Income: <strong>${income[hoverIndex].toLocaleString()}</strong></span>
          <span style={{ color: '#ea4335' }}>Expenses: <strong>${expenses[hoverIndex].toLocaleString()}</strong></span>
          <span style={{ color: '#1a73e8' }}>Net: <strong>${net[hoverIndex].toLocaleString()}</strong></span>
          <span style={{ color: '#fbbc04' }}>Debt: <strong>${debt[hoverIndex].toLocaleString()}</strong></span>
        </div>
      )}
    </div>
  );
};

/**
 * 3. SECTOR INCOME & EXPENSE DONUT CHART COMPONENT (SVG)
 */
const SectorDonutChart = () => {
  const incomeSectors = [
    { name: 'Residential Tax', value: 45000, color: '#1a73e8' },
    { name: 'Commercial Tax', value: 38000, color: '#34a853' },
    { name: 'Industrial Tax', value: 29000, color: '#fbbc04' },
    { name: 'Public Transit Fares', value: 12000, color: '#a142f4' },
    { name: 'Energy Export', value: 18000, color: '#00acc1' }
  ];

  const expenseSectors = [
    { name: 'Education & Schools', value: 28000, color: '#4285f4' },
    { name: 'Healthcare & Hospitals', value: 24000, color: '#ec407a' },
    { name: 'Police & Fire Safety', value: 21000, color: '#ff9800' },
    { name: 'Roads & Infrastructure', value: 16000, color: '#78909c' },
    { name: 'Power & Water Grid', value: 14000, color: '#26a69a' },
    { name: 'Debt Interest Servicing', value: 9000, color: '#ea4335' }
  ];

  const [activeTab, setActiveTab] = useState('income');
  const activeSectors = activeTab === 'income' ? incomeSectors : expenseSectors;
  const totalSum = activeSectors.reduce((acc, s) => acc + s.value, 0);

  // Calculate SVG arc paths
  let cumulativeAngle = 0;
  const arcs = activeSectors.map(sector => {
    const angle = (sector.value / totalSum) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const r = 90;
    const x1 = 120 + r * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = 120 + r * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = 120 + r * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const y2 = 120 + r * Math.sin((Math.PI * (endAngle - 90)) / 180);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...sector,
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      percentage: ((sector.value / totalSum) * 100).toFixed(1)
    };
  });

  return (
    <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#fbbc04', fontWeight: '700' }}>
            🍩 Sector Financial Distribution
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Income Sources vs Municipal Expense Allocation</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('income')}
            style={{ background: activeTab === 'income' ? '#34a853' : '#243044', padding: '4px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
          >
            Income Breakdown
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            style={{ background: activeTab === 'expense' ? '#ea4335' : '#243044', padding: '4px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
          >
            Expense Breakdown
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* SVG Donut Chart */}
        <svg width="240" height="240">
          {arcs.map((arc, i) => (
            <path
              key={i}
              d={arc.path}
              fill="none"
              stroke={arc.color}
              strokeWidth="36"
              style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
            />
          ))}
          <circle cx="120" cy="120" r="68" fill="#1a2332" />
          <text x="120" y="112" textAnchor="middle" fill="#9aa0a6" fontSize="11">TOTAL {activeTab.toUpperCase()}</text>
          <text x="120" y="132" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="800">
            ${(totalSum / 1000).toFixed(0)}k/mo
          </text>
        </svg>

        {/* Legend Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {arcs.map((sector, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: '#0f1419', padding: '6px 12px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', background: sector.color, borderRadius: '50%' }} />
                <span style={{ color: '#e8eaed' }}>{sector.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#fff' }}>${sector.value.toLocaleString()}</strong>
                <span style={{ fontSize: '0.7rem', color: '#9aa0a6', marginLeft: '6px' }}>({sector.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 4. RCI DEMAND CURVES COMPONENT (Canvas/SVG)
 */
const RCIDemandCurvesChart = ({ data }) => {
  const [taxRateR, setTaxRateR] = useState(10);
  const [taxRateC, setTaxRateC] = useState(9);
  const [taxRateI, setTaxRateI] = useState(11);

  // Projected demand adjustments based on tax sliders
  const adjR = Math.round(55 - (taxRateR - 10) * 8);
  const adjC = Math.round(42 - (taxRateC - 9) * 7);
  const adjI = Math.round(38 - (taxRateI - 11) * 6);

  return (
    <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#4285f4', fontWeight: '700' }}>
            🏗️ RCI Zoning Demand & Tax Influence Simulator
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Residential, Commercial & Industrial Growth Indices</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {/* RESIDENTIAL DEMAND */}
        <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', border: '1px solid #1a73e8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: '700', color: '#1a73e8' }}>🟢 RESIDENTIAL (R)</span>
            <strong style={{ color: adjR > 0 ? '#34a853' : '#ea4335' }}>{adjR > 0 ? `+${adjR}` : adjR}%</strong>
          </div>
          <div style={{ height: '6px', background: '#243044', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${Math.max(0, Math.min(100, adjR))}%`, height: '100%', background: '#1a73e8' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>
            <span>Tax Rate: {taxRateR}%</span>
            <input
              type="range"
              min="0"
              max="20"
              value={taxRateR}
              onChange={(e) => setTaxRateR(Number(e.target.value))}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
        </div>

        {/* COMMERCIAL DEMAND */}
        <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', border: '1px solid #34a853' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: '700', color: '#34a853' }}>🔵 COMMERCIAL (C)</span>
            <strong style={{ color: adjC > 0 ? '#34a853' : '#ea4335' }}>{adjC > 0 ? `+${adjC}` : adjC}%</strong>
          </div>
          <div style={{ height: '6px', background: '#243044', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${Math.max(0, Math.min(100, adjC))}%`, height: '100%', background: '#34a853' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>
            <span>Tax Rate: {taxRateC}%</span>
            <input
              type="range"
              min="0"
              max="20"
              value={taxRateC}
              onChange={(e) => setTaxRateC(Number(e.target.value))}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
        </div>

        {/* INDUSTRIAL DEMAND */}
        <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', border: '1px solid #fbbc04' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: '700', color: '#fbbc04' }}>🟡 INDUSTRIAL (I)</span>
            <strong style={{ color: adjI > 0 ? '#34a853' : '#ea4335' }}>{adjI > 0 ? `+${adjI}` : adjI}%</strong>
          </div>
          <div style={{ height: '6px', background: '#243044', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${Math.max(0, Math.min(100, adjI))}%`, height: '100%', background: '#fbbc04' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>
            <span>Tax Rate: {taxRateI}%</span>
            <input
              type="range"
              min="0"
              max="20"
              value={taxRateI}
              onChange={(e) => setTaxRateI(Number(e.target.value))}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 5. HISTORICAL POLLUTION & TRAFFIC BAR CHART COMPONENT (SVG)
 */
const DistrictPollutionTrafficChart = () => {
  const districts = [
    { name: 'North Suburbs', aqi: 24, traffic: 18, waterPpm: 12 },
    { name: 'Downtown Core', aqi: 78, traffic: 84, waterPpm: 42 },
    { name: 'South Bay', aqi: 32, traffic: 35, waterPpm: 18 },
    { name: 'Industrial East', aqi: 112, traffic: 62, waterPpm: 88 }
  ];

  return (
    <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#ea4335', fontWeight: '700' }}>
            🏙️ District Environmental & Traffic Metrics
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>Air Quality (AQI), Traffic Gridlock & Water Pollution</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {districts.map(dist => (
          <div key={dist.name} style={{ background: '#0f1419', padding: '12px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
              <span style={{ color: '#fff' }}>{dist.name}</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                <span style={{ color: dist.aqi > 100 ? '#ea4335' : dist.aqi > 50 ? '#fbbc04' : '#34a853' }}>
                  AQI: {dist.aqi}
                </span>
                <span style={{ color: dist.traffic > 70 ? '#ea4335' : '#4285f4' }}>
                  Traffic: {dist.traffic}%
                </span>
                <span style={{ color: '#00acc1' }}>Water: {dist.waterPpm} ppm</span>
              </div>
            </div>

            {/* AQI Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#9aa0a6' }}>
              <span style={{ width: '60px' }}>Air AQI</span>
              <div style={{ flex: 1, height: '6px', background: '#243044', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, dist.aqi / 1.5)}%`, height: '100%', background: dist.aqi > 100 ? '#ea4335' : '#fbbc04' }} />
              </div>
            </div>

            {/* Traffic Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#9aa0a6', marginTop: '4px' }}>
              <span style={{ width: '60px' }}>Traffic</span>
              <div style={{ flex: 1, height: '6px', background: '#243044', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${dist.traffic}%`, height: '100%', background: dist.traffic > 70 ? '#ea4335' : '#4285f4' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 6. PREDICTOR FORECASTING LINES COMPONENT (Canvas/SVG)
 */
const AIProjectionForecastChart = () => {
  const [eduFundingBoost, setEduFundingBoost] = useState(10);
  const [taxPolicyMod, setTaxPolicyMod] = useState(0);

  // Projected 5-year growth outcome calculation
  const projPopGrowthRate = (1.8 + eduFundingBoost * 0.12 - taxPolicyMod * 0.08).toFixed(2);
  const projUnemployment = Math.max(2.1, (6.4 - eduFundingBoost * 0.18 + taxPolicyMod * 0.15)).toFixed(1);
  const projDisasterRisk = (24 - eduFundingBoost * 0.5).toFixed(0);

  return (
    <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #2d3a4f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#a142f4', fontWeight: '700' }}>
            🔮 CityMind AI Predictive Trajectory & Scenario Modeling
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#9aa0a6' }}>5-Year What-If Policy Simulation</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* POLICY CONTROLS */}
        <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#fff' }}>🎛️ Simulated Policy Levers</h4>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>
              Education & R&D Budget (+{eduFundingBoost}%):
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={eduFundingBoost}
              onChange={(e) => setEduFundingBoost(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9aa0a6', display: 'block' }}>
              Corporate Tax Adjustment ({taxPolicyMod > 0 ? `+${taxPolicyMod}` : taxPolicyMod}%):
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              value={taxPolicyMod}
              onChange={(e) => setTaxPolicyMod(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* FORECAST OUTCOMES */}
        <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#9aa0a6' }}>Projected Pop Growth:</span>
            <strong style={{ color: '#34a853' }}>+{projPopGrowthRate}% / yr</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#9aa0a6' }}>Projected Unemployment:</span>
            <strong style={{ color: '#4285f4' }}>{projUnemployment}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#9aa0a6' }}>Disaster Vulnerability Index:</span>
            <strong style={{ color: '#fbbc04' }}>{projDisasterRisk} / 100</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN ANALYTICS DASHBOARD PANEL COMPONENT
 */
export default function AnalyticsDashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'population' | 'finance' | 'rci' | 'environment'
  const [timeRange, setTimeRange] = useState('5Y'); // '1Y' | '5Y' | '20Y' | 'ALL'
  
  const historicalData = useMemo(() => generateHistoricalData(timeRange === '1Y' ? 1 : timeRange === '5Y' ? 5 : 10), [timeRange]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Period,Income,Expenses,Net,Debt,Population,AQI,Traffic\n";
    historicalData.labels.forEach((label, idx) => {
      csvContent += `${label},${historicalData.treasury.income[idx]},${historicalData.treasury.expenses[idx]},${historicalData.treasury.net[idx]},${historicalData.treasury.debt[idx]},${historicalData.environment.population[idx]},${historicalData.environment.aqi[idx]},${historicalData.environment.traffic[idx]}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `citymind_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0f1419',
      color: '#e8eaed',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      {/* HEADER */}
      <div style={{
        padding: '16px 24px',
        background: '#1a2332',
        borderBottom: '1px solid #2d3a4f',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#4285f4', fontWeight: '800' }}>
            📊 CITYMIND Interactive Analytics & Intelligence Center
          </h2>
        </div>

        {/* CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* TIME RANGE SELECTOR */}
          <div style={{ background: '#0f1419', padding: '4px', borderRadius: '6px', border: '1px solid #2d3a4f', display: 'flex', gap: '4px' }}>
            {['1Y', '5Y', '20Y', 'ALL'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  background: timeRange === range ? '#1a73e8' : 'transparent',
                  color: timeRange === range ? '#fff' : '#9aa0a6',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                {range}
              </button>
            ))}
          </div>

          <button onClick={handleExportCSV} className="secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            📥 Export CSV
          </button>

          {onClose && (
            <button onClick={onClose} className="danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <div style={{ padding: '0 24px', background: '#161e2e', borderBottom: '1px solid #2d3a4f', display: 'flex', gap: '12px' }}>
        {[
          { id: 'overview', label: '📊 Master Overview' },
          { id: 'population', label: '👥 Demographics' },
          { id: 'finance', label: '💰 Finances & Treasury' },
          { id: 'rci', label: '🏗️ RCI & Economy' },
          { id: 'environment', label: '🏙️ Environment & Traffic' },
          { id: 'forecast', label: '🔮 AI Predictions' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: '0.85rem',
              fontWeight: '600',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #1a73e8' : '3px solid transparent',
              color: activeTab === tab.id ? '#4285f4' : '#9aa0a6',
              borderRadius: 0
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN BODY DASHBOARD GRID */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {(activeTab === 'overview' || activeTab === 'finance') && (
          <TreasuryCashFlowChart data={historicalData} timeRange={timeRange} />
        )}

        {(activeTab === 'overview' || activeTab === 'population') && (
          <DemographicPyramidChart />
        )}

        {(activeTab === 'overview' || activeTab === 'finance') && (
          <SectorDonutChart />
        )}

        {(activeTab === 'overview' || activeTab === 'rci') && (
          <RCIDemandCurvesChart data={historicalData} />
        )}

        {(activeTab === 'overview' || activeTab === 'environment') && (
          <DistrictPollutionTrafficChart />
        )}

        {(activeTab === 'overview' || activeTab === 'forecast') && (
          <AIProjectionForecastChart />
        )}
      </div>
    </div>
  );
}
