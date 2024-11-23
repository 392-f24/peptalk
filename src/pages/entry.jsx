import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader, CheckCircle, X } from 'lucide-react';
import OpenAI from 'openai';

const Entry = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const emotions = ["😊", "😔", "😡", "😌", "🥰", "😤", "😢"];

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

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = handleAudioData;
      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const handleAudioData = async (event) => {
    if (event.data.size > 0) {
      audioChunksRef.current.push(event.data);
      await processAudioChunk(event.data);
    }
  };

  const processAudioChunk = async (audioChunk) => {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([audioChunk], { type: 'audio/webm' }));
      formData.append('model', 'whisper-1');

      const response = await openai.audio.transcriptions.create({
        file: formData.get('file'),
        model: 'whisper-1',
      });

      if (response.text) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
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
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const handleSave = () => {
    const entryContent = conversation
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');

    const newEntry = {
      id: Date.now(),
      title: title || 'Untitled Entry',
      date: new Date().toISOString().split('T')[0],
      content: entryContent,
      emotion: selectedEmotion,
      bookmarked: false
    };

    console.log('Saving entry:', newEntry);
    navigate(`/entry/${newEntry.id}`);
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
