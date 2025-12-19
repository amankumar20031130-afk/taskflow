import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface EnvConfig {
    MONGO_URI: string;
    JWT_SECRET: string;
    PORT: number;
    NODE_ENV: string;
    CLIENT_URL: string;
}

const env: EnvConfig = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://amankumar20031130_db_user:vmjMjyYtQeno721b@cluster0.fzx2zi8.mongodb.net/?appName=Cluster0',
    JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_URL: process.env.CLIENT_URL || 'https://taskflow-seven-iota.vercel.app'
};

export default env;