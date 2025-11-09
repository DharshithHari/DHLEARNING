import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
export default function AnalyticsChart(){
  const data = { labels:['Week 1','Week 2','Week 3','Week 4'], datasets:[{ label:'Avg Grade', data:[70,78,82,85], tension:0.4 }] };
  return (
    <div>
      <h3>Sample Analytics</h3>
      <Line data={data} />
    </div>
  );
}
