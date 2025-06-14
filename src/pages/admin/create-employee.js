import { useState } from 'react';

export default function AdminCreateEmployee() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'qlhoso',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setFormData({ username: '', email: '', role: 'qlhoso' }); // Reset form
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-black">Tạo tài khoản nhân viên</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-black">Tên nhân viên</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-black"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-black">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-black"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-black">Vai trò</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-black"
            >
              <option value="qlhoso">Quản lý hồ sơ</option>
              <option value="qltintd">Quản lý tin tuyển dụng</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded"
          >
            Tạo tài khoản
          </button>
        </form>
      </div>
    </div>
  );
}