const BaseModel = require('./BaseModel');

class InventoryModel extends BaseModel {
  constructor() {
    super();
    this.tableName = 'inventory_data';
  }

  async fetchInventoryData(filters = {}) {
    try {
      let baseQuery = `SELECT * FROM ${this.tableName}`;
      
      // Apply filters
      const data = await this.executeQueryWithFilters(baseQuery, filters);
      
      // Transform data for template
      const transformedData = this.transformDataForTemplate(data);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      throw new Error(`Failed to fetch inventory data: ${error.message}`);
    }
  }

  transformDataForTemplate(data) {
    // Transform dates
    const dateFields = ['created_date', 'updated_date', 'last_restock_date'];
    let transformedData = this.transformDates(data, dateFields);
    
    // Transform numbers
    const numberFields = ['quantity', 'price', 'reorder_level'];
    transformedData = this.transformNumbers(transformedData, numberFields);
    
    // Add calculated fields
    transformedData = transformedData.map(row => {
      if (row.quantity && row.price) {
        row.total_value = (parseFloat(row.quantity) * parseFloat(row.price)).toFixed(2);
      }
      
      // Add stock status
      if (row.quantity !== undefined && row.reorder_level !== undefined) {
        if (row.quantity <= 0) {
          row.stock_status = 'Out of Stock';
        } else if (row.quantity <= row.reorder_level) {
          row.stock_status = 'Low Stock';
        } else {
          row.stock_status = 'In Stock';
        }
      }
      
      return row;
    });
    
    return transformedData;
  }

  generateInventorySummary(data) {
    const summaryFields = ['quantity', 'price'];
    const baseSummary = this.generateSummary(data, summaryFields);
    
    // Add inventory-specific summary
    if (data.length > 0) {
      const totalQuantity = data.reduce((sum, row) => sum + (parseInt(row.quantity) || 0), 0);
      baseSummary.totalQuantity = totalQuantity;
      baseSummary.averageQuantity = Math.round(totalQuantity / data.length);
      
      // Stock status counts
      const stockStatusCounts = {};
      data.forEach(row => {
        if (row.stock_status) {
          stockStatusCounts[row.stock_status] = (stockStatusCounts[row.stock_status] || 0) + 1;
        }
      });
      baseSummary.stockStatusCounts = stockStatusCounts;
      
      // Low stock items
      const lowStockItems = data.filter(row => row.stock_status === 'Low Stock' || row.stock_status === 'Out of Stock');
      baseSummary.lowStockCount = lowStockItems.length;
      baseSummary.lowStockItems = lowStockItems.slice(0, 10); // Top 10 low stock items
    }
    
    return baseSummary;
  }
}

module.exports = InventoryModel;
