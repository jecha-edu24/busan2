import React from 'react';
import { HistoryResult } from '../types';
import { BookOpen, ExternalLink, MapPin } from 'lucide-react';

interface HistoryDisplayProps {
  data: HistoryResult;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ data }) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border-l-4 border-blue-500 overflow-hidden animate-fade-in-up">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">
            {data.location}의 기억
          </h2>
        </div>

        <p className="text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-lg italic">
          "{data.summary}"
        </p>

        <div className="space-y-3">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> 주요 역사적 사실
          </h3>
          <ul className="space-y-2">
            {data.facts.map((fact, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="min-w-[6px] h-[6px] rounded-full bg-blue-400 mt-2"></span>
                {fact}
              </li>
            ))}
          </ul>
        </div>

        {data.sourceUrls && data.sourceUrls.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2">출처 (Google Search Grounding):</p>
            <div className="flex flex-wrap gap-2">
              {data.sourceUrls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline bg-blue-50 px-2 py-1 rounded-md transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source {idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDisplay;
