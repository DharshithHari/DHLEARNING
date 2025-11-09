import React from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export default function BatchManager(){
  const [name,setName]=React.useState('');
  const [desc,setDesc]=React.useState('');
  const token = localStorage.getItem('token');
  async function createBatch(){
    await fetch(API + '/api/batches', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: 'Bearer ' + token }, body:JSON.stringify({ name, description: desc }) });
    setName(''); setDesc('');
    alert('Batch created (refresh to see changes).');
  }
  return (
    <div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder='Batch name' />
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder='Description' />
      <button onClick={createBatch}>Create Batch</button>
    </div>
  );
}
