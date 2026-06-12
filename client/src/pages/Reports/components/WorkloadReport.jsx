import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiUsers, FiActivity, FiTrendingUp } from 'react-icons/fi';
import styles from '../Reports.module.css';

const WorkloadReport = ({ data }) => {
  return (
    <div>
      {data.summary && (
        <div className={styles.summary_cards}>
          <div className={styles.summary_card}>
            <FiUsers />
            <div>
              <h4>Всего мастеров</h4>
              <p>{data.summary.totalMasters || 0}</p>
            </div>
          </div>
          <div className={styles.summary_card}>
            <FiActivity />
            <div>
              <h4>Всего записей</h4>
              <p>{data.summary.totalAppointmentsAll || 0}</p>
            </div>
          </div>
          <div className={styles.summary_card}>
            <FiTrendingUp />
            <div>
              <h4>Средняя нагрузка</h4>
              <p>{data.summary.averageWorkloadPerMaster || 0} записей</p>
            </div>
          </div>
        </div>
      )}
      
      {data.masters && data.masters.length > 0 && (
        <>
          <div className={styles.chart_container}>
            <h3>Загруженность мастеров</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.masters}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="masterName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalAppointments" name="Количество записей" fill="#CDAA7D" />
                <Bar dataKey="totalWorkHours" name="Часы работы" fill="#b8926a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className={styles.table_wrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Мастер</th>
                  <th>Записей</th>
                  <th>Часы работы</th>
                  <th>Среднее в день</th>
                  <th>Эффективность</th>
                </tr>
              </thead>
              <tbody>
                {data.masters.map((master) => (
                  <tr key={master.masterId}>
                    <td>{master.masterName}</td>
                    <td>{master.totalAppointments}</td>
                    <td>{master.totalWorkHours}</td>
                    <td>{master.averageDailyAppointments}</td>
                    <td>
                      <span className={`${styles.efficiency_badge} ${styles[master.efficiencyRating]}`}>
                        {master.efficiencyRating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkloadReport;