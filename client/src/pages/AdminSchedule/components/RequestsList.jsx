import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiClock, FiCalendar, FiUser, FiCheckCircle, FiXCircle, FiMessageSquare } from 'react-icons/fi';
import styles from '../AdminSchedule.module.css';

const RequestsList = ({ onRefresh }) => {
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [dayOffRequests, setDayOffRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [scheduleRes, dayOffRes] = await Promise.all([
        axios.get('/api/schedule-management/pending-schedule-requests'),
        axios.get('/api/schedule-management/pending-dayoff-requests')
      ]);
      setScheduleRequests(scheduleRes.data);
      setDayOffRequests(dayOffRes.data);
    } catch (error) {
      console.error('Ошибка загрузки запросов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSchedule = async (id) => {
    try {
      await axios.post(`/api/schedule-management/approve-schedule/${id}`);
      alert('Запрос утвержден');
      fetchRequests();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при утверждении');
    }
  };

  const handleRejectSchedule = async (id) => {
    if (!rejectionReason) {
      alert('Укажите причину отказа');
      return;
    }
    try {
      await axios.post(`/api/schedule-management/reject-schedule/${id}`, { rejectionReason });
      alert('Запрос отклонен');
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при отклонении');
    }
  };

  const handleApproveDayOff = async (id) => {
    try {
      await axios.post(`/api/schedule-management/approve-dayoff/${id}`);
      alert('Запрос на пропуск утвержден');
      fetchRequests();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при утверждении');
    }
  };

  const handleRejectDayOff = async (id) => {
    if (!rejectionReason) {
      alert('Укажите причину отказа');
      return;
    }
    try {
      await axios.post(`/api/schedule-management/reject-dayoff/${id}`, { rejectionReason });
      alert('Запрос на пропуск отклонен');
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при отклонении');
    }
  };

  if (loading) return <div className={styles.loading}>Загрузка запросов...</div>;

  return (
    <div className={styles.requests_container}>
      <div className={styles.requests_section}>
        <h3><FiClock /> Запросы на изменение расписания</h3>
        {scheduleRequests.length === 0 ? (
          <div className={styles.empty}>Нет ожидающих запросов</div>
        ) : (
          scheduleRequests.map(request => (
            <div key={request.id} className={styles.request_card}>
              <div className={styles.request_header}>
                <strong><FiUser /> {request.Master?.User?.firstName} {request.Master?.User?.lastName}</strong>
                <span className={styles.pending_badge}>Ожидает</span>
              </div>
              <div className={styles.request_body}>
                <p><FiCalendar /> Запрос на изменение расписания</p>
                <p>Дата создания: {new Date(request.createdAt).toLocaleString()}</p>
              </div>
              <div className={styles.request_actions}>
                <button
                  onClick={() => handleApproveSchedule(request.id)}
                  className={styles.approve_btn}
                >
                  <FiCheckCircle /> Подтвердить
                </button>
                <button
                  onClick={() => setSelectedRequest(request.id)}
                  className={styles.reject_btn}
                >
                  <FiXCircle /> Отклонить
                </button>
              </div>
              
              {selectedRequest === request.id && (
                <div className={styles.rejection_modal}>
                  <textarea
                    placeholder="Укажите причину отказа..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                  />
                  <div className={styles.rejection_actions}>
                    <button onClick={() => handleRejectSchedule(request.id)}>Подтвердить отказ</button>
                    <button onClick={() => setSelectedRequest(null)}>Отмена</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className={styles.requests_section}>
        <h3><FiCalendar /> Запросы на пропуск дня</h3>
        {dayOffRequests.length === 0 ? (
          <div className={styles.empty}>Нет ожидающих запросов</div>
        ) : (
          dayOffRequests.map(request => (
            <div key={request.id} className={styles.request_card}>
              <div className={styles.request_header}>
                <strong><FiUser /> {request.Master?.User?.firstName} {request.Master?.User?.lastName}</strong>
                <span className={styles.pending_badge}>Ожидает</span>
              </div>
              <div className={styles.request_body}>
                <p><FiCalendar /> Дата: {new Date(request.date).toLocaleDateString()}</p>
                <p>Тип: {request.type === 'vacation' ? 'Отпуск' : request.type === 'sick' ? 'Больничный' : request.type === 'holiday' ? 'Праздник' : 'Личное'}</p>
                <p><FiMessageSquare /> Причина: {request.reason}</p>
              </div>
              <div className={styles.request_actions}>
                <button
                  onClick={() => handleApproveDayOff(request.id)}
                  className={styles.approve_btn}
                >
                  <FiCheckCircle /> Подтвердить
                </button>
                <button
                  onClick={() => setSelectedRequest(`dayoff-${request.id}`)}
                  className={styles.reject_btn}
                >
                  <FiXCircle /> Отклонить
                </button>
              </div>
              
              {selectedRequest === `dayoff-${request.id}` && (
                <div className={styles.rejection_modal}>
                  <textarea
                    placeholder="Укажите причину отказа..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                  />
                  <div className={styles.rejection_actions}>
                    <button onClick={() => handleRejectDayOff(request.id)}>Подтвердить отказ</button>
                    <button onClick={() => setSelectedRequest(null)}>Отмена</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestsList;