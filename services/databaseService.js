const oracledb = require('oracledb');

class DatabaseService {
  constructor() {
    this.connection = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Use thin mode - no Oracle Client required
      oracledb.initOracleClient({ libDir: null });
      
      // Create connection pool
      await oracledb.createPool({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
        // Thin mode specific options
        events: false,
        queueTimeout: 60000
      });

      this.isInitialized = true;
      console.log('Oracle connection pool created successfully (thin mode)');
    } catch (error) {
      console.error('Failed to initialize Oracle connection pool:', error);
      throw error;
    }
  }

  async getConnection() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    try {
      return await oracledb.getConnection();
    } catch (error) {
      console.error('Failed to get database connection:', error);
      throw error;
    }
  }

  async executeQuery(query, params = [], options = {}) {
    let connection;
    try {
      connection = await this.getConnection();
      
      const result = await connection.execute(query, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...options
      });
      
      return result.rows || [];
    } catch (error) {
      console.error('Query execution failed:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error('Error closing connection:', closeError);
        }
      }
    }
  }

  async executeQueryWithFilters(baseQuery, filters) {
    let query = baseQuery;
    let params = [];
    let paramIndex = 1;

    // Add WHERE clause if filters exist
    if (Object.keys(filters).length > 0) {
      const whereConditions = [];
      
      if (filters.fromDate) {
        whereConditions.push(`date_column >= :${paramIndex}`);
        params.push(filters.fromDate);
        paramIndex++;
      }
      
      if (filters.toDate) {
        whereConditions.push(`date_column <= :${paramIndex}`);
        params.push(filters.toDate);
        paramIndex++;
      }
      
      if (filters.type) {
        whereConditions.push(`type_column = :${paramIndex}`);
        params.push(filters.type);
        paramIndex++;
      }

      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
    }

    return await this.executeQuery(query, params);
  }

  async closePool() {
    try {
      await oracledb.getPool().close();
      console.log('Oracle connection pool closed');
    } catch (error) {
      console.error('Error closing connection pool:', error);
    }
  }
}

// Singleton instance
const databaseService = new DatabaseService();

// Initialize database connection
async function initializeDatabase() {
  await databaseService.initialize();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await databaseService.closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await databaseService.closePool();
  process.exit(0);
});

module.exports = {
  databaseService,
  initializeDatabase
}; 