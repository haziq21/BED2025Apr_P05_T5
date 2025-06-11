import "dotenv/config";
import sql from "mssql";

/**
 * The global connection pool. This can be
 * closed at the end of the app's lifecycle.
 */
export default await sql.connect({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER ?? "localhost",
  database: process.env.DB_DATABASE,
  options: {
    port: +(process.env.DB_PORT ?? 1433),
    trustServerCertificate: true,
  },
});
