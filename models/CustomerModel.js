const BaseModel = require('./BaseModel');

class CustomerModel extends BaseModel {
  constructor() {
    super();
    this.tableName = 'customer_data';
  }

  async fetchCustomerData(filters = {}) {
    try {
      let baseQuery = `SELECT * FROM ${this.tableName}`;
      
      // Apply filters
      const data = await this.executeQueryWithFilters(baseQuery, filters);
      
      // Transform data for template
      const transformedData = this.transformDataForTemplate(data);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching customer data:', error);
      throw new Error(`Failed to fetch customer data: ${error.message}`);
    }
  }

  transformDataForTemplate(data) {
    // Transform dates
    const dateFields = ['created_date', 'updated_date', 'last_purchase_date', 'registration_date'];
    let transformedData = this.transformDates(data, dateFields);
    
    // Transform numbers
    const numberFields = ['total_purchases', 'lifetime_value'];
    transformedData = this.transformNumbers(transformedData, numberFields);
    
    // Add calculated fields
    transformedData = transformedData.map(row => {
      // Add customer segment based on lifetime value
      if (row.lifetime_value) {
        const value = parseFloat(row.lifetime_value);
        if (value >= 10000) {
          row.customer_segment = 'Premium';
        } else if (value >= 5000) {
          row.customer_segment = 'Gold';
        } else if (value >= 1000) {
          row.customer_segment = 'Silver';
        } else {
          row.customer_segment = 'Bronze';
        }
      }
      
      // Add customer status
      if (row.last_purchase_date) {
        const lastPurchase = new Date(row.last_purchase_date);
        const daysSincePurchase = Math.floor((new Date() - lastPurchase) / (1000 * 60 * 60 * 24));
        
        if (daysSincePurchase <= 30) {
          row.customer_status = 'Active';
        } else if (daysSincePurchase <= 90) {
          row.customer_status = 'Recent';
        } else if (daysSincePurchase <= 365) {
          row.customer_status = 'Occasional';
        } else {
          row.customer_status = 'Inactive';
        }
      }
      
      return row;
    });
    
    return transformedData;
  }

  generateCustomerSummary(data) {
    const summaryFields = ['total_purchases', 'lifetime_value'];
    const baseSummary = this.generateSummary(data, summaryFields);
    
    // Add customer-specific summary
    if (data.length > 0) {
      // Customer segment distribution
      const segmentCounts = {};
      const statusCounts = {};
      
      data.forEach(row => {
        if (row.customer_segment) {
          segmentCounts[row.customer_segment] = (segmentCounts[row.customer_segment] || 0) + 1;
        }
        if (row.customer_status) {
          statusCounts[row.customer_status] = (statusCounts[row.customer_status] || 0) + 1;
        }
      });
      
      baseSummary.segmentDistribution = segmentCounts;
      baseSummary.statusDistribution = statusCounts;
      baseSummary.uniqueCustomers = new Set(data.map(row => row.customer_id || row.id)).size;
      
      // Top customers by lifetime value
      const topCustomers = [...data]
        .filter(row => row.lifetime_value)
        .sort((a, b) => parseFloat(b.lifetime_value) - parseFloat(a.lifetime_value))
        .slice(0, 10);
      
      baseSummary.topCustomers = topCustomers;
    }
    
    return baseSummary;
  }
}

module.exports = CustomerModel;
