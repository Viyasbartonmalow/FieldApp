import { Pool, Client, PoolClient } from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import logger from '@/utils/logger'

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'field_app_db',
  max: 20, // Max pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err)
})

/**
 * Execute a query using the connection pool
 */
export const query = async <T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> => {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    logger.debug(`Query executed in ${duration}ms`, { query: text, params })
    return { rows: result.rows, rowCount: result.rowCount || 0 }
  } catch (error) {
    logger.error('Database query error', { query: text, params, error })
    throw error
  }
}

/**
 * Get a client from the pool for transaction management
 */
export const getClient = async (): Promise<PoolClient> => {
  return pool.connect()
}

/**
 * Transaction helper for atomic operations
 */
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Initialize database - run migrations
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Initializing database...')

    // Read migration file
    const migrationFile = join(__dirname, 'migrations', '001_initial_schema.sql')
    const migrationSQL = readFileSync(migrationFile, 'utf-8')

    // Execute migration
    await pool.query(migrationSQL)

    logger.info('Database initialized successfully')
  } catch (error) {
    logger.error('Database initialization failed', error)
    throw error
  }
}

/**
 * Check database connection
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()')
    return result.rows.length > 0
  } catch (error) {
    logger.error('Database connection check failed', error)
    return false
  }
}

/**
 * Close the pool
 */
export const closePool = async (): Promise<void> => {
  await pool.end()
  logger.info('Database pool closed')
}

export default pool
