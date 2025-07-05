module.exports = function calculateRiskLevel(reports) {
  if (!reports.length) return 'Low';

  const totalSeverity = reports.reduce((sum, r) => sum + r.severity, 0);
  const avgSeverity = totalSeverity / reports.length;
  const recentCount = reports.filter(r => {
    const daysAgo = (Date.now() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24);
    return daysAgo < 30;
  }).length;

  if (avgSeverity >= 4 || recentCount >= 3) return 'High';
  if (avgSeverity >= 2) return 'Medium';
  return 'Low';
}; 