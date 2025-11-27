import React from 'react';
import { AppState } from '../types';

interface LoadingOverlayProps {
  state: AppState;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ state }) => {
  const getMessage = () => {
    switch (state) {
      case AppState.FETCHING_HISTORY:
        return "역사의 흔적을 찾고 있습니다...";
      case AppState.PLANNING_CONTENT:
        return "당신의 감정을 담아 콘텐츠를 기획 중입니다...";
      case AppState.GENERATING_IMAGE:
        return "Nano Banana 모델이 포스터를 그리고 있습니다...";
      default:
        return "로딩 중...";
    }
  };

  if (state === AppState.IDLE || state === AppState.COMPLETED || state === AppState.ERROR) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-xl font-medium animate-pulse">{getMessage()}</p>
    </div>
  );
};

export default LoadingOverlay;
