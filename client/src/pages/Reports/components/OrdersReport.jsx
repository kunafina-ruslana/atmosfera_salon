import React from 'react';
import { FiFileText, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import styles from '../Reports.module.css';

const OrdersReport = ({ data }) => {
  return (
    <div>
      {data.summary && (
        <div className={styles.summary_cards}>
          <div className={styles.summary_card}>
            <FiFileText />
            <div>
              <h4>Всего заказов</h4>
              <p>{data.summary.totalOrders || 0}</p>
            </div>
          </div>
          <div className={styles.summary_card}>
            <FiDollarSign />
            <div>
              <h4>Общая выручка</h4>
              <p>{data.summary.totalRevenue ? data.summary.totalRevenue.toFixed(2) : 0} ₽</p>
            </div>
          </div>
          <div className={styles.summary_card}>
            <FiTrendingUp />
            <div>
              <h4>Средний чек</h4>
              <p>{data.summary.averageCheck ? data.summary.averageCheck.toFixed(2) : 0} ₽</p>
            </div>
          </div>
        </div>
      )}
      
      {data.appointments && data.appointments.length > 0 ? (
        <div className={styles.table_wrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Услуга</th>
                <th>Цена</th>
                <th>Мастер</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{new Date(apt.date).toLocaleDateString()}</td>
                  <td>{apt.client}</td>
                  <td>{apt.clientPhone}</td>
                  <td>{apt.service}</td>
                  <td>{apt.servicePrice} ₽</td>
                  <td>{apt.master}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>Нет выполненных заказов за выбранный период</div>
      )}
    </div>
  );
};

export default OrdersReport;