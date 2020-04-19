import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Button,
  Text,
} from 'react-native';
import Axios from 'axios';
import { TimestampService, useTimestamp } from './Timestamp';

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
