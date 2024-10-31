import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAB0XJht2Krw2sh9yU4VUKSNcrD10fgshk",
  authDomain: "crm-android-system.firebaseapp.com",
  projectId: "crm-android-system",
  storageBucket: "crm-android-system.appspot.com",
  messagingSenderId: "312505091006",
  appId: "1:312505091006:android:2151cc5787af69c9fe6fef",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFirebaseNotificationPermission = async () => {
  try {
    const token ='ckYDwnM9Qi21UeNR6RDLF3:APA91bEnT8bt63FACtQusGhayek7sN972KE0k8AAqdHGZ6BsHuUl89YYbogOiA9_TtrXtbgdEB-uYT73iRg5ckTPZZmjAAxDnnuk2FUsBmY5iA2erV1vs1aXT2FRFLzVO2dkbIEoJmhs';
    if (token) {
      console.log('Firebase Token:', token);
      // Aquí puedes enviar el token a tu servidor para identificar el dispositivo.
      return token;
    }
  } catch (error) {
    console.error('Error al obtener el token de Firebase', error);
  }
};

export const onMessageListener = () => 
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
