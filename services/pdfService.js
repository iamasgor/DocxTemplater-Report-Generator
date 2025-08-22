const fs = require('fs').promises;
const path = require('path');
const libre = require('libreoffice-convert');
const { promisify } = require('util');

// Convert libre.convert to promise-based function
const convertAsync = promisify(libre.convert);

class PDFService {
  constructor() {
    this.tempPath = process.env.TEMP_FILES_PATH || './temp';
    this.ensureTempDirectory();
  }

  async ensureTempDirectory() {
    try {
      await fs.mkdir(this.tempPath, { recursive: true });
      console.log(`Temp directory created: ${this.tempPath}`);
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  async convertDocxToPdf(docxBuffer) {
    try {
      // Generate unique filename for temp files
      const timestamp = Date.now();
      const tempDocxPath = path.join(this.tempPath, `temp_${timestamp}.docx`);
      const tempPdfPath = path.join(this.tempPath, `temp_${timestamp}.pdf`);

      // Write docx buffer to temp file
      await fs.writeFile(tempDocxPath, docxBuffer);

      // Convert to PDF
      const pdfBuffer = await convertAsync(
        await fs.readFile(tempDocxPath),
        '.pdf',
        undefined
      );

      // Clean up temp files
      await this.cleanupTempFiles([tempDocxPath, tempPdfPath]);

      return pdfBuffer;
    } catch (error) {
      console.error('Error converting DOCX to PDF:', error);
      throw new Error('Failed to convert document to PDF');
    }
  }

  async cleanupTempFiles(filePaths) {
    try {
      for (const filePath of filePaths) {
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.warn(`Could not delete temp file: ${filePath}`, unlinkError);
        }
      }
    } catch (error) {
      console.error('Error during temp file cleanup:', error);
    }
  }

  // Alternative method using a different PDF library if libreoffice-convert fails
  async convertDocxToPdfAlternative(docxBuffer) {
    try {
      // This is a fallback method - you can implement other PDF conversion libraries here
      // For example, using docx-pdf or other Node.js libraries
      
      console.log('Using alternative PDF conversion method');
      
      // For now, we'll throw an error to indicate this method needs implementation
      throw new Error('Alternative PDF conversion method not implemented');
    } catch (error) {
      console.error('Alternative PDF conversion failed:', error);
      throw error;
    }
  }

  // Method to check if LibreOffice is available
  async checkLibreOfficeAvailability() {
    try {
      // Try to convert a simple document to test availability
      const testBuffer = Buffer.from('test');
      await convertAsync(testBuffer, '.pdf', undefined);
      return true;
    } catch (error) {
      console.warn('LibreOffice not available:', error.message);
      return false;
    }
  }
}

module.exports = new PDFService(); 