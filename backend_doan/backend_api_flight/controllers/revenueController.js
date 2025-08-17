const sql = require('mssql/msnodesqlv8'); // Use mssql/msnodesqlv8 based on your db.js
const { config } = require('../config/db'); // Import config from db.js

// Get total revenue
const getTotalRevenue = async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(`
                SELECT SUM(TongTien) as TotalRevenue
                FROM HoaDon
                WHERE NgayThanhToan IS NOT NULL
            `);
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Error getting total revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get daily revenue
const getDailyRevenue = async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(`
                SELECT 
                    CAST(NgayThanhToan AS DATE) as Date,
                    SUM(TongTien) as DailyRevenue
                FROM HoaDon
                WHERE NgayThanhToan IS NOT NULL
                GROUP BY CAST(NgayThanhToan AS DATE)
                ORDER BY Date DESC
            `);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error getting daily revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get monthly and yearly revenue
const getMonthlyYearlyRevenue = async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(`
                SELECT 
                    YEAR(NgayThanhToan) as Year,
                    MONTH(NgayThanhToan) as Month,
                    SUM(TongTien) as Revenue
                FROM HoaDon
                WHERE NgayThanhToan IS NOT NULL
                GROUP BY YEAR(NgayThanhToan), MONTH(NgayThanhToan)
                ORDER BY Year DESC, Month DESC
            `);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error getting monthly/yearly revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get revenue by specific date
const getRevenueByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required'
            });
        }

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('date', sql.Date, date)
            .query(`
                SELECT 
                    h.ID_HoaDon,
                    h.NgayThanhToan,
                    h.TongTien,
                    c.HoTen as CustomerName,
                    c.SDT as CustomerPhone
                FROM HoaDon h
                JOIN Ve v ON h.ID_Ve = v.ID_Ve
                JOIN HanhKhach c ON v.ID_HanhKhach = c.ID_HanhKhach
                WHERE CAST(h.NgayThanhToan AS DATE) = @date
                ORDER BY h.NgayThanhToan DESC
            `);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error getting revenue by date:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getTotalRevenue,
    getDailyRevenue,
    getMonthlyYearlyRevenue,
    getRevenueByDate
}; 