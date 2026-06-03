const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message = 'Server error', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { success, error };
