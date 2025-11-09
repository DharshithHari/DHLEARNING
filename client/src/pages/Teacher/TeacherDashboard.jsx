import React from 'react';
export default function TeacherDashboard({data}){
  return (
    <div style={{padding:20}}>
      <h1>Teacher Dashboard</h1>
      <div>
        <h3>Your batches</h3>
        <ul>{data.batches.map(b=> <li key={b.id}>{b.name}</li>)}</ul>
      </div>
    </div>
  );
}
