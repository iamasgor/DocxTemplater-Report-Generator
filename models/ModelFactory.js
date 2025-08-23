const SalesModel = require('./SalesModel');
const InventoryModel = require('./InventoryModel');
const CustomerModel = require('./CustomerModel');

class ModelFactory {
  constructor() {
    this.models = {
      sales: new SalesModel(),
      inventory: new InventoryModel(),
      customers: new CustomerModel(),
      orders: new SalesModel() // Reuse sales model for orders
    };
  }

  getModel(reportType) {
    const model = this.models[reportType];
    if (!model) {
      throw new Error(`No model found for report type: ${reportType}`);
    }
    return model;
  }

  async fetchData(reportType, filters = {}) {
    const model = this.getModel(reportType);
    
    switch (reportType) {
      case 'sales':
        return await model.fetchSalesData(filters);
      case 'inventory':
        return await model.fetchInventoryData(filters);
      case 'customers':
        return await model.fetchCustomerData(filters);
      case 'orders':
        return await model.fetchSalesData(filters);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  async generateSummary(reportType, data) {
    const model = this.getModel(reportType);
    
    switch (reportType) {
      case 'sales':
        return model.generateSalesSummary(data);
      case 'inventory':
        return model.generateInventorySummary(data);
      case 'customers':
        return model.generateCustomerSummary(data);
      case 'orders':
        return model.generateSalesSummary(data);
      default:
        return model.generateSummary(data);
    }
  }

  getAvailableReportTypes() {
    return Object.keys(this.models);
  }

  validateReportType(reportType) {
    return this.models.hasOwnProperty(reportType);
  }
}

module.exports = new ModelFactory();
