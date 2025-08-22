#!/usr/bin/env node

/**
 * Test script to verify Oracle database connection in thin mode
 * Run this script to test your database connection before starting the main application
 */

require('dotenv').config();
const oracledb = require('oracledb');

async function testConnection() {
  console.log('🔍 Testing Oracle Database Connection (Thin Mode)');
  console.log('================================================\n');

  try {
    // Check environment variables
    const requiredEnvVars = ['ORACLE_HOST', 'ORACLE_PORT', 'ORACLE_SERVICE', 'ORACLE_USER', 'ORACLE_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log('\nPlease check your .env file and ensure all variables are set.');
      return;
    }

    console.log('✅ Environment variables found');
    console.log(`   Host: ${process.env.ORACLE_HOST}`);
    console.log(`   Port: ${process.env.ORACLE_PORT}`);
    console.log(`   Service: ${process.env.ORACLE_SERVICE}`);
    console.log(`   User: ${process.env.ORACLE_USER}`);
    console.log(`   Password: ${process.env.ORACLE_PASSWORD ? '***' : 'NOT SET'}\n`);

    // OracleDB thin mode is the default in newer versions
    console.log('🚀 Using OracleDB thin mode (no Oracle Client required)');
    console.log('✅ Oracle client ready for thin mode connection\n');

    // Test connection
    console.log('🔌 Testing database connection...');
    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE}`
    });

    console.log('✅ Database connection successful!');

    // Get database version
    const result = await connection.execute('SELECT * FROM v$version WHERE ROWNUM = 1');
    if (result.rows && result.rows.length > 0) {
      console.log(`📊 Database version: ${result.rows[0][0]}`);
    }

    // Test a simple query
    console.log('\n🧪 Testing simple query...');
    try {
      const testResult = await connection.execute('SELECT 1 as test_value FROM dual');
      console.log('✅ Simple query test successful');
      console.log(`   Result: ${testResult.rows[0][0]}`);
    } catch (queryError) {
      console.log('⚠️  Simple query test failed (this might be normal):');
      console.log(`   Error: ${queryError.message}`);
    }

    // Close connection
    await connection.close();
    console.log('\n✅ Connection test completed successfully!');
    console.log('🎉 Your Oracle database is accessible and ready to use.');

  } catch (error) {
    console.log('\n❌ Connection test failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('ORA-12541')) {
      console.log('\n💡 This error usually means:');
      console.log('   - The database is not running');
      console.log('   - The port number is incorrect');
      console.log('   - A firewall is blocking the connection');
    } else if (error.message.includes('ORA-01017')) {
      console.log('\n💡 This error usually means:');
      console.log('   - Invalid username or password');
      console.log('   - The user account is locked');
    } else if (error.message.includes('ORA-12514')) {
      console.log('\n💡 This error usually means:');
      console.log('   - The service name is incorrect');
      console.log('   - The database is not running');
    }
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Verify your Oracle database is running');
    console.log('   2. Check your network connectivity');
    console.log('   3. Verify your credentials in the .env file');
    console.log('   4. Ensure the database service is accessible');
  }
}

// Run the test
testConnection().catch(console.error); 