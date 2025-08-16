import { useState, useEffect } from 'react';
import { statisticsAPI } from '../services/api';

export const useStatistics = (active) => {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalSeedsDistributed: 0,
    totalAlive: 0,
    totalDead: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsAPI.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (active === 'Dashboard') {
      fetchStats();
    }
  }, [active]);

  return { stats, loading };
};
