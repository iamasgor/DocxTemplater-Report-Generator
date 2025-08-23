const { databaseService } = require('../services/databaseService');

class BaseModel {
  constructor() {
    this.db = databaseService;
  }

  async executeQuery(query, params = []) {
    return await this.db.executeQuery(query, params);
  }

  async executeQueryWithFilters(baseQuery, filters) {
    return await this.db.executeQueryWithFilters(baseQuery, filters);
  }

  // Common data transformation methods
  transformDates(data, dateFields = []) {
    return data.map(row => {
      const transformedRow = { ...row };
      dateFields.forEach(field => {
        if (row[field]) {
          transformedRow[field] = new Date(row[field]).toLocaleDateString();
        }
      });
      return transformedRow;
    });
  }

  transformNumbers(data, numberFields = []) {
    return data.map(row => {
      const transformedRow = { ...row };
      numberFields.forEach(field => {
        if (row[field] !== undefined && row[field] !== null) {
          if (field.includes('amount') || field.includes('price') || field.includes('total')) {
            transformedRow[field] = parseFloat(row[field]).toFixed(2);
          } else if (field.includes('quantity') || field.includes('count')) {
            transformedRow[field] = parseInt(row[field]);
          }
        }
      });
      return transformedRow;
    });
  }

  generateSummary(data, summaryFields = []) {
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

    summaryFields.forEach(field => {
      if (data[0][field] !== undefined) {
        if (typeof data[0][field] === 'number' || !isNaN(parseFloat(data[0][field]))) {
          const total = data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
          summary[`total${field.charAt(0).toUpperCase() + field.slice(1)}`] = total;
          summary[`average${field.charAt(0).toUpperCase() + field.slice(1)}`] = (total / data.length).toFixed(2);
        }
      }
    });

    return summary;
  }
}

module.exports = BaseModel;
