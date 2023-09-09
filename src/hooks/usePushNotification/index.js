import React from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';


const usePushNotification = () => {
    const requestUserPermission = async () => {
        if (Platform.OS === 'ios') {
            //Request iOS permission
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('Authorization status:', authStatus);
            }
        } else if (Platform.OS === 'android') {
            //Request Android permission (For API level 33+, for 32 or below is not required)
            const res = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
        }
    }

    const getFCMToken = async () => {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            console.log('Your Firebase Token is:', fcmToken);
        } else {
            console.log('Failed', 'No token received');
        }
    };

    const listenToForegroundNotifications = async () => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
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
            });
            console.log(
                'A new message arrived! (FOREGROUND)',
                JSON.stringify(remoteMessage),
            );
        });
        return unsubscribe;
    }

    const listenToBackgroundNotifications = async () => {
        const unsubscribe = messaging().setBackgroundMessageHandler(
            async remoteMessage => {
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
                });
                console.log(
                    'A new message arrived! (BACKGROUND)',
                    JSON.stringify(remoteMessage),
                );
            },
        );

        return unsubscribe;
    }

    const onNotificationOpenedAppFromBackground = async () => {
        const unsubscribe = messaging().onNotificationOpenedApp(
            async remoteMessage => {
                console.log(
                    'App opened from BACKGROUND by tapping notification:',
                    JSON.stringify(remoteMessage),
                );
            },
        );
        return unsubscribe;
    };

    const onNotificationOpenedAppFromQuit = async () => {
        const message = await messaging().getInitialNotification();

        if (message) {
            console.log('App opened from QUIT by tapping notification:', JSON.stringify(message));
        }
    };

    return {
        requestUserPermission,
        getFCMToken,
        listenToForegroundNotifications,
        listenToBackgroundNotifications,
        onNotificationOpenedAppFromBackground,
        onNotificationOpenedAppFromQuit,
    };
};

export default usePushNotification;