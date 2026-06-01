import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import logger from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import ptpRoutes from '@/routes/ptp.routes';
import referenceRoutes from '@/routes/reference.routes';
import ptpStepsRoutes from '@/routes/ptp-steps.routes';
import ptpWorkflowRoutes from '@/routes/ptp-workflow.routes';
import projectsRoutes from '@/routes/projects.routes';
import pretaskControlsRoutes from '@/routes/pretask-controls.routes';
import dailyReportsRoutes from '@/routes/daily-reports.routes';
import { checkConnection, closePool } from '@/database/index';

// Load environment variables from .env and .env.local
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbConnected = await checkConnection();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbConnected ? 'connected' : 'disconnected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'error',
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ptps', ptpRoutes);
app.use('/api/v1/reference', referenceRoutes);
app.use('/api/v1/ptp-steps', ptpStepsRoutes);
app.use('/api/v1/ptp-workflows', ptpWorkflowRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/pretask-controls', pretaskControlsRoutes);
app.use('/api/v1', dailyReportsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server with optional database initialization
const startServer = async () => {
  try {
    // Check database connection (optional - server can run without DB)
    logger.info('Checking database connection...');
    const connected = await checkConnection();
    
    if (!connected) {
      logger.warn('Database not available. Server will run with limited functionality.');
    } else {
      logger.info('Database connection successful');
    }

    // Start HTTP server (with or without DB)
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📝 Health check: http://localhost:${PORT}/health`);
      logger.info(`ℹ️  Using in-memory storage for Daily Reports API`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        logger.info('HTTP server closed');
        await closePool();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
