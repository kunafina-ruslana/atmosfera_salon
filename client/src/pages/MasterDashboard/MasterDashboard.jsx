import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiCalendar,
  FiRefreshCw,
  FiClock as FiPending,
  FiCheckCircle,
  FiXCircle,
  FiCheck,
  FiTag
} from 'react-icons/fi';
import AppointmentCard from './AppointmentCard';
import styles from './MasterDashboard.module.css';

const MasterDashboard = () => {
  const { user } = useAuth();
  const [master, setMaster] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchMaster();
  }, [user]);

  useEffect(() => {
    if (master) {
      fetchAppointments();
    }
  }, [master, selectedDate]);

  const fetchMaster = async () => {
    try {
      const response = await axios.get('/api/masters');

      const currentMaster = response.data.find(
        (m) => m.userId === user.id
      );

      setMaster(currentMaster);
    } catch (error) {
      console.error(
        'Ошибка загрузки мастера:',
        error
      );
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `/api/appointments/master?masterId=${master.id}&date=${selectedDate}`
      );

      setAppointments(response.data);
    } catch (error) {
      console.error(
        'Ошибка загрузки записей:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);

    try {
      await axios.put(
        `/api/appointments/${id}/status`,
        { status }
      );

      await fetchAppointments();
    } catch (error) {
      console.error(
        'Ошибка обновления статуса:',
        error
      );
    } finally {
      setUpdating(null);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Ожидает',
          icon: FiPending,
          color: '#ffc107',
          bg: 'rgba(255, 193, 7, 0.1)'
        };

      case 'confirmed':
        return {
          text: 'Подтвержден',
          icon: FiCheckCircle,
          color: '#28a745',
          bg: 'rgba(40, 167, 69, 0.1)'
        };

      case 'cancelled':
        return {
          text: 'Отменен',
          icon: FiXCircle,
          color: '#dc3545',
          bg: 'rgba(220, 53, 69, 0.1)'
        };

      case 'completed':
        return {
          text: 'Завершен',
          icon: FiCheck,
          color: '#17a2b8',
          bg: 'rgba(23, 162, 184, 0.1)'
        };

      default:
        return {
          text: status,
          icon: FiTag,
          color: '#999',
          bg: 'rgba(153, 153, 153, 0.1)'
        };
    }
  };

  const getDateTitle = () => {
    const date = new Date(selectedDate);

    const today = new Date();

    const tomorrow = new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    if (
      date.toDateString() ===
      today.toDateString()
    ) {
      return 'Сегодня';
    }

    if (
      date.toDateString() ===
      tomorrow.toDateString()
    ) {
      return 'Завтра';
    }

    return date.toLocaleDateString(
      'ru-RU',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );
  };

  const getTimeOfDay = (time) => {
    const hour = new Date(time).getHours();

    if (hour < 12) return 'Утро';

    if (hour < 18) return 'День';

    return 'Вечер';
  };

  const pendingCount = appointments.filter(
    (a) => a.status === 'pending'
  ).length;

  const confirmedCount = appointments.filter(
    (a) => a.status === 'confirmed'
  ).length;

  if (!master) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Загрузка данных мастера...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Расписание
        </h1>
      </div>

      <div className={styles.dateSelector}>
        <label>
          <FiCalendar />
          Выберите дату
        </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) =>
            setSelectedDate(e.target.value)
          }
          className={styles.dateInput}
        />
      </div>

      <div className={styles.dashboardCard}>
        <div className={styles.dateSection}>
          <div className={styles.dateTitle}>
            {getDateTitle()}
          </div>

          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statCount}>
                {appointments.length}
              </span>

              <span className={styles.statLabel}>
                всего записей
              </span>
            </div>

            <div className={styles.stat}>
              <span className={styles.statCount}>
                {pendingCount}
              </span>

              <span className={styles.statLabel}>
                ожидают
              </span>
            </div>

            <div className={styles.stat}>
              <span className={styles.statCount}>
                {confirmedCount}
              </span>

              <span className={styles.statLabel}>
                подтверждены
              </span>
            </div>
          </div>
        </div>

        {loading && (
          <div className={styles.loadingState}>
            <FiRefreshCw className={styles.spin} />

            <span>
              Загрузка записей...
            </span>
          </div>
        )}

        {!loading &&
          appointments.length === 0 && (
            <div className={styles.emptyState}>
              <FiCalendar
                className={styles.emptyIcon}
              />

              <p>
                Нет записей на выбранную дату
              </p>

              <span
                className={styles.emptyHint}
              >
                Выберите другую дату для
                просмотра записей
              </span>
            </div>
          )}

        {!loading &&
          appointments.length > 0 && (
            <div
              className={styles.appointmentsList}
            >
              {appointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  updateStatus={updateStatus}
                  updating={updating}
                  getStatusInfo={getStatusInfo}
                  getTimeOfDay={getTimeOfDay}
                  styles={styles}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default MasterDashboard;