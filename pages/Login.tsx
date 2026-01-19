
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { db } from '../constants';
import { ArrowLeft, Zap, AlertCircle, Loader2, Lock, Globe, Fingerprint, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    // التحقق من وجود مفتاح بصمة محلي
    setHasBiometric(localStorage.getItem('khotati_bio_active') === 'true');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await db.schoolLogin({ username, password });

    if (result.success && result.data) {
      onLogin(result.data);
      navigate('/school');
    } else {
      setError(result.message || 'بيانات الدخول غير صحيحة');
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    // محاكاة طلب البصمة - في النسخة الكاملة يتم الربط مع WebAuthn
    setTimeout(async () => {
      // تجربة الدخول بالبيانات المحفوظة للبصمة
      const saved = localStorage.getItem('khotati_bio_data');
      if (saved) {
        const result = await db.schoolLogin(JSON.parse(saved));
        if (result.success) {
           onLogin(result.data);
           navigate('/school');
           return;
        }
      }
      setError('فشل التعرف على البصمة');
      setBiometricLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']" dir="rtl">
      <div className="w-full max-w-[460px] animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-flex p-5 bg-indigo-600 text-white rounded-[1.8rem] mb-6 shadow-xl shadow-indigo-100">
              <Zap size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">بوابة المدارس</h1>
            <p className="text-slate-400 font-bold mt-2 text-sm">سجل دخول