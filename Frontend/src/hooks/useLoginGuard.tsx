import { useState, useEffect, useCallback, useRef } from 'react';
import LoginPromptModal from '../components/LoginPromptModal';
import type { Page } from '../types';

const COUNTDOWN_START = 5;

/**
 * useLoginGuard
 *
 * Returns a `guardedAction` wrapper and the JSX for the login-prompt modal.
 *
 * Usage:
 *   const { guardedAction, LoginModal } = useLoginGuard(navigate, isAuthenticated);
 *
 *   // Wrap any write action:
 *   const handleCheckout = () => guardedAction(() => startCheckout());
 *
 *   // Place <LoginModal /> anywhere in the component JSX.
 */
export function useLoginGuard(
  navigate: (page: Page) => void,
  isAuthenticated: boolean,
) {
  const [modalOpen, setModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable reference — safe to use inside useCallback with empty deps
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start countdown only when the modal opens; navigate is kept in a ref
  // so changes to it don't restart the timer unnecessarily.
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  useEffect(() => {
    if (!modalOpen) return;
    setCountdown(COUNTDOWN_START);

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearTimer();
          setModalOpen(false);
          navigateRef.current('auth');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [modalOpen, clearTimer]);

  const handleCancel = useCallback(() => {
    clearTimer();
    setModalOpen(false);
  }, [clearTimer]);

  const handleProceed = useCallback(() => {
    clearTimer();
    setModalOpen(false);
    navigate('auth');
  }, [clearTimer, navigate]);

  /**
   * If authenticated, runs `action` immediately.
   * Otherwise, opens the login-prompt modal.
   */
  const guardedAction = useCallback(
    (action: () => void | Promise<void>) => {
      if (isAuthenticated) {
        action();
      } else {
        setModalOpen(true);
      }
    },
    [isAuthenticated],
  );

  const LoginModal = (
    <LoginPromptModal
      isOpen={modalOpen}
      countdown={countdown}
      onCancel={handleCancel}
      onProceed={handleProceed}
    />
  );

  return { guardedAction, LoginModal };
}
