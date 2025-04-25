import { Observable, firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';

export async function fetchObservableResult<T>(
  observable: Observable<AxiosResponse<T>>,
): Promise<T> {
  try {
    const response = await firstValueFrom(observable);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // You can log more detailed info or rethrow a custom error
      console.error('Axios error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error('Unexpected error:', error);
    }

    throw error; // Rethrow so caller can also handle it
  }
}
