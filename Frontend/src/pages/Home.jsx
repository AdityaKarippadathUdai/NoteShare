import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileDropzone from '../components/FileDropzone';
import FilePreview from '../components/FilePreview';
import UploadSettings from '../components/UploadSettings';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../components/Toast';
import dropService from '../services/dropService';
import { getErrorMessage } from '../utils/errorUtils';

export function Home() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [expiresIn, setExpiresIn] = useState('30m');
  const [maxDownloads, setMaxDownloads] = useState('3');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [deleteAfterFirstDownload, setDeleteAfterFirstDownload] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    addToast(`Selected: ${file.name}`, 'info', 2000);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPasswordError(null);
    setUploadProgress(null);
  };

  const validateSettings = () => {
    if (passwordEnabled) {
      if (!password || password.trim().length === 0) {
        setPasswordError('Please specify a password or disable password protection.');
        return false;
      }
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match.');
        return false;
      }
    }
    setPasswordError(null);
    return true;
  };

  const handleCreateDrop = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('Please select a file to drop.', 'warning');
      return;
    }

    if (!validateSettings()) {
      addToast('Please resolve password errors before continuing.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const dropResult = await dropService.createDrop(
        {
          file: selectedFile,
          expiresIn,
          maxDownloads: deleteAfterFirstDownload ? 1 : maxDownloads,
          password: passwordEnabled ? password : null,
          deleteAfterFirstDownload,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      addToast('Drop created successfully!', 'success');
      // Navigate to Drop Created screen
      navigate(`/drop/${dropResult.code}`, {
        state: { drop: dropResult, isCreator: true },
      });
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Upload failed. Please try again.');
      addToast(errorMsg, 'error');
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="w-full py-8 sm:py-14 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Temporary file sharing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Share files with a simple code.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Upload a file, get a short code, and share it securely. No account required.
          </p>
        </div>

        {/* Upload Container */}
        <form onSubmit={handleCreateDrop} className="space-y-6">
          <FileDropzone
            file={selectedFile}
            onFileSelected={handleFileSelect}
            onRemove={handleRemoveFile}
            disabled={isUploading}
          />

          <AnimatePresence>
            {selectedFile && (
              <motion.div
                key="settings-panel"
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-6 overflow-hidden"
              >
                <UploadSettings
                  expiresIn={expiresIn}
                  onExpiresInChange={setExpiresIn}
                  maxDownloads={maxDownloads}
                  onMaxDownloadsChange={setMaxDownloads}
                  passwordEnabled={passwordEnabled}
                  onPasswordToggle={setPasswordEnabled}
                  password={password}
                  onPasswordChange={setPassword}
                  confirmPassword={confirmPassword}
                  onConfirmPasswordChange={setConfirmPassword}
                  passwordError={passwordError}
                  deleteAfterFirstDownload={deleteAfterFirstDownload}
                  onDeleteAfterFirstDownloadChange={setDeleteAfterFirstDownload}
                  disabled={isUploading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Progress & Action Button */}
          {selectedFile && (
            <div className="space-y-4 pt-2">
              {isUploading && (
                <ProgressBar
                  progress={uploadProgress}
                  label={uploadProgress ? `Uploading... ${uploadProgress}%` : 'Creating Drop...'}
                />
              )}

              <button
                id="btn-create-drop"
                type="submit"
                disabled={isUploading}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base text-white transition-all duration-200 flex items-center justify-center gap-3 shadow-xl active:scale-[0.99] ${
                  isUploading
                    ? 'bg-emerald-700/60 cursor-not-allowed opacity-90'
                    : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-emerald-600/25'
                }`}
              >
                {isUploading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Drop...</span>
                  </>
                ) : (
                  <>
                    <span>Create Drop</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>

        {/* Feature Badges with White-Green-Red Theme Accents */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800/60 shadow-sm dark:shadow-none">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">No Account Needed</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant access for any receiver</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800/60 shadow-sm dark:shadow-none">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auto Expiration</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Self-cleaning temporary storage</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800/60 shadow-sm dark:shadow-none">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Fast Download</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">6-character code or direct link</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
