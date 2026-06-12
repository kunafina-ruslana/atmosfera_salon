import React, { useState } from 'react';
import { FiSave, FiX, FiClock, FiCoffee, FiSun, FiMoon } from 'react-icons/fi';
import styles from '../AdminSchedule.module.css';

const ScheduleModal = ({ master, scheduleData, onClose, onSave }) => {
  const [weekSchedule, setWeekSchedule] = useState(
    scheduleData.master?.scheduleSettings?.weekSchedule || {
      monday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorking: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      sunday: { isWorking: false, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' }
    }
  );
  
  const [techBreak, setTechBreak] = useState(scheduleData.techBreakMinutes || 15);
  const [overrides, setOverrides] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [overrideForm, setOverrideForm] = useState({
    isDayOff: false,
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    reason: ''
  });

  const days = [
    { id: 'monday', label: 'Понедельник' },
    { id: 'tuesday', label: 'Вторник' },
    { id: 'wednesday', label: 'Среда' },
    { id: 'thursday', label: 'Четверг' },
    { id: 'friday', label: 'Пятница' },
    { id: 'saturday', label: 'Суббота' },
    { id: 'sunday', label: 'Воскресенье' }
  ];

  const handleDayChange = (dayId, field, value) => {
    setWeekSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));
  };

  const handleAddOverride = () => {
    if (!selectedDate) return;
    
    setOverrides(prev => [...prev, {
      date: selectedDate,
      ...overrideForm
    }]);
    setSelectedDate('');
    setOverrideForm({
      isDayOff: false,
      startTime: '09:00',
      endTime: '18:00',
      breakStart: '13:00',
      breakEnd: '14:00',
      reason: ''
    });
  };

  const handleRemoveOverride = (index) => {
    setOverrides(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSave(weekSchedule, overrides);
  };

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h3>Редактирование расписания: {master?.User?.firstName} {master?.User?.lastName}</h3>
          <button onClick={onClose} className={styles.close_btn}><FiX /></button>
        </div>
        
        <div className={styles.modal_body}>
          <div className={styles.section}>
            <h4><FiClock /> Технический перерыв</h4>
            <div className={styles.tech_break}>
              <input
                type="number"
                value={techBreak}
                onChange={(e) => setTechBreak(parseInt(e.target.value))}
                min="0"
                max="60"
              />
              <span>минут между записями</span>
            </div>
          </div>
          
          <div className={styles.section}>
            <h4><FiSun /> Расписание по дням недели</h4>
            <div className={styles.week_schedule}>
              {days.map(day => (
                <div key={day.id} className={styles.day_schedule_edit}>
                  <div className={styles.day_header}>
                    <label className={styles.working_checkbox}>
                      <input
                        type="checkbox"
                        checked={weekSchedule[day.id].isWorking}
                        onChange={(e) => handleDayChange(day.id, 'isWorking', e.target.checked)}
                      />
                      <span>{day.label}</span>
                    </label>
                  </div>
                  
                  {weekSchedule[day.id].isWorking && (
                    <div className={styles.time_inputs}>
                      <div className={styles.time_group}>
                        <label>Начало работы</label>
                        <input
                          type="time"
                          value={weekSchedule[day.id].start}
                          onChange={(e) => handleDayChange(day.id, 'start', e.target.value)}
                        />
                      </div>
                      <div className={styles.time_group}>
                        <label>Конец работы</label>
                        <input
                          type="time"
                          value={weekSchedule[day.id].end}
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
          </div>
          
          <div className={styles.section}>
            <h4><FiMoon /> Исключения (отпуск, больничный и т.д.)</h4>
            <div className={styles.overrides_list}>
              {overrides.map((override, index) => (
                <div key={index} className={styles.override_item}>
                  <span>{override.date}</span>
                  {override.isDayOff ? (
                    <span className={styles.dayoff_badge}>Выходной: {override.reason}</span>
                  ) : (
                    <span>{override.startTime} - {override.endTime}</span>
                  )}
                  <button onClick={() => handleRemoveOverride(index)} className={styles.remove_btn}><FiX /></button>
                </div>
              ))}
            </div>
            
            <div className={styles.add_override}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={styles.date_input}
              />
              <label className={styles.dayoff_checkbox}>
                <input
                  type="checkbox"
                  checked={overrideForm.isDayOff}
                  onChange={(e) => setOverrideForm(prev => ({ ...prev, isDayOff: e.target.checked }))}
                />
                Выходной
              </label>
              
              {!overrideForm.isDayOff && (
                <>
                  <input
                    type="time"
                    value={overrideForm.startTime}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className={styles.time_input}
                  />
                  <input
                    type="time"
                    value={overrideForm.endTime}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className={styles.time_input}
                  />
                </>
              )}
              
              {overrideForm.isDayOff && (
                <input
                  type="text"
                  placeholder="Причина (отпуск, больничный и т.д.)"
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                  className={styles.reason_input}
                />
              )}
              
              <button onClick={handleAddOverride} className={styles.add_btn}>Добавить</button>
            </div>
          </div>
        </div>
        
        <div className={styles.modal_footer}>
          <button onClick={handleSubmit} className={styles.save_btn}>
            <FiSave /> Сохранить расписание
          </button>
          <button onClick={onClose} className={styles.cancel_btn}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;