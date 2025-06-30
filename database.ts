import mysql, { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';

export class Database {
  private pool: Pool;

  constructor(config: {
    host: string;
    user: string;
    password: string;
    database: string;
  }) {
    this.pool = mysql.createPool({
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: '20749',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

   async connect(): Promise<void> {
    try {
      // Test the connection by getting a connection from the pool
      const connection = await this.pool.getConnection();
      // Run a simple query to verify the connection
      await connection.query('SELECT 1');
      // Release the connection back to the pool
      connection.release();
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  }

   async query(sql: string, values?: any[]): Promise<any> {
    let connection: PoolConnection | null = null;
    try {
      connection = await this.pool.getConnection();
      const [results] = await connection.query(sql, values);
      return results;
    } catch (error) {
      throw new Error(`Query execution failed: ${error}`);
    } finally {
      if (connection) {
        connection.release(); // Release the connection back to the pool
      }
    }
  }



  async close(): Promise<void> {
    await this.pool.end();
  }
}
