import { useState, useCallback, useEffect } from 'react';
import dropService from '../services/dropService';
import { normalizeCode } from '../utils/formatUtils';

/**
 * Custom hook to encapsulate drop lifecycle (fetching, password unlocking, downloading).
 * 
 * @param {string} [initialCode]
 */
export function useDrop(initialCode) {
  const [code, setCode] = useState(initialCode ? normalizeCode(initialCode) : '');
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialCode));
  const [error, setError] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [passwordAttempts, setPasswordAttempts] = useState(0);

  const loadDrop = useCallback(async (targetCode) => {
    const cleanCode = normalizeCode(targetCode || code);
    if (!cleanCode) return;

    setLoading(true);
    setError(null);

    try {
      const data = await dropService.getDrop(cleanCode);
      setDrop(data);
      setCode(cleanCode);
      if (data.requiresPassword) {
        setRequiresPassword(true);
        setIsUnlocked(false);
        setVerifiedPassword(null);
      } else {
        setRequiresPassword(false);
        setIsUnlocked(true);
        setVerifiedPassword(null);
      }
    } catch (err) {
      setError(err);
      setDrop(null);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (initialCode) {
      loadDrop(initialCode);
    }
  }, [initialCode, loadDrop]);

  const unlock = useCallback(async (password) => {
    if (!code) return { success: false, error: 'No code specified' };

    setLoading(true);
    setError(null);

    try {
      await dropService.verifyPassword(code, password);
      setVerifiedPassword(password);
      setIsUnlocked(true);
      setRequiresPassword(false);
      return { success: true, data };
    } catch (err) {
      setPasswordAttempts((prev) => prev + 1);
      setError(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [code]);

  const download = useCallback(async (password = null) => {
    if (!code) return { success: false, error: 'No drop loaded' };

    setIsDownloading(true);
    try {
      const result = await dropService.downloadDrop(code, password || verifiedPassword);
      // If drop had max downloads, update remaining count
      if (drop && drop.maxDownloads) {
        setDrop((prev) => prev ? {
          ...prev,
          downloadCount: (prev.downloadCount || 0) + 1,
        } : null);
      }
      return { success: true, result };
    } catch (err) {
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsDownloading(false);
    }
  }, [code, drop, verifiedPassword]);

  return {
    code,
    drop,
    loading,
    error,
    requiresPassword,
    isUnlocked,
    verifiedPassword,
    isDownloading,
    passwordAttempts,
    loadDrop,
    unlock,
    download,
    setDrop,
  };
}

export default useDrop;
