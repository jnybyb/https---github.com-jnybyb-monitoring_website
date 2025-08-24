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

  // Send 401 Unauthorized
  static sendUnauthorized(res, message = 'Unauthorized') {
    res.status(401).json({ error: message });
  }

  // Send 403 Forbidden
  static sendForbidden(res, message = 'Forbidden') {
    res.status(403).json({ error: message });
  }

  // Send 400 Bad Request
  static sendBadRequest(res, message = 'Bad request') {
    res.status(400).json({ error: message });
  }
}

module.exports = BaseController;
