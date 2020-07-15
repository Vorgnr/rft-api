class HttpError extends Error {
  constructor({ message, status }) {
    super(message);
    this.status = status;
  }
}

class NotFoundError extends HttpError {
  constructor(message) {
    super({ message, status: 404 });
  }
}

class BadRequestError extends HttpError {
  constructor(message) {
    super({ message, status: 400 });
  }
}

module.exports = {
  NotFoundError,
  HttpError,
  BadRequestError,
};
