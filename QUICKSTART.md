# Quick Start Guide

Get your DocxTemplater Report Generator up and running in minutes!

## Prerequisites

- Node.js 18 or higher
- Oracle Database (accessible via network)
- LibreOffice (for PDF conversion)

## 1. Clone and Install

```bash
git clone <repository-url>
cd docxtemplater
npm install
```

## 2. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your Oracle database details
# Use any text editor to modify the .env file
```

**Required settings in `.env`:**
```env
ORACLE_HOST=your-oracle-server
ORACLE_PORT=1521
ORACLE_SERVICE=your-service-name
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
```

## 3. Setup and Test

```bash
# Create necessary directories
npm run setup

# Test database connection
npm run test-connection
```

## 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 5. Upload Your First Template

Create a `.docx` file with placeholders like:
```
Report: {reportType}
Generated: {generatedDate}
Total Records: {summary.totalRecords}

Data:
{#data}
- {name}: {amount}
{/data}
```

Upload it using the API:
```bash
curl -X POST http://localhost:3000/upload-template \
  -F "template=@your-template.docx" \
  -F "reportType=sales"
```

## 6. Generate Your First Report

```bash
curl "http://localhost:3000/generate?report=sales&fromDate=2025-01-01&toDate=2025-01-31"
```

## API Endpoints

- **Health Check**: `GET /health`
- **Upload Template**: `POST /upload-template`
- **Generate Report**: `GET /generate?report=type&filters...`
- **List Templates**: `GET /upload-template`
- **Available Reports**: `GET /generate/available-types`

## Troubleshooting

### Connection Issues
- Run `npm run test-connection` to diagnose database problems
- Verify your Oracle database is running and accessible
- Check firewall settings

### Template Issues
- Ensure your `.docx` file uses valid DocxTemplater syntax
- Check the sample template in `samples/sample_template.docx.txt`

### PDF Generation Issues
- Install LibreOffice for PDF conversion
- Verify LibreOffice is in your PATH

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints for advanced usage
- Customize database queries in `services/reportService.js`
- Add your own report types and templates

## Support

- Check the troubleshooting section in README.md
- Review console logs for error details
- Create an issue in the repository for bugs

---

**That's it!** Your report generator is now ready to use. 🎉 