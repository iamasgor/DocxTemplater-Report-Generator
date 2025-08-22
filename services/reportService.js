const { databaseService } = require('./databaseService');
const templateService = require('./templateService');
const pdfService = require('./pdfService');

class ReportService {
  constructor() {
    this.sampleQueries = {
      sales: 'SELECT * FROM sales_data',
      inventory: 'SELECT * FROM inventory_data',
      customers: 'SELECT * FROM customer_data',
      orders: 'SELECT * FROM order_data'
    };
  }

  async generateReport(reportType, filters = {}) {
    try {
      // Step 1: Get the template for the report type
      const template = await templateService.getTemplate(reportType);
      console.log(`Template found: ${template.filename}`);

      // Step 2: Fetch data from Oracle DB based on filters
      const data = await this.fetchReportData(reportType, filters);
      console.log(`Data fetched: ${data.length} records`);

      // Step 3: Populate the template with data
      const populatedDocx = await templateService.populateTemplate(template.filePath, {
        reportType: reportType.toUpperCase(),
        generatedDate: new Date().toISOString(),
        filters: filters,
        data: data,
        summary: this.generateSummary(data, reportType)
      });
      console.log('Template populated successfully');

      // Step 4: Convert to PDF
      const pdfBuffer = await pdfService.convertDocxToPdf(populatedDocx);
      console.log('PDF generated successfully');

      return {
        pdfBuffer,
        filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`,
        contentType: 'application/pdf'
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async fetchReportData(reportType, filters) {
    try {
      let baseQuery = this.sampleQueries[reportType];
      
      if (!baseQuery) {
        // If no predefined query, create a generic one
        baseQuery = `SELECT * FROM ${reportType}_data`;
      }

      // Apply filters to the query
      const data = await databaseService.executeQueryWithFilters(baseQuery, filters);
      
      // Transform data for template (convert dates, format numbers, etc.)
      return this.transformDataForTemplate(data, reportType);
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw new Error(`Failed to fetch data for ${reportType} report`);
    }
  }

  transformDataForTemplate(data, reportType) {
    try {
      return data.map(row => {
        const transformedRow = { ...row };
        
        // Format dates
        if (row.created_date) {
          transformedRow.created_date = new Date(row.created_date).toLocaleDateString();
        }
        if (row.updated_date) {
          transformedRow.updated_date = new Date(row.updated_date).toLocaleDateString();
        }
        
        // Format numbers
        if (row.amount) {
          transformedRow.amount = parseFloat(row.amount).toFixed(2);
        }
        if (row.quantity) {
          transformedRow.quantity = parseInt(row.quantity);
        }
        
        // Add calculated fields
        if (row.amount && row.quantity) {
          transformedRow.total = (parseFloat(row.amount) * parseInt(row.quantity)).toFixed(2);
        }
        
        return transformedRow;
      });
    } catch (error) {
      console.error('Error transforming data:', error);
      return data; // Return original data if transformation fails
    }
  }

  generateSummary(data, reportType) {
    try {
      if (!data || data.length === 0) {
        return {
          totalRecords: 0,
          message: 'No data available for the specified criteria'
        };
      }

      const summary = {
        totalRecords: data.length,
        generatedAt: new Date().toLocaleString()
      };

      // Add type-specific summaries
      switch (reportType) {
        case 'sales':
          if (data[0].amount) {
            const totalAmount = data.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
            summary.totalAmount = totalAmount.toFixed(2);
            summary.averageAmount = (totalAmount / data.length).toFixed(2);
          }
          break;
        
        case 'inventory':
          if (data[0].quantity) {
            const totalQuantity = data.reduce((sum, row) => sum + (parseInt(row.quantity) || 0), 0);
            summary.totalQuantity = totalQuantity;
            summary.averageQuantity = Math.round(totalQuantity / data.length);
          }
          break;
        
        case 'customers':
          summary.uniqueCustomers = new Set(data.map(row => row.customer_id || row.id)).size;
          break;
        
        case 'orders':
          if (data[0].order_date) {
            const recentOrders = data.filter(row => {
              const orderDate = new Date(row.order_date);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return orderDate >= thirtyDaysAgo;
            });
            summary.recentOrders = recentOrders.length;
          }
          break;
      }

      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        totalRecords: data.length,
        message: 'Summary generation failed'
      };
    }
  }

  async getAvailableReportTypes() {
    try {
      const templates = await templateService.getAllTemplates();
      const reportTypes = [...new Set(templates.map(t => t.reportType))];
      return reportTypes;
    } catch (error) {
      console.error('Error getting available report types:', error);
      return [];
    }
  }

  async validateReportRequest(reportType, filters) {
    const errors = [];

    if (!reportType) {
      errors.push('Report type is required');
    }

    if (filters.fromDate && !this.isValidDate(filters.fromDate)) {
      errors.push('Invalid fromDate format. Use YYYY-MM-DD');
    }

    if (filters.toDate && !this.isValidDate(filters.toDate)) {
      errors.push('Invalid toDate format. Use YYYY-MM-DD');
    }

    if (filters.fromDate && filters.toDate) {
      const fromDate = new Date(filters.fromDate);
      const toDate = new Date(filters.toDate);
      if (fromDate > toDate) {
        errors.push('fromDate cannot be after toDate');
      }
    }

    return errors;
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
}

module.exports = new ReportService(); 