export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'This account information is already registered' });
  }
  const status = error.status || 500;
  res.status(status).json({ message: status === 500 ? 'Server error. Please try again.' : error.message || 'Server error' });
}
