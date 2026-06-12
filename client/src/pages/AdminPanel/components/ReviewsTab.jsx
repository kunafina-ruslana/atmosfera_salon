// ReviewsTab.js
import React from 'react';
import { FiStar, FiUser } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const ReviewsTab = ({ data, onRefresh, showMessage, modalOpen, setModalOpen }) => {
  const reviewsList = Array.isArray(data) ? data : [];

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div>
      <div className={styles.reviews_list}>
        {reviewsList.map(review => (
          <div key={review.id} className={styles.review_card}>
            <div className={styles.review_header}>
              <div className={styles.review_rating}>{renderStars(review.rating)}</div>
              <div className={styles.review_date}>
                {new Date(review.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
            <p className={styles.review_text}>"{review.text}"</p>
            <div className={styles.review_author}>
              <FiUser /> <strong>{review.User?.firstName} {review.User?.lastName}</strong>
              <span>Мастер: {review.Master?.User?.firstName} {review.Master?.User?.lastName}</span>
            </div>
          </div>
        ))}
      </div>
      {reviewsList.length === 0 && (
        <div className={styles.empty_state}>Нет отзывов</div>
      )}
    </div>
  );
};

export default ReviewsTab;