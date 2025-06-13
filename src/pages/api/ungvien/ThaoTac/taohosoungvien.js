import { formidable } from 'formidable';
import db from "../../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false
  }
};

const parseFormData = async (req) => {
  const options = {
    maxFileSize: 5 * 1024 * 1024, // 10MB
    allowEmptyFiles: false,
    multiples: true
  };

 return new Promise((resolve, reject) => {
    const form = formidable(options);
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        // Kiểm tra lỗi file quá lớn
        if (err.code === 'LIMIT_FILE_SIZE') {
          reject(new Error('File không được vượt quá 5MB'));
          return;
        }
        reject(err);
        return;
      }

      // Đảm bảo tenHoSo là string
      const tenHoSo = fields.tenHoSo?.[0] || fields.tenHoSo || '';

      resolve({
        fields: {
          ...fields,
          tenHoSo: String(tenHoSo)  // Chuyển đổi thành string
        },
        files: {
          cv: files.cv?.[0] || files.cv,
          thuGioiThieu: files.thuGioiThieu?.[0] || files.thuGioiThieu
        }
      });
    });
  });
};

// Hàm xử lý đọc file
const readFileBuffer = async (file) => {
  if (!file) return null;
  return await fs.readFile(file.filepath);
};

// Hàm xử lý xóa file tạm
const cleanupTempFiles = async (files) => {
  for (const key in files) {
    if (files[key]?.filepath) {
      await fs.unlink(files[key].filepath).catch(console.error);
    }
  }
};

export default async function handler(req, res) {
  // Kiểm tra phương thức
  if (req.method !== 'PUT' && req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  let connection;
  try {
    // Kiểm tra đăng nhập
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: "Vui lòng đăng nhập" 
      });
    }

    // Parse form data
    const { fields, files } = await parseFormData(req);

   // Validate dữ liệu đầu vào
  if (!fields.tenHoSo || fields.tenHoSo.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Tên hồ sơ không được để trống"
    });
  }
    // Đọc nội dung file
    const cvBuffer = await readFileBuffer(files.cv);
    const thuGioiThieuBuffer = await readFileBuffer(files.thuGioiThieu);

    // Validate CV
    if (!cvBuffer) {
      return res.status(400).json({
        success: false,
        message: "CV là bắt buộc"
      });
    }
    // Hàm tạo mã hồ sơ tự động
    const generateMaHoSo = async () => {
      const [rows] = await db.query(
        "SELECT MAX(CAST(SUBSTRING(MaHoSo, 3) AS UNSIGNED)) as maxId FROM HO_SO"
      );
      const maxId = rows[0].maxId || 0;
      return `HS${String(maxId + 1).padStart(8, '0')}`;
    };

     // Kiểm tra và lấy MaUngVien
    const [ungVien] = await db.query(
      "SELECT MaUngVien FROM UNG_VIEN WHERE Email = ?",
      [session.user.email]
    );

    if (!ungVien || ungVien.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin ứng viên"
      });
    }

    // Chuẩn bị dữ liệu
    const maHoSo = await generateMaHoSo();
    const maUngVien = ungVien[0].MaUngVien; // Lấy MaUngVien từ database
    const tenHoSo = fields.tenHoSo.trim();

    // Thực hiện transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Thêm hồ sơ mới
    await connection.query(
      `INSERT INTO HO_SO (MaHoSo, MaUngVien, TenHoSo, CV, ThuGioiThieu, NgayTao) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [maHoSo, maUngVien, tenHoSo, cvBuffer, thuGioiThieuBuffer]
    );

    // Commit transaction
    await connection.commit();

    // Xóa file tạm
    await cleanupTempFiles(files);

    // Trả về kết quả thành công
    return res.status(200).json({
      success: true,
      message: "Tạo hồ sơ thành công",
      data: { maHoSo, tenHoSo }
    });

  } catch (error) {
    // Rollback nếu có lỗi và có connection
    if (connection) {
      await connection.rollback();
    }

    console.error("Lỗi tạo hồ sơ:", error);

    // Xử lý các loại lỗi
  if (error.message.includes('File không được vượt quá')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (error.code === 'ER_DATA_TOO_LONG') {
    return res.status(400).json({
      success: false,
      message: "File quá lớn để lưu vào database"
    });
  }

    // Trả về lỗi chung
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo hồ sơ"
    });

  } finally {
    // Giải phóng connection
    if (connection) {
      connection.release();
    }
  }
}