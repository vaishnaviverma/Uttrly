import { useState } from 'react';
import { promptAPI } from '../api/client';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechTranscription } from '../hooks/useSpeechTranscription';
import { useTimer } from '../hooks/useTimer';
import '../styles/SpeakingPractice.css';

type PracticePhase = 'idle' | 'thinking' | 'speaking' | 'reviewing';

interface Prompt {
  id: number;
  text: string;
  category: string;
}

export const SpeakingPractice = () => {
  const [phase, setPhase] = useState<PracticePhase>('idle');
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [thinkDuration, setThinkDuration] = useState(0);
  const [speakDuration, setSpeakDuration] = useState(0);
  const [timerMode, setTimerMode] = useState<'1min' | '2min' | '3min' | '5min'>('2min');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  const {
    transcript,
    interimTranscript,
    isSupported: transcriptionSupported,
    isListening,
    error: transcriptionError,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechTranscription();

  const displayError = error || transcriptionError;
  const liveTranscript = [transcript, interimTranscript].filter(Boolean).join(' ').trim();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchRandomPrompt = async () => {
    setLoading(true);
    setError('');
    clearTranscript();
    clearRecording();
    stopListening();

    try {
      const { data } = await promptAPI.getRandomPrompt();
      setPrompt(data);
      setPhase('thinking');
      thinkTimer.reset();
      speakTimer.reset();
      setSpeakDuration(0);
      setThinkDuration(0);
    } catch {
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

  const moveToSpeaking = () => {
    const finalThinkTime = thinkTimer.time;
    thinkTimer.stop();
    setThinkDuration(finalThinkTime);
    setPhase('speaking');
    startSpeaking();
  };

  const startSpeaking = async () => {
    clearTranscript();
    await startRecording();

    if (transcriptionSupported) {
      startListening();
    }

    speakTimer.start();
  };

  const finishSpeaking = () => {
    stopListening();
    stopRecording();

    const finalSpeakTime = speakTimer.time;
    speakTimer.stop();
    setSpeakDuration(finalSpeakTime);
    setPhase('reviewing');
  };

  return (
    <div className="speaking-practice">
      <header className="header">
        <h1>🎤 Uttrly</h1>
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

            {displayError && <div className="error">{displayError}</div>}

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
                  Recording... {formatTime(recordingTime)}
                </div>
              )}
            </div>

            <div className="transcript-card">
              <div className="transcript-header">
                <h3>Live Transcript</h3>
                <span className={transcriptionSupported ? 'supported' : 'unsupported'}>
                  {transcriptionSupported ? (isListening ? 'Listening' : 'Waiting') : 'Not supported'}
                </span>
              </div>
              {transcriptionSupported ? (
                <p className="transcript-text">
                  {liveTranscript || 'Start speaking to see live transcription.'}
                </p>
              ) : (
                <p className="transcript-text muted">
                  Live speech recognition is not supported in this browser.
                </p>
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

            <div className="transcript-card">
              <div className="transcript-header">
                <h3>Transcript</h3>
                <span className="supported">Final</span>
              </div>
              <p className="transcript-text">
                {liveTranscript || 'No transcript captured.'}
              </p>
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
                onClick={() => {
                  setPhase('idle');
                  setPrompt(null);
                  clearRecording();
                  clearTranscript();
                  stopListening();
                }}
                className="secondary-btn"
              >
                Start New Session
              </button>
            </div>

            {displayError && <div className="error">{displayError}</div>}
          </div>
        )}
      </div>
    </div>
  );
};