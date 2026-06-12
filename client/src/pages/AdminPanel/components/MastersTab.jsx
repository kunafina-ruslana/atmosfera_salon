// MastersTab.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiMail, FiPhone, FiUser, FiSave, FiX } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';
import { API_URL } from '../../../config';

const MastersTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const [masterModal, setMasterModal] = useState({ open: false, editing: null });
  const [masterForm, setMasterForm] = useState({ bio: '', photo: null });
  const [masterCategories, setMasterCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const mastersList = Array.isArray(data) ? data : [];

  useEffect(() => {
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      openMasterModal();
    }
  }, [modalOpen]);

  const fetchAllCategories = async () => {
    try {
      const response = await axios.get('/api/services/categories');
      setAllCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      setAllCategories([]);
    }
  };

  const fetchMasterCategories = async (masterId) => {
    try {
      const response = await axios.get(`/api/schedule/masters/${masterId}/categories`);
      setMasterCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Ошибка загрузки категорий мастера:', error);
      setMasterCategories([]);
    }
  };

  const openMasterModal = async (master = null) => {
    if (master) {
      setMasterForm({ bio: master.bio || '', photo: null });
      setPreviewPhoto(master.photo ? `${API_URL}/uploads/masters/${master.photo}` : null);
      await fetchMasterCategories(master.id);
      setMasterModal({ open: true, editing: master });
    } else {
      setMasterForm({ bio: '', photo: null });
      setPreviewPhoto(null);
      setMasterCategories([]);
      setMasterModal({ open: true, editing: null });
    }
  };

  const closeMasterModal = () => {
    setMasterModal({ open: false, editing: null });
    setPreviewPhoto(null);
    setMasterCategories([]);
    if (setModalOpen) setModalOpen(false);
  };

  const handleMasterSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('bio', masterForm.bio);
      if (masterForm.photo) {
        formData.append('photo', masterForm.photo);
      }
      
      await axios.put(`/api/admin/masters/${masterModal.editing.id}`, formData);
      onRefresh();
      showMessage('Данные мастера обновлены');
      closeMasterModal();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка обновления мастера', true);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMasterForm({ ...masterForm, photo: file });
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const assignCategoryToMaster = async (categoryId) => {
    try {
      await axios.post(`/api/schedule/masters/${masterModal.editing.id}/categories/${categoryId}`);
      await fetchMasterCategories(masterModal.editing.id);
      showMessage('Категория назначена мастеру');
    } catch (err) {
      showMessage('Ошибка назначения категории', true);
    }
  };

  const removeCategoryFromMaster = async (categoryId) => {
    if (window.confirm('Удалить эту категорию у мастера?')) {
      try {
        await axios.delete(`/api/schedule/masters/${masterModal.editing.id}/categories/${categoryId}`);
        await fetchMasterCategories(masterModal.editing.id);
        showMessage('Категория удалена у мастера');
      } catch (err) {
        showMessage('Ошибка удаления категории', true);
      }
    }
  };

  return (
    <div>
      <div className={styles.grid}>
        {mastersList.map(master => (
          <div key={master.id} className={styles.master_card}>
            <div className={styles.master_avatar}>
              {master.photo ? (
                <img src={`${API_URL}/uploads/masters/${master.photo}`} alt={master.User?.firstName || 'Мастер'} />
              ) : (
                <div className={styles.avatar_placeholder}><FiUser /></div>
              )}
            </div>
            <div className={styles.master_info}>
              <h3>{master.User?.firstName} {master.User?.lastName}</h3>
              <p><FiMail /> {master.User?.email}</p>
              <p><FiPhone /> {master.User?.phone}</p>
              <p className={styles.master_bio}>{master.bio || 'Нет информации'}</p>
              <button onClick={() => openMasterModal(master)} className={styles.edit_btn}>
                <FiEdit2 /> Редактировать
              </button>
            </div>
          </div>
        ))}
      </div>

      {masterModal.open && (
        <div className={styles.modal_overlay} onClick={closeMasterModal}>
          <div className={`${styles.modal_container} ${styles.modal_large}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2 className={styles.modal_title}>Редактировать мастера</h2>
              <button className={styles.modal_close} onClick={closeMasterModal}>×</button>
            </div>
            <div className={styles.modal_content}>
              <form onSubmit={handleMasterSubmit} className={styles.modal_form}>
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Имя</label>
                    <input type="text" value={`${masterModal.editing?.User?.firstName || ''} ${masterModal.editing?.User?.lastName || ''}`} disabled />
                  </div>
                  <div className={styles.form_group}>
                    <label>Почта</label>
                    <input type="email" value={masterModal.editing?.User?.email || ''} disabled />
                  </div>
                </div>
                <div className={styles.form_group}>
                  <label>Телефон</label>
                  <input type="tel" value={masterModal.editing?.User?.phone || ''} disabled />
                </div>
                <div className={styles.form_group}>
                  <label>Описание мастера</label>
                  <textarea value={masterForm.bio} onChange={(e) => setMasterForm({ ...masterForm, bio: e.target.value })} rows="4" placeholder="Расскажите о мастере..." />
                </div>
                <div className={styles.form_group}>
                  <label>Фото мастера</label>
                  {previewPhoto && (
                    <div className={styles.current_photo}>
                      <img src={previewPhoto} alt="Master preview" />
                    </div>
                  )}
                  <input type="file" onChange={handlePhotoChange} accept="image/jpeg,image/png,image/gif,image/webp" />
                  <small className={styles.photo_hint}>Рекомендуемый размер: 300x300px</small>
                </div>
                <div className={styles.form_group}>
                  <label>Категории услуг мастера</label>
                  <div className={styles.categories_list}>
                    {masterCategories.map(mc => {
                      const category = allCategories.find(c => c.id === mc.categoryId);
                      return (
                        <div key={mc.id} className={styles.category_tag}>
                          {category?.name || 'Категория'}
                          <button type="button" onClick={() => removeCategoryFromMaster(mc.categoryId)}>×</button>
                        </div>
                      );
                    })}
                    {masterCategories.length === 0 && <div className={styles.no_categories}>Нет назначенных категорий</div>}
                  </div>
                  <select onChange={(e) => { if (e.target.value) { assignCategoryToMaster(parseInt(e.target.value)); e.target.value = ''; } }} className={styles.select} value="">
                    <option value="">Добавить категорию...</option>
                    {allCategories.filter(cat => !masterCategories.some(mc => mc.categoryId === cat.id)).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.modal_actions}>
                  <button type="submit" className={styles.save_btn}> Сохранить</button>
                  <button type="button" onClick={closeMasterModal} className={styles.cancel_btn}>Отмена</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MastersTab;