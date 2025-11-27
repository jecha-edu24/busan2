import React, { useState } from 'react';
import { MapPin, Heart, Sparkles, Layers } from 'lucide-react';

interface InputSectionProps {
  onSubmit: (location: string, emotion: string, contentType: string) => void;
  isLoading: boolean;
}

const CONTENT_TYPES = [
  "웹툰",
  "오디오 드라마",
  "다큐멘터리",
  "전시회",
  "에세이",
  "숏폼 영상",
  "시(Poem)"
];

const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading }) => {
  const [location, setLocation] = useState('');
  const [emotion, setEmotion] = useState('');
  const [contentType, setContentType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && emotion.trim() && contentType) {
      onSubmit(location, emotion, contentType);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">부산 소울 큐레이터</h1>
        <p className="text-slate-600">
          부산의 장소와 당신의 감정을 들려주세요.<br />
          역사가 깃든 이야기로 당신을 위로합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Input */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            부산의 장소
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 40계단, 영도대교, 감천문화마을"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white/50"
            disabled={isLoading}
            required
          />
        </div>

        {/* Emotion Input */}
        <div className="space-y-2">
          <label htmlFor="emotion" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            현재의 감정
          </label>
          <input
            id="emotion"
            type="text"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="예: 그리움, 고독, 희망, 설렘"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none bg-white/50"
            disabled={isLoading}
            required
          />
        </div>

        {/* Content Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            희망하는 콘텐츠 형태
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setContentType(type)}
                disabled={isLoading}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                  contentType === type
                    ? 'bg-purple-100 border-purple-500 text-purple-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !location || !emotion || !contentType}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>큐레이팅 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>나만의 콘텐츠 만들기</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;