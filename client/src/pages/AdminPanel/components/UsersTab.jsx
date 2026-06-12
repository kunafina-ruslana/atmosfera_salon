import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiLock, FiUnlock, FiSave, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const UsersTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const [userModal, setUserModal] = useState({ open: false, editing: null });
  const [userForm, setUserForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', birthDate: '', role: 'user', isBlocked: false, password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      openUserModal();
    }
  }, [modalOpen]);

  const updateUserRole = async (userId, role) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role });
      onRefresh();
      showMessage('Роль пользователя обновлена');
    } catch (err) {
      showMessage('Ошибка обновления роли', true);
    }
  };

  const blockUser = async (userId, isBlocked) => {
    try {
      await axios.put(`/api/admin/users/${userId}/block`, { isBlocked });
      onRefresh();
      showMessage(isBlocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
    } catch (err) {
      showMessage('Ошибка изменения статуса', true);
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setUserForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        role: user.role || 'user',
        isBlocked: user.isBlocked || false,
        password: ''
      });
      setUserModal({ open: true, editing: user });
    } else {
      setUserForm({
        firstName: '', lastName: '', email: '', phone: '', birthDate: '', role: 'user', isBlocked: false, password: ''
      });
      setUserModal({ open: true, editing: null });
    }
  };

  const closeUserModal = () => {
    setUserModal({ open: false, editing: null });
    setUserForm({
      firstName: '', lastName: '', email: '', phone: '', birthDate: '', role: 'user', isBlocked: false, password: ''
    });
    setShowPassword(false);
    if (setModalOpen) setModalOpen(false);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (userModal.editing) {
        const updateData = {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          phone: userForm.phone,
          birthDate: userForm.birthDate
        };
        if (userForm.password) updateData.password = userForm.password;
        await axios.put(`/api/admin/users/${userModal.editing.id}`, updateData);
        showMessage('Пользователь обновлен');
      } else {
        const createData = {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          phone: userForm.phone,
          birthDate: userForm.birthDate,
          password: userForm.password,
          role: userForm.role
        };
        await axios.post('/api/admin/users', createData);
        showMessage('Пользователь создан');
      }
      onRefresh();
      closeUserModal();
    } catch (err) {
      showMessage('Ошибка сохранения пользователя', true);
    }
  };

  return (
    <div>
      <div className={styles.table_wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Почта</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.map(user => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <select 
                    value={user.role} 
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className={styles.select}
                  >
                    <option value="user">Пользователь</option>
                    <option value="master">Мастер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </td>
                <td>
                  <span className={`${styles.status_badge} ${user.isBlocked ? styles.blocked : styles.active}`}>
                    {user.isBlocked ? 'Заблокирован' : 'Активен'}
                  </span>
                </td>
                <td>
                  <div className={styles.action_buttons}>
                    <button onClick={() => openUserModal(user)} className={styles.edit_btn}>
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => blockUser(user.id, !user.isBlocked)}
                      className={user.isBlocked ? styles.unblock_btn : styles.block_btn}
                    >
                      {user.isBlocked ? <FiUnlock /> : <FiLock />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Встроенное модальное окно */}
      {userModal.open && (
        <div className={styles.modal_overlay} onClick={closeUserModal}>
          <div className={`${styles.modal_container} ${styles.modal_medium}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h2 className={styles.modal_title}>{userModal.editing ? 'Редактировать пользователя' : 'Добавить пользователя'}</h2>
              <button className={styles.modal_close} onClick={closeUserModal}>×</button>
            </div>
            <div className={styles.modal_content}>
              <form onSubmit={handleUserSubmit} className={styles.modal_form}>
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Имя</label>
                    <input type="text" value={userForm.firstName} onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })} required />
                  </div>
                  <div className={styles.form_group}>
                    <label>Фамилия</label>
                    <input type="text" value={userForm.lastName} onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })} required />
                  </div>
                </div>
                
                <div className={styles.form_group}>
                  <label>Почта</label>
                  <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required disabled={!!userModal.editing} />
                </div>
                
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Телефон</label>
                    <input type="tel" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} required />
                  </div>
                  <div className={styles.form_group}>
                    <label>Дата рождения</label>
                    <input type="date" value={userForm.birthDate} onChange={(e) => setUserForm({ ...userForm, birthDate: e.target.value })} required />
                  </div>
                </div>
                
                <div className={styles.form_group}>
                  <label>Пароль {userModal.editing && '(оставьте пустым, если не меняете)'}</label>
                  <div className={styles.password_input}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={userForm.password} 
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                      required={!userModal.editing}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.password_toggle}>
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                
                <div className={styles.form_row}>
                  <div className={styles.form_group}>
                    <label>Роль</label>
                    <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className={styles.select}>
                      <option value="user">Пользователь</option>
                      <option value="master">Мастер</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                  <div className={styles.form_group}>
                    <label>
                      <input type="checkbox" checked={userForm.isBlocked} onChange={(e) => setUserForm({ ...userForm, isBlocked: e.target.checked })} />
                      Заблокирован
                    </label>
                  </div>
                </div>
                
                <div className={styles.modal_actions}>
                  <button type="submit" className={styles.save_btn}> Сохранить</button>
                  <button type="button" onClick={closeUserModal} className={styles.cancel_btn}><FiX /> Отмена</button>
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