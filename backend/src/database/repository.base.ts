/**
 * Base Repository Pattern
 * Provides generic CRUD operations for database entities
 */

import { query, getClient } from '@/database'
import { PoolClient } from 'pg'

export interface FindOptions {
  where?: Record<string, any>
  select?: string[]
  limit?: number
  offset?: number
  orderBy?: { field: string; direction: 'ASC' | 'DESC' }[]
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

/**
 * Base repository class with common CRUD operations
 */
export abstract class BaseRepository<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  /**
   * Find all records
   */
  async findAll(options?: FindOptions): Promise<T[]> {
    let sql = `SELECT * FROM ${this.tableName}`
    const params: any[] = []

    if (options?.where) {
      const conditions = Object.entries(options.where).map(([key], index) => {
        params.push(Object.values(options.where!)[index])
        return `${key} = $${index + 1}`
      })
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    if (options?.orderBy) {
      const orderClauses = options.orderBy
        .map((sort) => `${sort.field} ${sort.direction}`)
        .join(', ')
      sql += ` ORDER BY ${orderClauses}`
    }

    if (options?.limit) {
      sql += ` LIMIT $${params.length + 1}`
      params.push(options.limit)
    }

    if (options?.offset) {
      sql += ` OFFSET $${params.length + 1}`
      params.push(options.offset)
    }

    const result = await query<T>(sql, params)
    return result.rows
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`
    const result = await query<T>(sql, [id])
    return result.rows[0] || null
  }

  /**
   * Find with pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    where?: Record<string, any>
  ): Promise<PaginationResult<T>> {
    const offset = (page - 1) * limit

    // Get total count
    let countSql = `SELECT COUNT(*) as count FROM ${this.tableName}`
    const countParams: any[] = []

    if (where) {
      const conditions = Object.entries(where).map(([key], index) => {
        countParams.push(Object.values(where)[index])
        return `${key} = $${index + 1}`
      })
      countSql += ` WHERE ${conditions.join(' AND ')}`
    }

    const countResult = await query<{ count: string }>(countSql, countParams)
    const total = parseInt(countResult.rows[0]?.count || '0')

    // Get paginated data
    const data = await this.findAll({
      where,
      limit,
      offset,
    })

    return {
      data,
      total,
      page,
      limit,
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')

    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
    const result = await query<T>(sql, values)
    return result.rows[0]
  }

  /**
   * Create multiple records in a transaction
   */
  async createBatch(dataArray: Partial<T>[]): Promise<T[]> {
    if (dataArray.length === 0) return []

    const client = await getClient()
    try {
      await client.query('BEGIN')
      const results: T[] = []

      for (const data of dataArray) {
        const keys = Object.keys(data)
        const values = Object.values(data)
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')

        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
        const result = await client.query(sql, values)
        results.push(result.rows[0])
      }

      await client.query('COMMIT')
      return results
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const keys = Object.keys(data)
    const values = Object.values(data)

    if (keys.length === 0) {
      return this.findById(id) as Promise<T>
    }

    const updates = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')
    values.push(id)

    const sql = `UPDATE ${this.tableName} SET ${updates}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`
    const result = await query<T>(sql, values)

    if (!result.rows[0]) {
      throw new Error(`Record not found: ${id}`)
    }

    return result.rows[0]
  }

  /**
   * Delete a record (hard delete)
   */
  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1`
    const result = await query(sql, [id])
    return result.rowCount > 0
  }

  /**
   * Soft delete a record (mark as inactive)
   */
  async softDelete(id: string): Promise<T> {
    return this.update(id, { is_active: false } as any)
  }

  /**
   * Restore a soft-deleted record
   */
  async restore(id: string): Promise<T> {
    return this.update(id, { is_active: true } as any)
  }

  /**
   * Check if a record exists
   */
  async exists(where: Record<string, any>): Promise<boolean> {
    const conditions = Object.entries(where).map(([key], index) => `${key} = $${index + 1}`)
    const sql = `SELECT 1 FROM ${this.tableName} WHERE ${conditions.join(' AND ')} LIMIT 1`
    const result = await query(sql, Object.values(where))
    return result.rowCount > 0
  }

  /**
   * Count records
   */
  async count(where?: Record<string, any>): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`
    const params: any[] = []

    if (where) {
      const conditions = Object.entries(where).map(([key], index) => {
        params.push(Object.values(where)[index])
        return `${key} = $${index + 1}`
      })
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    const result = await query<{ count: string }>(sql, params)
    return parseInt(result.rows[0]?.count || '0')
  }

  /**
   * Execute raw query
   */
  protected async executeQuery<R = any>(sql: string, params?: any[]): Promise<R[]> {
    const result = await query<R>(sql, params)
    return result.rows
  }

  /**
   * Execute query with client (for transactions)
   */
  protected async executeQueryWithClient<R = any>(
    client: PoolClient,
    sql: string,
    params?: any[]
  ): Promise<R[]> {
    const result = await client.query(sql, params)
    return result.rows
  }
}
