/* global cordova */

import { useCallback } from "react"

const formatVideoDuration = (duration) => {
    if (isNaN(duration)) {
      return '';
    }
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


export const useNotificationsSwich = () => {
    
const notificationCaseText = useCallback((newMessage) => {
const title = `${newMessage.destino_nombre || ''} ${newMessage.destino_apellido || ''}`.trim();
cordova.plugins.notification.local.schedule({
    title: title || 'Nuevo mensaje',
    text: newMessage.text || 'Tienes un nuevo mensaje',
    smallIcon: `${process.env.REACT_ICON_SMALL}`, // Ícono genérico para el sistema
    icon: process.env.REACT_APP_API_URL+newMessage.destino_foto || '',
});
}, []);

const notificationCaseAudio = useCallback((newMessage) => {
const title = `${newMessage.destino_nombre || ''} ${newMessage.destino_apellido || ''}`.trim();
const formattedDuration = formatVideoDuration(newMessage.duration);
cordova.plugins.notification.local.schedule({
    title: title || 'Nuevo mensaje',
    text: `🎙️ Mensaje de audio: ${formattedDuration || 'Duración desconocida'}`,
    smallIcon: `${process.env.REACT_ICON_SMALL}`,
    icon: process.env.REACT_APP_API_URL+newMessage.destino_foto || '',
});
}, []);

const notificationCaseVideo = useCallback((newMessage) => {
const title = `${newMessage.destino_nombre || ''} ${newMessage.destino_apellido || ''}`.trim();
const formattedDuration = formatVideoDuration(newMessage.duration);
cordova.plugins.notification.local.schedule({
    title: title || 'Nuevo mensaje',
    text: `🎥 Video: ${formattedDuration || 'Duración desconocida'}`,
    smallIcon: `${process.env.REACT_ICON_SMALL}`,
    icon: process.env.REACT_APP_API_URL+newMessage.destino_foto || '',
});
}, []);

const notificationCaseImage = useCallback((newMessage) => {
const image = newMessage.type == 'reply' ? newMessage.url : process.env.REACT_APP_API_URL+newMessage.url;
const title = `${newMessage.destino_nombre || ''} ${newMessage.destino_apellido || ''}`.trim();
cordova.plugins.notification.local.schedule({
    title: title || 'Nuevo mensaje',
    text: newMessage.text || '📷 Foto enviada',
    smallIcon: `${process.env.REACT_ICON_SMALL}`,
    icon: process.env.REACT_APP_API_URL+newMessage.destino_foto || '',
    attachments: [image || ''], 
});
}, []);

const notificationCaseDocument = useCallback((newMessage) => {
const document = newMessage.type == 'reply' ? newMessage.file_name : newMessage.url.split('/media/documents/')[1];   
const title = `${newMessage.destino_nombre || ''} ${newMessage.destino_apellido || ''}`.trim();
cordova.plugins.notification.local.schedule({
    title: title || 'Nuevo mensaje',
    text: `📄 Documento: ${document || 'Archivo recibido'}`,
    smallIcon: `${process.env.REACT_ICON_SMALL}`,
    icon: process.env.REACT_APP_API_URL+newMessage.destino_foto || '',
});
}, []);

const notificationCaseReaction = useCallback((newMessage) => {
  const title = `${newMessage.destino_nombre || ''} ${newMessage.destino_apellido || ''}`.trim();
  var messageContet = null;
  switch (newMessage.type || newMessage.replly_type) {
    case 'audio':
      messageContet = 'Reacciono a: 🎙️ Mensaje de audio';
      break;
    case 'text':
      messageContet = `Reacciono a: '${newMessage.text || newMessage.reply_text}'`;
      break;
    case 'video':
      messageContet = 'Reacciono a: 🎥 Video';
      break;
    case 'image':
      messageContet = 'Reacciono a: 📷 Foto'
      break;
    case 'document':  
      messageContet = 'Reacciono a : 📄 Documento';
      break;  
    default:
      break;
  }
  cordova.plugins.notification.local.schedule({
      title: title || 'Nuevo mensaje',
      text: messageContet,
      smallIcon: `${process.env.REACT_ICON_SMALL}`,
      icon: process.env.REACT_APP_API_URL+newMessage.destino_foto || '',
  });
}, []);  

    return {
    notificationCaseDocument,
    notificationCaseAudio,
    notificationCaseImage,
    notificationCaseVideo,
    notificationCaseText,
    notificationCaseReaction,
  }
}
