import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcrypt';
import sequelize, { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import scheduleManagementRoutes from './routes/scheduleManagementRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import {
  User,
  Category,
  Service,
  Master,
  ServiceMaster,
  Appointment,
  Favorite,
  Review,
  ScheduleOverride
} from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
const mastersDir = path.join(__dirname, 'uploads', 'masters');
const categoriesDir = path.join(__dirname, 'uploads', 'categories');
const servicesDir = path.join(__dirname, 'uploads', 'services');
const worksDir = path.join(__dirname, 'uploads', 'works');
const promotionsDir = path.join(__dirname, 'uploads', 'promotions');

const dirs = [uploadsDir, mastersDir, categoriesDir, servicesDir, worksDir, promotionsDir];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Создана директория: ${dir}`);
  }
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://atmosfera-uili.onrender.com'
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [{ model: Category, attributes: ['name'] }]
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ['firstName', 'lastName'] },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/work-photos', async (req, res) => {
  try {
    const worksDir = path.join(__dirname, 'uploads', 'works');
    if (!fs.existsSync(worksDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(worksDir);
    const photos = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)).map(file => ({
      id: file,
      imageUrl: file,
      masterName: 'Мастер',
      description: '',
      categoryId: null
    }));
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/promotions', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/masters', async (req, res) => {
  try {
    const masters = await Master.findAll({
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] }]
    });
    res.json(masters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, attributes: ['firstName', 'lastName', 'email'] },
        { model: Service },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ],
      order: [['dateTime', 'DESC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reviews/all', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Master, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }
      ]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/work-photos', async (req, res) => {
  try {
    const worksDir = path.join(__dirname, 'uploads', 'works');
    if (!fs.existsSync(worksDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(worksDir);
    const photos = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)).map((file, index) => ({
      id: index + 1,
      imageUrl: file,
      masterName: 'Мастер',
      description: '',
      categoryId: null
    }));
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/promotions', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/promotions', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/work-photos', async (req, res) => {
  try {
    const worksDir = path.join(__dirname, 'uploads', 'works');
    if (!fs.existsSync(worksDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(worksDir);
    const photos = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)).map(file => ({
      id: file,
      imageUrl: file,
      masterName: 'Мастер',
      description: '',
      categoryId: null
    }));
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schedule-management', scheduleManagementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает' });
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: err.message });
});

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const createTestAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      where: { role: 'admin' }
    });

    if (!adminExists) {
      const hashedPassword = await hashPassword('RtyFghVbn4884$**$');
      
      await User.create({
        email: 'admin@salon.com',
        password: hashedPassword,
        firstName: 'Админ',
        lastName: 'Системный',
        birthDate: '1990-01-01',
        phone: '+7 (999) 999-99-99',
        role: 'admin'
      });
    }
  } catch (error) {
    if (error.name !== 'SequelizeUniqueConstraintError') {
      console.error('Ошибка при создании администратора:', error.message);
    }
  }
};

const startServer = async () => {
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('Невозможно запустить сервер без подключения к базе данных');
    process.exit(1);
  }

  try {
    await sequelize.sync({ alter: true });
    console.log('Синхронизация моделей завершена');

    await createTestAdmin();

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });

    server.timeout = 120000;
    server.keepAliveTimeout = 120000;

  } catch (error) {
    console.error('Ошибка синхронизации базы данных:', error.message);
    process.exit(1);
  }
};

startServer();