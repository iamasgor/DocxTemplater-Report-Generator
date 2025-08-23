const BaseModel = require('./BaseModel');

class SalesModel extends BaseModel {
  constructor() {
    super();
    this.tableName = 'sales_data';
  }

  async fetchSalesData(filters = {}) {
    try {
      let baseQuery = `SELECT * FROM ${this.tableName}`;
      
      // Apply filters
      const data = await this.executeQueryWithFilters(baseQuery, filters);
      
      // Transform data for template
      const transformedData = this.transformDataForTemplate(data);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching sales data:', error);
      throw new Error(`Failed to fetch sales data: ${error.message}`);
    }
  }

  transformDataForTemplate(data) {
    // Transform dates
    const dateFields = ['created_date', 'updated_date', 'sale_date'];
    let transformedData = this.transformDates(data, dateFields);
    
    // Transform numbers
    const numberFields = ['amount', 'quantity', 'price'];
    transformedData = this.transformNumbers(transformedData, numberFields);
    
    // Add calculated fields
    transformedData = transformedData.map(row => {
      if (row.amount && row.quantity) {
        row.total = (parseFloat(row.amount) * parseInt(row.quantity)).toFixed(2);
      }
      return row;
    });
    
    return transformedData;
  }

  generateSalesSummary(data) {
    const summaryFields = ['amount', 'quantity'];
    const baseSummary = this.generateSummary(data, summaryFields);
    
    // Add sales-specific summary
    if (data.length > 0) {
      const totalAmount = data.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
      baseSummary.totalAmount = totalAmount.toFixed(2);
      baseSummary.averageAmount = (totalAmount / data.length).toFixed(2);
      
      // Group by date if available
      if (data[0].sale_date) {
        const salesByDate = {};
        data.forEach(row => {
          const date = row.sale_date;
          if (!salesByDate[date]) {
            salesByDate[date] = { count: 0, total: 0 };
          }
          salesByDate[date].count++;
          salesByDate[date].total += parseFloat(row.amount) || 0;
        });
        baseSummary.salesByDate = salesByDate;
      }
    }
    
    return baseSummary;
  }
}

module.exports = SalesModel;
