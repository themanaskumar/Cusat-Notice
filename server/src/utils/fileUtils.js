const fs = require('fs');
const path = require('path');
const url = require('url');

// Delete files from uploads directory
exports.deleteFiles = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return;
  }

  const uploadsDir = path.join(__dirname, '../../uploads');

  for (const file of files) {
    try {
      // Extract the filename from the URL
      const fileUrl = file.url;
      const parsedUrl = url.parse(fileUrl);
      const pathname = parsedUrl.pathname;
      const filename = pathname.split('/').pop();
      
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    } catch (err) {
      console.error(`Error deleting file ${file.url}:`, err);
    }
  }
}; 