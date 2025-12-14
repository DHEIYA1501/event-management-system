// kill-port.js - WITH MONGO_URI FIX
const { exec } = require('child_process');

// Map MONGO_URI to MONGODB_URI if needed
if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

console.log('🔫 Clearing port 5000...');

// Windows command
exec('netstat -ano | findstr :5000', (error, stdout) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      console.log(`Killing PID: ${pid}`);
      exec(`taskkill /f /pid ${pid}`);
    });
  }
  console.log('✅ Port 5000 cleared');
  
  // Start server after 1 second
  setTimeout(() => {
    console.log('🚀 Starting server...');
    require('./server.js');
  }, 1000);
});