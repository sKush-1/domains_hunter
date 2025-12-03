export function sendResponse<T = any>(
  res: any,
  status: number,
  error: boolean,
  message: string,
  data: T = {} as T,
) {
  res.status(status).json({
    message: message,
    data: data,
  });
}
