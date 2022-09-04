module.exports = (_, res, next) => {
  const errorPossibility = process.env.ERROR_POSSIBILITY ?? 0;
  const errorOccurred = Math.random() < +errorPossibility;
  if (errorOccurred) {
    return res.status(500).json({ message: 'Planned server error' });
  }
  next();
};