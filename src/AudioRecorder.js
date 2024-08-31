import React, { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { MicFill, StopFill, PauseFill, PlayFill, TrashFill, SendFill, ArrowClockwise } from 'react-bootstrap-icons';
import axios from 'axios';
import './App.css';
import Swal from 'sweetalert2';
import Recorder from 'recorder-js';

export const AudioRecorder = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [backendAudioUrl, setBackendAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Intentar forzar la captura de un solo canal de audio (mono)
        }
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      recorderRef.current = new Recorder(audioContext);
      await recorderRef.current.init(stream);
      recorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error",
        text: `Error al intentar grabar audio. Error: ${error}`,
        icon: "error"
      });
    }
  };

  const stopRecording = async () => {
    try {
      const { blob } = await recorderRef.current.stop();
      const audioUrl = URL.createObjectURL(blob);
      setAudioUrl(audioUrl);
      setAudioBlob(blob);
      setIsRecording(false);
      setIsPaused(false);

      // Subir el archivo al servidor
      const formData = new FormData();
      formData.append('audio', blob, 'recording.ogg');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-audio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const backendUrl = response.data.audioUrl;
      setBackendAudioUrl(backendUrl);
    } catch (error) {
      console.error('Error al detener la grabación:', error);
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setBackendAudioUrl(null);
    setAudioBlob(null);
  };

  const handleSendAudio = () => {
    if (backendAudioUrl) {
      onSend(backendAudioUrl, 'audio/ogg');
      deleteRecording();
    }
  };

  return (
    <div className="audio-recorder">
      {!isRecording && !audioUrl && (
        <Button variant="light" onClick={startRecording}>
          <MicFill />
        </Button>
      )}
      {isRecording && (
        <>
          <span>Grabando...</span>
          {isPaused ? (
            <Button variant="light" onClick={resumeRecording}>
              <PlayFill />
            </Button>
          ) : (
            <Button variant="light" onClick={pauseRecording}>
              <PauseFill />
            </Button>
          )}
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
            {isProcessing ? <ArrowClockwise animation="border" size="sm" /> : <SendFill />}
          </Button>
        </div>
      )}
    </div>
  );
};