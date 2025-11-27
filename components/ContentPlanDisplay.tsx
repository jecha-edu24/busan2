import React from 'react';
import { ContentPlan } from '../types';
import { Lightbulb, Film, Feather, HeartHandshake } from 'lucide-react';

interface ContentPlanDisplayProps {
  plan: ContentPlan;
}

const ContentPlanDisplay: React.FC<ContentPlanDisplayProps> = ({ plan }) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border-l-4 border-teal-500 overflow-hidden animate-fade-in-up delay-100">
      <div className="bg-teal-50 p-4 border-b border-teal-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-teal-600" />
          <span className="font-bold text-teal-800">문화 콘텐츠 기획안</span>
        </div>
        <span className="px-3 py-1 bg-white text-teal-600 text-xs font-bold rounded-full border border-teal-200 uppercase tracking-wider">
          {plan.contentType}
        </span>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.title}</h3>
          <p className="text-teal-600 font-medium">{plan.concept}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Film className="w-4 h-4" /> 스토리라인
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {plan.storyline}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" /> 공감 포인트
            </h4>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <p className="text-orange-800 text-sm italic">
                "{plan.empathyPoint}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPlanDisplay;
