import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiCalendar } from 'react-icons/fi';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          error = 'Поле обязательно для заполнения';
        } else if (value.length > 30) {
          error = 'Не более 30 символов';
        } else if (!/^[A-Za-zА-Яа-яЁё]+$/.test(value)) {
          error = 'Только буквы';
        }
        break;

      case 'birthDate':
        if (!value) {
          error = 'Дата рождения обязательна';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < 10) {
            error = 'Возраст должен быть не менее 10 лет';
          } else if (age > 120) {
            error = 'Возраст не может быть более 120 лет';
          }
        }
        break;

      case 'phone':
        if (!value) {
          error = 'Телефон обязателен';
        } else if (!/^[\d\s+()-]{10,20}$/.test(value)) {
          error = 'Введите корректный номер телефона';
        }
        break;

      case 'email':
        if (!value) {
          error = 'Email обязателен';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Введите корректный email';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Пароль обязателен';
        } else if (value.length < 6) {
          error = 'Пароль должен быть не менее 6 символов';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Подтвердите пароль';
        } else if (value !== formData.password) {
          error = 'Пароли не совпадают';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    const errorMsg = validateField(name, value);
    setFieldErrors({ ...fieldErrors, [name]: errorMsg });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    setFieldErrors({ ...fieldErrors, [name]: errorMsg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const errors = {};
    Object.keys(formData).forEach(key => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) errors[key] = errorMsg;
    });
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Регистрация</h2>
          <p>Создайте новый аккаунт</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.form_row}>
            <div className={styles.form_group}>
              <label>Имя</label>
              <div className={styles.input_wrapper}>
                <FiUser className={styles.input_icon} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Иван"
                  className={fieldErrors.firstName ? styles.error_input : ''}
                  required
                />
              </div>
              {fieldErrors.firstName && <span className={styles.field_error}>{fieldErrors.firstName}</span>}
            </div>

            <div className={styles.form_group}>
              <label>Фамилия</label>
              <div className={styles.input_wrapper}>
                <FiUser className={styles.input_icon} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Иванов"
                  className={fieldErrors.lastName ? styles.error_input : ''}
                  required
                />
              </div>
              {fieldErrors.lastName && <span className={styles.field_error}>{fieldErrors.lastName}</span>}
            </div>
          </div>

          <div className={styles.form_row}>
            <div className={styles.form_group}>
              <label>Дата рождения</label>
              <div className={styles.input_wrapper}>
                <FiCalendar className={styles.input_icon} />
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.birthDate ? styles.error_input : ''}
                  required
                />
              </div>
              {fieldErrors.birthDate && <span className={styles.field_error}>{fieldErrors.birthDate}</span>}
            </div>

            <div className={styles.form_group}>
              <label>Телефон</label>
              <div className={styles.input_wrapper}>
                <FiPhone className={styles.input_icon} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+7 (999) 123-45-67"
                  className={fieldErrors.phone ? styles.error_input : ''}
                  required
                />
              </div>
              {fieldErrors.phone && <span className={styles.field_error}>{fieldErrors.phone}</span>}
            </div>
          </div>

          <div className={styles.form_group}>
            <label>Email</label>
            <div className={styles.input_wrapper}>
              <FiMail className={styles.input_icon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="example@mail.com"
                className={fieldErrors.email ? styles.error_input : ''}
                required
              />
            </div>
            {fieldErrors.email && <span className={styles.field_error}>{fieldErrors.email}</span>}
          </div>

          <div className={styles.form_group}>
            <label>Пароль</label>
            <div className={styles.input_wrapper}>
              <FiLock className={styles.input_icon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Минимум 6 символов"
                className={fieldErrors.password ? styles.error_input : ''}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.toggle_password}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {fieldErrors.password && <span className={styles.field_error}>{fieldErrors.password}</span>}
          </div>

          <div className={styles.form_group}>
            <label>Подтверждение пароля</label>
            <div className={styles.input_wrapper}>
              <FiLock className={styles.input_icon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Подтвердите пароль"
                className={fieldErrors.confirmPassword ? styles.error_input : ''}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.toggle_password}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <span className={styles.field_error}>{fieldErrors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.register_btn}>
            Зарегистрироваться
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;