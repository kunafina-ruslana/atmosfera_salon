import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiSave, FiX, FiClock, FiDollarSign } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const ServicesTab = ({ data, categories, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const [serviceModal, setServiceModal] = useState({ open: false, editing: null });
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', duration: 60, price: 0, categoryId: '' });
  const [servicePhoto, setServicePhoto] = useState(null);

  useEffect(() => {
    if (modalOpen) {
      openServiceModal();
    }
  }, [modalOpen]);

  const openServiceModal = (service = null) => {
    if (service) {
      setServiceForm({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || 60,
        price: service.price || 0,
        categoryId: service.categoryId || ''
      });
      setServiceModal({ open: true, editing: service });
    } else {
      setServiceForm({ name: '', description: '', duration: 60, price: 0, categoryId: '' });
      setServiceModal({ open: true, editing: null });
    }
    setServicePhoto(null);
  };

  const closeServiceModal = () => {
    setServiceModal({ open: false, editing: null });
    setServicePhoto(null);
    if (setModalOpen) setModalOpen(false);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(serviceForm).forEach(key => formData.append(key, serviceForm[key]));
      if (servicePhoto) formData.append('photo', servicePhoto);
      
      if (serviceModal.editing) {
        await axios.put(`/api/admin/services/${serviceModal.editing.id}`, formData);
        showMessage('Услуга обновлена');
      } else {
        await axios.post('/api/admin/services', formData);
        showMessage('Услуга добавлена');
      }
      onRefresh();
      closeServiceModal();
    } catch (err) {
      showMessage('Ошибка сохранения услуги', true);
    }
  };

  const deleteService = async (id) => {
    if (window.confirm('Удалить эту услугу?')) {
      try {
        await axios.delete(`/api/admin/services/${id}`);
        onRefresh();
        showMessage('Услуга удалена');
      } catch (err) {
        showMessage('Ошибка удаления услуги', true);
      }
    }
  };

  return (
    <div>
      <div className={styles.grid}>
        {data.map(service => (
          <div key={service.id} className={styles.card}>
            {service.photo && (
              <div className={styles.card_image}>
                <img src={`http://localhost:5000/uploads/services/${service.photo}`} alt={service.name} />
              </div>
            )}
            <div className={styles.card_content}>
              <h3>{service.name}</h3>
              <p className={styles.card_description}>{service.description?.substring(0, 80)}...</p>
              <div className={styles.card_details}>
                <span><FiClock /> {service.duration} мин</span>
                <span><FiDollarSign /> {service.price} ₽</span>
              </div>
              <div className={styles.card_actions}>
                <button onClick={() => openServiceModal(service)} className={styles.edit_btn}><FiEdit2 /> Редактировать</button>
                <button onClick={() => deleteService(service.id)} className={styles.delete_btn}><FiTrash2 /> Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Встроенное модальное окно */}
      {serviceModal.open && (
        <div className={styles.modal_overlay} onClick={closeServiceModal}>
          <div className={`${styles.modal_container} ${styles.modal_medium}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2 className={styles.modal_title}>{serviceModal.editing ? 'Редактировать услугу' : 'Добавить услугу'}</h2>
              <button className={styles.modal_close} onClick={closeServiceModal}>×</button>
            </div>
            <div className={styles.modal_content}>
              <form onSubmit={handleServiceSubmit} className={styles.modal_form}>
                <div className={styles.form_group}>
                  <label>Название</label>
                  <input type="text" value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} required />
                </div>
                <div className={styles.form_group}>
                  <label>Описание</label>
                  <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} rows="4" required />
                </div>
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Длительность (мин)</label>
                    <input type="number" value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) })} required />
                  </div>
                  <div className={styles.form_group}>
                    <label>Цена (₽)</label>
                    <input type="number" step="0.01" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })} required />
                  </div>
                </div>
                <div className={styles.form_group}>
                  <label>Категория</label>
                  <select value={serviceForm.categoryId} onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })} required className={styles.select}>
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className={styles.form_group}>
                  <label>Фото</label>
                  <input type="file" onChange={(e) => setServicePhoto(e.target.files[0])} accept="image/*" />
                  {serviceModal.editing?.photo && (
                    <div className={styles.current_photo}>
                      <img src={`http://localhost:5000/uploads/services/${serviceModal.editing.photo}`} alt={serviceModal.editing.name} />
                    </div>
                  )}
                </div>
                <div className={styles.modal_actions}>
                  <button type="submit" className={styles.save_btn}> Сохранить</button>
                  <button type="button" onClick={closeServiceModal} className={styles.cancel_btn}><FiX /> Отмена</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesTab;