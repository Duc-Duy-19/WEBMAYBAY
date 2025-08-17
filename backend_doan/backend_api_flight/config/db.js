const sql = require("mssql/msnodesqlv8");

const dbName = "HETHONGQLBANVEMB";
const config = {
  database: dbName,
  server: "ADMIN-PC\\SQLEXPRESS",
  connectionString: `Driver={ODBC Driver 18 for SQL Server};Server=ADMIN-PC\\SQLEXPRESS;Database=${dbName};Trusted_Connection=yes;TrustServerCertificate=yes;`,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const connectDB = () => {
  return sql
    .connect(config)
    .then(() => {
      console.log("✅ Kết nối CSDL thành công");
      return sql.query`SELECT DB_NAME() AS CurrentDatabase`;
    })
    .then((result) => {
      console.log(
        "Database đang sử dụng:",
        result.recordset[0].CurrentDatabase
      );
    })
    .catch((err) => {
      console.error("❌ Kết nối CSDL thất bại", err);
      throw err;
    });
};

module.exports = {
  sql,
  connectDB,
};
