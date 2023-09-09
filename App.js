import PushNotification from 'react-native-push-notification';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import usePushNotification from './src/hooks/usePushNotification';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

const App = () => {
  const [accountInformation, setAccountInformation] = useState(null);
  const sendFcmToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      await axios.post('http://192.168.0.44:3000/register', { token });
    } catch (err) {
      //Do nothing
      console.log(err.response.data);
      return;
    }
  };

  const getAccountInformation = async () => {
    try {
      await axios.get('http://192.168.0.44:3000/account').then(function (response) {
        setAccountInformation(response.data.result)
      }).catch(function (error) {
        // handle error
        console.log(error);
      })
    } catch (err) {
      //Do nothing
      console.log(err.response.data);
      return;
    }
  };

  useEffect(() => {
    sendFcmToken();
    getAccountInformation();
  }, []);

  const {
    requestUserPermission,
    getFCMToken,
    listenToBackgroundNotifications,
    listenToForegroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
  } = usePushNotification();

  useEffect(() => {
    const listenToNotifications = async () => {
      try {
        await requestUserPermission();
        await getFCMToken();
        const unsubscribeBackground = listenToBackgroundNotifications();
        const unsubscribeForeground = listenToForegroundNotifications();
        const unsubscribeBackgroundOpen = onNotificationOpenedAppFromBackground();
        const unsubscribeQuitOpen = onNotificationOpenedAppFromQuit();

        return () => {
          unsubscribeBackground();
          unsubscribeForeground();
          unsubscribeBackgroundOpen();
          unsubscribeQuitOpen();
        };
      } catch (error) {
        console.log(error);
      }
    };

    listenToNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Push Notification APP</Text>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Balance</Text>
        <Text style={styles.balanceAmount}>$ {accountInformation?.balance || 0}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 18,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;
