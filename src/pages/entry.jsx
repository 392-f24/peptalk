import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader, CheckCircle, X } from 'lucide-react';
import OpenAI from 'openai';
import { getDatabase, ref, push, set } from "firebase/database";
import firebase from "../firebase";
import { usePepContext } from '../utilities/context';

const Entry = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioChunksRef = useRef([]);
  const db = getDatabase(firebase);
  const { user } = usePepContext();
  
  const emotions = ["😊", "😔", "😡", "😌", "🥰", "😤", "😢"];

  useEffect(() => {
    // Initialize OpenAI in useEffect to handle environment variables properly
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      setError('OpenAI API key is missing');
      console.error('OpenAI API key is missing');
      return;
    }
  }, []);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const convertToWav = async (audioChunks) => {
    try {
      // Create a new audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Concatenate all chunks into a single blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create a WAV encoder
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      const wavBuffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(wavBuffer);
      
      // Write WAV header
      const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 4, true); // Updated calculation
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, 'data');
      view.setUint32(40, length * 2, true);
      
      // Write audio data
      let offset = 44;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
          const int = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          view.setInt16(offset, int, true);
          offset += 2;
        }
      }
      
      return new Blob([wavBuffer], { type: 'audio/wav' });
    } catch (error) {
      console.error('Error converting to WAV:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsProcessing(true);
          const wavBlob = await convertToWav(audioChunksRef.current);
          await processAudioChunk(wavBlob);
        } catch (error) {
          console.error('Error processing recording:', error);
          setError('Error processing recording: ' + error.message);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start(250); // Increased chunk size
      setIsRecording(true);
      setIsPaused(false);
      setError(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Error accessing microphone: ' + err.message);
    }
  };

  const processAudioChunk = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await openai.audio.transcriptions.create({
        file: formData.get('file'),
        model: 'whisper-1',
      });

      if (response.text) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o", 
          messages: [
            { 
              role: "system", 
              content: "You are a supportive journal companion. Keep responses brief, empathetic, and encouraging. Help the user reflect on their thoughts and feelings."
            },
            { role: "user", content: response.text }
          ],
        });

        const aiResponse = completion.choices[0].message.content;
        
        setConversation(prev => [...prev, 
          { role: 'user', content: response.text },
          { role: 'assistant', content: aiResponse }
        ]);

        const utterance = new SpeechSynthesisUtterance(aiResponse);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setError('Error processing audio: ' + error.message);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      window.speechSynthesis.pause();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      window.speechSynthesis.resume();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      window.speechSynthesis.cancel();
    }
  };

  const handleSave = async () => {
    
    try {
      if (!title || !selectedEmotion) {
        setError('Please fill in all required fields');
        return;
      }

      console.log({user});
      // Get the user ID from localStorage or your store
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Compile entry content from conversation
      const transcriptContent = conversation
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n');
  
      // Get summary from the last AI response if available
      const summaryContent = conversation
        .filter(msg => msg.role === 'assistant')
        .slice(-1)[0]?.content || 'No summary available';
  
      // Create entry reference with auto-generated ID
      const entriesRef = ref(db, `${user.uid}/entries`);
      const newEntryRef = push(entriesRef);
  
      // Create entry data
      const entryData = {
        name: title,
        date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        emoji: selectedEmotion,
        summary: summaryContent,
        transcript: transcriptContent
      };
  
      // Save to Firebase
      await set(newEntryRef, entryData);
      console.log('Entry saved successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Error saving entry: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">New Journal Entry</h1>
          <button 
            onClick={() => navigate('/')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Date Display */}
        <div className="text-sm text-gray-500">
          {getCurrentDate()}
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Give your entry a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />

        {/* Emotion Selection */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">How are you feeling?</span>
          <div className="flex gap-2">
            {emotions.map(emoji => (
              <button
                key={emoji}
                onClick={() => setSelectedEmotion(selectedEmotion === emoji ? "" : emoji)}
                className={`text-xl p-2 rounded-full hover:bg-gray-100 transition-colors
                  ${selectedEmotion === emoji ? "bg-gray-100 ring-2 ring-blue-500" : ""}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Recording Interface */}
        <div className="bg-white rounded-lg p-8 shadow-sm space-y-4">
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}
              className={`p-6 rounded-full ${
                isRecording 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              } transition-colors`}
            >
              {isRecording ? (isPaused ? <Mic size={32} /> : <MicOff size={32} />) : <Mic size={32} />}
            </button>

            {/* Recording Status */}
            <div className="text-center">
              <div className="text-lg font-medium text-gray-800">
                {isRecording 
                  ? (isPaused 
                      ? "Ready to continue your PepTalk?" 
                      : "I\u0027m listening...") 
                  : "Start your PepTalk"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {isRecording 
                  ? (isPaused 
                      ? "Click to resume" 
                      : "Click to pause") 
                  : "Click the microphone to begin"}
              </div>
            </div>

            {isRecording && (
              <button
                onClick={stopRecording}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <CheckCircle size={20} />
                <span>Finish PepTalk</span>
              </button>
            )}
          </div>

          {/* Conversation Display */}
          <div className="mt-6 space-y-4">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-50 ml-8' 
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <p className="text-sm text-gray-700">{message.content}</p>
              </div>
            ))}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mt-4">
              <Loader className="animate-spin" size={16} />
              <span>Wrapping up your PepTalk...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title || !selectedEmotion || isRecording}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default Entry;
