import React, { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { MicFill, StopFill, PauseFill, PlayFill, TrashFill, SendFill, ArrowClockwise } from 'react-bootstrap-icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import Recorder from 'recorder-js';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

export const AudioRecorder = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [backendAudioUrl, setBackendAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const recorderRef = useRef(null);
  const messageRef = useRef(null);
  
  const ffmpegRef = useRef(new FFmpeg({
    log: true,
    corePath: `${baseURL}/ffmpeg-core.js`,
    wasmPath: `${baseURL}/ffmpeg-core.wasm`,
    TOTAL_MEMORY: 256 * 1024 * 1024 // 256 MB
  }));  

  const loadFFmpeg = async () => {
    if (!loaded) {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg log:', message);
        if (messageRef.current) {
          messageRef.current.innerHTML = message;
        }
      });
      await ffmpeg.load();
      setLoaded(true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      recorderRef.current = new Recorder(audioContext);
      await recorderRef.current.init(stream);
      recorderRef.current.start();

      setIsRecording(true);
      setAudioUrl(null);
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
  };

  const stopRecording = async () => {
    try {
      setIsProcessing(true);
      const { blob } = await recorderRef.current.stop();
      const audioUrl = URL.createObjectURL(blob);
      setAudioUrl(audioUrl);
      setAudioBlob(blob);
      setIsRecording(false);
      setIsPaused(false);
  
      // Enviar el archivo WAV directamente al servidor
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      const backendUrl = response.data.audioUrl;
      setBackendAudioUrl(backendUrl);
      setIsProcessing(false);
  
    } catch (error) {
      console.error('Error al detener la grabación:', error);
      setIsProcessing(false);
      Swal.fire({
        title: "Error",
        text: `Error al procesar el audio. Error: ${error.message}`,
        icon: "error"
      });
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
      onSend(backendAudioUrl, 'audio/wav');
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
          <p ref={messageRef}></p>
        </div>
      )}
    </div>
  );
};
