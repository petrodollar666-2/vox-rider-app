import { useState, useEffect } from 'react';
import { useTTS } from './hooks/useTTS';
import { IELTS_DATA } from './data/ielts';
import { TOPICS_DATA } from './data/topics';

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic?: string;
  type?: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  example2?: string;
  example2Meaning?: string;
}

const DEFAULT_MOCK_DATA: VocabularyItem[] = [
  { id: '1', word: 'Commute', phonetic: '/kəˈmjuːt/', type: 'verb / noun', meaning: 'Đi lại hàng ngày (giữa nhà và chỗ làm)', example: 'I commute to work by motorbike every morning.', exampleMeaning: 'Tôi đi làm bằng xe máy mỗi sáng.', example2: 'The commute takes about 30 minutes.', example2Meaning: 'Chuyến đi lại mất khoảng 30 phút.' },
  { id: '2', word: 'Traffic congestion', type: 'noun phrase', meaning: 'Tắc nghẽn giao thông', example: 'Avoid the highway to escape congestion.', exampleMeaning: 'Tránh đường cao tốc để thoát cảnh tắc đường.', example2: 'Traffic congestion is terrible here.', example2Meaning: 'Tắc đường ở đây thật tồi tệ.' },
  { id: '3', word: 'Pedestrian', type: 'noun', meaning: 'Người đi bộ', example: 'Yield to pedestrians.', exampleMeaning: 'Nhường đường cho người đi bộ.', example2: 'The pedestrian crossing is ahead.', example2Meaning: 'Vạch qua đường dành cho người đi bộ ở phía trước.' },
  { id: '4', word: 'Intersection', type: 'noun', meaning: 'Ngã tư', example: 'Slow down at the intersection.', exampleMeaning: 'Giảm tốc độ tại ngã tư.', example2: 'Turn left at the next intersection.', example2Meaning: 'Rẽ trái ở ngã tư tiếp theo.' },
  { id: '5', word: 'Helmet', type: 'noun', meaning: 'Mũ bảo hiểm', example: 'Wear your helmet.', exampleMeaning: 'Đội mũ bảo hiểm vào.', example2: 'My helmet is black.', example2Meaning: 'Mũ bảo hiểm của tôi màu đen.' }
];

const ieltsTopics = Array.from({ length: Math.ceil(IELTS_DATA.length / 30) }, (_, i) => {
  const start = i * 30;
  const end = Math.min(start + 30, IELTS_DATA.length);
  return `IELTS (Từ ${start + 1}-${end})`;
});

const PRESET_TOPICS = [
  'Giao thông & Đi đường',
  ...ieltsTopics,
  'Giao tiếp công sở',
  'Đời sống hàng ngày',
];

export default function App() {
  const [topic, setTopic] = useState<string>(PRESET_TOPICS[0]);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>(DEFAULT_MOCK_DATA);
  const [customText, setCustomText] = useState<string>('');

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'cards' | 'custom'>('cards');
  const [searchTopic, setSearchTopic] = useState<string>('');

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const { togglePlay, stop, isPlayingRef, isPaused, pause, resume } = useTTS(
    vocabList, 
    currentIndex, 
    setCurrentIndex, 
    setIsPlaying,
    selectedVoice
  );

  const handleTogglePlay = () => {
    if (vocabList.length === 0) return;
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      togglePlay(currentIndex);
    }
  };

  const handleShuffleVocab = () => {
    stop();
    const shuffled = [...vocabList].sort(() => Math.random() - 0.5);
    setVocabList(shuffled);
    setCurrentIndex(0);
    setActiveTab('cards');
  };

  const handleSelectTopic = (nextTopic: string) => {
    stop();
    setTopic(nextTopic);
    
    if (nextTopic.startsWith('IELTS')) {
      const match = nextTopic.match(/Từ (\d+)-(\d+)/);
      if (match) {
        const start = parseInt(match[1]) - 1;
        const end = parseInt(match[2]);
        setVocabList(IELTS_DATA.slice(start, end));
      }
    } else if (nextTopic === 'Giao thông & Đi đường') {
      setVocabList(DEFAULT_MOCK_DATA);
    } else {
      setVocabList(TOPICS_DATA[nextTopic] || []);
    }
    setCurrentIndex(0);
    setSearchTopic('');
  };

  const handleChangeTopic = () => {
    const nextIndex = (PRESET_TOPICS.indexOf(topic) + 1) % PRESET_TOPICS.length;
    handleSelectTopic(PRESET_TOPICS[nextIndex]);
  };
  
  const handleNextWord = () => {
    stop();
    setCurrentIndex(prev => (prev + 1) % vocabList.length);
  };

  const handleApplyCustomVocab = () => {
    if (!customText.trim()) return;
    const lines = customText.split('\n').filter((l) => l.trim().length > 0);
    const parsed: VocabularyItem[] = lines.map((line, idx) => {
      const parts = line.split(/[-:]/);
      const word = parts[0]?.trim() || `Word ${idx + 1}`;
      const meaning = parts[1]?.trim() || 'Tự định nghĩa';
      return {
        id: `custom-${idx + 1}`,
        word,
        meaning,
        example: `I want to learn ${word}`,
        exampleMeaning: `Tôi muốn học ${word}`,
      };
    });

    if (parsed.length > 0) {
      setVocabList(parsed);
      setCurrentIndex(0);
      setActiveTab('cards');
      stop();
    }
  };

  const filteredTopics = PRESET_TOPICS.filter(t => t.toLowerCase().includes(searchTopic.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-xl font-black tracking-wider uppercase text-emerald-400">
              VOX RIDER (FREE)
            </h1>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700">
            ✓ Offline Mode
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col gap-5">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Chủ đề hiện tại:</span>
              <p className="text-lg md:text-xl font-extrabold text-amber-300 mt-0.5">{topic}</p>
            </div>
            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-300">
              {vocabList.length} từ
            </span>
          </div>
          
          <input
             type="text"
             placeholder="Tìm kiếm chủ đề..."
             value={searchTopic}
             onChange={e => setSearchTopic(e.target.value)}
             className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-sm text-slate-200 outline-none transition"
          />
          {searchTopic && (
             <div className="max-h-40 overflow-y-auto flex flex-col gap-1 mt-2">
                {filteredTopics.map(t => (
                  <button
                    key={t}
                    onClick={() => handleSelectTopic(t)}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition ${topic === t ? 'bg-emerald-900/50 text-emerald-400' : 'hover:bg-slate-800 text-slate-300'}`}
                  >
                    {t}
                  </button>
                ))}
                {filteredTopics.length === 0 && (
                  <div className="text-sm text-slate-500 p-2">Không tìm thấy chủ đề phù hợp</div>
                )}
             </div>
          )}
        </div>

        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <label className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2 block">
            Giọng đọc (Voice):
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-sm text-slate-200 outline-none transition"
          >
            <option value="">-- Mặc định (Tự động chọn) --</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        <section className="w-full">
          <button
            onClick={handleTogglePlay}
            className={`w-full py-8 md:py-10 rounded-3xl font-black text-3xl md:text-4xl shadow-2xl flex flex-col items-center justify-center gap-2 transition-all transform active:scale-95 duration-150 border-4 ${
              isPlaying && !isPaused
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-900/50 animate-pulse'
                : isPlaying && isPaused
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-amber-950/70'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300 shadow-emerald-950/70'
            }`}
          >
            <div className="flex items-center gap-4">
              {isPlaying && !isPaused ? (
                <span>TẠM DỪNG (PAUSE)</span>
              ) : isPlaying && isPaused ? (
                <span>TIẾP TỤC (RESUME)</span>
              ) : (
                <span>BẤM ĐỂ NGHE (LOOP)</span>
              )}
            </div>
            <span className="text-sm font-semibold tracking-wide opacity-90">
              {isPlaying && !isPaused 
                ? `Đang phát từ ${currentIndex + 1}/${vocabList.length}: ${vocabList[currentIndex]?.word || ''}` 
                : isPlaying && isPaused
                ? `Đã tạm dừng. Bấm để phát tiếp`
                : 'Chạm 1 lần để nghe liên tục'}
            </span>
          </button>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShuffleVocab}
            className="h-16 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-lg active:scale-95 transition"
          >
            🔀 Đảo trộn từ
          </button>
          <button
            onClick={handleChangeTopic}
            className="h-16 bg-purple-600 hover:bg-purple-500 text-white font-black text-lg rounded-2xl shadow-lg active:scale-95 transition"
          >
            🔄 Đổi chủ đề
          </button>
        </div>
        
        <div className="w-full">
          <button
            onClick={handleNextWord}
            className="w-full h-16 bg-slate-800 hover:bg-slate-700 text-white font-black text-lg rounded-2xl shadow-lg active:scale-95 transition"
          >
            ⏭️ Chuyển từ tiếp theo (Bỏ qua)
          </button>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 py-3 text-base font-bold rounded-xl transition ${activeTab === 'cards' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400'}`}
          >
            📋 Danh sách từ
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-base font-bold rounded-xl transition ${activeTab === 'custom' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400'}`}
          >
            ✍️ Tự nhập
          </button>
        </div>

        {activeTab === 'cards' ? (
          <div className="flex flex-col gap-3">
            {vocabList.map((item, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={item.id || idx}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">#{idx + 1}</span>
                        <h3 className="text-xl font-extrabold text-white">{item.word}</h3>
                      </div>
                      <div className="mt-2 text-base font-bold text-amber-300">{item.meaning}</div>
                    </div>
                  </div>
                  {item.example && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-sm">
                      <p className="text-slate-300 italic">"{item.example}"</p>
                      <p className="text-slate-400 text-xs mt-0.5">👉 {item.exampleMeaning}</p>
                    </div>
                  )}
                  {item.example2 && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-sm">
                      <p className="text-slate-300 italic">"{item.example2}"</p>
                      <p className="text-slate-400 text-xs mt-0.5">👉 {item.example2Meaning}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <textarea
              rows={8}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={`commute - đi làm hàng ngày\nhelmet - mũ bảo hiểm`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm font-mono text-slate-200 outline-none transition"
            />
            <button
              onClick={handleApplyCustomVocab}
              className="w-full h-14 bg-emerald-600 text-slate-950 font-black text-lg rounded-xl shadow-lg active:scale-95 transition"
            >
              ✅ Nạp từ
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
