import React from 'react';
import styles from '../Reports.module.css';

const MasterServicesReport = ({ data }) => {
  if (!data.masters || data.masters.length === 0) {
    return <div className={styles.empty}>Нет данных по услугам мастеров</div>;
  }

  return (
    <div>
      {data.masters.map((master) => (
        <div key={master.masterId} className={styles.master_report_card}>
          <h3>{master.masterName}</h3>
          <div className={styles.master_stats}>
            <span>Всего услуг: {master.totalServices || 0}</span>
            <span>Выручка: {master.totalRevenue ? master.totalRevenue.toFixed(2) : 0} ₽</span>
            <span>Средний чек: {master.averagePerService ? master.averagePerService.toFixed(2) : 0} ₽</span>
          </div>
          {master.services && master.services.length > 0 && (
            <div className={styles.table_wrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Услуга</th>
                    <th>Количество</th>
                    <th>Выручка</th>
                  </tr>
                </thead>
                <tbody>
                  {master.services.map((service, idx) => (
                    <tr key={idx}>
                      <td>{service.serviceName}</td>
                      <td>{service.count}</td>
                      <td>{service.revenue.toFixed(2)} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MasterServicesReport;