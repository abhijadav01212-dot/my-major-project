import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT || 5000;

async function boot() {
  app.listen(port, () => {
    console.log(`TorqueIQ Nexus API running on http://localhost:${port}`);
  });
}

boot().catch((error) => {
  console.error('Startup failed:', error.message);
  process.exit(1);
});
