export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  if (typeof error === 'string') {
    return error;
  }

  const message =
    error.message ||
    error.error?.message ||
    error.response?.data?.error?.message ||
    error.response?.data?.message;

  return typeof message === 'string' && message.trim() ? message : fallback;
}

export function getErrorCode(error, fallback = 'API_ERROR') {
  if (!error || typeof error === 'string') return fallback;

  return (
    error.code ||
    error.error?.code ||
    error.response?.data?.error?.code ||
    error.response?.data?.code ||
    fallback
  );
}
