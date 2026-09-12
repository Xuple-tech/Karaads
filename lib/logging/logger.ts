type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown> | undefined;

const toFlag = (value: string | undefined) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
};

const featureFlags = {
  reverb: toFlag(process.env.EXPO_PUBLIC_REVERB_DEBUG) || __DEV__,
  call: toFlag(process.env.EXPO_PUBLIC_CALL_DEBUG) || __DEV__,
  push: toFlag(process.env.EXPO_PUBLIC_PUSH_DEBUG) || __DEV__,
};

const shouldLog = (scope: keyof typeof featureFlags, level: LogLevel) => {
  if (level === 'error') return true;
  return featureFlags[scope];
};

const emit = (level: LogLevel, label: string, context?: LogContext) => {
  if (level === 'warn') {
    console.warn(label, context ?? '');
    return;
  }
  if (level === 'error') {
    console.error(label, context ?? '');
    return;
  }
  console.log(label, context ?? '');
};

export const createLogger = (scope: keyof typeof featureFlags) => {
  return {
    debug(message: string, context?: LogContext) {
      if (!shouldLog(scope, 'debug')) return;
      emit('debug', `[${scope}] ${message}`, context);
    },
    info(message: string, context?: LogContext) {
      if (!shouldLog(scope, 'info')) return;
      emit('info', `[${scope}] ${message}`, context);
    },
    warn(message: string, context?: LogContext) {
      if (!shouldLog(scope, 'warn')) return;
      emit('warn', `[${scope}] ${message}`, context);
    },
    error(message: string, context?: LogContext) {
      emit('error', `[${scope}] ${message}`, context);
    },
  };
};
