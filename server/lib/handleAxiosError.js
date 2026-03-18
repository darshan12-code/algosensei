const handleAxiosError = (err, res) => {
  const status = err.response?.status;

  if (status === 429) {
    return res.status(429).json({
      error: 'AI rate limit hit. Please wait 60 seconds and try again.',
      retryAfter: 60
    });
  }
  if (status === 401) {
    return res.status(500).json({
      error: 'Invalid AI API key — check your environment variables.'
    });
  }
  console.error('API error:', err.response?.data || err.message);
  return res.status(500).json({ error: err.message });
};

module.exports = handleAxiosError;