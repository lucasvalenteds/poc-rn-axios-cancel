import { useState } from 'react';
import Axios, { AxiosInstance, CancelTokenSource } from 'axios';

export interface TimestampService {
  getCurrent(cancelToken: CancelTokenSource): Promise<string>;
}

export class TimestampServiceHttpbin implements TimestampService {
  public constructor(
    private httpClient: AxiosInstance,
    private delayInSeconds: number = 2,
  ) {}

  public async getCurrent(cancelToken: CancelTokenSource): Promise<string> {
    await this.httpClient.get(`/delay/${this.delayInSeconds}`, {
      cancelToken: cancelToken.token,
    });

    return new Date().toISOString();
  }
}

export interface TimestampProps {
  isLoading: boolean;
  latestTimestamp: string;
  request(): void;
  cancel(): void;
}

export function useTimestamp(service: TimestampService): TimestampProps {
  const [cancelToken, setCancelToken] = useState<CancelTokenSource>(
    Axios.CancelToken.source(),
  );
  const [latestTimestamp, setLatestTimestamp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const request = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const timestamp = await service.getCurrent(cancelToken);

      console.debug('Latest timestamp received', timestamp);

      setLatestTimestamp(timestamp);
    } catch (error) {
      if (Axios.isCancel(error)) {
        console.debug(error.message);
      } else {
        console.debug('Could not request timestamp', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancel = (): void => {
    setIsLoading(false);
    cancelToken.cancel('Cancel button pressed by the user');
    setCancelToken(Axios.CancelToken.source());
  };

  return {
    latestTimestamp,
    isLoading,
    request,
    cancel,
  };
}
