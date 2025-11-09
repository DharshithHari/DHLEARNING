import React from 'react';
import CEODashboard from './CEO/CEODashboard.jsx';
import TeacherDashboard from './Teacher/TeacherDashboard.jsx';
import StudentDashboard from './Student/StudentDashboard.jsx';
const token = localStorage.getItem('token');
export default function Dashboard(){
  const [data,setData]=React.useState(null);
  React.useEffect(()=>{ fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/dashboard', { headers:{ Authorization: 'Bearer ' + token } }).then(r=>r.json()).then(setData); },[]);
  if (!data) return <div>Loading...</div>;
  const user = JSON.parse(localStorage.getItem('user')) || {};
  if (user.role === 'ceo') return <CEODashboard data={data} />;
  if (user.role === 'teacher') return <TeacherDashboard data={data} />;
  return <StudentDashboard data={data} />;
}
