import { useRef, useCallback, useEffect, useState } from 'react';
import type { VocabularyItem } from '../App';

interface TTSQueueItem {
  text: string;
  lang: string;
}

export function useTTS(
  vocabList: VocabularyItem[],
  _currentIndex: number,
  setCurrentIndex: (index: number | ((prev: number) => number)) => void,
  setIsPlaying: (playing: boolean) => void,
  voiceURI?: string
) {
  const synth = window.speechSynthesis;
  const isPlayingRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wakeLockRef = useRef<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Force load voices
    synth.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      synth.getVoices();
    };
  }, [synth]);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err: any) {
        console.warn('Wake Lock error:', err);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const speakQueue = async (queue: TTSQueueItem[]) => {
    for (const item of queue) {
      if (!isPlayingRef.current) break;
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(item.text);
        utteranceRef.current = utterance; // Prevent GC
        utterance.lang = item.lang;
        
        const voices = synth.getVoices();
        
        if (item.lang === 'vi-VN') {
          utterance.voice = voices.find(v => v.lang.includes('vi')) || null;
        } else {
          if (voiceURI) {
            utterance.voice = voices.find(v => v.voiceURI === voiceURI) || null;
          }
          if (!utterance.voice) {
            utterance.voice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB')) || null;
          }
        }

        utterance.onend = () => {
          setTimeout(resolve, 500);
        };
        utterance.onerror = () => resolve();
        synth.speak(utterance);
      });
    }
  };

  const buildQueueForWord = (word: VocabularyItem): TTSQueueItem[] => {
    const queue: TTSQueueItem[] = [];
    queue.push({ text: word.word, lang: 'en-US' });
    queue.push({ text: word.word, lang: 'en-US' });
    queue.push({ text: word.word, lang: 'en-US' });

    if ((word as any).meaning) {
      queue.push({ text: (word as any).meaning, lang: 'vi-VN' });
    }

    if (word.example) {
      queue.push({ text: word.example, lang: 'en-US' });
    }
    if (word.exampleMeaning) {
      queue.push({ text: word.exampleMeaning, lang: 'vi-VN' });
    }

    if (word.example2) {
      queue.push({ text: word.example2, lang: 'en-US' });
    }
    if (word.example2Meaning) {
      queue.push({ text: word.example2Meaning, lang: 'vi-VN' });
    }
    return queue;
  };

  const playLoop = useCallback(async (startIndex: number) => {
    isPlayingRef.current = true;
    setIsPaused(false);
    requestWakeLock();
    let i = startIndex;
    while (isPlayingRef.current && vocabList.length > 0) {
      setCurrentIndex(i);
      const queue = buildQueueForWord(vocabList[i]);
      await speakQueue(queue);
      if (!isPlayingRef.current) break;
      i++;
      if (i >= vocabList.length) {
        i = 0; // Loop back to start
      }
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    releaseWakeLock();
  }, [vocabList, setCurrentIndex, setIsPlaying, voiceURI]);

  const togglePlay = (index: number) => {
    if (isPlayingRef.current) {
      synth.cancel();
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      releaseWakeLock();
    } else {
      if (vocabList.length === 0) return;
      playLoop(index >= vocabList.length ? 0 : index);
    }
  };

  const stop = () => {
    synth.cancel();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    releaseWakeLock();
  };

  const pause = () => {
    synth.pause();
    setIsPaused(true);
  };

  const resume = () => {
    synth.resume();
    setIsPaused(false);
  };

  return { togglePlay, stop, pause, resume, isPlayingRef, isPaused };
}
