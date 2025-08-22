const express = require('express');
const multer = require('multer');
const templateService = require('../services/templateService');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.originalname.endsWith('.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Only .docx files are allowed'), false);
    }
  }
});

// POST /upload-template - Upload a new template
router.post('/', upload.single('template'), async (req, res, next) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ error: 'No template file provided' });
    }

    if (!req.body.reportType) {
      return res.status(400).json({ error: 'Report type is required' });
    }

    // Validate file
    templateService.validateTemplateFile(req.file);

    // Save template
    const templateInfo = await templateService.saveTemplate(req.file, req.body.reportType);

    res.status(201).json({
      message: 'Template uploaded successfully',
      template: {
        id: templateInfo.id,
        filename: templateInfo.filename,
        reportType: templateInfo.reportType,
        originalName: templateInfo.originalName,
        uploadDate: templateInfo.uploadDate,
        size: templateInfo.size
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /upload-template - Get all uploaded templates
router.get('/', async (req, res, next) => {
  try {
    const templates = await templateService.getAllTemplates();
    res.json({
      templates: templates.map(template => ({
        id: template.id,
        filename: template.filename,
        reportType: template.reportType,
        originalName: template.originalName,
        uploadDate: template.uploadDate,
        size: template.size
      }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /upload-template/:id - Get specific template info
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const templates = await templateService.getAllTemplates();
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      template: {
        id: template.id,
        filename: template.filename,
        reportType: template.reportType,
        originalName: template.originalName,
        uploadDate: template.uploadDate,
        size: template.size
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /upload-template/:id - Delete a template
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await templateService.deleteTemplate(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /upload-template/report-type/:type - Get templates by report type
router.get('/report-type/:type', async (req, res, next) => {
  try {
    const { type } = req.params;
    const templates = await templateService.getAllTemplates();
    const filteredTemplates = templates.filter(t => t.reportType === type);
    
    res.json({
      reportType: type,
      templates: filteredTemplates.map(template => ({
        id: template.id,
        filename: template.filename,
        originalName: template.originalName,
        uploadDate: template.uploadDate,
        size: template.size
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 