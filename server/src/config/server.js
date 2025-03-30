// Server configuration
const config = {
  // Server port
  port: process.env.PORT || 5000,
  
  // Base URL for the server (used for generating absolute URLs)
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  
  // Get full URL for a path
  getFullUrl: (path) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${config.baseUrl}/${cleanPath}`;
  }
};

module.exports = config; 