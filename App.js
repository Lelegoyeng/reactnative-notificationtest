import PushNotification from 'react-native-push-notification';
import { useEffect } from 'react';
import { View, Text, Platform, ToastAndroid } from 'react-native';
import usePushNotification from './src/hooks/usePushNotification';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

const App = () => {
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

  useEffect(() => {
    sendFcmToken();
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

  useEffect(() => {
    // Handler untuk menangani notifikasi saat aplikasi dalam keadaan terbuka
    const handleForegroundNotification = async (remoteMessage) => {
      PushNotification.createChannel(
        {
          channelId: remoteMessage.messageId, // (required)
          channelName: "Special message", // (required)
          channelDescription: "Notification for special message", // (optional) default: undefined.
          importance: 4, // (optional) default: 4. Int value of the Android notification importance
          vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
        },
        (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
      );
      PushNotification.localNotification({
        channelId: remoteMessage.messageId,
        title: remoteMessage.data.title,
        message: remoteMessage.data.body
      })
    };

    const unsubscribeForeground = messaging().onMessage(handleForegroundNotification);

    return () => {
      unsubscribeForeground();
    };
  }, []);

  return (
    <View>
      <Text>Push Notification APP</Text>
    </View>
  );
};

export default App;
