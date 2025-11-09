import React from 'react';
import { Link } from 'react-router-dom';
export default function Landing(){
  return (
    <div style={{padding:40}}>
      <h1>My Tutoring Platform</h1>
      <p>Teach, learn, submit homework, attend live classes — all in one place.</p>
      <div style={{marginTop:20}}>
        <Link to='/auth'>Sign in / Sign up</Link>
      </div>
    </div>
  );
}
