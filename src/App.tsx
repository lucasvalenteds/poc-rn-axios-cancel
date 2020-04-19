import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Button,
  Text,
} from 'react-native';
import Axios, { AxiosInstance, CancelTokenSource } from 'axios';

export class TimestampService {
  private delayInSeconds = 2;

  constructor(private httpClient: AxiosInstance) {}

  async getCurrent(cancelToken: CancelTokenSource): Promise<string> {
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

const App: React.FC = (): React.ReactElement => {
  const timestamp = useTimestamp(
    new TimestampService(
      Axios.create({
        baseURL: 'https://httpbin.org/',
      }),
    ),
  );

  return (
    <>
      <StatusBar />
      <SafeAreaView>
        <ScrollView>
          <Button
            title={'Request'}
            onPress={() => timestamp.request()}
            disabled={timestamp.isLoading}
          />
          <Button
            title={'Cancel'}
            onPress={() => timestamp.cancel()}
            disabled={!timestamp.isLoading}
          />
          <Text>{timestamp.latestTimestamp}</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default App;
