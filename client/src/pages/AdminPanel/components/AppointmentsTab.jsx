import React from 'react';
import axios from 'axios';
import { FiUser, FiUserCheck, FiCalendar } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const AppointmentsTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const updateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}/status`, { status });
      onRefresh();
      showMessage('Статус записи обновлен');
    } catch (err) {
      showMessage('Ошибка обновления статуса', true);
    }
  };

  return (
    <div className={styles.appointments_list}>
      {data.map(apt => (
        <div key={apt.id} className={styles.appointment_card}>
          <div className={styles.appointment_header}>
            <h4>{apt.Service?.name}</h4>
            <select 
              value={apt.status} 
              onChange={(e) => updateAppointmentStatus(apt.id, e.target.value)}
              className={styles.status_select}
            >
              <option value="pending">Ожидает</option>
              <option value="confirmed">Подтвержден</option>
              <option value="cancelled">Отменен</option>
              <option value="completed">Завершен</option>
            </select>
          </div>
          <div className={styles.appointment_details}>
            <span><FiUser /> {apt.User?.firstName} {apt.User?.lastName}</span>
            <span><FiUserCheck /> {apt.Master?.User?.firstName} {apt.Master?.User?.lastName}</span>
            <span><FiCalendar /> {new Date(apt.dateTime).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentsTab;