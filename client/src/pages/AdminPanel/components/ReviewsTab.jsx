import React from 'react';
import axios from 'axios';
import { FiUser, FiUserCheck, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const ReviewsTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const moderateReview = async (id) => {
    try {
      await axios.put(`/api/reviews/${id}/moderate`);
      onRefresh();
      showMessage('Отзыв опубликован');
    } catch (err) {
      showMessage('Ошибка публикации отзыва', true);
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Удалить этот отзыв?')) {
      try {
        await axios.delete(`/api/reviews/${id}`);
        onRefresh();
        showMessage('Отзыв удален');
      } catch (err) {
        showMessage('Ошибка удаления отзыва', true);
      }
    }
  };

  return (
    <div className={styles.reviews_list}>
      {data.map(review => (
        <div key={review.id} className={styles.review_card}>
          <div className={styles.review_header}>
            <div className={styles.review_rating}>
              {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
            </div>
            <span className={`${styles.review_status} ${review.isModerated ? styles.moderated : styles.pending}`}>
              {review.isModerated ? 'Опубликован' : 'На модерации'}
            </span>
          </div>
          <p className={styles.review_text}>{review.text}</p>
          <div className={styles.review_meta}>
            <span><FiUser /> {review.User?.firstName} {review.User?.lastName}</span>
            <span><FiUserCheck /> {review.Master?.User?.firstName} {review.Master?.User?.lastName}</span>
          </div>
          {!review.isModerated && (
            <div className={styles.review_actions}>
              <button onClick={() => moderateReview(review.id)} className={styles.moderate_btn}>
                <FiCheckCircle /> Опубликовать
              </button>
              <button onClick={() => deleteReview(review.id)} className={styles.delete_btn}>
                <FiTrash2 /> Удалить
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsTab;