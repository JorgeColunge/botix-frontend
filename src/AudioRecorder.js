import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { MicFill, StopFill, TrashFill, SendFill, ArrowClockwise } from 'react-bootstrap-icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AppContext } from './context';

export const AudioRecorder = ({ onSend, inactivo }) => {
  const [isRecording, setIsRecording] = useState(localStorage.getItem('recordingAudio') || false);
  const [audioUrl, setAudioUrl] = useState(localStorage.getItem('audioURL') || null);
  const [backendAudioUrl, setBackendAudioUrl] = useState(localStorage.getItem('backendAudioURL') || null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(localStorage.getItem('processingAudio') || false);
  const mediaRecorderRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        localStorage.setItem('audioURL', url);

        // Enviar el blob al backend
        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.wav');
          
          setIsProcessing(true);
          localStorage.setItem('processingAudio', true);
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-audio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          const backendUrl = response.data.audioUrl;
          setBackendAudioUrl(backendUrl);
          localStorage.setItem('backendAudioURL', backendUrl);
          setIsProcessing(false);
          localStorage.setItem('processingAudio', '');

        } catch (error) {
          console.error('Error al procesar el audio:', error);
          setIsProcessing(false);
          localStorage.setItem('processingAudio', '');
          Swal.fire({
            title: "Error",
            text: `Error al procesar el audio. Error: ${error.message}`,
            icon: "error"
          });
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      localStorage.setItem('recordingAudio', '');
      setAudioUrl(null);
      localStorage.setItem('audioURL', '');
      localStorage.setItem('backendAudioURL', '');
      setBackendAudioUrl(null);
      setAudioBlob(null);
    } catch (error) {
      console.error('Error al intentar grabar audio:', error);
      Swal.fire({
        title: "Error",
        text: `Error al intentar grabar audio. Error: ${error.message}`,
        icon: "error"
      });
    }
  }, []);
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      localStorage.setItem('recordingAudio', '');
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    localStorage.setItem('audioURL', '');
    localStorage.setItem('backendAudioURL', '');
    setBackendAudioUrl(null);
    setAudioBlob(null);
  };

  const handleSendAudio = () => {
    if (backendAudioUrl) {
      onSend(backendAudioUrl, 'audio/wav');
      deleteRecording();
    }
  };

  return (
    <div className="audio-recorder">
      {!isRecording && !audioUrl && (
        <Button disabled={!inactivo ? inactivo : inactivo() } variant="light" onClick={startRecording}>
          <MicFill />
        </Button>
      )}
      {isRecording && (
        <>
          <span>Grabando...</span>
          <Button variant="light" onClick={stopRecording}>
            <StopFill />
          </Button>
        </>
      )}
      {audioUrl && (
        <div className="audio-controls">
          <audio controls src={audioUrl}></audio>
          <Button variant="light" onClick={deleteRecording}>
            <TrashFill />
          </Button>
          <Button variant="light" onClick={handleSendAudio} disabled={!backendAudioUrl || isProcessing}>
            {isProcessing ? <ArrowClockwise /> : <SendFill />}
          </Button>
        </div>
      )}
    </div>
  );
};
