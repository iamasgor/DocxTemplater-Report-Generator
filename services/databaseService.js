const oracledb = require('oracledb');

class DatabaseService {
  constructor() {
    this.connection = null;
    this.isInitialized = false;
    this.useConnectionPool = true;
  }

  async initialize() {
    try {
      // Use thin mode - no Oracle Client required
      // For newer versions of OracleDB, thin mode is the default
      // We don't need to call initOracleClient for thin mode
      console.log('Using OracleDB thin mode (no Oracle Client required)');
      
      // Try to create connection pool first
      try {
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
        this.useConnectionPool = true;
        console.log('Oracle connection pool created successfully (thin mode)');
      } catch (poolError) {
        console.warn('Failed to create connection pool, falling back to direct connections:', poolError.message);
        this.useConnectionPool = false;
        this.isInitialized = true;
        console.log('Using direct connections (no connection pool)');
      }
    } catch (error) {
      console.error('Failed to initialize Oracle database service:', error);
      throw error;
    }
  }

  async getConnection() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    
    try {
      if (this.useConnectionPool) {
        return await oracledb.getConnection();
      } else {
        // Fallback to direct connection
        return await oracledb.getConnection({
          user: process.env.ORACLE_USER,
          password: process.env.ORACLE_PASSWORD,
          connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`
        });
      }
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
    if (this.useConnectionPool) {
      try {
        await oracledb.getPool().close();
        console.log('Oracle connection pool closed');
      } catch (error) {
        console.error('Error closing connection pool:', error);
      }
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