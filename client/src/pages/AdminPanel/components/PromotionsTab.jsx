// PromotionsTab.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';
import { API_URL } from '../../../config';

const PromotionsTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const [promotionModal, setPromotionModal] = useState({ open: false, editing: null });
  const [promotionForm, setPromotionForm] = useState({ title: '', description: '', discount: '', validFrom: '', validTo: '', isActive: true });
  const [selectedImage, setSelectedImage] = useState(null);

  const promotionsList = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (modalOpen) {
      openPromotionModal();
    }
  }, [modalOpen]);

  const openPromotionModal = (promo = null) => {
    if (promo) {
      setPromotionForm({
        title: promo.title || '',
        description: promo.description || '',
        discount: promo.discount || '',
        validFrom: promo.validFrom ? promo.validFrom.split('T')[0] : '',
        validTo: promo.validTo ? promo.validTo.split('T')[0] : '',
        isActive: promo.isActive !== undefined ? promo.isActive : true
      });
      setPromotionModal({ open: true, editing: promo });
    } else {
      setPromotionForm({ title: '', description: '', discount: '', validFrom: '', validTo: '', isActive: true });
      setPromotionModal({ open: true, editing: null });
    }
    setSelectedImage(null);
  };

  const closePromotionModal = () => {
    setPromotionModal({ open: false, editing: null });
    setSelectedImage(null);
    if (setModalOpen) setModalOpen(false);
  };

  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(promotionForm));
      if (selectedImage) formData.append('image', selectedImage);
      
      if (promotionModal.editing) {
        await axios.put(`/api/admin/promotions/${promotionModal.editing.id}`, formData);
        showMessage('Акция обновлена');
      } else {
        await axios.post('/api/admin/promotions', formData);
        showMessage('Акция добавлена');
      }
      
      onRefresh();
      closePromotionModal();
    } catch (err) {
      showMessage('Ошибка сохранения акции', true);
    }
  };

  const deletePromotion = async (id) => {
    if (window.confirm('Удалить эту акцию?')) {
      try {
        await axios.delete(`/api/admin/promotions/${id}`);
        onRefresh();
        showMessage('Акция удалена');
      } catch (err) {
        showMessage('Ошибка удаления акции', true);
      }
    }
  };

  return (
    <div>
      <div className={styles.promotions_list}>
        {promotionsList.map(promo => (
          <div key={promo.id} className={styles.promotion_admin_card}>
            {promo.imageUrl && (
              <img src={`${API_URL}/uploads/promotions/${promo.imageUrl}`} alt={promo.title} />
            )}
            <div className={styles.promotion_admin_info}>
              <h3>{promo.title}</h3>
              <p>{promo.description}</p>
              {promo.discount && <p className={styles.discount}>Скидка: {promo.discount}%</p>}
              <p>Действует: {promo.validFrom ? new Date(promo.validFrom).toLocaleDateString() : 'сейчас'} - {promo.validTo ? new Date(promo.validTo).toLocaleDateString() : 'бессрочно'}</p>
              <span className={`${styles.status_badge} ${promo.isActive ? styles.active : styles.inactive}`}>
                {promo.isActive ? 'Активна' : 'Неактивна'}
              </span>
              <div className={styles.card_actions}>
                <button onClick={() => openPromotionModal(promo)} className={styles.edit_btn}><FiEdit2 /></button>
                <button onClick={() => deletePromotion(promo.id)} className={styles.delete_btn}><FiTrash2 /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {promotionsList.length === 0 && (
        <div className={styles.empty_state}>Нет акций</div>
      )}

      {promotionModal.open && (
        <div className={styles.modal_overlay} onClick={closePromotionModal}>
          <div className={`${styles.modal_container} ${styles.modal_medium}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2 className={styles.modal_title}>{promotionModal.editing ? 'Редактировать акцию' : 'Добавить акцию'}</h2>
              <button className={styles.modal_close} onClick={closePromotionModal}>×</button>
            </div>
            <div className={styles.modal_content}>
              <form onSubmit={handlePromotionSubmit} className={styles.modal_form}>
                <div className={styles.form_group}>
                  <label>Название</label>
                  <input type="text" value={promotionForm.title} onChange={(e) => setPromotionForm({ ...promotionForm, title: e.target.value })} required />
                </div>
                <div className={styles.form_group}>
                  <label>Описание</label>
                  <textarea value={promotionForm.description} onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })} rows="3" required />
                </div>
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Скидка (%)</label>
                    <input type="number" value={promotionForm.discount} onChange={(e) => setPromotionForm({ ...promotionForm, discount: e.target.value })} min="0" max="100" />
                  </div>
                  <div className={styles.form_group}>
                    <label>
                      <input type="checkbox" checked={promotionForm.isActive} onChange={(e) => setPromotionForm({ ...promotionForm, isActive: e.target.checked })} />
                      Активна
                    </label>
                  </div>
                </div>
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Действует с</label>
                    <input type="date" value={promotionForm.validFrom} onChange={(e) => setPromotionForm({ ...promotionForm, validFrom: e.target.value })} />
                  </div>
                  <div className={styles.form_group}>
                    <label>Действует до</label>
                    <input type="date" value={promotionForm.validTo} onChange={(e) => setPromotionForm({ ...promotionForm, validTo: e.target.value })} />
                  </div>
                </div>
                <div className={styles.form_group}>
                  <label>Изображение</label>
                  <input type="file" onChange={(e) => setSelectedImage(e.target.files[0])} accept="image/*" />
                  {promotionModal.editing?.imageUrl && (
                    <div className={styles.current_photo}>
                      <img src={`${API_URL}/uploads/promotions/${promotionModal.editing.imageUrl}`} alt={promotionModal.editing.title} />
                    </div>
                  )}
                </div>
                <div className={styles.modal_actions}>
                  <button type="submit" className={styles.save_btn}> Сохранить</button>
                  <button type="button" onClick={closePromotionModal} className={styles.cancel_btn}>
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

export default PromotionsTab;