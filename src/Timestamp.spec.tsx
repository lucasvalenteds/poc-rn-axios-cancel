import * as TestingLibrary from '@testing-library/react-hooks';
import Axios, { AxiosInstance } from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';

import {
  TimestampService,
  TimestampServiceHttpbin,
  useTimestamp,
} from './Timestamp';

async function wait(timeInMs: number): Promise<void> {
  return new Promise((resolve) => {
    const handle = setTimeout(() => {
      resolve();
      clearTimeout(handle);
    }, timeInMs);
  });
}

describe('TimestampService', () => {
  const httpClient: AxiosInstance = Axios.create();
  const mock: AxiosMockAdapter = new AxiosMockAdapter(httpClient);
  const service: TimestampService = new TimestampServiceHttpbin(httpClient);

  test('It returns timestamp as string in ISO format', async () => {
    mock.onGet('/delay/2').reply(200);

    const timestamp = await service.getCurrent(Axios.CancelToken.source());

    expect(timestamp).not.toHaveLength(0);
  });

  test('It is possible to cancel the request', async () => {
    expect.assertions(2);
    mock.onGet('/delay/2').reply(async () => {
      await wait(10);
      return [200];
    });
    const cancelToken = Axios.CancelToken.source();

    const cancelAfterTwoSeconds = async (): Promise<void> => {
      await wait(2);
      cancelToken.cancel('Canceled by the test');
    };

    try {
      await Promise.all([
        service.getCurrent(cancelToken),
        cancelAfterTwoSeconds(),
      ]);
    } catch (error) {
      expect(Axios.isCancel(error)).toBeTruthy();
      expect(error.message).toStrictEqual('Canceled by the test');
    }
  });
});

describe('useTimestamp', () => {
  test('It can send the request', async () => {
    const getCurrent = jest.fn().mockResolvedValue('date here');
    const hook = TestingLibrary.renderHook(() => useTimestamp({ getCurrent }));

    // eslint-disable-next-line @typescript-eslint/require-await
    await TestingLibrary.act(async () => {
      expect(hook.result.current.latestTimestamp).toStrictEqual('');
      return hook.result.current.request();
    });

    expect(hook.result.current.isLoading).toBeFalsy();
    expect(hook.result.current.latestTimestamp).toStrictEqual('date here');
    expect(getCurrent).toHaveBeenCalledTimes(1);
  });
  test.todo('It can cancel the request');
});
