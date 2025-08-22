# Troubleshooting Guide

Common issues and solutions for the DocxTemplater Report Generator.

## Database Connection Issues

### Error: NJS-007: invalid value for "libDir" in parameter 1

**Cause**: This error occurs when trying to use an invalid parameter with `initOracleClient`.

**Solution**: The application now uses OracleDB thin mode by default, which doesn't require `initOracleClient`. This has been fixed in the latest version.

### Error: ORA-12541: TNS:no listener

**Cause**: The Oracle database is not running or not accessible on the specified port.

**Solutions**:
1. Verify your Oracle database is running
2. Check the port number in your `.env` file
3. Ensure firewall allows connections to the database port
4. Test connectivity: `telnet your-host 1521`

### Error: ORA-01017: invalid username/password

**Cause**: Invalid database credentials.

**Solutions**:
1. Check your `.env` file for correct username/password
2. Verify the user account is not locked
3. Ensure the user has proper permissions
4. Test credentials with SQL*Plus or another Oracle client

### Error: ORA-12514: TNS:listener does not currently know of service

**Cause**: Incorrect service name or the service is not running.

**Solutions**:
1. Verify the service name in your `.env` file
2. Check if the database service is running
3. Use the correct service name (not SID)
4. Common service names: `ORCL`, `XE`, `PROD`, etc.

### Error: NJS-040: connection pool does not exist

**Cause**: Connection pool initialization failed.

**Solution**: The application will automatically fall back to direct connections if the pool fails to initialize.

## Environment Configuration Issues

### Missing Environment Variables

**Symptoms**: Application fails to start with "Missing required environment variables" error.

**Solution**: Ensure your `.env` file contains all required variables:
```env
ORACLE_HOST=your-database-host
ORACLE_PORT=1521
ORACLE_SERVICE=your-service-name
ORACLE_USER=your-username
ORACLE_PASSWORD=your-password
```

### Port Already in Use

**Symptoms**: "EADDRINUSE" error when starting the server.

**Solutions**:
1. Change the port in your `.env` file: `PORT=3001`
2. Stop other applications using the same port
3. Use `netstat -tulpn | grep :3000` to find what's using the port

## Template Issues

### Template Not Found Error

**Symptoms**: "No template found for report type" error.

**Solutions**:
1. Upload a template first using `POST /upload-template`
2. Check if the template was uploaded successfully
3. Verify the report type matches exactly (case-sensitive)

### Invalid Template Format

**Symptoms**: Template processing fails with parsing errors.

**Solutions**:
1. Ensure your template is a valid `.docx` file
2. Check the sample template in `samples/sample_template.docx.txt`
3. Use proper DocxTemplater syntax
4. Avoid complex formatting that might break the template

## PDF Generation Issues

### LibreOffice Not Found

**Symptoms**: PDF conversion fails with "LibreOffice not found" error.

**Solutions**:
1. Install LibreOffice:
   - **Windows**: Download from libreoffice.org
   - **Linux**: `sudo apt-get install libreoffice`
   - **macOS**: `brew install --cask libreoffice`
2. Ensure LibreOffice is in your PATH
3. Test manually: `libreoffice --version`

### PDF Conversion Fails

**Symptoms**: DOCX to PDF conversion errors.

**Solutions**:
1. Verify LibreOffice installation
2. Check available disk space in temp directory
3. Ensure the DOCX file is not corrupted
4. Try with a simple template first

## Performance Issues

### Slow Report Generation

**Symptoms**: Reports take a long time to generate.

**Solutions**:
1. Check database query performance
2. Optimize your database queries
3. Add database indexes for frequently filtered columns
4. Consider using database views for complex queries
5. Limit the amount of data returned (use pagination)

### Memory Issues

**Symptoms**: Application crashes with out-of-memory errors.

**Solutions**:
1. Increase Node.js memory limit: `node --max-old-space-size=4096 server.js`
2. Process data in smaller batches
3. Optimize database queries to return less data
4. Monitor memory usage during report generation

## Testing and Debugging

### Test Database Connection

Use the built-in test script:
```bash
npm run test-connection
```

This will:
- Verify environment variables
- Test database connectivity
- Show database version
- Execute a simple test query

### Check Application Logs

Monitor console output for:
- Database connection status
- Template processing messages
- PDF conversion progress
- Error details

### Verify Environment

Run the setup script to check your environment:
```bash
npm run setup
```

This will:
- Create necessary directories
- Check Node.js version
- Verify OracleDB package installation
- Check LibreOffice availability

## Common OracleDB Thin Mode Issues

### Thin Mode Not Working

**Symptoms**: Connection attempts fail with thin mode errors.

**Solutions**:
1. Ensure Node.js version 18 or higher
2. Use OracleDB 6.0 or higher
3. Check network connectivity to Oracle database
4. Verify database supports thin mode connections

### Connection Pool Issues

**Symptoms**: Connection pool creation fails.

**Solutions**:
1. The application automatically falls back to direct connections
2. Check database connection limits
3. Verify user has CONNECT privilege
4. Reduce pool size in configuration

## Getting Help

### Check Logs First

Always check the console output and application logs before seeking help.

### Common Commands

```bash
# Test database connection
npm run test-connection

# Check setup
npm run setup

# Start in development mode (more verbose logging)
npm run dev

# Start in production mode
npm start
```

### Environment Information

When reporting issues, include:
- Node.js version: `node --version`
- OracleDB version: Check `package.json`
- Operating system
- Oracle database version
- Error messages and stack traces
- Environment configuration (without sensitive data)

### Support Resources

1. Check this troubleshooting guide
2. Review the README.md for detailed documentation
3. Check the QUICKSTART.md for setup instructions
4. Create an issue in the repository with detailed information 