/**
 * Database configuration for different environments
 * Uses OracleDB thin mode (no Oracle Client required)
 */

const config = {
  development: {
    host: process.env.ORACLE_HOST || 'localhost',
    port: process.env.ORACLE_PORT || 1521,
    service: process.env.ORACLE_SERVICE || 'XE',
    user: process.env.ORACLE_USER || 'system',
    password: process.env.ORACLE_PASSWORD || 'oracle',
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    queueTimeout: 60000,
    // Thin mode specific options
    events: false,
    _enableStats: true
  },
  
  production: {
    host: process.env.ORACLE_HOST,
    port: process.env.ORACLE_PORT || 1521,
    service: process.env.ORACLE_SERVICE,
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    poolMin: 5,
    poolMax: 20,
    poolIncrement: 2,
    queueTimeout: 120000,
    // Thin mode specific options
    events: false,
    _enableStats: false
  },
  
  test: {
    host: process.env.ORACLE_HOST || 'localhost',
    port: process.env.ORACLE_PORT || 1521,
    service: process.env.ORACLE_SERVICE || 'TEST',
    user: process.env.ORACLE_USER || 'test_user',
    password: process.env.ORACLE_PASSWORD || 'test_password',
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
    queueTimeout: 30000,
    // Thin mode specific options
    events: false,
    _enableStats: false
  }
};

module.exports = config[process.env.NODE_ENV || 'development']; 