// StageFlow Backend - Server Entry Point
import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log('🎭 StageFlow Backend Server Started');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📋 Available Routes:');
    console.log('  GET  /api/health         - Health check');
    console.log('  POST /api/auth/register  - User registration');
    console.log('  POST /api/auth/login     - User login');
    console.log('  GET  /api/auth/me        - Current user');
    console.log('\n✨ Ready for development!');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});