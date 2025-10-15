function showNotification(message, type = 'success') {
  let noti = document.createElement('div');
  noti.className = `custom-notification ${type}`;
  noti.textContent = message;
  noti.style.position = 'fixed';
  noti.style.top = '30px';
  noti.style.right = '30px';
  noti.style.background = type === 'success' ? '#4caf50' : '#f44336';
  noti.style.color = '#fff';
  noti.style.padding = '12px 24px';
  noti.style.borderRadius = '6px';
  noti.style.zIndex = 9999;
  noti.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  document.body.appendChild(noti);
  setTimeout(() => noti.remove(), 2000);
} 