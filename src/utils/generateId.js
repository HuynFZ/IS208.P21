export async function generateId(prefix, maNhaTuyenDung, db) {
  try {
    // Lấy 3 số cuối của mã nhà tuyển dụng
    const shortEmployerId = maNhaTuyenDung.slice(-3);

    let query = '';
    let tableName = '';

    // Xác định bảng cần truy vấn dựa vào prefix
    switch (prefix) {
      case 'PV':
        tableName = 'PHONG_VAN';
        query = 'MaLichPhongVan';
        break;
      case 'BT':
        tableName = 'BAI_TEST';
        query = 'MaBaiTest';
        break;
      default:
        throw new Error('Prefix không hợp lệ');
    }

    // Truy vấn số lớn nhất hiện có ứng với nhà tuyển dụng đó
    const [rows] = await db.query(
      `SELECT MAX(CAST(SUBSTRING(${query}, -5) AS UNSIGNED)) as maxNum 
       FROM ${tableName}
       WHERE MaNhaTuyenDung = ? 
       AND ${query} LIKE ?`,
      [maNhaTuyenDung, `${prefix}${shortEmployerId}%`]
    );

    const currentMax = rows[0].maxNum || 0;
    const nextNum = String(currentMax + 1).padStart(5, '0');

    return `${prefix}${shortEmployerId}${nextNum}`;
  } catch (error) {
    console.error('Generate ID Error:', error);
    throw error;
  }
}