import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/context/ToastContext';
import ThanhdhDN from '@/components/thanhdieuhuong/thanhdhDN';
import ChanTrang from '@/components/chantrang';
import TaoPhongVanModal from '@/components/nhatuyendung/TaoPhongVanModal';
import TaoBaiTestModal from '@/components/nhatuyendung/TaoBaiTestModal';
import InterviewList from '@/components/nhatuyendung/PhongVanList';
import TestList from '@/components/nhatuyendung/BaiTestList';
import { signIn } from 'next-auth/react';

export default function QuanLyPhongVan() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  // States
  const [activeTab, setActiveTab] = useState('phongvan'); // 'phongvan' or 'baitest'
  const [interviews, setInterviews] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateInterviewModal, setShowCreateInterviewModal] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);

  // Load data on mount
  useEffect(() => {
  if (!session) {
    signIn(undefined, { 
      callbackUrl: '/nhatuyendung/PhongVanvaBaiTest/trangquanlyphongvan'
    });
    return;
  }
  if (session.user?.role !== 'nhatuyendung') {
    router.push('/'); // Chuyển về trang chủ nếu không có quyền
    return;
  }
    loadData();
  }, [session]);

  const loadData = async () => {
    try {
      const [interviewsRes, testsRes] = await Promise.all([
        axios.get('/api/nhatuyendung/phongvan/dsphongvan'),
        axios.get('/api/nhatuyendung/baitest/dsbaitest')
      ]);

      setInterviews(interviewsRes.data.data);
      setTests(testsRes.data.data);
    } catch (error) {
      console.error('Load data error:', error);
      showToast('Có lỗi khi tải dữ liệu', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThanhdhDN />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Quản lý phỏng vấn và bài test
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateInterviewModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg
                    flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tạo phỏng vấn
                </button>
                <button
                  onClick={() => setShowCreateTestModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg
                    flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Tạo bài test
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex gap-6">
                <button
                  onClick={() => setActiveTab('phongvan')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'phongvan'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Phỏng vấn
                </button>
                <button
                  onClick={() => setActiveTab('baitest')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'baitest'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Bài test
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'phongvan' ? (
            <InterviewList 
              interviews={interviews} 
              onReload={loadData}
              loading={loading}
            />
          ) : (
            <TestList 
              tests={tests} 
              onReload={loadData}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <TaoPhongVanModal
        isOpen={showCreateInterviewModal}
        onClose={() => setShowCreateInterviewModal(false)}
        onSuccess={() => {
          setShowCreateInterviewModal(false);
          loadData();
        }}
      />

      <TaoBaiTestModal
        isOpen={showCreateTestModal}
        onClose={() => setShowCreateTestModal(false)}
        onSuccess={() => {
          setShowCreateTestModal(false);
          loadData();
        }}
      />

      <ChanTrang />
    </>
  );
}