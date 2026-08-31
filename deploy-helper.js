#!/usr/bin/env node

/**
 * CortexOps - One-Click Live Deployment Helper
 * 
 * This script guides you through deployment in ~2 minutes
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const options = {
  'render': {
    name: 'Render.com (Recommended - Free)',
    time: '2-3 minutes',
    steps: [
      '1. Go to https://github.com/new',
      '2. Create repo "cortexops"',
      '3. Run: git remote add origin https://github.com/YOUR_USERNAME/cortexops.git',
      '4. Run: git push -u origin main',
      '5. Go to https://dashboard.render.com',
      '6. Click "New" → "Web Service" → Connect GitHub',
      '7. Select cortexops repository',
      '8. Build: cd frontend && npm ci && npm run build && cd ../backend && npm ci',
      '9. Start: node backend/server-prod.js',
      '10. Add env: MONGO_URI=mongodb+srv://cortexops:kp29112004@cluster0.cglyv.mongodb.net/?appName=Cluster0',
      '11. Deploy and wait 5 minutes',
      'Your URL: https://cortexops-YOUR-USERNAME.onrender.com'
    ]
  },
  'railway': {
    name: 'Railway.app (Docker-based)',
    time: '3-5 minutes',
    steps: [
      '1. Go to https://railway.app and sign up',
      '2. Run: npm install -g @railway/cli',
      '3. Run: railway login',
      '4. Run: railway init',
      '5. Run: railway up',
      '6. In dashboard, add env: MONGO_URI=mongodb+srv://cortexops:kp29112004@cluster0.cglyv.mongodb.net/?appName=Cluster0',
      'Your URL will be shown in Railway dashboard'
    ]
  },
  'local': {
    name: 'Keep Running Locally (localhost:5000)',
    time: 'Already running',
    steps: [
      '✓ Backend: http://localhost:5000',
      '✓ API: http://localhost:5000/api/incidents',
      '✓ Frontend: http://localhost:57826',
      'Ready to test!'
    ]
  }
};

console.log('\n╔════════════════════════════════════════╗');
console.log('║  CortexOps - Live Deployment Helper   ║');
console.log('╚════════════════════════════════════════╝\n');

console.log('Choose your deployment option:\n');
console.log('1) Render.com    (Recommended - Free)');
console.log('2) Railway.app   (Free Trial)');
console.log('3) Stay Local    (localhost)');
console.log('4) Exit\n');

rl.question('Enter your choice (1-4): ', (choice) => {
  const selections = { '1': 'render', '2': 'railway', '3': 'local', '4': 'exit' };
  const selected = selections[choice];

  if (!selected || selected === 'exit') {
    console.log('\n✓ Deployment guide at: LIVE-DEPLOYMENT.md');
    rl.close();
    return;
  }

  const option = options[selected];
  
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  ${option.name.padEnd(37)}  ║`);
  console.log(`║  Time: ${option.time.padEnd(31)}  ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  
  option.steps.forEach(step => console.log(step));
  
  console.log('\n📖 Full guide: See LIVE-DEPLOYMENT.md');
  console.log('💰 Cost: FREE\n');
  
  rl.close();
});
