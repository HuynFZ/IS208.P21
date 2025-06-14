import db from "../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      message: "Method not allowed" 
    });
  }

  let connection;
  try {
    // Kiểm tra session và role
    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session);

    if (!session || session.user.role !== "qlhoso") {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const { maHoSos, action, lyDo } = req.body;
    console.log('Request body:', { maHoSos, action, lyDo });

    // Validate input
    if (!maHoSos || !Array.isArray(maHoSos) || maHoSos.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Danh sách hồ sơ không hợp lệ" 
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: "Hành động không hợp lệ" 
      });
    }

    if (action === 'reject' && !lyDo) {
      return res.status(400).json({ 
        success: false, 
        message: "Vui lòng nhập lý do từ chối" 
      });
    }

    // Xử lý trong transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    const trangThai = action === "approve" ? "Đã duyệt" : "Đã hủy";
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Log thông tin duyệt hồ sơ
    for (const maHoSo of maHoSos) {
      await connection.query(
        `INSERT INTO DUYET_HO_SO (
          MaHoSo, 
          MaNhanVien, 
          ThoiGian, 
          TrangThaiDuyet,
          LyDo
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          maHoSo,
          session.user.id,
          currentTime,
          trangThai,
          action === 'reject' ? lyDo : null
        ]
      );

      // Cập nhật trạng thái hồ sơ
      await connection.query(
        `UPDATE HO_SO 
         SET TrangThai = ?
         WHERE MaHoSo = ?`,
        [trangThai, maHoSo]
      );
    }

    await connection.commit();
    console.log('Transaction committed successfully');

    return res.status(200).json({
      success: true,
      message: `${maHoSos.length} hồ sơ đã được ${action === "approve" ? "duyệt" : "từ chối"} thành công`
    });

  } catch (error) {
    console.error("API Error:", error);
    if (connection) {
      await connection.rollback();
      console.log('Transaction rolled back due to error');
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Có lỗi xảy ra khi xử lý yêu cầu",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
}