import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const CategoriesTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const [categoryModal, setCategoryModal] = useState({ open: false, editing: null });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [categoryPhoto, setCategoryPhoto] = useState(null);

  const categoriesList = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (modalOpen) {
      openCategoryModal();
    }
  }, [modalOpen]);

  const openCategoryModal = (category = null) => {
    if (category) {
      setCategoryForm({ name: category.name || '' });
      setCategoryModal({ open: true, editing: category });
    } else {
      setCategoryForm({ name: '' });
      setCategoryModal({ open: true, editing: null });
    }
    setCategoryPhoto(null);
  };

  const closeCategoryModal = () => {
    setCategoryModal({ open: false, editing: null });
    setCategoryPhoto(null);
    if (setModalOpen) setModalOpen(false);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      if (categoryPhoto) {
        formData.append('photo', categoryPhoto);
      }
      
      let response;
      if (categoryModal.editing) {
        response = await axios.put(`/api/admin/categories/${categoryModal.editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showMessage('Категория обновлена');
      } else {
        response = await axios.post('/api/admin/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showMessage('Категория добавлена');
      }
      
      console.log('Response:', response.data);
      onRefresh();
      closeCategoryModal();
    } catch (err) {
      console.error('Error:', err);
      showMessage(err.response?.data?.error || 'Ошибка сохранения категории', true);
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Удалить эту категорию?')) {
      try {
        await axios.delete(`/api/admin/categories/${id}`);
        onRefresh();
        showMessage('Категория удалена');
      } catch (err) {
        showMessage('Ошибка удаления категории', true);
      }
    }
  };

  return (
    <div>
      <div className={styles.grid}>
        {categoriesList.map(category => (
          <div key={category.id} className={styles.card}>
            {category.photo && (
              <div className={styles.card_image_small}>
                <img src={`http://localhost:5000/uploads/categories/${category.photo}`} alt={category.name} />
              </div>
            )}
            <div className={styles.card_content}>
              <h3>{category.name}</h3>
              <div className={styles.card_actions}>
                <button onClick={() => openCategoryModal(category)} className={styles.edit_btn}>
                  <FiEdit2 /> Редактировать
                </button>
                <button onClick={() => deleteCategory(category.id)} className={styles.delete_btn}>
                  <FiTrash2 /> Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categoryModal.open && (
        <div className={styles.modal_overlay} onClick={closeCategoryModal}>
          <div className={`${styles.modal_container} ${styles.modal_small}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2 className={styles.modal_title}>{categoryModal.editing ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
              <button className={styles.modal_close} onClick={closeCategoryModal}>×</button>
            </div>
            <div className={styles.modal_content}>
              <form onSubmit={handleCategorySubmit} className={styles.modal_form}>
                <div className={styles.form_group}>
                  <label>Название</label>
                  <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ name: e.target.value })} required />
                </div>
                <div className={styles.form_group}>
                  <label>Фото</label>
                  <input type="file" onChange={(e) => setCategoryPhoto(e.target.files[0])} accept="image/*" />
                  {categoryModal.editing?.photo && (
                    <div className={styles.current_photo}>
                      <img src={`http://localhost:5000/uploads/categories/${categoryModal.editing.photo}`} alt={categoryModal.editing.name} />
                    </div>
                  )}
                </div>
                <div className={styles.modal_actions}>
                  <button type="submit" className={styles.save_btn}>
                    <FiSave /> Сохранить
                  </button>
                  <button type="button" onClick={closeCategoryModal} className={styles.cancel_btn}>
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

export default CategoriesTab;