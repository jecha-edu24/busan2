import React, { useState } from 'react';
import { AppState, HistoryResult, ContentPlan, GeneratedPoster } from './types';
import * as GeminiService from './services/geminiService';
import InputSection from './components/InputSection';
import HistoryDisplay from './components/HistoryDisplay';
import ContentPlanDisplay from './components/ContentPlanDisplay';
import SocialPost from './components/SocialPost';
import LoadingOverlay from './components/LoadingOverlay';
import { FileText, Download, Printer, ChevronDown, BookOpen, Lightbulb } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [history, setHistory] = useState<HistoryResult | null>(null);
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);
  const [poster, setPoster] = useState<GeneratedPoster | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<{location: string, emotion: string, contentType: string} | null>(null);
  const [showReportOptions, setShowReportOptions] = useState(false);

  const handleStart = async (location: string, emotion: string, contentType: string) => {
    setError(null);
    setHistory(null);
    setContentPlan(null);
    setPoster(null);
    setUserInput({ location, emotion, contentType });
    setShowReportOptions(false);

    try {
      // Step 1: History
      setAppState(AppState.FETCHING_HISTORY);
      const historyData = await GeminiService.fetchLocationHistory(location);
      setHistory(historyData);

      // Step 2: Planning
      setAppState(AppState.PLANNING_CONTENT);
      const planData = await GeminiService.planCulturalContent(location, historyData, emotion, contentType);
      setContentPlan(planData);

      // Step 3: Image Generation
      setAppState(AppState.GENERATING_IMAGE);
      const posterData = await GeminiService.generatePosterImage(planData, location, emotion);
      setPoster(posterData);

      setAppState(AppState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
      setAppState(AppState.ERROR);
    }
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHistory = () => {
    if (!history || !userInput) return;
    const content = `[부산 소울 큐레이터 - 역사적 사실]\n\n장소: ${userInput.location}\n\n[요약]\n${history.summary}\n\n[주요 사실]\n${history.facts.map(f => `- ${f}`).join('\n')}\n\n[출처]\n${history.sourceUrls?.join('\n') || '-'}`;
    downloadTextFile(`History_${userInput.location}.txt`, content);
  };

  const handleDownloadContentPlan = () => {
    if (!contentPlan || !userInput) return;
    const content = `[부산 소울 큐레이터 - 문화 콘텐츠 기획]\n\n형태: ${contentPlan.contentType}\n제목: ${contentPlan.title}\n컨셉: ${contentPlan.concept}\n\n[스토리라인]\n${contentPlan.storyline}\n\n[공감 포인트]\n${contentPlan.empathyPoint}\n\n[홍보 문구]\n${contentPlan.socialPostText}\n\n[해시태그]\n${contentPlan.hashtags.join(' ')}`;
    downloadTextFile(`Plan_${userInput.location}.txt`, content);
  };

  const handleDownloadReportTxt = () => {
    if (!history || !contentPlan || !userInput) return;

    const date = new Date().toLocaleDateString();
    const reportContent = `
[부산 소울 큐레이터 - 기획 결과 보고서]
발행일: ${date}

==================================================
1. 큐레이션 개요
==================================================
• 대상 장소: ${userInput.location}
• 사용자 감정: ${userInput.emotion}
• 콘텐츠 형태: ${userInput.contentType}

==================================================
2. 역사적 사실 (History)
==================================================
[요약]
${history.summary}

[주요 사실]
${history.facts.map(f => `- ${f}`).join('\n')}

[출처]
${history.sourceUrls && history.sourceUrls.length > 0 ? history.sourceUrls.join('\n') : '출처 정보 없음'}

==================================================
3. 문화 콘텐츠 기획안 (Content Plan)
==================================================
• 제목: ${contentPlan.title}
• 컨셉: ${contentPlan.concept}

[스토리라인]
${contentPlan.storyline}

[공감 포인트]
${contentPlan.empathyPoint}

==================================================
4. 소셜 미디어 홍보 (Social Media)
==================================================
[포스트 멘트]
${contentPlan.socialPostText}

[해시태그]
${contentPlan.hashtags.join(' ')}

--------------------------------------------------
* 본 보고서는 부산 소울 큐레이터 AI(Gemini)에 의해 생성되었습니다.
`;
    downloadTextFile(`Report_${userInput.location}.txt`, reportContent);
    setShowReportOptions(false);
  };

  const handleDownloadReportPdf = () => {
    setShowReportOptions(false);
    // Use window.print() to generate PDF via browser
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-slate-100 pb-20">
      <LoadingOverlay state={appState} />

      <header className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <span className="bg-blue-600 text-white p-1 rounded-lg">B</span>
            <span>Busan Soul Curator</span>
          </div>
        </div>
      </header>
      
      {/* Print-only Header */}
      <div className="hidden print:block text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold text-slate-900">부산 소울 큐레이터 - 결과 보고서</h1>
        <p className="text-slate-500 mt-2">
          {userInput?.location} X {userInput?.emotion}
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-12 print:space-y-8">
        {/* Input Section - Hidden when printing */}
        <section className="no-print">
          <InputSection 
            onSubmit={handleStart} 
            isLoading={appState !== AppState.IDLE && appState !== AppState.COMPLETED && appState !== AppState.ERROR} 
          />
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center animate-shake no-print">
            <p className="font-bold">오류 발생</p>
            <p>{error}</p>
            <button 
              onClick={() => setAppState(AppState.IDLE)}
              className="mt-2 text-sm underline hover:text-red-800"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* Results Container */}
        {(appState === AppState.COMPLETED || appState === AppState.GENERATING_IMAGE || appState === AppState.PLANNING_CONTENT) && (
          <div className="space-y-8">
            
            {/* Step 1: History Result */}
            {history && (
              <div className="page-break-inside-avoid">
                <HistoryDisplay data={history} />
              </div>
            )}

            {/* Step 2: Content Plan */}
            {contentPlan && (
              <div className="page-break-inside-avoid">
                <ContentPlanDisplay plan={contentPlan} />
              </div>
            )}

            {/* Step 3: Final Poster (Only show when fully completed) */}
            {appState === AppState.COMPLETED && poster && contentPlan && (
              <>
                <div className="page-break-inside-avoid">
                  <SocialPost plan={contentPlan} poster={poster} />
                </div>
                
                {/* Download Actions - Hidden when printing */}
                <div className="mt-12 pt-8 border-t border-slate-200 animate-fade-in-up delay-300 no-print">
                  <h3 className="text-lg font-bold text-slate-700 text-center mb-6">자료 저장 및 내보내기</h3>
                  
                  <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
                    {/* 1. History Download */}
                    <button 
                      onClick={handleDownloadHistory}
                      className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>역사적 사실 (.txt)</span>
                    </button>

                    {/* 2. Content Plan Download */}
                    <button 
                      onClick={handleDownloadContentPlan}
                      className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4 text-teal-500" />
                      <span>콘텐츠 기획 (.txt)</span>
                    </button>

                    {/* 3. Full Report Download with Options */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowReportOptions(!showReportOptions)}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        <span>기획 결과 보고서</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showReportOptions ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {showReportOptions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                          <button 
                            onClick={handleDownloadReportTxt}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 border-b border-slate-100"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            텍스트 파일로 저장 (.txt)
                          </button>
                          <button 
                            onClick={handleDownloadReportPdf}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2"
                          >
                            <Printer className="w-4 h-4 text-slate-400" />
                            PDF로 인쇄/저장
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    * PDF 저장은 인쇄 미리보기 화면에서 'PDF로 저장'을 선택해주세요.
                  </p>
                </div>
              </>
            )}
            
          </div>
        )}
      </main>

      <footer className="text-center text-slate-400 py-8 text-sm no-print">
        <p>Powered by Google Gemini 2.5 Flash & Nano Banana (Image)</p>
      </footer>
    </div>
  );
};

export default App;