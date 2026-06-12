import jwt from 'jsonwebtoken';
import { User, Master } from '../models/index.js';

export const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, birthDate, phone } = req.body;
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Пароли не совпадают' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже существует' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      birthDate,
      phone
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Аккаунт заблокирован' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    birthDate: req.user.birthDate,
    phone: req.user.phone,
    role: req.user.role
  });
};

export const updateMe = async (req, res) => {
  try {
    const { firstName, lastName, birthDate, phone, password } = req.body;
    
    if (password) {
      req.user.password = password;
    }
    
    req.user.firstName = firstName || req.user.firstName;
    req.user.lastName = lastName || req.user.lastName;
    req.user.birthDate = birthDate || req.user.birthDate;
    req.user.phone = phone || req.user.phone;
    
    await req.user.save();
    
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      birthDate: req.user.birthDate,
      phone: req.user.phone,
      role: req.user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};