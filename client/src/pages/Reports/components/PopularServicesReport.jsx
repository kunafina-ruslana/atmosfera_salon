import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FiStar, FiFileText, FiDollarSign } from 'react-icons/fi';
import styles from '../Reports.module.css';

const PopularServicesReport = ({ data }) => {
  const COLORS = ['#CDAA7D', '#b8926a', '#a07a50', '#8c6840', '#785830'];

  return (
    <div>
      {data.summary && (
        <div className={styles.summary_cards}>
          <div className={styles.summary_card}>
            <FiStar />
            <div>
              <h4>Всего услуг</h4>
              <p>{data.summary.uniqueServices || 0}</p>
            </div>
          </div>
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
        </div>
      )}
      
      <div className={styles.chart_row}>
        {data.topByPopularity && data.topByPopularity.length > 0 && (
          <div className={styles.chart_half}>
            <h3>Топ популярных услуг</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.topByPopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="serviceName" width={120} />
                <Tooltip />
                <Bar dataKey="count" name="Количество заказов" fill="#CDAA7D" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {data.topByRevenue && data.topByRevenue.length > 0 && (
          <div className={styles.chart_half}>
            <h3>Топ по выручке</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.topByRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="serviceName" width={120} />
                <Tooltip formatter={(value) => `${value.toFixed(2)} ₽`} />
                <Bar dataKey="totalRevenue" name="Выручка" fill="#b8926a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {data.byCategory && data.byCategory.length > 0 && (
        <div className={styles.chart_container}>
          <h3>Популярность по категориям</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byCategory}
                dataKey="count"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {data.topByPopularity && data.topByPopularity.length > 0 && (
        <div className={styles.table_wrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Категория</th>
                <th>Количество заказов</th>
                <th>Выручка</th>
              </tr>
            </thead>
            <tbody>
              {data.topByPopularity.map((service) => (
                <tr key={service.serviceId}>
                  <td>{service.serviceName}</td>
                  <td>{service.categoryName}</td>
                  <td>{service.count}</td>
                  <td>{service.totalRevenue.toFixed(2)} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PopularServicesReport;