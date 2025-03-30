const User = require('../models/User');
const Faculty = require('../models/Faculty');

module.exports = async function(req, res, next) {
  try {
    // Check if user is admin in User collection
    let user = await User.findById(req.user.id);
    
    if (user && user.isAdmin) {
      return next();
    }
    
    // If not found or not admin in User collection, check Faculty collection
    let faculty = await Faculty.findById(req.user.id);
    
    if (faculty && faculty.isAdmin) {
      return next();
    }
    
    return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 