import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastProvider from './components/Toast';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import DropCreated from './pages/DropCreated';
import Receive from './pages/Receive';
import DownloadPage from './pages/Download';
import About from './pages/About';
import NotFound from './pages/NotFound';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full flex-1 flex flex-col items-center"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/drop/:code" element={<DropCreated />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/d/:code" element={<DownloadPage />} />
          <Route path="/about" element={<About />} />
          {/* Also route direct code paths or legacy links */}
          <Route path="/download/:code" element={<Navigate to="/d/:code" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
            <Navbar />
            <main className="flex-1 flex flex-col items-center w-full">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}


