import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import ThanhdhDN from "../../components/thanhdieuhuong/thanhdhDN";
import Image from "next/image";

export default function TrangDSHoSoDuyet() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

    useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (session.user.role !== 'qlhoso') {
      router.push('/');
      return;
    }

    fetchProfiles();
  }, [session, router]);

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/nhanvienHS/dshosoduyet", {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}` 
        }
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        setProfiles(data.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (maHoSo) => {
    setSelectedProfiles(prev => 
      prev.includes(maHoSo)
        ? prev.filter(id => id !== maHoSo)
        : [...prev, maHoSo]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      "Chờ duyệt": "text-yellow-600",
      "Đã duyệt": "text-green-600",
      "Bị khóa": "text-red-600"
    };
    return colors[status] || "text-gray-600";
  };

  const handleViewDetail = (maHoSo) => {
    router.push(`/ungvien/chitiethosoungvien?id=${maHoSo}`);
  };

  const handleApprove = async () => {
    if (!selectedProfiles.length) return;
    
    try {
      const res = await fetch("/api/nhanvienHS/duyethoso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maHoSos: selectedProfiles,
          action: "approve"
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Refresh data
        fetchProfiles();
        setSelectedProfiles([]);
      }
    } catch (error) {
      console.error("Lỗi khi duyệt hồ sơ:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedProfiles.length) return;
    
    try {
      const res = await fetch("/api/nhanvienHS/duyethoso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maHoSos: selectedProfiles,
          action: "reject"
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Refresh data
        fetchProfiles();
        setSelectedProfiles([]);
      }
    } catch (error) {
      console.error("Lỗi khi từ chối hồ sơ:", error);
    }
  };

  return (
    <>
      <ThanhdhDN userType="nhanvien" />
        <div className="min-h-screen flex flex-col gap-2 items-center text-center bg-gray-100 pt-10">
        <div className="p-8 w-full max-w-7xl mx-auto bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-black mb-2">Danh sách hồ sơ ứng viên</h1>
                <p className="text-gray-500 text-lg">
                {profiles.filter(p => p.TrangThai === "Chờ duyệt").length} hồ sơ chờ duyệt
                </p>
            </div>
            <div className="space-x-2">
                <button
                onClick={handleReject}
                disabled={selectedProfiles.length === 0}
                className={`px-4 py-2 rounded font-medium ${
                    selectedProfiles.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                >
                Từ chối
                </button>
                <button
                onClick={handleApprove}
                disabled={selectedProfiles.length === 0}
                className={`px-4 py-2 rounded font-medium ${
                    selectedProfiles.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
                >
                Duyệt
                </button>
            </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-5 bg-gray-100 p-4 font-semibold text-gray-700 text-lg">
                <div className="col-span-1 flex items-center">
                <input
                    type="checkbox"
                    className="mr-2"
                    onChange={(e) => {
                    if (e.target.checked) {
                        setSelectedProfiles(profiles.map(p => p.MaHoSo));
                    } else {
                        setSelectedProfiles([]);
                    }
                    }}
                    checked={selectedProfiles.length === profiles.length}
                />
                Thông tin ứng viên
                </div>
                <div className="col-span-1">Tên hồ sơ</div>
                <div className="col-span-1">Ngày tạo</div>
                <div className="col-span-1 text-center">Trạng thái</div>
                <div className="col-span-1 text-center">Thao tác</div>
            </div>

            {loading ? (
                <div className="p-4 text-center text-black">Đang tải...</div>
            ) : profiles.length === 0 ? (
                <div className="p-4 text-center text-black">Không có hồ sơ nào.</div>
            ) : (
                profiles.map((profile) => (
                  <div
                    key={profile.MaHoSo}
                    className="grid grid-cols-5 p-4 border-t items-center hover:bg-gray-50 text-base"
                  >
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={() => handleCheckboxChange(profile.MaHoSo)}
                        checked={selectedProfiles.includes(profile.MaHoSo)}
                      />
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-black">{profile.TenUngVien}</span>
                        <span className="text-sm text-gray-500">{profile.Email}</span>
                      </div>
                    </div>

                    <div className="col-span-1 flex flex-col pl-4">
                      <span className="text-black">{profile.TenHoSo}</span>
                    </div>

                    <div className="col-span-1 flex flex-col pl-4">
                      <span className="text-black">
                        {new Date(profile.NgayTao).toLocaleDateString('vi-VN')}
                      </span>
                      {profile.NgayDuyet && (
                        <span className="text-sm text-gray-500">
                          Duyệt: {new Date(profile.NgayDuyet).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                      {profile.NguoiDuyet && (
                        <span className="text-sm text-gray-500">
                          Bởi: {profile.NguoiDuyet}
                        </span>
                      )}
                    </div>

                    <div className="col-span-1 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${profile.TrangThai === 'Đã duyệt' ? 'bg-green-100 text-green-800' : 
                          profile.TrangThai === 'Từ chối' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {profile.TrangThai || 'Chưa duyệt'}
                      </span>
                      {profile.LyDo && (
                        <p className="text-xs text-gray-500 mt-1">{profile.LyDo}</p>
                      )}
                    </div>

                    <div className="col-span-1 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(profile.MaHoSo)}
                        className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 text-sm"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))
            )}
            </div>
        </div>
        </div>
    </>
    );
}