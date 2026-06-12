import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  FiUser,
  FiHeart,
  FiCalendar,
  FiTrash2,
  FiClock,
  FiDollarSign,
  FiUserCheck,
  FiPhone,
  FiMail,
  FiLock,
} from 'react-icons/fi';

import styles from './Profile.module.css';
import { API_URL } from '../../config';

const STATUS_CONFIG = {
  pending: {
    text: 'Ожидает подтверждения',
    color: '#ffc107',
  },
  confirmed: {
    text: 'Подтверждена',
    color: '#28a745',
  },
  cancelled: {
    text: 'Отменена',
    color: '#dc3545',
  },
  completed: {
    text: 'Завершена',
    color: '#17a2b8',
  },
};

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  birthDate: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const FavoriteCard = memo(({ favorite, onRemove }) => {
  const service = favorite.Service;

  return (
    <div className={styles.favorite_card}>
      {service?.photo && (
        <div className={styles.image_wrapper}>
          <img
            src={`${API_URL}/uploads/${service.photo}`}
            alt={service.name}
          />
        </div>
      )}

      <div className={styles.card_content}>
        <h3>{service?.name}</h3>

        <p className={styles.description}>
          {service?.description?.substring(0, 100)}...
        </p>

        <div className={styles.card_details}>
          <span>
            <FiClock /> {service?.duration} мин
          </span>

          <span>
            <FiDollarSign /> {service?.price} ₽
          </span>
        </div>

        <div className={styles.card_actions}>
          <Link to={`/services/${service?.id}`}>
            <button className={styles.details_btn}>
              Подробнее
            </button>
          </Link>

          <button
            className={styles.remove_btn}
            onClick={() => onRemove(service?.id)}
          >
            <FiTrash2 /> Удалить
          </button>
        </div>
      </div>
    </div>
  );
});

const AppointmentCard = memo(({ appointment, onCancel }) => {
  const appointmentDate = new Date(appointment.dateTime);

  const isPast = appointmentDate < new Date();

  const canCancel =
    appointment.status !== 'cancelled' &&
    appointment.status !== 'completed' &&
    !isPast;

  const status =
    STATUS_CONFIG[appointment.status] || {
      text: appointment.status,
      color: '#6c757d',
    };

  return (
    <div className={styles.appointment_card}>
      <div className={styles.appointment_header}>
        <h3>{appointment.Service?.name || 'Услуга'}</h3>

        <span
          className={styles.status}
          style={{ backgroundColor: status.color }}
        >
          {status.text}
        </span>
      </div>

      <div className={styles.appointment_details}>
        <div className={styles.detail_item}>
          <FiUserCheck />
          <span>
            Мастер:{' '}
            {appointment.Master?.User?.firstName}{' '}
            {appointment.Master?.User?.lastName}
          </span>
        </div>

        <div className={styles.detail_item}>
          <FiCalendar />
          <span>
            Дата:{' '}
            {appointmentDate.toLocaleDateString('ru-RU')}
          </span>
        </div>

        <div className={styles.detail_item}>
          <FiClock />
          <span>
            Время:{' '}
            {appointmentDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className={styles.detail_item}>
          <FiClock />
          <span>
            Длительность:{' '}
            {appointment.Service?.duration} минут
          </span>
        </div>

        <div className={styles.detail_item}>
          <FiDollarSign />
          <span>
            Цена: {appointment.Service?.price} ₽
          </span>
        </div>
      </div>

      {canCancel && (
        <div className={styles.appointment_actions}>
          <button
            className={styles.cancel_btn}
            onClick={() => onCancel(appointment.id)}
          >
            <FiTrash2 /> Отменить запись
          </button>
        </div>
      )}

      {isPast &&
        appointment.status !== 'cancelled' &&
        appointment.status !== 'completed' && (
          <div className={styles.past_notice}>
            <small>Запись просрочена</small>
          </div>
        )}
    </div>
  );
});

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState(
    INITIAL_FORM_STATE
  );

  const [favorites, setFavorites] = useState([]);

  const [appointments, setAppointments] = useState([]);

  const [notification, setNotification] = useState({
    type: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const showNotification = useCallback(
    (type, message) => {
      setNotification({ type, message });

      setTimeout(() => {
        setNotification({
          type: '',
          message: '',
        });
      }, 3000);
    },
    []
  );

  useEffect(() => {
    if (!user) return;

    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      birthDate: user.birthDate
        ? user.birthDate.split('T')[0]
        : '',
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
    });
  }, [user]);

  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/favorites');

      setFavorites(data);
    } catch (error) {
      console.error(
        'Ошибка загрузки избранного:',
        error
      );
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(
        '/api/appointments/me'
      );

      // Сортировка записей от новых к старым (по убыванию даты)
      const sortedAppointments = data.sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime);
      });

      setAppointments(sortedAppointments);
    } catch (error) {
      console.error(
        'Ошибка загрузки записей:',
        error
      );
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
    fetchAppointments();
  }, [fetchFavorites, fetchAppointments]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.password &&
      formData.password !==
        formData.confirmPassword
    ) {
      showNotification(
        'error',
        'Пароли не совпадают'
      );

      return;
    }

    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.birthDate,
      phone: formData.phone,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      setLoading(true);

      await updateProfile(updateData);

      showNotification(
        'success',
        'Профиль успешно обновлен'
      );

      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (error) {
      showNotification(
        'error',
        error.response?.data?.error ||
          'Ошибка обновления профиля'
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (serviceId) => {
    try {
      await axios.delete(
        `/api/favorites/${serviceId}`
      );

      setFavorites((prev) =>
        prev.filter(
          (item) => item.Service?.id !== serviceId
        )
      );

      showNotification(
        'success',
        'Удалено из избранного'
      );
    } catch (error) {
      console.error(
        'Ошибка удаления из избранного:',
        error
      );

      showNotification(
        'error',
        'Ошибка удаления'
      );
    }
  };

  const cancelAppointment = async (id) => {
    const confirmed = window.confirm(
      'Вы уверены, что хотите отменить эту запись?'
    );

    if (!confirmed) return;

    try {
      await axios.put(
        `/api/appointments/${id}/cancel`
      );

      setAppointments((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'cancelled' }
            : item
        )
      );

      showNotification(
        'success',
        'Запись успешно отменена'
      );
    } catch (error) {
      console.error(
        'Ошибка отмены записи:',
        error
      );

      showNotification(
        'error',
        'Не удалось отменить запись'
      );
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Личный кабинет
      </h2>

      {notification.message && (
        <div
          className={
            notification.type === 'success'
              ? styles.success
              : styles.error
          }
        >
          {notification.message}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === 'profile'
              ? styles.active
              : ''
          }`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser /> Мои данные
        </button>

        <button
          className={`${styles.tab} ${
            activeTab === 'favorites'
              ? styles.active
              : ''
          }`}
          onClick={() => setActiveTab('favorites')}
        >
          <FiHeart /> Избранное
        </button>

        <button
          className={`${styles.tab} ${
            activeTab === 'appointments'
              ? styles.active
              : ''
          }`}
          onClick={() =>
            setActiveTab('appointments')
          }
        >
          <FiCalendar /> Мои записи
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className={styles.profile_card}>
          <form onSubmit={handleSubmit}>
            <div className={styles.form_grid}>
              <div className={styles.form_group}>
                <label>
                  <FiUser /> Имя
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.form_group}>
                <label>
                  <FiUser /> Фамилия
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.form_group}>
                <label>
                  <FiCalendar /> Дата рождения
                </label>

                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.form_group}>
                <label>
                  <FiPhone /> Телефон
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.form_group}>
                <label>
                  <FiMail /> Почта
                </label>

                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={
                    styles.disabled_input
                  }
                />
              </div>
<br />
              <div className={styles.form_group}>
                <label>
                  <FiLock /> Новый пароль
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Оставьте пустым, если не меняете"
                />
              </div>

              <div className={styles.form_group}>
                <label>
                  <FiLock /> Подтверждение пароля
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.save_btn}
              disabled={loading}
            >
              {loading
                ? 'Сохранение...'
                : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            <div className={styles.empty_state}>
              <FiHeart
                className={styles.empty_icon}
              />

              <p>
                У вас пока нет избранных услуг
              </p>

              <Link to="/services">
                <button
                  className={styles.empty_btn}
                >
                  Перейти к каталогу услуг
                </button>
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {favorites.map((favorite) => (
                <FavoriteCard
                  key={favorite.id}
                  favorite={favorite}
                  onRemove={removeFavorite}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'appointments' && (
        <>
          {appointments.length === 0 ? (
            <div className={styles.empty_state}>
              <FiCalendar
                className={styles.empty_icon}
              />

              <p>
                У вас пока нет записей
              </p>

              <Link to="/services">
                <button
                  className={styles.empty_btn}
                >
                  Записаться на услугу
                </button>
              </Link>
            </div>
          ) : (
            <div
              className={
                styles.appointments_list
              }
            >
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={cancelAppointment}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;