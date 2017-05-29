// @flow

export const unauthorized = (message?: string) => {
  const error: Object = new Error(message || 'unauthorized');
  error.status = 401;
  return error;
};

export const notFound = (message?: string) => {
  const error: Object = new Error(message || 'not found');
  error.status = 404;
  return error;
};
