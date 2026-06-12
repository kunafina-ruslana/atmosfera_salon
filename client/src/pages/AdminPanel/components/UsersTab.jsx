import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiMail, FiPhone, FiLock, FiUnlock } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const UsersTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const [userModal, setUserModal] = useState({ open: false, editing: null });
  const [userForm, setUserForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    role: 'user',
    isBlocked: false 
  });

  const usersList = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (modalOpen) {
      openUserModal();
    }
  }, [modalOpen]);

  const openUserModal = (user = null) => {
    if (user) {
      setUserForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        isBlocked: user.isBlocked || false
      });
      setUserModal({ open: true, editing: user });
    } else {
      setUserForm({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        phone: '', 
        role: 'user',
        isBlocked: false 
      });
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
        await axios.put(`/api/admin/users/${userModal.editing.id}/block`, { isBlocked: userForm.isBlocked });
        showMessage('Данные пользователя обновлены');
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

  if (usersList.length === 0) {
    return (
      <div className={styles.empty_state}>
        <FiUser className={styles.empty_icon} />
        <p>Пользователи не найдены</p>
      </div>
    );
  }

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
              <div className={styles.user_meta}>
                <span className={`${styles.role_badge} ${styles[user.role]}`}>
                  {user.role === 'admin' ? 'Администратор' : user.role === 'master' ? 'Мастер' : 'Пользователь'}
                </span>
                <span className={`${styles.status_badge} ${user.isBlocked ? styles.blocked : styles.active}`}>
                  {user.isBlocked ? 'Заблокирован' : 'Активен'}
                </span>
              </div>
              <div className={styles.card_actions}>
                <button onClick={() => openUserModal(user)} className={styles.edit_btn}>
                  <FiEdit2 /> Редактировать
                </button>
                <button 
                  onClick={() => blockUser(user.id, user.isBlocked)} 
                  className={user.isBlocked ? styles.unblock_btn : styles.block_btn}
                >
                  {user.isBlocked ? <FiUnlock /> : <FiLock />}
                  {user.isBlocked ? ' Разблокировать' : ' Заблокировать'}
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
              <h2 className={styles.modal_title}>
                {userModal.editing ? 'Редактировать пользователя' : 'Добавить пользователя'}
              </h2>
              <button className={styles.modal_close} onClick={closeUserModal}>×</button>
            </div>
            <div className={styles.modal_content}>
              <form onSubmit={handleUserSubmit} className={styles.modal_form}>
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Имя</label>
                    <input 
                      type="text" 
                      value={userForm.firstName} 
                      onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                      required 
                    />
                  </div>
                  <div className={styles.form_group}>
                    <label>Фамилия</label>
                    <input 
                      type="text" 
                      value={userForm.lastName} 
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                      required 
                    />
                  </div>
                </div>
                <div className={styles.form_group}>
                  <label>Почта</label>
                  <input 
                    type="email" 
                    value={userForm.email} 
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required 
                  />
                </div>
                <div className={styles.form_group}>
                  <label>Телефон</label>
                  <input 
                    type="tel" 
                    value={userForm.phone} 
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Роль</label>
                    <select 
                      value={userForm.role} 
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} 
                      className={styles.select}
                    >
                      <option value="user">Пользователь</option>
                      <option value="master">Мастер</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                  <div className={styles.form_group}>
                    <label>Статус</label>
                    <select 
                      value={userForm.isBlocked} 
                      onChange={(e) => setUserForm({ ...userForm, isBlocked: e.target.value === 'true' })} 
                      className={styles.select}
                    >
                      <option value="false">Активен</option>
                      <option value="true">Заблокирован</option>
                    </select>
                  </div>
                </div>
                <div className={styles.modal_actions}>
                  <button type="submit" className={styles.save_btn}>
                    <FiSave /> Сохранить
                  </button>
                  <button type="button" onClick={closeUserModal} className={styles.cancel_btn}>
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

export default UsersTab;