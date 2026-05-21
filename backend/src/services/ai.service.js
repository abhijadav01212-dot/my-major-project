const issueWeights = {
  engine: 0.9,
  brake: 0.82,
  electrical: 0.68,
  suspension: 0.64,
  ac: 0.48,
  tyre: 0.35,
  oil: 0.28
};

export function predictRepair({ issueType = '', odometerKm = 0, year = new Date().getFullYear(), priority = 'normal' }) {
  const normalized = issueType.toLowerCase();
  const baseRisk = Object.entries(issueWeights).find(([key]) => normalized.includes(key))?.[1] || 0.45;
  const age = Math.max(0, new Date().getFullYear() - Number(year || new Date().getFullYear()));
  const usageFactor = Math.min(0.35, Number(odometerKm || 0) / 300000);
  const priorityFactor = priority === 'emergency' ? 0.18 : priority === 'high' ? 0.09 : 0;
  const riskScore = Math.min(0.98, baseRisk + usageFactor + age * 0.015 + priorityFactor);
  const healthScore = Math.max(18, Math.round(100 - riskScore * 72));
  const costMin = Math.round((1800 + riskScore * 8500 + age * 220) / 100) * 100;
  const costMax = Math.round((costMin * (1.45 + usageFactor)) / 100) * 100;
  const risk = riskScore > 0.75 ? 'critical' : riskScore > 0.55 ? 'moderate' : 'low';
  const recommendation = risk === 'critical'
    ? 'Prioritize diagnostics, part inspection, and road safety validation before release.'
    : risk === 'moderate'
      ? 'Run guided inspection and prepare customer approval for likely replacement parts.'
      : 'Schedule routine inspection and preventive maintenance.';
  return { costMin, costMax, healthScore, recommendation, risk };
}

export function serviceRecommendations(vehicle) {
  const km = Number(vehicle?.odometerKm || 0);
  const items = ['Digital inspection', 'Fluid level audit'];
  if (km > 8000) items.push('Engine oil and filter replacement');
  if (km > 20000) items.push('Brake pad and tyre rotation check');
  if (vehicle?.fuelType === 'ev') items.push('Battery health scan');
  return items;
}
