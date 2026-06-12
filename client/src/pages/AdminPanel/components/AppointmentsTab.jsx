// AppointmentsTab.js
import React from 'react';
import { FiClock, FiDollarSign, FiUser, FiCalendar } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const STATUS_CONFIG = {
  pending: { text: 'Ожидает', color: '#ffc107' },
  confirmed: { text: 'Подтверждена', color: '#28a745' },
  cancelled: { text: 'Отменена', color: '#dc3545' },
  completed: { text: 'Завершена', color: '#17a2b8' }
};

const AppointmentsTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const appointmentsList = Array.isArray(data) ? data : [];

  return (
    <div>
      <div className={styles.appointments_list}>
        {appointmentsList.map(appointment => {
          const appointmentDate = new Date(appointment.dateTime);
          const status = STATUS_CONFIG[appointment.status] || { text: appointment.status, color: '#6c757d' };
          
          return (
            <div key={appointment.id} className={styles.appointment_card}>
              <div className={styles.appointment_header}>
                <h3>{appointment.Service?.name || 'Услуга'}</h3>
                <span className={styles.status} style={{ backgroundColor: status.color }}>
                  {status.text}
                </span>
              </div>
              <div className={styles.appointment_details}>
                <div className={styles.detail_item}>
                  <FiUser />
                  <span>Клиент: {appointment.User?.firstName} {appointment.User?.lastName}</span>
                </div>
                <div className={styles.detail_item}>
                  <FiUser />
                  <span>Мастер: {appointment.Master?.User?.firstName} {appointment.Master?.User?.lastName}</span>
                </div>
                <div className={styles.detail_item}>
                  <FiCalendar />
                  <span>Дата: {appointmentDate.toLocaleDateString('ru-RU')}</span>
                </div>
                <div className={styles.detail_item}>
                  <FiClock />
                  <span>Время: {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={styles.detail_item}>
                  <FiClock />
                  <span>Длительность: {appointment.Service?.duration} мин</span>
                </div>
                <div className={styles.detail_item}>
                  <FiDollarSign />
                  <span>Цена: {appointment.Service?.price} ₽</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {appointmentsList.length === 0 && (
        <div className={styles.empty_state}>Нет записей</div>
      )}
    </div>
  );
};

export default AppointmentsTab;