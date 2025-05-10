if (process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: ".env.production" });
} else {
  require("dotenv").config({ path: ".env.development" });
}

module.exports = {
  apps: [
    {
      name: "5-sprint-mission-be",
      script: "npm",
      args: "start",
      watch: false,
      env: {
        NODE_ENV: "development",
        DATABASE_URL: process.env.DATABASE_URL,
        PORT: process.env.PORT,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
      },
      env_production: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,
        PORT: process.env.PORT,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
      },
    },
  ],
};
