import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScheduleCalendar = ({ masterId, serviceId, onSlotSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (masterId && serviceId) {
      fetchSlots();
    }
  }, [masterId, serviceId, currentDate]);

  const fetchSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const response = await axios.get(`/api/schedule/slots`, {
        params: { masterId, date: dateStr, serviceId }
      });
      setSlots(response.data);
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      setError('Не удалось загрузить доступное время');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.isAvailable && !slot.isBreak) {
      setSelectedSlot(slot);
      onSlotSelect(slot);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    setSelectedSlot(null);
    onSlotSelect(null);
  };

  const getSlotStyle = (slot) => {
    if (slot.isBreak) {
      return {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
        opacity: 0.6
      };
    }
    if (!slot.isAvailable) {
      return {
        backgroundColor: '#dc3545',
        cursor: 'not-allowed',
        opacity: 0.8
      };
    }
    if (selectedSlot && selectedSlot.start === slot.start) {
      return {
        backgroundColor: '#28a745',
        cursor: 'pointer',
        border: '2px solid #155724'
      };
    }
    return {
      backgroundColor: '#28a745',
      cursor: 'pointer'
    };
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <button 
          onClick={() => changeDate(-1)}
          disabled={currentDate <= minDate}
          style={{ opacity: currentDate <= minDate ? 0.5 : 1 }}
        >
          ← Предыдущий день
        </button>
        
        <h3 style={{ margin: 0 }}>
          {currentDate.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          {isToday(currentDate) && <span style={{ color: '#28a745', marginLeft: '10px' }}>Сегодня</span>}
        </h3>
        
        <button 
          onClick={() => changeDate(1)}
          disabled={currentDate >= maxDate}
          style={{ opacity: currentDate >= maxDate ? 0.5 : 1 }}
        >
          Следующий день →
        </button>
      </div>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Загрузка доступного времени...
        </div>
      )}
      
      {error && (
        <div className="error" style={{ textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      )}
      
      {!loading && !error && slots.length > 0 && (
        <>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#28a745', borderRadius: '4px' }}></div>
              <span>Свободно</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#dc3545', borderRadius: '4px' }}></div>
              <span>Занято</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#cccccc', borderRadius: '4px' }}></div>
              <span>Перерыв</span>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
            gap: '10px' 
          }}>
            {slots.map((slot, index) => (
              <button
                key={index}
                onClick={() => handleSlotClick(slot)}
                style={{
                  ...getSlotStyle(slot),
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
                disabled={!slot.isAvailable || slot.isBreak}
              >
                {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        </>
      )}
      
      {!loading && !error && slots.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#999',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          Нет доступных слотов на выбранную дату
          <br />
          <small>Попробуйте выбрать другую дату</small>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;