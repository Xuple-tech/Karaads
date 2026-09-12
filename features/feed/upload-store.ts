import { create } from 'zustand';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type PostUploadState = {
  status: UploadStatus;
  progress: number;
  message: string;
  start: () => void;
  succeed: () => void;
  fail: (message: string) => void;
  dismiss: () => void;
};

let progressTimer: ReturnType<typeof setInterval> | null = null;
const stopTimer = () => {
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = null;
};

export const usePostUploadStore = create<PostUploadState>((set, get) => ({
  status: 'idle',
  progress: 0,
  message: '',
  start: () => {
    stopTimer();
    set({ status: 'uploading', progress: 0.06, message: 'Uploading your post…' });
    progressTimer = setInterval(() => {
      if (get().status !== 'uploading') return stopTimer();
      set((state) => ({ progress: Math.min(0.9, state.progress + Math.max(0.015, (0.9 - state.progress) * 0.08)) }));
    }, 650);
  },
  succeed: () => {
    stopTimer();
    set({ status: 'success', progress: 1, message: 'Your post is live.' });
    setTimeout(() => {
      if (get().status === 'success') set({ status: 'idle', progress: 0, message: '' });
    }, 3500);
  },
  fail: (message) => {
    stopTimer();
    set({ status: 'error', progress: 1, message });
  },
  dismiss: () => {
    stopTimer();
    set({ status: 'idle', progress: 0, message: '' });
  },
}));
