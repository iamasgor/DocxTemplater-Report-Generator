const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');

class TemplateService {
  constructor() {
    this.templatesPath = process.env.TEMPLATE_UPLOAD_PATH || './uploads/templates';
    this.templates = new Map(); // In-memory storage for template metadata
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.templatesPath, { recursive: true });
      console.log(`Templates directory created: ${this.templatesPath}`);
    } catch (error) {
      console.error('Error creating templates directory:', error);
    }
  }

  async saveTemplate(file, reportType, templateName = null) {
    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueId = uuidv4();
      const filename = `${reportType}_${uniqueId}${fileExtension}`;
      const filePath = path.join(this.templatesPath, filename);

      // Save file to disk
      await fs.writeFile(filePath, file.buffer);

      // Store template metadata
      const templateInfo = {
        id: uniqueId,
        filename,
        filePath,
        reportType,
        templateName: templateName || file.originalname.replace('.docx', ''),
        originalName: file.originalname,
        uploadDate: new Date(),
        size: file.size
      };

      this.templates.set(uniqueId, templateInfo);

      console.log(`Template saved: ${filename} for report type: ${reportType} with name: ${templateInfo.templateName}`);
      return templateInfo;
    } catch (error) {
      console.error('Error saving template:', error);
      throw new Error('Failed to save template');
    }
  }

  async getTemplate(reportType, templateName = null) {
    try {
      // Find template by report type and optionally by name
      for (const [id, template] of this.templates) {
        if (template.reportType === reportType) {
          if (templateName) {
            if (template.templateName === templateName) {
              return template;
            }
          } else {
            // Return first template found for this report type
            return template;
          }
        }
      }
      
      if (templateName) {
        throw new Error(`No template found for report type: ${reportType} with name: ${templateName}`);
      } else {
        throw new Error(`No template found for report type: ${reportType}`);
      }
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  async populateTemplate(templatePath, data) {
    try {
      // Read the template file
      const content = await fs.readFile(templatePath);
      
      // Create a new instance of Docxtemplater with the content
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip);

      // Set the template variables
      doc.setData(data);

      // Render the document
      doc.render();

      // Get the generated document
      const buffer = doc.getZip().generate({ type: 'nodebuffer' });
      
      return buffer;
    } catch (error) {
      console.error('Error populating template:', error);
      throw new Error('Failed to populate template with data');
    }
  }

  async getAllTemplates() {
    return Array.from(this.templates.values());
  }

  async getTemplatesByReportType(reportType) {
    const templates = [];
    for (const [id, template] of this.templates) {
      if (template.reportType === reportType) {
        templates.push(template);
      }
    }
    return templates;
  }

  async getTemplateNames(reportType) {
    const templates = await this.getTemplatesByReportType(reportType);
    return templates.map(t => t.templateName);
  }

  async deleteTemplate(templateId) {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Delete file from disk
      await fs.unlink(template.filePath);
      
      // Remove from memory
      this.templates.delete(templateId);
      
      console.log(`Template deleted: ${template.filename}`);
      return { message: 'Template deleted successfully' };
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  validateTemplateFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.originalname || !file.originalname.endsWith('.docx')) {
      throw new Error('Only .docx files are allowed');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size too large. Maximum size is 10MB');
    }

    return true;
  }
}

module.exports = new TemplateService(); 