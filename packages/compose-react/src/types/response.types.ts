export interface BaseApiResponse<T> {
  data: T;
}
export interface BaseApiResponseError<E> {
  errors: E | null;
}

export interface ApiError {
  message: string;
}
export type ApiResponse<T> = BaseApiResponse<T> &
  Partial<BaseApiResponseError<ApiError>>;
