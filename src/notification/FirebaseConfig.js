/* global FirebasePlugin */
import React, { useEffect } from 'react'

export const FirebaseConfig = () => {

    const useFirebaseMessaging = () => {
        useEffect(() => {
          // Obtén el token FCM cuando la aplicación se carga
          window.FirebasePlugin.getToken((fcmToken) => {
            console.log("FCM Token recibido:", fcmToken);
            // Guarda el token en tu servidor si es necesario
          }, (error) => {
            console.error("Error al obtener el token de FCM:", error);
          });
      
          // Manejar la actualización del token
          window.FirebasePlugin.onTokenRefresh((fcmToken) => {
            console.log("Token FCM actualizado:", fcmToken);
            // Actualiza el token en tu servidor si es necesario
          });
      
          // Solicitar permiso para las notificaciones
          window.FirebasePlugin.grantPermission();
        }, []);
      };

      const useNotificationHandler = () => {
        useEffect(() => {
          // Manejar notificaciones cuando la app está en primer plano
          window.FirebasePlugin.onMessageReceived((message) => {
            console.log("Mensaje FCM recibido en primer plano:", message);
            // Aquí puedes personalizar lo que ocurre al recibir una notificación
            alert(`Nuevo mensaje: ${message.body}`);
          });
      
          // Manejar notificaciones cuando la app está en segundo plano o cerrada
          document.addEventListener('resume', () => {
            window.FirebasePlugin.onBackgroundMessage((message) => {
              console.log("Mensaje FCM recibido en segundo plano:", message);
              // Mostrar notificación o realizar acciones según los datos del mensaje
            });
          });
        }, []);
      };

  return{
    useNotificationHandler,
    useFirebaseMessaging
  }
}
