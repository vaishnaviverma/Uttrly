import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../hooks/useTimer';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { promptAPI, sessionAPI } from '../api/client';
import '../styles/SpeakingPractice.css';

type PracticePhase = 'idle' | 'thinking' | 'speaking' | 'reviewing';

interface Prompt {
  id: number;
  text: string;
  category: string;
}

export const SpeakingPractice = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<PracticePhase>('idle');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [thinkDuration, setThinkDuration] = useState(0);
  const [speakDuration, setSpeakDuration] = useState(0);
  const [timerMode, setTimerMode] = useState<'1min' | '2min' | '3min' | '5min'>('2min');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const thinkTimer = useTimer();
  const speakTimer = useTimer();
  const {
    isRecording,
    recordedBlob,
    recordingTime,
    startRecording,
    stopRecording,
    playback,
    pausePlayback,
    isPlaying,
    currentPlaybackTime,
    playbackDuration,
    clearRecording,
  } = useAudioRecorder();

  const getTimerConfig = () => {
    switch (timerMode) {
      case '1min': return { think: 60, speak: 60 };
      case '2min': return { think: 120, speak: 120 };
      case '3min': return { think: 180, speak: 180 };
      case '5min': return { think: 300, speak: 300 };
      default: return { think: 120, speak: 120 };
    }
  };

  const fetchRandomPrompt = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await promptAPI.getRandomPrompt();
      setPrompt(data);
      setPhase('thinking');
      thinkTimer.reset();
      speakTimer.reset();
      setSpeakDuration(0);
      setThinkDuration(0);
      clearRecording();
    } catch (err: any) {
      setError('Failed to fetch prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startThinking = () => {
    if (phase === 'thinking') {
      thinkTimer.start();
    }
  };

  const pauseThinking = () => {
    thinkTimer.pause();
  };

  const resumeThinking = () => {
    thinkTimer.resume();
  };

  const moveToSpeaking = () => {
    thinkTimer.stop();
    setThinkDuration(thinkTimer.time);
    setPhase('speaking');
    startSpeaking();
  };

  const startSpeaking = async () => {
    await startRecording();
    speakTimer.start();
  };

  const finishSpeaking = () => {
    stopRecording();
    speakTimer.stop();
    setSpeakDuration(speakTimer.time);
    setPhase('reviewing');
  };

  const submitSession = async () => {
    if (!prompt || !recordedBlob) {
      setError('No recording to submit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', recordedBlob, 'recording.webm');
      formData.append('promptId', String(prompt.id));
      formData.append('promptText', prompt.text);
      formData.append('thinkDuration', String(thinkDuration));
      formData.append('speakDuration', String(speakDuration));

      await sessionAPI.createSession(formData);
      setSuccessMessage('Session saved successfully! 🎉');
      
      // Reset for next session
      setTimeout(() => {
        setPhase('idle');
        setPrompt(null);
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="speaking-practice">
      <header className="header">
        <h1>🎤 Speaking Practice</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      <div className="container">
        {phase === 'idle' && (
          <div className="idle-section">
            <h2>Ready to practice?</h2>
            <p>Select your practice duration and start speaking!</p>
            
            <div className="timer-config">
              <label>Duration Mode:</label>
              <div className="radio-group">
                {(['1min', '2min', '3min', '5min'] as const).map((mode) => (
                  <label key={mode}>
                    <input
                      type="radio"
                      value={mode}
                      checked={timerMode === mode}
                      onChange={(e) => setTimerMode(e.target.value as typeof timerMode)}
                    />
                    {mode}
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="error">{error}</div>}
            {successMessage && <div className="success">{successMessage}</div>}

            <button
              onClick={fetchRandomPrompt}
              disabled={loading}
              className="primary-btn start-btn"
            >
              {loading ? 'Loading...' : 'Get Random Prompt'}
            </button>
          </div>
        )}

        {phase === 'thinking' && prompt && (
          <div className="thinking-section">
            <div className="prompt-card">
              <p className="prompt-label">Your Prompt:</p>
              <p className="prompt-text">{prompt.text}</p>
              <p className="prompt-category">Category: {prompt.category}</p>
            </div>

            <div className="timer-section">
              <h3>Thinking Time</h3>
              <div className="timer-display">{formatTime(thinkTimer.time)}</div>
              <div className="timer-controls">
                {!thinkTimer.isRunning ? (
                  <button onClick={startThinking} className="primary-btn">
                    Start Thinking
                  </button>
                ) : (
                  <button onClick={pauseThinking} className="secondary-btn">
                    Pause
                  </button>
                )}
              </div>
              <button
                onClick={moveToSpeaking}
                disabled={thinkTimer.time === 0}
                className="success-btn"
              >
                Ready to Speak →
              </button>
            </div>
          </div>
        )}

        {phase === 'speaking' && prompt && (
          <div className="speaking-section">
            <div className="prompt-card">
              <p className="prompt-text">{prompt.text}</p>
            </div>

            <div className="recording-indicator">
              {isRecording && (
                <div className="recording-pulse">
                  <span className="pulse"></span>
                  Recording...
                </div>
              )}
            </div>

            <div className="timer-section">
              <h3>Speaking Time</h3>
              <div className="timer-display">{formatTime(speakTimer.time)}</div>
              <button
                onClick={finishSpeaking}
                className="danger-btn"
              >
                Stop Speaking
              </button>
            </div>
          </div>
        )}

        {phase === 'reviewing' && prompt && (
          <div className="reviewing-section">
            <h2>Session Review</h2>
            
            <div className="stats">
              <div className="stat">
                <label>Thinking Duration:</label>
                <span>{formatTime(thinkDuration)}</span>
              </div>
              <div className="stat">
                <label>Speaking Duration:</label>
                <span>{formatTime(speakDuration)}</span>
              </div>
              <div className="stat">
                <label>Prompt:</label>
                <span>{prompt.text}</span>
              </div>
            </div>

            {recordedBlob && (
              <div className="playback-section">
                <h3>Playback Your Recording</h3>
                <div className="audio-controls">
                  {!isPlaying ? (
                    <button onClick={playback} className="primary-btn">
                      ▶ Play Recording
                    </button>
                  ) : (
                    <button onClick={pausePlayback} className="secondary-btn">
                      ⏸ Pause
                    </button>
                  )}
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: playbackDuration > 0 ? `${(currentPlaybackTime / playbackDuration) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
                <div className="time-display">
                  {formatTime(currentPlaybackTime)} / {formatTime(Math.ceil(playbackDuration))}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button
                onClick={submitSession}
                disabled={loading}
                className="success-btn"
              >
                {loading ? 'Saving...' : 'Save Session'}
              </button>
              <button
                onClick={() => {
                  setPhase('idle');
                  setPrompt(null);
                  clearRecording();
                }}
                className="secondary-btn"
              >
                Start New Session
              </button>
            </div>

            {error && <div className="error">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
