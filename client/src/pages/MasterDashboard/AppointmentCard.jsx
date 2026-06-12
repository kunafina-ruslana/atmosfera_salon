import React from 'react';
import {
  FiPhone,
  FiRefreshCw,
  FiCheck,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';

const AppointmentCard = ({
  apt,
  updateStatus,
  updating,
  getStatusInfo,
  getTimeOfDay,
  styles
}) => {
  const statusInfo = getStatusInfo(apt.status);
  const StatusIcon = statusInfo.icon;

  const appointmentTime = new Date(apt.dateTime);

  const isUpdating = updating === apt.id;

  return (
    <div className={styles.appointmentCard}>
      <div className={styles.appointmentTime}>
        <div className={styles.timeBadge}>
          <span>
            {appointmentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className={styles.timeOfDay}>
          {getTimeOfDay(apt.dateTime)}
        </div>
      </div>

      <div className={styles.appointmentContent}>
        <div className={styles.appointmentHeader}>
          <h3 className={styles.serviceName}>
            {apt.Service?.name}
          </h3>

          <div
            className={styles.statusBadge}
            style={{
              backgroundColor: statusInfo.bg,
              color: statusInfo.color
            }}
          >
            <StatusIcon />
            <span>{statusInfo.text}</span>
          </div>
        </div>

        <div className={styles.clientInfo}>
          <div className={styles.clientDetail}>
            <span>
              {apt.User?.firstName} {apt.User?.lastName}
            </span>
          </div>

          <div className={styles.clientDetail}>
            <FiPhone />
            <span>{apt.User?.phone}</span>
          </div>
        </div>

        <div className={styles.serviceDetails}>
          <span>
            Длительность: {apt.Service?.duration} мин
          </span>

          <span>
            Цена: {apt.Service?.price} ₽
          </span>
        </div>

        <div className={styles.actionButtons}>
          {apt.status === 'pending' && (
            <button
              onClick={() =>
                updateStatus(apt.id, 'confirmed')
              }
              className={`${styles.actionBtn} ${styles.confirmBtn}`}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <FiRefreshCw className={styles.spinSmall} />
              ) : (
                <FiCheck />
              )}

              Подтвердить
            </button>
          )}

          {apt.status === 'confirmed' && (
            <button
              onClick={() =>
                updateStatus(apt.id, 'completed')
              }
              className={`${styles.actionBtn} ${styles.completeBtn}`}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <FiRefreshCw className={styles.spinSmall} />
              ) : (
                <FiCheckCircle />
              )}

              Завершить
            </button>
          )}

          {(apt.status === 'pending' ||
            apt.status === 'confirmed') && (
            <button
              onClick={() =>
                updateStatus(apt.id, 'cancelled')
              }
              className={`${styles.actionBtn} ${styles.cancelBtn}`}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <FiRefreshCw className={styles.spinSmall} />
              ) : (
                <FiX />
              )}

              Отменить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;