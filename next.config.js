/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    DATABASE_CREDENTIALS:
      process.env.type == "development"
        ? {
            host: "localhost",
            user: "root",
            password: "mysql",
            connectionLimit: 100,
            port: 3306,
            database: "erp_software_db",
            multipleStatements: true,
          }
        : {
            host: "localhost",
            user: "thegaadi_root",
            password: "gaadiwala_root",
            connectionLimit: 100,
            port: 3306,
            database: "thegaadi_gaadiwala",
            multipleStatements: true,
          },
  }
};

module.exports = nextConfig;
