import React from 'react';
export default function ClassRoom(){
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room') || 'TutoringRoom_default';
  const domain = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';
  const iframeUrl = `https://${domain}/${room}`;
  return (
    <div style={{height:'90vh'}}>
      <iframe src={iframeUrl} style={{width:'100%', height:'100%', border:0}} allow="camera; microphone; fullscreen; display-capture"></iframe>
    </div>
  );
}
