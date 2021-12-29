const handler = (err, req, res, next) => {
  let { statusCode, message } = err;

  const response = {
    code: statusCode,
    message,
  };

  res.status(statusCode).json(response);
};

module.exports = handler;
