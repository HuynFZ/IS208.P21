export default async function handler(req, res) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    switch (req.method) {
      case 'GET':
        // Lấy tất cả ngành nghề (bao gồm cả ngừng hoạt động)
        const [allCategories] = await connection.execute(
          'SELECT * FROM NGANH_NGHE ORDER BY NgayTao DESC'
        );
        res.status(200).json({ success: true, data: allCategories });
        break;

      case 'POST':
        // Thêm ngành nghề mới
        const { tenNganhNghe, moTa } = req.body;
        
        // Tạo mã ngành nghề tự động
        const [lastCategory] = await connection.execute(
          'SELECT MaNganhNghe FROM NGANH_NGHE ORDER BY MaNganhNghe DESC LIMIT 1'
        );
        
        let newMaNganhNghe = 'NN001';
        if (lastCategory.length > 0) {
          const lastNumber = parseInt(lastCategory[0].MaNganhNghe.slice(2));
          newMaNganhNghe = `NN${String(lastNumber + 1).padStart(3, '0')}`;
        }

        await connection.execute(
          'INSERT INTO NGANH_NGHE (MaNganhNghe, TenNganhNghe, MoTa) VALUES (?, ?, ?)',
          [newMaNganhNghe, tenNganhNghe, moTa]
        );
        
        res.status(201).json({ 
          success: true, 
          message: 'Thêm ngành nghề thành công',
          data: { MaNganhNghe: newMaNganhNghe }
        });
        break;

      case 'PUT':
        // Cập nhật ngành nghề
        const { maNganhNghe, tenNganhNghe: newTenNganhNghe, moTa: newMoTa, trangThai } = req.body;
        
        await connection.execute(
          'UPDATE NGANH_NGHE SET TenNganhNghe = ?, MoTa = ?, TrangThai = ? WHERE MaNganhNghe = ?',
          [newTenNganhNghe, newMoTa, trangThai, maNganhNghe]
        );
        
        res.status(200).json({ 
          success: true, 
          message: 'Cập nhật ngành nghề thành công' 
        });
        break;

      case 'DELETE':
        // Xóa mềm - chuyển trạng thái thành "Ngừng hoạt động"
        const { id } = req.query;
        
        await connection.execute(
          'UPDATE NGANH_NGHE SET TrangThai = ? WHERE MaNganhNghe = ?',
          ['Ngừng hoạt động', id]
        );
        
        res.status(200).json({ 
          success: true, 
          message: 'Xóa ngành nghề thành công' 
        });
        break;

      default:
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  } finally {
    await connection.end();
  }
}