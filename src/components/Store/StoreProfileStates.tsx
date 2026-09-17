import React from 'react';
import { Store, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

interface StoreLoadingStateProps {
  message: string;
}

export const StoreLoadingState: React.FC<StoreLoadingStateProps> = ({ message }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" className="text-orange-600" />
    <span className="text-sm font-semibold text-slate-500">{message}</span>
  </div>
);

interface StoreErrorStateProps {
  errorType?: 'notFound' | 'serverError' | null;
  d: (key: string) => string;
  onRetry: () => void;
  onBack: () => void;
}

export const StoreErrorState: React.FC<StoreErrorStateProps> = ({
  errorType,
  d,
  onRetry,
  onBack,
}) => {
  if (errorType === 'serverError') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{d('loadError')}</h2>
          <p className="text-sm text-slate-500">{d('loadErrorDesc')}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-2xl text-xs font-bold hover:bg-orange-700 transition-all cursor-pointer"
            >
              <span>{d('retry')}</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-800 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{d('backToCatalog')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md text-center space-y-4">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{d('notExist')}</h2>
        <p className="text-sm text-slate-500">{d('notExistDesc')}</p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer mt-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{d('backToCatalog')}</span>
        </button>
      </div>
    </div>
  );
};
