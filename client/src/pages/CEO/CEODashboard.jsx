import React from 'react';
import BatchManager from '../../components/BatchManager.jsx';
import AnalyticsChart from '../../components/AnalyticsChart.jsx';
export default function CEODashboard({data}){
  return (
    <div style={{padding:20}}>
      <h1>CEO Dashboard</h1>
      <div>
        <div>Students: {data.stats.students}</div>
        <div>Teachers: {data.stats.teachers}</div>
      </div>
      <div style={{marginTop:20}}>
        <BatchManager />
      </div>
      <div style={{marginTop:20}}>
        <AnalyticsChart />
      </div>
    </div>
  );
}
