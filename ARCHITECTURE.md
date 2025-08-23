# Application Architecture - Model-Based Report Generation

## Overview

This application has been restructured to use a **Model-Based Architecture** for report generation. The new structure separates concerns and provides a more maintainable and extensible codebase.

## Architecture Flow

```
Request → Routes → Report Service → Model Factory → Specific Model → Database → Data → Report Service → Template Service → PDF Service → Response
```

## Key Components

### 1. Models (`/models/`)

Models are responsible for:
- Fetching data from the database
- Transforming data for template consumption
- Generating summaries and calculated fields
- Handling business logic specific to each report type

#### Base Model (`BaseModel.js`)
- Common database operations
- Data transformation utilities
- Summary generation helpers

#### Specific Models
- **SalesModel**: Handles sales data with amount calculations and date grouping
- **InventoryModel**: Manages inventory with stock status and value calculations
- **CustomerModel**: Customer segmentation and activity status

### 2. Model Factory (`ModelFactory.js`)
- Central registry for all models
- Provides unified interface for data fetching
- Routes requests to appropriate models
- Validates report types

### 3. Services

#### Report Service (`reportService.js`)
- Orchestrates the report generation process
- Uses models for data fetching
- Handles template selection by name
- Manages PDF generation workflow

#### Template Service (`templateService.js`)
- Manages template uploads and storage
- Supports template names for output determination
- Handles template population with data

#### Database Service (`databaseService.js`)
- Oracle database connection management
- Query execution with filters
- Connection pooling

## New Features

### Template Names
Templates now support custom names that determine the output filename:

```javascript
// Upload template with custom name
POST /upload-template
{
  "template": file,
  "reportType": "sales",
  "templateName": "Monthly Sales Report"
}

// Generate report using specific template
GET /generate?report=sales&templateName=Monthly Sales Report
```

### Model-Based Data Fetching
Each report type has its own model that handles:
- Database queries
- Data transformation
- Business logic
- Summary generation

### Enhanced API Endpoints

#### New Routes
- `GET /generate/templates/:reportType` - Get available templates for a report type
- Enhanced preview with template information
- Batch processing with template names

#### Updated Routes
- All routes now support `templateName` parameter
- Enhanced validation using model factory
- Better error handling and reporting

## Usage Examples

### 1. Upload a Template with Custom Name
```bash
curl -X POST http://localhost:3000/upload-template \
  -F "template=@monthly_sales.docx" \
  -F "reportType=sales" \
  -F "templateName=Monthly Sales Report"
```

### 2. Generate Report Using Template Name
```bash
curl -X GET "http://localhost:3000/generate?report=sales&templateName=Monthly Sales Report&fromDate=2024-01-01&toDate=2024-01-31"
```

### 3. Get Available Templates for Report Type
```bash
curl -X GET http://localhost:3000/generate/templates/sales
```

### 4. Preview Data with Template Information
```bash
curl -X GET "http://localhost:3000/generate/preview/sales?fromDate=2024-01-01&toDate=2024-01-31"
```

## Adding New Report Types

### 1. Create a New Model
```javascript
// models/NewReportModel.js
const BaseModel = require('./BaseModel');

class NewReportModel extends BaseModel {
  constructor() {
    super();
    this.tableName = 'new_report_data';
  }

  async fetchNewReportData(filters = {}) {
    // Implementation
  }

  transformDataForTemplate(data) {
    // Data transformation logic
  }

  generateNewReportSummary(data) {
    // Summary generation
  }
}

module.exports = NewReportModel;
```

### 2. Register in Model Factory
```javascript
// models/ModelFactory.js
const NewReportModel = require('./NewReportModel');

class ModelFactory {
  constructor() {
    this.models = {
      // ... existing models
      newReport: new NewReportModel()
    };
  }
  
  // ... rest of implementation
}
```

### 3. Upload Template
```bash
curl -X POST http://localhost:3000/upload-template \
  -F "template=@new_report.docx" \
  -F "reportType=newReport" \
  -F "templateName=New Report Template"
```

## Benefits of New Architecture

1. **Separation of Concerns**: Models handle data, services handle business logic
2. **Extensibility**: Easy to add new report types and models
3. **Maintainability**: Clear structure and responsibilities
4. **Reusability**: Common functionality in base classes
5. **Template Flexibility**: Multiple templates per report type with custom names
6. **Better Error Handling**: Model-specific error messages and validation

## Database Schema Requirements

The application expects the following tables:
- `sales_data` - Sales information
- `inventory_data` - Inventory and stock data
- `customer_data` - Customer information
- `order_data` - Order details

Each table should include:
- `created_date` - Record creation timestamp
- `updated_date` - Last update timestamp
- Appropriate business fields (amount, quantity, etc.)

## Configuration

Ensure your `.env` file contains:
```env
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE=your_service
TEMPLATE_UPLOAD_PATH=./uploads/templates
```

## Troubleshooting

### Common Issues

1. **Model Not Found**: Ensure the model is registered in `ModelFactory.js`
2. **Template Not Found**: Check template name spelling and report type
3. **Database Connection**: Verify Oracle connection parameters
4. **File Permissions**: Ensure upload directory is writable

### Debug Mode
Enable debug logging by setting environment variable:
```env
DEBUG=true
```

## Migration from Old Structure

The old structure has been preserved in the codebase. To migrate:

1. Update API calls to include `templateName` parameter
2. Use new model-based endpoints for better data handling
3. Leverage template names for organized output files
4. Utilize enhanced validation and error reporting
