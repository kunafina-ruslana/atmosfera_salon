import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ScheduleCalendar from '../../components/ScheduleCalendar';
import { 
  FiCheck, FiChevronLeft, FiChevronRight, FiClock, FiDollarSign, 
  FiUser, FiCalendar, FiTag, FiArrowLeft, FiArrowRight, FiCheckCircle 
} from 'react-icons/fi';
import styles from './Booking.module.css';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [masters, setMasters] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchCategories();
    const serviceId = new URLSearchParams(location.search).get('serviceId');
    if (serviceId) {
      fetchServiceDetails(serviceId);
    }
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      setError('Не удалось загрузить услуги');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/services/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const fetchServiceDetails = async (id) => {
    try {
      const response = await axios.get(`/api/services/${id}`);
      setSelectedService(response.data);
      await fetchMastersForService(id);
      setStep(2);
    } catch (error) {
      console.error('Ошибка загрузки услуги:', error);
      setError('Не удалось загрузить услугу');
    }
  };

  const fetchMastersForService = async (serviceId) => {
    try {
      const response = await axios.get(`/api/services/${serviceId}/masters`);
      setMasters(response.data);
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
      setError('Не удалось загрузить мастеров');
    }
  };

  const handleServiceSelect = async (service) => {
    setSelectedService(service);
    await fetchMastersForService(service.id);
    setStep(2);
  };

  const handleMasterSelect = (master) => {
    setSelectedMaster(master);
    setStep(3);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setError('Пожалуйста, выберите время');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/appointments', {
        serviceId: selectedService.id,
        masterId: selectedMaster.id,
        dateTime: selectedSlot.start
      });

      if (response.status === 201) {
        navigate('/appointments', {
          state: { message: 'Запись успешно создана!' }
        });
      }
    } catch (error) {
      console.error('Ошибка создания записи:', error);
      setError(error.response?.data?.error || 'Не удалось создать запись. Попробуйте другое время.');
      setSelectedSlot(null);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Без категории';
  };

  const steps = [
    { number: 1, title: 'Услуга', icon: FiTag },
    { number: 2, title: 'Мастер', icon: FiUser },
    { number: 3, title: 'Время', icon: FiCalendar },
    { number: 4, title: 'Подтверждение', icon: FiCheckCircle }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Запись на услугу</h1>
      
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.steps_container}>
        {steps.map((stepItem) => {
          const isActive = step === stepItem.number;
          const isCompleted = step > stepItem.number;
          const Icon = stepItem.icon;
          
          return (
            <div key={stepItem.number} className={styles.step_item}>
              <div className={`${styles.step_circle} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                {isCompleted ? <FiCheck /> : stepItem.number}
              </div>
              <div className={`${styles.step_label} ${isActive ? styles.active : ''}`}>
                <Icon className={styles.step_icon} />
                <span>{stepItem.title}</span>
              </div>
              {stepItem.number < 4 && <div className={styles.step_line} />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className={styles.step_content}>
          <h2 className={styles.section_title}>Выберите услугу</h2>
          <div className={styles.services_grid}>
            {services.map(service => (
              <div
                key={service.id}
                className={styles.service_card}
                onClick={() => handleServiceSelect(service)}
              >
                {service.photo && (
                  <div className={styles.service_image_wrapper}>
                    <img
                      src={`http://localhost:5000/uploads/${service.photo}`}
                      alt={service.name}
                      className={styles.service_image}
                    />
                  </div>
                )}
                <div className={styles.service_content}>
                  <h3 className={styles.service_name}>{service.name}</h3>
                  <span className={styles.service_category}>{getCategoryName(service.categoryId)}</span>
                  <p className={styles.service_description}>{service.description?.substring(0, 80)}...</p>
                  <div className={styles.service_footer}>
                    <span className={styles.service_duration}>
                      <FiClock /> {service.duration} мин
                    </span>
                    <span className={styles.service_price}>
                      <FiDollarSign /> {service.price} ₽
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedService && (
        <div className={styles.step_content}>
          <div className={styles.selected_info_card}>
            <div className={styles.selected_info_header}>
              <FiTag />
              <span>Выбранная услуга:</span>
              <strong>{selectedService.name}</strong>
            </div>
            <div className={styles.selected_info_details}>
              <span><FiClock /> {selectedService.duration} мин</span>
              <span><FiDollarSign /> {selectedService.price} ₽</span>
            </div>
            <button onClick={() => setStep(1)} className={styles.back_btn}>
              <FiArrowLeft /> Назад
            </button>
          </div>

          <h2 className={styles.section_title}>Выберите мастера</h2>
          
          {masters.length === 0 ? (
            <div className={styles.empty_state}>
              <p>Нет доступных мастеров для этой услуги</p>
              <button onClick={() => setStep(1)} className={styles.empty_btn}>
                Выбрать другую услугу
              </button>
            </div>
          ) : (
            <div className={styles.masters_grid}>
              {masters.map(master => (
                <div
                  key={master.id}
                  className={styles.master_card}
                  onClick={() => handleMasterSelect(master)}
                >
                  <div className={styles.master_avatar}>
                    {master.photo ? (
                      <img
                        src={`http://localhost:5000/uploads/${master.photo}`}
                        alt={master.User.firstName}
                      />
                    ) : (
                      <div className={styles.avatar_placeholder}>
                        <FiUser />
                      </div>
                    )}
                  </div>
                  <div className={styles.master_content}>
                    <h3>{master.User.firstName} {master.User.lastName}</h3>
                    <p>{master.bio || 'Опытный мастер'}</p>
                    <div className={styles.master_rating}>⭐ 4.8</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && selectedService && selectedMaster && (
        <div className={styles.step_content}>
          <div className={styles.selected_info_card}>
            <div className={styles.selected_info_row}>
              <div>
                <FiTag /> <span>Услуга:</span> <strong>{selectedService.name}</strong>
              </div>
              <div>
                <FiUser /> <span>Мастер:</span> <strong>{selectedMaster.User.firstName} {selectedMaster.User.lastName}</strong>
              </div>
            </div>
            <div className={styles.selected_info_details}>
              <span><FiClock /> {selectedService.duration} мин</span>
              <span><FiDollarSign /> {selectedService.price} ₽</span>
            </div>
            <button onClick={() => setStep(2)} className={styles.back_btn}>
              <FiArrowLeft /> Назад
            </button>
          </div>

          <div className={styles.calendar_wrapper}>
            <ScheduleCalendar
              masterId={selectedMaster.id}
              serviceId={selectedService.id}
              onSlotSelect={handleSlotSelect}
            />
          </div>

          {selectedSlot && (
            <div className={styles.selected_slot_card}>
              <h3><FiCalendar /> Выбранное время</h3>
              <div className={styles.slot_info}>
                <div className={styles.slot_date}>
                  {new Date(selectedSlot.start).toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className={styles.slot_time}>
                  {new Date(selectedSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(selectedSlot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button onClick={() => setStep(4)} className={styles.continue_btn}>
                Продолжить <FiArrowRight />
              </button>
            </div>
          )}
        </div>
      )}

      {step === 4 && selectedService && selectedMaster && selectedSlot && (
        <div className={styles.step_content}>
          <div className={styles.confirmation_card}>
            <h2 className={styles.confirmation_title}>
              <FiCheckCircle /> Подтверждение записи
            </h2>

            <div className={styles.confirmation_details}>
              <div className={styles.detail_row}>
                <div className={styles.detail_label}>
                  <FiTag /> Услуга
                </div>
                <div className={styles.detail_value}>{selectedService.name}</div>
              </div>
              <div className={styles.detail_row}>
                <div className={styles.detail_label}>
                  <FiClock /> Длительность
                </div>
                <div className={styles.detail_value}>{selectedService.duration} минут</div>
              </div>
              <div className={styles.detail_row}>
                <div className={styles.detail_label}>
                  <FiDollarSign /> Цена
                </div>
                <div className={styles.detail_value}>{selectedService.price} ₽</div>
              </div>
              <div className={styles.detail_row}>
                <div className={styles.detail_label}>
                  <FiUser /> Мастер
                </div>
                <div className={styles.detail_value}>
                  {selectedMaster.User.firstName} {selectedMaster.User.lastName}
                </div>
              </div>
              <div className={styles.detail_row}>
                <div className={styles.detail_label}>
                  <FiCalendar /> Дата
                </div>
                <div className={styles.detail_value}>
                  {new Date(selectedSlot.start).toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className={styles.detail_row}>
                <div className={styles.detail_label}>
                  <FiClock /> Время
                </div>
                <div className={styles.detail_value}>
                  {new Date(selectedSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(selectedSlot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className={styles.confirmation_actions}>
              <button onClick={() => setStep(3)} className={styles.back_btn_large}>
                <FiArrowLeft /> Назад
              </button>
              <button onClick={handleConfirmBooking} disabled={loading} className={styles.confirm_btn}>
                {loading ? 'Обработка...' : 'Подтвердить запись'}
                {!loading && <FiCheck />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;