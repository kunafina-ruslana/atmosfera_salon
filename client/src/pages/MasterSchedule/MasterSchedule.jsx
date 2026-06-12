import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiClock, FiSun, FiMoon, FiSend, FiAlertCircle, FiCheckCircle, FiXCircle, FiCoffee, FiCheck, FiX } from 'react-icons/fi';
import styles from './MasterSchedule.module.css';

const MasterSchedule = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [weekSchedule, setWeekSchedule] = useState({
    monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    tuesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    thursday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    saturday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    sunday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' }
  });
  const [techBreak, setTechBreak] = useState(15);
  const [showDayOffForm, setShowDayOffForm] = useState(false);
  const [dayOffForm, setDayOffForm] = useState({
    date: '',
    type: 'personal',
    reason: ''
  });
  const [myRequests, setMyRequests] = useState({ scheduleRequests: [], dayOffRequests: [] });
  
  // Состояния для модальных окон
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    fetchSchedule();
    fetchMyRequests();
  }, [selectedYear, selectedMonth]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/schedule-management/me/schedule', {
        params: { year: selectedYear, month: selectedMonth }
      });
      setScheduleData(response.data);
      
      if (response.data && response.data.master && response.data.master.scheduleSettings && response.data.master.scheduleSettings.weekSchedule) {
        setWeekSchedule(response.data.master.scheduleSettings.weekSchedule);
        setTechBreak(response.data.master.scheduleSettings.techBreakMinutes || 15);
      }
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
      showNotification('error', 'Ошибка', 'Не удалось загрузить расписание');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get('/api/schedule-management/my-requests');
      setMyRequests(response.data);
    } catch (error) {
      console.error('Ошибка загрузки запросов:', error);
    }
  };

  const showNotification = (type, title, message) => {
    setNotificationModal({
      isOpen: true,
      type,
      title,
      message
    });
    
    // Автоматически закрыть через 3 секунды
    setTimeout(() => {
      setNotificationModal(prev => ({ ...prev, isOpen: false }));
    }, 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleSubmitSchedule = async () => {
    if (!weekSchedule) {
      showNotification('error', 'Ошибка', 'Нет данных расписания');
      return;
    }
    
    try {
      await axios.post('/api/schedule-management/me/request-schedule', {
        weekSchedule,
        techBreakMinutes: techBreak
      });
      showNotification('success', 'Запрос отправлен', 'Ваше предложение по расписанию отправлено администратору на рассмотрение');
      setEditMode(false);
      fetchMyRequests();
    } catch (error) {
      console.error('Ошибка:', error);
      showNotification('error', 'Ошибка', error.response?.data?.error || 'Не удалось отправить запрос');
    }
  };

  const handleSubmitDayOff = async () => {
    if (!dayOffForm.date || !dayOffForm.reason) {
      showNotification('error', 'Ошибка', 'Заполните все поля');
      return;
    }
    
    try {
      await axios.post('/api/schedule-management/me/request-dayoff', dayOffForm);
      showNotification('success', 'Запрос отправлен', 'Запрос на выходной день отправлен администратору на рассмотрение');
      setShowDayOffForm(false);
      setDayOffForm({ date: '', type: 'personal', reason: '' });
      fetchMyRequests();
      fetchSchedule();
    } catch (error) {
      console.error('Ошибка:', error);
      showNotification('error', 'Ошибка', error.response?.data?.error || 'Не удалось отправить запрос');
    }
  };

  const handleCancelEdit = () => {
    showConfirm('Вы уверены, что хотите отменить редактирование? Все несохраненные изменения будут потеряны.', () => {
      setEditMode(false);
      fetchSchedule();
    });
  };

  const handleDayChange = (dayId, field, value) => {
    setWeekSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));
  };

  const days = [
    { id: 'monday', label: 'Понедельник' },
    { id: 'tuesday', label: 'Вторник' },
    { id: 'wednesday', label: 'Среда' },
    { id: 'thursday', label: 'Четверг' },
    { id: 'friday', label: 'Пятница' },
    { id: 'saturday', label: 'Суббота' },
    { id: 'sunday', label: 'Воскресенье' }
  ];

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendar = () => {
    if (!scheduleData || !scheduleData.schedule) return null;
    
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const calendarDays = [];
    
    for (let i = 0; i < startOffset; i++) {
      calendarDays.push(<div key={`empty-${i}`} className={styles.calendar_empty}></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = scheduleData.schedule[dateStr];
      const dayOfWeek = new Date(selectedYear, selectedMonth - 1, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      calendarDays.push(
        <div key={day} className={`${styles.calendar_day} ${isWeekend ? styles.weekend : ''}`}>
          <div className={styles.day_number}>{day}</div>
          {dayData && (
            <div className={styles.day_schedule}>
              {dayData.pendingDayOff ? (
                <div className={styles.pending_badge}>Запрос на выходной отправлен</div>
              ) : dayData.isWorking ? (
                <div className={styles.working_day}>
                  <div><FiClock /> {dayData.start} - {dayData.end}</div>
                  {dayData.breakStart && dayData.breakEnd && (
                    <div className={styles.break_slot}><FiCoffee /> Обед: {dayData.breakStart} - {dayData.breakEnd}</div>
                  )}
                </div>
              ) : (
                <div className={styles.day_off}>
                  Выходной
                  {dayData.reason && <div>({dayData.reason})</div>}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return calendarDays;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className={styles.status_pending}><FiAlertCircle /> На рассмотрении</span>;
      case 'approved':
        return <span className={styles.status_approved}><FiCheckCircle /> Одобрено</span>;
      case 'rejected':
        return <span className={styles.status_rejected}><FiXCircle /> Отклонено</span>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Моё расписание</h2>
      
      {/* Модальное окно уведомления */}
      {notificationModal.isOpen && (
        <div className={styles.notification_overlay} onClick={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}>
          <div className={`${styles.notification_modal} ${styles[notificationModal.type]}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.notification_icon}>
              {notificationModal.type === 'success' && <FiCheckCircle />}
              {notificationModal.type === 'error' && <FiXCircle />}
              {notificationModal.type === 'warning' && <FiAlertCircle />}
            </div>
            <div className={styles.notification_content}>
              <h3>{notificationModal.title}</h3>
              <p>{notificationModal.message}</p>
            </div>
            <button 
              className={styles.notification_close}
              onClick={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {confirmModal.isOpen && (
        <div className={styles.modal_overlay} onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}>
          <div className={styles.confirm_modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirm_icon}>
              <FiAlertCircle />
            </div>
            <h3>Подтверждение действия</h3>
            <p>{confirmModal.message}</p>
            <div className={styles.confirm_actions}>
              <button 
                className={styles.confirm_btn}
                onClick={confirmModal.onConfirm}
              >
                <FiCheck /> Да, подтверждаю
              </button>
              <button 
                className={styles.cancel_btn}
                onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
              >
                <FiX /> Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.controls}>
        <div className={styles.month_select}>
          <button onClick={() => {
            if (selectedMonth === 1) {
              setSelectedYear(selectedYear - 1);
              setSelectedMonth(12);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}>←</button>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button onClick={() => {
            if (selectedMonth === 12) {
              setSelectedYear(selectedYear + 1);
              setSelectedMonth(1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}>→</button>
        </div>
        
        <div className={styles.action_buttons}>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className={styles.edit_btn}>
              Предложить расписание
            </button>
          ) : (
            <button onClick={handleCancelEdit} className={styles.cancel_edit_btn}>
              <FiX /> Отменить
            </button>
          )}
          <button onClick={() => setShowDayOffForm(true)} className={styles.edit_btn}>
            Запросить выходной
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Загрузка расписания...</div>
      ) : (
        <>
          <div className={styles.calendar}>
            <div className={styles.calendar_header}>
              {daysOfWeek.map(day => (
                <div key={day} className={styles.header_cell}>{day}</div>
              ))}
            </div>
            <div className={styles.calendar_grid}>
              {renderCalendar()}
            </div>
          </div>
          
          {editMode && weekSchedule && (
            <div className={styles.edit_panel}>
              <h3>Предложить новое расписание</h3>
              <div className={styles.tech_break}>
                <label>Технический перерыв между записями:</label>
                <input
                  type="number"
                  value={techBreak}
                  onChange={(e) => setTechBreak(parseInt(e.target.value))}
                  min="0"
                  max="60"
                />
                <span>минут</span>
              </div>
              
              <div className={styles.week_schedule}>
                {days.map(day => (
                  <div key={day.id} className={styles.day_schedule_edit}>
                    <label className={styles.working_checkbox}>
                      <input
                        type="checkbox"
                        checked={weekSchedule[day.id]?.isWorking || false}
                        onChange={(e) => handleDayChange(day.id, 'isWorking', e.target.checked)}
                      />
                      {day.label}
                    </label>
                    
                    {weekSchedule[day.id]?.isWorking && (
                      <div className={styles.time_inputs}>
                        <div>
                          <label>Начало</label>
                          <input
                            type="time"
                            value={weekSchedule[day.id].start || '09:00'}
                            onChange={(e) => handleDayChange(day.id, 'start', e.target.value)}
                          />
                        </div>
                        <div>
                          <label>Конец</label>
                          <input
                            type="time"
                            value={weekSchedule[day.id].end || '18:00'}
                            onChange={(e) => handleDayChange(day.id, 'end', e.target.value)}
                          />
                        </div>
                        <div>
                          <label>Обед с</label>
                          <input
                            type="time"
                            value={weekSchedule[day.id].breakStart || '13:00'}
                            onChange={(e) => handleDayChange(day.id, 'breakStart', e.target.value)}
                          />
                        </div>
                        <div>
                          <label>Обед до</label>
                          <input
                            type="time"
                            value={weekSchedule[day.id].breakEnd || '14:00'}
                            onChange={(e) => handleDayChange(day.id, 'breakEnd', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button onClick={handleSubmitSchedule} className={styles.submit_btn}>
                Отправить на согласование
              </button>
            </div>
          )}
          
          <div className={styles.requests_info}>
            <h3>Мои запросы</h3>
            
            <div className={styles.requests_section}>
              <h4>Запросы на изменение расписания</h4>
              {myRequests.scheduleRequests && myRequests.scheduleRequests.length === 0 ? (
                <p>Нет запросов</p>
              ) : (
                myRequests.scheduleRequests?.map(req => (
                  <div key={req.id} className={styles.request_item}>
                    <span>От {new Date(req.createdAt).toLocaleDateString()}</span>
                    {getStatusBadge(req.status)}
                    {req.status === 'rejected' && req.rejectionReason && (
                      <div className={styles.rejection_reason}>Причина: {req.rejectionReason}</div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className={styles.requests_section}>
              <h4>Запросы на пропуск дня</h4>
              {myRequests.dayOffRequests && myRequests.dayOffRequests.length === 0 ? (
                <p>Нет запросов</p>
              ) : (
                myRequests.dayOffRequests?.map(req => (
                  <div key={req.id} className={styles.request_item}>
                    <span>{new Date(req.date).toLocaleDateString()} - {req.type === 'vacation' ? 'Отпуск' : req.type === 'sick' ? 'Больничный' : 'Личное'}</span>
                    {getStatusBadge(req.status)}
                    {req.status === 'rejected' && req.rejectionReason && (
                      <div className={styles.rejection_reason}>Причина: {req.rejectionReason}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
      
      {showDayOffForm && (
        <div className={styles.modal_overlay} onClick={() => setShowDayOffForm(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h3>Запросить выходной</h3>
              <button className={styles.modal_close} onClick={() => setShowDayOffForm(false)}>
                <FiX />
              </button>
            </div>
            <div className={styles.form_group}>
              <label>Дата</label>
              <input
                type="date"
                value={dayOffForm.date}
                onChange={(e) => setDayOffForm({ ...dayOffForm, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className={styles.form_group}>
              <label>Тип</label>
              <select
                value={dayOffForm.type}
                onChange={(e) => setDayOffForm({ ...dayOffForm, type: e.target.value })}
              >
                <option value="personal">Личное</option>
                <option value="sick">Больничный</option>
                <option value="vacation">Отпуск</option>
                <option value="holiday">Праздник</option>
              </select>
            </div>
            <div className={styles.form_group}>
              <label>Причина</label>
              <textarea
                value={dayOffForm.reason}
                onChange={(e) => setDayOffForm({ ...dayOffForm, reason: e.target.value })}
                rows="3"
                placeholder="Укажите причину пропуска..."
                required
              />
            </div>
            <div className={styles.modal_actions}>
              <button onClick={handleSubmitDayOff} className={styles.submit_btn}>
                Отправить запрос
              </button>
              <button onClick={() => setShowDayOffForm(false)} className={styles.cancel_btn}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterSchedule;