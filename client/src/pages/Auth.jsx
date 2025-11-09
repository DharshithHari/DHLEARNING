import React from 'react';
export default function Auth(){
  const [mode, setMode] = React.useState('login');
  return (
    <div style={{padding:20}}>
      <div>
        <button onClick={()=>setMode('login')}>Login</button>
        <button onClick={()=>setMode('signup')}>Signup</button>
      </div>
      {mode === 'login' ? <LoginForm/> : <SignupForm/>}
    </div>
  );
}
function LoginForm(){
  const [username,setUsername]=React.useState('');
  const [password,setPassword]=React.useState('');
  async function submit(e){
    e.preventDefault();
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,password})});
    const data = await res.json();
    if (!res.ok) return alert(data.error||'Login failed');
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard';
  }
  return (
    <form onSubmit={submit}>
      <input placeholder='username' value={username} onChange={e=>setUsername(e.target.value)} />
      <input placeholder='password' value={password} onChange={e=>setPassword(e.target.value)} type='password' />
      <button>Login</button>
    </form>
  );
}
function SignupForm(){
  const [username,setUsername]=React.useState('');
  const [password,setPassword]=React.useState('');
  const [full_name,setFullName]=React.useState('');
  const [role,setRole]=React.useState('student');
  async function submit(e){
    e.preventDefault();
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,password,full_name,role})});
    const data = await res.json();
    if (!res.ok) return alert(data.error||'Signup failed');
    localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard';
  }
  return (
    <form onSubmit={submit}>
      <input placeholder='Full name' value={full_name} onChange={e=>setFullName(e.target.value)} />
      <input placeholder='username' value={username} onChange={e=>setUsername(e.target.value)} />
      <input placeholder='password' value={password} onChange={e=>setPassword(e.target.value)} type='password' />
      <select value={role} onChange={e=>setRole(e.target.value)}>
        <option value='student'>Student</option>
        <option value='teacher'>Teacher</option>
        <option value='ceo'>CEO</option>
      </select>
      <button>Signup</button>
    </form>
  );
}
