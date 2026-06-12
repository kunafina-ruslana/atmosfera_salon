import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';
import { API_URL } from '../../../config';

const WorkPhotosTab = ({ data, categories, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const [workPhotoModal, setWorkPhotoModal] = useState({ open: false, editing: null });
  const [workPhotoForm, setWorkPhotoForm] = useState({ masterName: '', description: '', categoryId: '' });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (modalOpen) {
      openWorkPhotoModal();
    }
  }, [modalOpen]);

  const openWorkPhotoModal = (photo = null) => {
    if (photo) {
      setWorkPhotoForm({
        masterName: photo.masterName || '',
        description: photo.description || '',
        categoryId: photo.categoryId || ''
      });
      setWorkPhotoModal({ open: true, editing: photo });
    } else {
      setWorkPhotoForm({ masterName: '', description: '', categoryId: '' });
      setWorkPhotoModal({ open: true, editing: null });
    }
    setSelectedImage(null);
  };

  const closeWorkPhotoModal = () => {
    setWorkPhotoModal({ open: false, editing: null });
    setSelectedImage(null);
    if (setModalOpen) setModalOpen(false);
  };

  const handleWorkPhotoSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(workPhotoForm));
      if (selectedImage) formData.append('image', selectedImage);
      
      if (workPhotoModal.editing) {
        await axios.put(`/api/admin/work-photos/${workPhotoModal.editing.id}`, formData);
        showMessage('Фото обновлено');
      } else {
        await axios.post('/api/admin/work-photos', formData);
        showMessage('Фото добавлено');
      }
      
      onRefresh();
      closeWorkPhotoModal();
    } catch (err) {
      showMessage('Ошибка сохранения фото', true);
    }
  };

  const deleteWorkPhoto = async (id) => {
    if (window.confirm('Удалить это фото?')) {
      try {
        await axios.delete(`/api/admin/work-photos/${id}`);
        onRefresh();
        showMessage('Фото удалено');
      } catch (err) {
        showMessage('Ошибка удаления фото', true);
      }
    }
  };

  return (
    <div>
      <div className={styles.works_grid}>
        {data.map(photo => (
          <div key={photo.id} className={styles.work_photo_card}>
            <img src={`${API_URL}/uploads/works/${photo.imageUrl}`} alt={photo.description} />
            <div className={styles.work_photo_info}>
              <p><strong>{photo.masterName}</strong></p>
              <p>{photo.description}</p>
              <div className={styles.card_actions}>
                <button onClick={() => openWorkPhotoModal(photo)} className={styles.edit_btn}><FiEdit2 /></button>
                <button onClick={() => deleteWorkPhoto(photo.id)} className={styles.delete_btn}><FiTrash2 /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Встроенное модальное окно */}
      {workPhotoModal.open && (
        <div className={styles.modal_overlay} onClick={closeWorkPhotoModal}>
          <div className={`${styles.modal_container} ${styles.modal_medium}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2 className={styles.modal_title}>{workPhotoModal.editing ? 'Редактировать фото' : 'Добавить фото'}</h2>
              <button className={styles.modal_close} onClick={closeWorkPhotoModal}>×</button>
            </div>
            <div className={styles.modal_content}>
              <form onSubmit={handleWorkPhotoSubmit} className={styles.modal_form}>
                <div className={styles.form_group}>
                  <label>Имя мастера</label>
                  <input type="text" value={workPhotoForm.masterName} onChange={(e) => setWorkPhotoForm({ ...workPhotoForm, masterName: e.target.value })} required />
                </div>
                <div className={styles.form_group}>
                  <label>Описание</label>
                  <textarea value={workPhotoForm.description} onChange={(e) => setWorkPhotoForm({ ...workPhotoForm, description: e.target.value })} rows="3" />
                </div>
                <div className={styles.form_group}>
                  <label>Категория</label>
                  <select value={workPhotoForm.categoryId} onChange={(e) => setWorkPhotoForm({ ...workPhotoForm, categoryId: e.target.value })} className={styles.select}>
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className={styles.form_group}>
                  <label>Фото</label>
                  <input type="file" onChange={(e) => setSelectedImage(e.target.files[0])} accept="image/*" required={!workPhotoModal.editing} />
                  {workPhotoModal.editing?.imageUrl && (
                    <div className={styles.current_photo}>
                      <img src={`${API_URL}/uploads/works/${workPhotoModal.editing.imageUrl}`} alt="Work" />
                    </div>
                  )}
                </div>
                <div className={styles.modal_actions}>
                  <button type="submit" className={styles.save_btn}>
                     Сохранить
                  </button>
                  <button type="button" onClick={closeWorkPhotoModal} className={styles.cancel_btn}>
                    <FiX /> Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkPhotosTab;