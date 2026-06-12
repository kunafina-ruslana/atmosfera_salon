import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { FiDollarSign, FiFileText, FiTrendingUp } from 'react-icons/fi';
import styles from '../Reports.module.css';

const RevenueReport = ({ data, groupBy, setGroupBy }) => {
  const COLORS = ['#CDAA7D', '#b8926a', '#a07a50', '#8c6840', '#785830'];

  return (
    <div>
      <div className={styles.chart_controls}>
        <label>Группировка:</label>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="day">По дням</option>
          <option value="week">По неделям</option>
          <option value="month">По месяцам</option>
        </select>
      </div>
      
      <div className={styles.summary_cards}>
        <div className={styles.summary_card}>
          <FiDollarSign />
          <div>
            <h4>Общая выручка</h4>
            <p>{data.summary?.totalRevenue ? data.summary.totalRevenue.toFixed(2) : 0} ₽</p>
          </div>
        </div>
        <div className={styles.summary_card}>
          <FiFileText />
          <div>
            <h4>Всего заказов</h4>
            <p>{data.summary?.totalOrders || 0}</p>
          </div>
        </div>
        <div className={styles.summary_card}>
          <FiTrendingUp />
          <div>
            <h4>Средний чек</h4>
            <p>{data.summary?.averageCheck ? data.summary.averageCheck.toFixed(2) : 0} ₽</p>
          </div>
        </div>
      </div>
      
      {data.revenueByPeriod && data.revenueByPeriod.length > 0 && (
        <div className={styles.chart_container}>
          <h3>Динамика выручки</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.revenueByPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)} ₽`} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#CDAA7D" fill="#CDAA7D" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className={styles.chart_row}>
        {data.revenueByMaster && data.revenueByMaster.length > 0 && (
          <div className={styles.chart_half}>
            <h3>Выручка по мастерам</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.revenueByMaster}
                  dataKey="revenue"
                  nameKey="master"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.revenueByMaster.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} ₽`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {data.revenueByService && data.revenueByService.length > 0 && (
          <div className={styles.chart_half}>
            <h3>Выручка по услугам</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.revenueByService.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="service" width={100} />
                <Tooltip formatter={(value) => `${value.toFixed(2)} ₽`} />
                <Bar dataKey="revenue" fill="#CDAA7D" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueReport;