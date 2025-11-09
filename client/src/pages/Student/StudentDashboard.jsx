import React from 'react';
export default function StudentDashboard({data}){
  return (
    <div style={{padding:20}}>
      <h1>Student Dashboard</h1>
      <div>
        <h3>Your batches</h3>
        <ul>{data.batches.map(b=> <li key={b.id}>{b.name}</li>)}</ul>
      </div>
    </div>
  );
}
