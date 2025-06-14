import { useRouter } from 'next/router';
import ThongTinBaiTest from '@/components/nhatuyendung/ThongTinBaiTest';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';

export default function ChiTietBaiTestPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <Head>
        <title>Chi tiết bài test | Job Recruitment</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-teal-600 hover:text-teal-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
        </div>
        {id && <ThongTinBaiTest maBaiTest={id} />}
      </div>
    </Layout>
  );
}