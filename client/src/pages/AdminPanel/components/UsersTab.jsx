// UsersTab.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const UsersTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const [userModal, setUserModal] = useState({ open: false, editing: null });
  const [userForm, setUserForm] = useState({ email: '', firstName: '', lastName: '', phone: '', role: 'user' });

  const usersList = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (modalOpen) {
      openUserModal();
    }
  }, [modalOpen]);

  const openUserModal = (user = null) => {
    if (user) {
      setUserForm({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role || 'user'
      });
      setUserModal({ open: true, editing: user });
    } else {
      setUserForm({ email: '', firstName: '', lastName: '', phone: '', role: 'user' });
      setUserModal({ open: true, editing: null });
    }
  };

  const closeUserModal = () => {
    setUserModal({ open: false, editing: null });
    if (setModalOpen) setModalOpen(false);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userModal.editing) {
        await axios.put(`/api/admin/users/${userModal.editing.id}/role`, { role: userForm.role });
        showMessage('Роль пользователя обновлена');
      }
      onRefresh();
      closeUserModal();
    } catch (err) {
      showMessage('Ошибка обновления пользователя', true);
    }
  };

  const blockUser = async (id, isBlocked) => {
    try {
      await axios.put(`/api/admin/users/${id}/block`, { isBlocked: !isBlocked });
      onRefresh();
      showMessage(`Пользователь ${!isBlocked ? 'заблокирован' : 'разблокирован'}`);
    } catch (err) {
      showMessage('Ошибка изменения статуса', true);
    }
  };

  return (
    <div>
      <div className={styles.users_grid}>
        {usersList.map(user => (
          <div key={user.id} className={styles.user_card}>
            <div className={styles.user_avatar}>
              <FiUser />
            </div>
            <div className={styles.user_info}>
              <h3>{user.firstName} {user.lastName}</h3>
              <p><FiMail /> {user.email}</p>
              <p><FiPhone /> {user.phone || 'Не указан'}</p>
              <p>Роль: <span className={styles.role_badge}>{user.role}</span></p>
              <p>Статус: {user.isBlocked ? 'Заблокирован' : 'Активен'}</p>
              <div className={styles.card_actions}>
                <button onClick={() => openUserModal(user)} className={styles.edit_btn}><FiEdit2 /> Изменить роль</button>
                <button onClick={() => blockUser(user.id, user.isBlocked)} className={user.isBlocked ? styles.unblock_btn : styles.block_btn}>
                  {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {userModal.open && (
        <div className={styles.modal_overlay} onClick={closeUserModal}>
          <div className={`${styles.modal_container} ${styles.modal_small}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2 className={styles.modal_title}>Изменить роль пользователя</h2>
              <button className={styles.modal_close} onClick={closeUserModal}>×</button>
            </div>
            <div className={styles.modal_content}>
              <form onSubmit={handleUserSubmit} className={styles.modal_form}>
                <div className={styles.form_group}>
                  <label>Пользователь</label>
                  <input type="text" value={`${userForm.firstName} ${userForm.lastName} (${userForm.email})`} disabled />
                </div>
                <div className={styles.form_group}>
                  <label>Роль</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className={styles.select}>
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
                <div className={styles.modal_actions}>
                  <button type="submit" className={styles.save_btn}> Сохранить</button>
                  <button type="button" onClick={closeUserModal} className={styles.cancel_btn}>Отмена</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;