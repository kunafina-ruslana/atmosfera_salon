import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiUser, FiClock, FiBriefcase, FiCheckCircle, FiXCircle, FiEye, FiEdit2, FiSave, FiPlus, FiTrash2, FiSun, FiMoon, FiCoffee, FiEyeOff } from 'react-icons/fi';
import styles from './AdminSchedule.module.css';

const RequestsList = ({ onRefresh }) => {
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [dayOffRequests, setDayOffRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedScheduleRequest, setSelectedScheduleRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewScheduleData, setViewScheduleData] = useState(null);

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

  const viewScheduleProposal = (request) => {
    setSelectedScheduleRequest(request);
    setViewScheduleData(request.scheduleData);
  };

  const renderWeekSchedule = (scheduleData) => {
    if (!scheduleData || !scheduleData.weekSchedule) return null;
    
    const days = [
      { id: 'monday', label: 'Понедельник' },
      { id: 'tuesday', label: 'Вторник' },
      { id: 'wednesday', label: 'Среда' },
      { id: 'thursday', label: 'Четверг' },
      { id: 'friday', label: 'Пятница' },
      { id: 'saturday', label: 'Суббота' },
      { id: 'sunday', label: 'Воскресенье' }
    ];
    
    return (
      <div className={styles.proposal_schedule}>
        <h4>Предлагаемое расписание:</h4>
        <div className={styles.week_schedule_preview}>
          {days.map(day => {
            const dayData = scheduleData.weekSchedule[day.id];
            return (
              <div key={day.id} className={styles.preview_day}>
                <strong>{day.label}</strong>
                {dayData?.isWorking ? (
                  <div className={styles.preview_working}>
                    <div>{dayData.start} - {dayData.end}</div>
                    {dayData.breakStart && dayData.breakEnd && (
                      <div className={styles.preview_break}>Обед: {dayData.breakStart} - {dayData.breakEnd}</div>
                    )}
                  </div>
                ) : (
                  <div className={styles.preview_dayoff}>Выходной</div>
                )}
              </div>
            );
          })}
        </div>
        {scheduleData.techBreakMinutes && (
          <div className={styles.preview_tech_break}>
            Технический перерыв: {scheduleData.techBreakMinutes} минут
          </div>
        )}
      </div>
    );
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
                <button onClick={() => viewScheduleProposal(request)} className={styles.view_btn}>
                  <FiEye /> Просмотреть предложение
                </button>
                <button onClick={() => handleApproveSchedule(request.id)} className={styles.approve_btn}>
                  <FiCheckCircle /> Подтвердить
                </button>
                <button onClick={() => setSelectedRequest(request.id)} className={styles.reject_btn}>
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
                <p>Причина: {request.reason}</p>
              </div>
              <div className={styles.request_actions}>
                <button onClick={() => handleApproveDayOff(request.id)} className={styles.approve_btn}>
                  <FiCheckCircle /> Подтвердить
                </button>
                <button onClick={() => setSelectedRequest(`dayoff-${request.id}`)} className={styles.reject_btn}>
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

      {selectedScheduleRequest && viewScheduleData && (
        <div className={styles.modal_overlay} onClick={() => setSelectedScheduleRequest(null)}>
          <div className={styles.modal_content_large} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h3>Предложение мастера {selectedScheduleRequest.Master?.User?.firstName} {selectedScheduleRequest.Master?.User?.lastName}</h3>
              <button onClick={() => setSelectedScheduleRequest(null)} className={styles.close_btn}><FiXCircle /></button>
            </div>
            <div className={styles.modal_body}>
              {renderWeekSchedule(viewScheduleData)}
            </div>
            <div className={styles.modal_footer}>
              <button onClick={() => handleApproveSchedule(selectedScheduleRequest.id)} className={styles.approve_btn}>
                <FiCheckCircle /> Подтвердить
              </button>
              <button onClick={() => setSelectedRequest(selectedScheduleRequest.id)} className={styles.reject_btn}>
                <FiXCircle /> Отклонить
              </button>
              <button onClick={() => setSelectedScheduleRequest(null)} className={styles.cancel_btn}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminSchedule = () => {
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
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
  const [overrides, setOverrides] = useState([]);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    date: '',
    isDayOff: false,
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    reason: ''
  });

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    if (selectedMaster) {
      fetchSchedule();
    }
  }, [selectedMaster, selectedYear, selectedMonth]);

  const fetchMasters = async () => {
    try {
      const response = await axios.get('/api/admin/masters');
      setMasters(response.data);
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/schedule-management/master/${selectedMaster.id}/schedule`, {
        params: { year: selectedYear, month: selectedMonth }
      });
      setScheduleData(response.data);
      
      if (response.data && response.data.master && response.data.master.scheduleSettings && response.data.master.scheduleSettings.weekSchedule) {
        setWeekSchedule(response.data.master.scheduleSettings.weekSchedule);
        setTechBreak(response.data.master.scheduleSettings.techBreakMinutes || 15);
      }
      
      const existingOverrides = [];
      if (response.data.schedule) {
        Object.entries(response.data.schedule).forEach(([date, data]) => {
          if (data.type === 'override' && data.isWorking) {
            existingOverrides.push({
              date,
              isDayOff: false,
              startTime: data.start,
              endTime: data.end,
              breakStart: data.breakStart,
              breakEnd: data.breakEnd,
              reason: data.reason
            });
          } else if (data.type === 'override' && !data.isWorking) {
            existingOverrides.push({
              date,
              isDayOff: true,
              reason: data.reason
            });
          }
        });
      }
      setOverrides(existingOverrides);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      await axios.put(`/api/schedule-management/master/${selectedMaster.id}/schedule-direct`, {
        weekSchedule,
        techBreakMinutes: techBreak,
        overrides
      });
      alert('Расписание успешно сохранено');
      setEditMode(false);
      fetchSchedule();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка сохранения расписания');
    }
  };

  const handleAddOverride = () => {
    if (!overrideForm.date) {
      alert('Выберите дату');
      return;
    }
    
    setOverrides(prev => [...prev, { ...overrideForm }]);
    setOverrideForm({
      date: '',
      isDayOff: false,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: '13:00',
      breakEnd: '14:00',
      reason: ''
    });
    setShowOverrideForm(false);
  };

  const handleRemoveOverride = (index) => {
    setOverrides(prev => prev.filter((_, i) => i !== index));
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
      const override = overrides.find(o => o.date === dateStr);
      const dayOfWeek = new Date(selectedYear, selectedMonth - 1, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let displayData = dayData;
      if (override) {
        displayData = override.isDayOff 
          ? { isWorking: false, reason: override.reason }
          : { isWorking: true, start: override.startTime, end: override.endTime, breakStart: override.breakStart, breakEnd: override.breakEnd };
      }
      
      calendarDays.push(
        <div key={day} className={`${styles.calendar_day} ${isWeekend ? styles.weekend : ''} ${override ? styles.has_override : ''}`}>
          <div className={styles.day_number}>{day}</div>
          {displayData && (
            <div className={styles.day_schedule}>
              {displayData.pendingDayOff ? (
                <div className={styles.pending_badge}>Запрос на выходной</div>
              ) : displayData.isWorking ? (
                <div className={styles.working_day}>
                  <div className={styles.time_slot}>
                    <FiClock /> {displayData.start} - {displayData.end}
                  </div>
                  {displayData.breakStart && displayData.breakEnd && (
                    <div className={styles.break_slot}>
                      <FiCoffee /> {displayData.breakStart} - {displayData.breakEnd}
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.day_off}>
                  Выходной
                  {displayData.reason && <div className={styles.reason}>({displayData.reason})</div>}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return calendarDays;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Управление расписанием мастеров</h2>
      
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'schedule' ? styles.active : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <FiCalendar /> Расписание
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <FiBriefcase /> Запросы
        </button>
      </div>
      
      {activeTab === 'schedule' && (
        <>
          <div className={styles.controls}>
            <div className={styles.master_select}>
              <label><FiUser /> Мастер:</label>
              <select
                value={selectedMaster?.id || ''}
                onChange={(e) => {
                  const master = masters.find(m => m.id === parseInt(e.target.value));
                  setSelectedMaster(master);
                  setEditMode(false);
                  setOverrides([]);
                }}
              >
                <option value="">Выберите мастера</option>
                {masters.map(master => (
                  <option key={master.id} value={master.id}>
                    {master.User?.firstName} {master.User?.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.month_select}>
              <button
                onClick={() => {
                  if (selectedMonth === 1) {
                    setSelectedYear(selectedYear - 1);
                    setSelectedMonth(12);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
              >
                ←
              </button>
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
              <button
                onClick={() => {
                  if (selectedMonth === 12) {
                    setSelectedYear(selectedYear + 1);
                    setSelectedMonth(1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
              >
                →
              </button>
            </div>
            
            {selectedMaster && (
              <div className={styles.action_buttons}>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className={styles.edit_btn}>
                    <FiEdit2 /> Редактировать расписание
                  </button>
                ) : (
                  <>
                    <button onClick={handleSaveSchedule} className={styles.save_btn}>
                      <FiSave /> Сохранить
                    </button>
                    <button onClick={() => setEditMode(false)} className={styles.cancel_btn}>
                      <FiXCircle /> Отмена
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {loading ? (
            <div className={styles.loading}>Загрузка расписания...</div>
          ) : scheduleData ? (
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
              
              {editMode && (
                <div className={styles.edit_panel}>
                  <h3><FiSun /> Редактирование недельного расписания</h3>
                  
                  <div className={styles.tech_break_section}>
                    <label><FiClock /> Технический перерыв между записями:</label>
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
                        <div className={styles.day_header}>
                          <label className={styles.working_checkbox}>
                            <input
                              type="checkbox"
                              checked={weekSchedule?.[day.id]?.isWorking || false}
                              onChange={(e) => handleDayChange(day.id, 'isWorking', e.target.checked)}
                            />
                            <strong>{day.label}</strong>
                          </label>
                        </div>
                        
                        {weekSchedule?.[day.id]?.isWorking && (
                          <div className={styles.time_inputs}>
                            <div className={styles.time_group}>
                              <label>Начало работы</label>
                              <input
                                type="time"
                                value={weekSchedule[day.id].start || '09:00'}
                                onChange={(e) => handleDayChange(day.id, 'start', e.target.value)}
                              />
                            </div>
                            <div className={styles.time_group}>
                              <label>Конец работы</label>
                              <input
                                type="time"
                                value={weekSchedule[day.id].end || '18:00'}
                                onChange={(e) => handleDayChange(day.id, 'end', e.target.value)}
                              />
                            </div>
                            <div className={styles.time_group}>
                              <label><FiCoffee /> Начало обеда</label>
                              <input
                                type="time"
                                value={weekSchedule[day.id].breakStart || '13:00'}
                                onChange={(e) => handleDayChange(day.id, 'breakStart', e.target.value)}
                              />
                            </div>
                            <div className={styles.time_group}>
                              <label>Конец обеда</label>
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
                  
                  <div className={styles.overrides_section}>
                    <div className={styles.overrides_header}>
                      <h3><FiMoon /> Исключения (отпуск, больничный, изменения в конкретные дни)</h3>
                      <button onClick={() => setShowOverrideForm(true)} className={styles.add_override_btn}>
                        <FiPlus /> Добавить исключение
                      </button>
                    </div>
                    
                    <div className={styles.overrides_list}>
                      {overrides.length === 0 ? (
                        <div className={styles.empty_overrides}>Нет исключений</div>
                      ) : (
                        overrides.map((override, index) => (
                          <div key={index} className={styles.override_item}>
                            <div className={styles.override_date}>
                              <strong>{new Date(override.date).toLocaleDateString()}</strong>
                            </div>
                            <div className={styles.override_info}>
                              {override.isDayOff ? (
                                <span className={styles.dayoff_badge}>Выходной: {override.reason}</span>
                              ) : (
                                <span>Рабочий день: {override.startTime} - {override.endTime}</span>
                              )}
                            </div>
                            <button onClick={() => handleRemoveOverride(index)} className={styles.remove_override_btn}>
                              <FiTrash2 />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>Выберите мастера для просмотра расписания</div>
          )}
        </>
      )}
      
      {activeTab === 'requests' && (
        <RequestsList onRefresh={fetchSchedule} />
      )}
      
      {showOverrideForm && (
        <div className={styles.modal_overlay} onClick={() => setShowOverrideForm(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h3>Добавить исключение</h3>
              <button onClick={() => setShowOverrideForm(false)} className={styles.close_btn}><FiXCircle /></button>
            </div>
            
            <div className={styles.modal_body}>
              <div className={styles.form_group}>
                <label>Дата</label>
                <input
                  type="date"
                  value={overrideForm.date}
                  onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
                  min={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`}
                  max={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${getDaysInMonth(selectedYear, selectedMonth)}`}
                />
              </div>
              
              <div className={styles.form_group}>
                <label className={styles.checkbox_label}>
                  <input
                    type="checkbox"
                    checked={overrideForm.isDayOff}
                    onChange={(e) => setOverrideForm({ ...overrideForm, isDayOff: e.target.checked })}
                  />
                  Выходной день
                </label>
              </div>
              
              {overrideForm.isDayOff ? (
                <div className={styles.form_group}>
                  <label>Причина</label>
                  <select
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  >
                    <option value="Отпуск">Отпуск</option>
                    <option value="Больничный">Больничный</option>
                    <option value="Личное">Личное</option>
                    <option value="Праздник">Праздник</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className={styles.form_row}>
                    <div className={styles.form_group}>
                      <label>Начало работы</label>
                      <input
                        type="time"
                        value={overrideForm.startTime}
                        onChange={(e) => setOverrideForm({ ...overrideForm, startTime: e.target.value })}
                      />
                    </div>
                    <div className={styles.form_group}>
                      <label>Конец работы</label>
                      <input
                        type="time"
                        value={overrideForm.endTime}
                        onChange={(e) => setOverrideForm({ ...overrideForm, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.form_row}>
                    <div className={styles.form_group}>
                      <label>Начало обеда</label>
                      <input
                        type="time"
                        value={overrideForm.breakStart}
                        onChange={(e) => setOverrideForm({ ...overrideForm, breakStart: e.target.value })}
                      />
                    </div>
                    <div className={styles.form_group}>
                      <label>Конец обеда</label>
                      <input
                        type="time"
                        value={overrideForm.breakEnd}
                        onChange={(e) => setOverrideForm({ ...overrideForm, breakEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className={styles.modal_footer}>
              <button onClick={handleAddOverride} className={styles.save_btn}>Добавить</button>
              <button onClick={() => setShowOverrideForm(false)} className={styles.cancel_btn}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedule;