class BaseController {
  // Generic error handler
  static handleError(res, error, defaultMessage = 'An error occurred') {
    console.error('Controller Error:', error);
    const message = error.message || defaultMessage;
    res.status(500).json({ error: message });
  }

  // Generic success response
  static sendSuccess(res, data = null, message = 'Success') {
    const response = { success: true, message };
    if (data !== null) {
      response.data = data;
    }
    res.json(response);
  }

  // Generic not found response
  static sendNotFound(res, message = 'Resource not found') {
    res.status(404).json({ error: message });
  }

  // Wrapper for async controller methods
  static asyncHandler(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        this.handleError(res, error);
      }
    };
  }
}

module.exports = BaseController;
