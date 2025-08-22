/**
 * Utility functions for input validation
 */

/**
 * Validates if a string is a valid date in YYYY-MM-DD format
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validates if a string is a valid report type
 * @param {string} reportType - The report type to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidReportType(reportType) {
  if (!reportType || typeof reportType !== 'string') {
    return false;
  }
  
  // Allow alphanumeric characters, hyphens, and underscores
  const reportTypeRegex = /^[a-zA-Z0-9_-]+$/;
  return reportTypeRegex.test(reportType) && reportType.length <= 50;
}

/**
 * Validates query parameters for report generation
 * @param {Object} params - The query parameters to validate
 * @returns {Object} - Object with isValid boolean and errors array
 */
function validateReportParams(params) {
  const errors = [];
  
  if (!params.report) {
    errors.push('Report type is required');
  } else if (!isValidReportType(params.report)) {
    errors.push('Invalid report type format');
  }
  
  if (params.fromDate && !isValidDate(params.fromDate)) {
    errors.push('Invalid fromDate format. Use YYYY-MM-DD');
  }
  
  if (params.toDate && !isValidDate(params.toDate)) {
    errors.push('Invalid toDate format. Use YYYY-MM-DD');
  }
  
  if (params.fromDate && params.toDate) {
    const fromDate = new Date(params.fromDate);
    const toDate = new Date(params.toDate);
    if (fromDate > toDate) {
      errors.push('fromDate cannot be after toDate');
    }
  }
  
  // Validate other filters
  if (params.type && typeof params.type !== 'string') {
    errors.push('Type filter must be a string');
  }
  
  if (params.limit && (!Number.isInteger(Number(params.limit)) || Number(params.limit) < 1 || Number(params.limit) > 1000)) {
    errors.push('Limit must be a number between 1 and 1000');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes input strings to prevent injection attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates file upload parameters
 * @param {Object} file - The uploaded file object
 * @param {Object} body - The request body
 * @returns {Object} - Object with isValid boolean and errors array
 */
function validateFileUpload(file, body) {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
  } else {
    if (!file.originalname || !file.originalname.endsWith('.docx')) {
      errors.push('Only .docx files are allowed');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      errors.push('File size too large. Maximum size is 10MB');
    }
  }
  
  if (!body.reportType) {
    errors.push('Report type is required');
  } else if (!isValidReportType(body.reportType)) {
    errors.push('Invalid report type format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  isValidDate,
  isValidReportType,
  validateReportParams,
  sanitizeInput,
  validateFileUpload
}; 