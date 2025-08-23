# DocxTemplater Report Generator

A Node.js application for generating reports from Oracle database data using DOCX templates and converting them to PDF format.

## Features

- **Model-Based Architecture**: Clean separation of concerns with dedicated models for each report type
- **Oracle Database Integration**: Connect to Oracle databases using thin mode (no Oracle Client required)
- **Template Management**: Upload and manage .docx templates with custom names for organized output
- **Report Generation**: Generate reports by populating templates with database data
- **PDF Conversion**: Convert generated DOCX files to PDF format
- **Flexible Filtering**: Support for date ranges, types, and custom filters
- **Batch Processing**: Generate multiple reports in a single request
- **RESTful API**: Clean and intuitive API endpoints
- **Extensible Design**: Easy to add new report types and models

## Tech Stack

- **Node.js** (v18+) + **Express.js** - Server framework
- **OracleDB** - Oracle database client for Node.js (thin mode)
- **DocxTemplater** - DOCX template processing
- **LibreOffice Convert** - PDF conversion
- **Multer** - File upload handling
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Model-Based Architecture** - Clean separation of data, business logic, and presentation

## Prerequisites

- Node.js (v18 or higher)
- Oracle Database (accessible via network)
- LibreOffice (for PDF conversion)

### Oracle Database Access

The application uses OracleDB thin mode, which means:
- **No Oracle Client installation required**
- **No Oracle Instant Client needed**
- **Direct network connection to Oracle database**
- **Supports Oracle Database 19c and later**

### LibreOffice Installation

#### Windows
Download and install LibreOffice from [libreoffice.org](https://www.libreoffice.org/download/download/)

#### Linux
```bash
sudo apt-get install libreoffice
```

#### macOS
```bash
brew install --cask libreoffice
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd docxtemplater
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp env.example .env
```

4. Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Oracle Database Configuration
ORACLE_HOST=your-oracle-host
ORACLE_PORT=1521
ORACLE_SERVICE=your-service-name
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password

# File Storage Configuration
TEMPLATE_UPLOAD_PATH=./uploads/templates
TEMP_FILES_PATH=./temp

# LibreOffice Configuration
LIBREOFFICE_PATH=/usr/bin/libreoffice
```

5. Create required directories:
```bash
npm run setup
```

## Architecture

This application uses a **Model-Based Architecture** that provides:

- **Models** (`/models/`): Handle data fetching, transformation, and business logic for each report type
- **Services** (`/services/`): Orchestrate the report generation process and manage templates
- **Routes** (`/routes/`): Handle HTTP requests and responses
- **Factory Pattern**: Centralized model management for easy extensibility

### Key Benefits

1. **Separation of Concerns**: Clear boundaries between data, business logic, and presentation
2. **Extensibility**: Easy to add new report types by creating new models
3. **Maintainability**: Well-structured code that's easy to understand and modify
4. **Template Flexibility**: Support for multiple templates per report type with custom names

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Usage

### Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on the configured port (default: 3000).

### API Endpoints

#### Health Check
```
GET /health
```

#### Template Management

**Upload Template**
```
POST /upload-template
Content-Type: multipart/form-data

Body:
- template: .docx file
- reportType: string (e.g., "sales", "inventory")
```

**Get All Templates**
```
GET /upload-template
```

**Get Template by ID**
```
GET /upload-template/:id
```

**Get Templates by Report Type**
```
GET /upload-template/report-type/:type
```

**Delete Template**
```
DELETE /upload-template/:id
```

#### Report Generation

**Generate Report**
```
GET /generate?report=sales&fromDate=2025-01-01&toDate=2025-01-31&type=retail
```

**Get Available Report Types**
```
GET /generate/available-types
```

**Preview Report Data**
```
GET /generate/preview/sales?fromDate=2025-01-01&toDate=2025-01-31
```

**Check Report Status**
```
GET /generate/status/sales
```

**Batch Report Generation**
```
POST /generate/batch
Content-Type: application/json

Body:
{
  "reports": [
    {
      "report": "sales",
      "filters": {
        "fromDate": "2025-01-01",
        "toDate": "2025-01-31"
      }
    },
    {
      "report": "inventory",
      "filters": {
        "type": "electronics"
      }
    }
  ]
}
```

### Query Parameters

- `report`: Report type (required)
- `fromDate`: Start date in YYYY-MM-DD format
- `toDate`: End date in YYYY-MM-DD format
- `type`: Additional filter type
- `limit`: Maximum number of records (1-1000)

## Template Format

Your .docx templates should use DocxTemplater syntax:

```
Report: {reportType}
Generated: {generatedDate}

Filters Applied:
- From Date: {filters.fromDate}
- To Date: {filters.toDate}
- Type: {filters.type}

Summary:
- Total Records: {summary.totalRecords}
- Generated At: {summary.generatedAt}

Data:
{#data}
  - {name}: {amount} ({created_date})
{/data}
```

## Database Schema

The application expects the following table structure (adjust according to your needs):

```sql
-- Sales data table
CREATE TABLE sales_data (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(100),
  amount NUMBER(10,2),
  type VARCHAR2(50),
  created_date DATE,
  updated_date DATE
);

-- Inventory data table
CREATE TABLE inventory_data (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(100),
  quantity NUMBER,
  type VARCHAR2(50),
  created_date DATE
);

-- Customer data table
CREATE TABLE customer_data (
  id NUMBER PRIMARY KEY,
  customer_id VARCHAR2(50),
  name VARCHAR2(100),
  email VARCHAR2(100),
  created_date DATE
);

-- Order data table
CREATE TABLE order_data (
  id NUMBER PRIMARY KEY,
  order_id VARCHAR2(50),
  customer_id VARCHAR2(50),
  order_date DATE,
  total_amount NUMBER(10,2),
  status VARCHAR2(20)
);
```

## Error Handling

The application includes comprehensive error handling for:
- Database connection issues
- Template not found
- Invalid query parameters
- File upload errors
- PDF conversion failures

All errors return appropriate HTTP status codes and descriptive error messages.

## Security Features

- Input validation and sanitization
- File type restrictions
- File size limits
- SQL injection prevention
- Helmet security middleware
- CORS configuration

## Development

### Project Structure
```
docxtemplater/
├── services/           # Business logic services
│   ├── databaseService.js
│   ├── templateService.js
│   ├── pdfService.js
│   └── reportService.js
├── routes/             # API route handlers
│   ├── uploadRoutes.js
│   └── reportRoutes.js
├── utils/              # Utility functions
│   └── validation.js
├── uploads/            # Template storage
├── temp/               # Temporary files
├── server.js           # Main server file
├── package.json        # Dependencies
└── README.md           # This file
```

### Adding New Report Types

1. Upload a template for the new report type
2. Add sample data to the database
3. Optionally, add custom query logic in `reportService.js`

### Customizing Database Queries

Modify the `sampleQueries` object in `reportService.js` to match your database schema:

```javascript
this.sampleQueries = {
  sales: 'SELECT * FROM sales_data',
  inventory: 'SELECT * FROM inventory_data',
  // Add your custom queries here
  custom: 'SELECT * FROM custom_table WHERE active = 1'
};
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Verify Oracle database credentials and network connectivity
2. **PDF Conversion Fails**: Verify LibreOffice is installed and accessible
3. **Template Not Found**: Check if template was uploaded for the specified report type
4. **Node.js Version**: Ensure you're using Node.js v18 or higher for thin mode support

### Logs

Check console output for detailed error messages and debugging information.

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please check the troubleshooting section or create an issue in the repository. Thank you!