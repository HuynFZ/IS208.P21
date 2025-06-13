import db from "../../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

// Hàm kiểm tra dữ liệu đầu vào
const validateInput = (data) => {
  const errors = [];
  
  // Kiểm tra họ tên
  if (!data.tenUngVien?.trim()) {
    errors.push("Họ tên không được để trống");
  } else if (data.tenUngVien.length > 50) {
    errors.push("Họ tên không được vượt quá 50 ký tự");
  }
  
  // Kiểm tra số điện thoại
  if (data.sdt && !/^[0-9]{10}$/.test(data.sdt)) {
    errors.push("Số điện thoại phải có đúng 10 chữ số");
  }
  
  // Kiểm tra ngày sinh
  if (data.ngaySinh) {
    const date = new Date(data.ngaySinh);
    const today = new Date();
    if (isNaN(date.getTime())) {
      errors.push("Ngày sinh không hợp lệ");
    } else if (date > today) {
      errors.push("Ngày sinh không thể là ngày trong tương lai");
    }
  }

  // Kiểm tra địa chỉ
  if (data.diaChi?.trim().length > 100) {
    errors.push("Địa chỉ không được vượt quá 100 ký tự");
  }

  return errors;
};

// Hàm lấy thông tin ứng viên
const getUngVienInfo = async (email) => {
  const [rows] = await db.query(
    "SELECT MaUngVien FROM UNG_VIEN WHERE Email = ?",
    [email]
  );
  return rows[0];
};

// Hàm cập nhật thông tin
const updateUngVien = async (maUngVien, fields) => {
  const updates = [];
  const values = [];

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (updates.length === 0) return null;

  values.push(maUngVien);

  const [result] = await db.query(
    `UPDATE UNG_VIEN 
     SET ${updates.join(', ')}
     WHERE MaUngVien = ?`,
    values
  );

  return result.affectedRows > 0;
};

export default async function handler(req, res) {
  // Kiểm tra phương thức
  if (req.method !== "PUT") {
    return res.status(405).json({ 
      success: false,
      message: "Phương thức không được phép" 
    });
  }

  try {
    // Kiểm tra đăng nhập
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ 
        success: false,
        message: "Vui lòng đăng nhập" 
      });
    }

    // Lấy thông tin ứng viên
    const ungVien = await getUngVienInfo(session.user.email);
    if (!ungVien) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin ứng viên"
      });
    }

    // Lấy và kiểm tra dữ liệu đầu vào
    const { tenUngVien, sdt, ngaySinh, diaChi } = req.body;
    const validationErrors = validateInput({ tenUngVien, sdt, ngaySinh, diaChi });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: validationErrors
      });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateFields = {
      TenUngVien: tenUngVien?.trim(),
      SDT: sdt,
      NgaySinh: ngaySinh,
      DiaChi: diaChi?.trim()
    };

    // Thực hiện cập nhật
    const updated = await updateUngVien(ungVien.MaUngVien, updateFields);
    
    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Không thể cập nhật thông tin"
      });
    }

    // Trả về kết quả thành công
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        maUngVien: ungVien.MaUngVien,
        ...updateFields
      },
      redirectUrl: '/ungvien/taikhoanUngVien' 
    });

  } catch (error) {
    console.error("Lỗi API:", error);
    
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra, vui lòng thử lại sau",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}