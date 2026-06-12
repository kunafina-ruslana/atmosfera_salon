import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { FiHeart, FiClock, FiDollarSign, FiTag, FiUser, FiCalendar, FiStar, FiArrowLeft } from 'react-icons/fi';
import styles from './ServiceDetails.module.css';

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [masters, setMasters] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchService();
    fetchMasters();
    if (user) checkFavorite();
  }, [id, user]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`/api/services/${id}`);
      setService(response.data);
    } catch (error) {
      console.error('Ошибка загрузки услуги:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const response = await axios.get(`/api/services/${id}/masters`);
      setMasters(response.data);
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await axios.get('/api/favorites');
      setIsFavorite(response.data.some(fav => fav.serviceId === parseInt(id)));
    } catch (error) {
      console.error('Ошибка проверки избранного:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await axios.delete(`/api/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await axios.post('/api/favorites', { serviceId: id });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Ошибка изменения избранного:', error);
    }
  };

  const handleBook = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/booking?serviceId=${id}`);
    }
  };

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loading}>Загрузка...</div>
    </div>
  );

  if (!service) return (
    <div className={styles.container}>
      <div className={styles.notFound}>Услуга не найдена</div>
    </div>
  );

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        <FiArrowLeft /> Назад
      </button>

      <div className={styles.serviceCard}>

        {service.photo && (
          <div className={styles.imageWrapper}>
            <img
              src={`http://localhost:5000/uploads/services/${service.photo}`}
              alt={service.name}
              className={styles.serviceImage}
            />
          </div>
        )}

        <div className={styles.serviceInfo}>

          <div className={styles.serviceHeader}>
            <h1 className={styles.serviceTitle}>
              {service.name}
            </h1>

            {user && (
              <button
                onClick={toggleFavorite}
                className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
              >
                <FiHeart />
                {isFavorite ? 'В избранном' : 'В избранное'}
              </button>
            )}
          </div>

          <div className={styles.description}>
            <p>{service.description}</p>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span>
                <strong>Категория:</strong> {service.Category?.name}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span>
                <strong>Длительность:</strong> {service.duration} минут
              </span>
            </div>

            <div className={styles.infoItem}>
              <span>
                <strong>Стоимость:</strong> от {service.price} ₽
              </span>
            </div>
          </div>

          <div className={styles.mastersSection}>
            <h3>Доступные мастера</h3>

            {masters.length === 0 ? (
              <div className={styles.noMasters}>
                Нет доступных мастеров
              </div>
            ) : (
              <div className={styles.mastersGrid}>
                {masters.map(master => (
                  <div key={master.id} className={styles.masterCard}>
                    <div className={styles.masterInfo}>
                      <h4>
                        {master.User.firstName} {master.User.lastName}
                      </h4>

                      <p className={styles.masterBio}>
                        Топ-мастер
                      </p>

                      <div className={styles.masterRating}>
                        <FiStar />
                        <span>5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.bookingSection}>
            <button onClick={handleBook} className={styles.bookBtn}>
              Записаться на услугу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;