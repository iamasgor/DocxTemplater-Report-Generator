const templateService = require('./templateService');
const pdfService = require('./pdfService');
const modelFactory = require('../models/ModelFactory');

class ReportService {
  constructor() {
    // Models are now handled by ModelFactory
  }

  async generateReport(reportType, filters = {}, templateName = null) {
    try {
      // Step 1: Get the template for the report type (optionally by name)
      const template = await templateService.getTemplate(reportType, templateName);
      console.log(`Template found: ${template.filename} (${template.templateName})`);

      // Step 2: Fetch data using the appropriate model
      const data = await modelFactory.fetchData(reportType, filters);
      console.log(`Data fetched: ${data.length} records`);

      // Step 3: Generate summary using the model
      const summary = await modelFactory.generateSummary(reportType, data);
      console.log('Summary generated successfully');

      // Step 4: Populate the template with data
      const populatedDocx = await templateService.populateTemplate(template.filePath, {
        reportType: reportType.toUpperCase(),
        templateName: template.templateName,
        generatedDate: new Date().toISOString(),
        filters: filters,
        data: data,
        summary: summary
      });
      console.log('Template populated successfully');

      // Step 5: Convert to PDF
      const pdfBuffer = await pdfService.convertDocxToPdf(populatedDocx);
      console.log('PDF generated successfully');

      // Step 6: Generate filename based on template name
      const filename = templateName 
        ? `${templateName}_${new Date().toISOString().split('T')[0]}.pdf`
        : `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;

      return {
        pdfBuffer,
        filename: filename,
        contentType: 'application/pdf',
        templateName: template.templateName
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async fetchReportData(reportType, filters) {
    try {
      // Use the model factory to fetch data
      return await modelFactory.fetchData(reportType, filters);
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw new Error(`Failed to fetch data for ${reportType} report`);
    }
  }





  async getAvailableReportTypes() {
    try {
      // Get available report types from model factory
      const modelReportTypes = modelFactory.getAvailableReportTypes();
      
      // Also get report types from templates
      const templates = await templateService.getAllTemplates();
      const templateReportTypes = [...new Set(templates.map(t => t.reportType))];
      
      // Combine and deduplicate
      const allReportTypes = [...new Set([...modelReportTypes, ...templateReportTypes])];
      
      return allReportTypes;
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

    // Validate report type exists in models
    if (!modelFactory.validateReportType(reportType)) {
      errors.push(`Unsupported report type: ${reportType}`);
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