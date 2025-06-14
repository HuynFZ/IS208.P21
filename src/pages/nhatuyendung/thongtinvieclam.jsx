'use client';

import JobInformation from "../../components/nhatuyendung/thongtinvieclam";
import { useRouter } from 'next/router';

export default function ChiTietViecLam() {
  const router = useRouter();
  const { id } = router.query; // Lấy mã tin tuyển dụng từ URL

  return (
    <>
      <JobInformation jobId={id} />
    </>
  );
}