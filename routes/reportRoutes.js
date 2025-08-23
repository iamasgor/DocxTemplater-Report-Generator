const express = require('express');
const reportService = require('../services/reportService');

const router = express.Router();

// GET /generate - Generate a report based on parameters
router.get('/', async (req, res, next) => {
  try {
    const { report, templateName, fromDate, toDate, type, ...otherFilters } = req.query;
    
    // Validate required parameters
    if (!report) {
      return res.status(400).json({ 
        error: 'Report type is required. Use ?report=sales' 
      });
    }

    // Build filters object
    const filters = {
      fromDate,
      toDate,
      type,
      ...otherFilters
    };

    // Validate request parameters
    const validationErrors = await reportService.validateReportRequest(report, filters);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Generate the report using the model-based approach
    const reportResult = await reportService.generateReport(report, filters, templateName);

    // Set response headers for PDF download
    res.setHeader('Content-Type', reportResult.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${reportResult.filename}"`);
    res.setHeader('Content-Length', reportResult.pdfBuffer.length);

    // Send the PDF
    res.send(reportResult.pdfBuffer);

  } catch (error) {
    next(error);
  }
});

// GET /generate/available-types - Get available report types
router.get('/available-types', async (req, res, next) => {
  try {
    const reportTypes = await reportService.getAvailableReportTypes();
    res.json({
      availableReportTypes: reportTypes,
      message: reportTypes.length > 0 
        ? 'Report types available' 
        : 'No report types available. Please upload templates first.'
    });
  } catch (error) {
    next(error);
  }
});

// GET /generate/templates/:reportType - Get available templates for a specific report type
router.get('/templates/:reportType', async (req, res, next) => {
  try {
    const { reportType } = req.params;
    
    // Validate report type
    if (!reportService.validateReportRequest(reportType, {})) {
      return res.status(400).json({ 
        error: `Invalid report type: ${reportType}` 
      });
    }

    const templateService = require('../services/templateService');
    const templates = await templateService.getTemplatesByReportType(reportType);
    
    res.json({
      reportType,
      templates: templates.map(t => ({
        id: t.id,
        name: t.templateName,
        filename: t.filename,
        uploadDate: t.uploadDate,
        size: t.size
      })),
      message: templates.length > 0 
        ? `${templates.length} template(s) available for ${reportType}` 
        : `No templates available for ${reportType}`
    });
  } catch (error) {
    next(error);
  }
});

// GET /generate/preview/:reportType - Preview report data without generating PDF
router.get('/preview/:reportType', async (req, res, next) => {
  try {
    const { reportType } = req.params;
    const { templateName, fromDate, toDate, type, ...otherFilters } = req.query;
    
    const filters = {
      fromDate,
      toDate,
      type,
      ...otherFilters
    };

    // Validate request parameters
    const validationErrors = await reportService.validateReportRequest(reportType, filters);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Fetch data only (no PDF generation) using the model
    const data = await reportService.fetchReportData(reportType, filters);
    
    // Get available templates for this report type
    const templateService = require('../services/templateService');
    const availableTemplates = await templateService.getTemplateNames(reportType);

    res.json({
      reportType,
      templateName,
      availableTemplates,
      filters,
      dataCount: data.length,
      sampleData: data.slice(0, 5), // Show first 5 records as sample
      message: 'Data preview generated successfully'
    });

  } catch (error) {
    next(error);
  }
});

// GET /generate/status/:reportType - Check if report generation is possible
router.get('/status/:reportType', async (req, res, next) => {
  try {
    const { reportType } = req.params;
    
    // Check if template exists
    const templateService = require('../services/templateService');
    let templateExists = false;
    let templateInfo = null;
    
    try {
      templateInfo = await templateService.getTemplate(reportType);
      templateExists = true;
    } catch (error) {
      templateExists = false;
    }

    // Check database connection
    const { databaseService } = require('../services/databaseService');
    let dbStatus = 'unknown';
    
    try {
      await databaseService.getConnection();
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
    }

    res.json({
      reportType,
      status: {
        template: templateExists ? 'available' : 'missing',
        database: dbStatus,
        canGenerate: templateExists && dbStatus === 'connected'
      },
      template: templateExists ? {
        filename: templateInfo.filename,
        uploadDate: templateInfo.uploadDate
      } : null,
      message: templateExists && dbStatus === 'connected' 
        ? 'Report generation is ready' 
        : 'Report generation is not ready'
    });

  } catch (error) {
    next(error);
  }
});

// POST /generate/batch - Generate multiple reports in batch
router.post('/batch', async (req, res, next) => {
  try {
    const { reports } = req.body;
    
    if (!Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({ 
        error: 'Reports array is required and must not be empty' 
      });
    }

    if (reports.length > 5) {
      return res.status(400).json({ 
        error: 'Maximum 5 reports can be generated in batch' 
      });
    }

    const results = [];
    const errors = [];

    for (const reportRequest of reports) {
      try {
        const { report, templateName, filters = {} } = reportRequest;
        
        if (!report) {
          errors.push({ report: 'unknown', error: 'Report type is required' });
          continue;
        }

        const validationErrors = await reportService.validateReportRequest(report, filters);
        if (validationErrors.length > 0) {
          errors.push({ 
            report, 
            error: 'Validation failed', 
            details: validationErrors 
          });
          continue;
        }

        const reportResult = await reportService.generateReport(report, filters, templateName);
        results.push({
          report,
          templateName: reportResult.templateName,
          filename: reportResult.filename,
          size: reportResult.pdfBuffer.length,
          status: 'success'
        });

      } catch (error) {
        errors.push({ 
          report: reportRequest.report || 'unknown', 
          error: error.message 
        });
      }
    }

    res.json({
      batchId: Date.now(),
      total: reports.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
      message: `Batch processing completed. ${results.length} successful, ${errors.length} failed.`
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router; 