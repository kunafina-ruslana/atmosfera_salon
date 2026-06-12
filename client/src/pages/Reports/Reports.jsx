import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  FiCalendar, FiDownload, FiFileText, FiPrinter
} from 'react-icons/fi';
import OrdersReport from './components/OrdersReport';
import MasterServicesReport from './components/MasterServicesReport';
import RevenueReport from './components/RevenueReport';
import WorkloadReport from './components/WorkloadReport';
import PopularServicesReport from './components/PopularServicesReport';
import styles from './Reports.module.css';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('orders');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    fetchMasters();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [activeReport, dateRange, selectedMaster, groupBy]);

  const fetchMasters = async () => {
    try {
      const response = await axios.get('/api/masters');
      setMasters(response.data);
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = '';
      switch (activeReport) {
        case 'orders':
          url = `/api/reports/completed-orders?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          if (selectedMaster) url += `&masterId=${selectedMaster}`;
          break;
        case 'master-services':
          url = `/api/reports/master-services?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          if (selectedMaster) url += `&masterId=${selectedMaster}`;
          break;
        case 'revenue':
          url = `/api/reports/revenue?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&groupBy=${groupBy}`;
          break;
        case 'workload':
          url = `/api/reports/master-workload?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
          break;
        case 'popular':
          url = `/api/reports/popular-services?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&limit=10`;
          break;
      }
      const response = await axios.get(url);
      setReportData(response.data);
    } catch (error) {
      console.error('Ошибка загрузки отчета:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;
    
    let data = [];
    let sheetName = '';
    
    switch (activeReport) {
      case 'orders':
        data = reportData?.appointments || [];
        sheetName = 'Выполненные заказы';
        break;
      case 'master-services':
        const masterData = [];
        reportData?.masters?.forEach(master => {
          if (master.services && master.services.length > 0) {
            master.services.forEach(service => {
              masterData.push({
                Мастер: master.masterName,
                Услуга: service.serviceName,
                Количество: service.count,
                Выручка: service.revenue
              });
            });
          }
        });
        data = masterData;
        sheetName = 'Услуги мастеров';
        break;
      case 'revenue':
        data = reportData?.revenueByPeriod || [];
        sheetName = 'Выручка по периодам';
        break;
      case 'workload':
        data = reportData?.masters?.map(m => ({
          Мастер: m.masterName,
          'Количество записей': m.totalAppointments,
          'Часы работы': m.totalWorkHours,
          'Среднее в день': m.averageDailyAppointments,
          'Эффективность': m.efficiencyRating
        })) || [];
        sheetName = 'Загруженность мастеров';
        break;
      case 'popular':
        data = reportData?.topByPopularity?.map(s => ({
          Услуга: s.serviceName,
          Категория: s.categoryName,
          Количество: s.count,
          Выручка: s.totalRevenue
        })) || [];
        sheetName = 'Популярность услуг';
        break;
    }
    
    if (data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  };

  const exportToPDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    let title = '';
    let headers = [];
    let data = [];
    
    switch (activeReport) {
      case 'orders':
        title = 'Отчет о выполненных заказах';
        headers = [['Дата', 'Клиент', 'Услуга', 'Цена', 'Мастер']];
        data = reportData?.appointments?.map(apt => [
          new Date(apt.date).toLocaleDateString(),
          apt.client,
          apt.service,
          `${apt.servicePrice} ₽`,
          apt.master
        ]) || [];
        break;
      case 'revenue':
        title = 'Отчет о выручке';
        headers = [['Период', 'Выручка']];
        data = reportData?.revenueByPeriod?.map(item => [item.period, `${item.revenue.toFixed(2)} ₽`]) || [];
        break;
      case 'workload':
        title = 'Отчет о загруженности мастеров';
        headers = [['Мастер', 'Записей', 'Часы работы', 'Среднее в день', 'Эффективность']];
        data = reportData?.masters?.map(m => [
          m.masterName,
          m.totalAppointments,
          m.totalWorkHours,
          m.averageDailyAppointments,
          m.efficiencyRating
        ]) || [];
        break;
      case 'popular':
        title = 'Отчет о популярности услуг';
        headers = [['Услуга', 'Категория', 'Количество', 'Выручка']];
        data = reportData?.topByPopularity?.map(s => [
          s.serviceName,
          s.categoryName,
          s.count,
          `${s.totalRevenue.toFixed(2)} ₽`
        ]) || [];
        break;
      default:
        return;
    }
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Период: ${dateRange.startDate} - ${dateRange.endDate}`, 14, 32);
    doc.text(`Дата формирования: ${new Date().toLocaleString()}`, 14, 38);
    
    if (reportData?.summary) {
      doc.text(`Итого заказов: ${reportData.summary.totalOrders || 0}`, 14, 44);
      doc.text(`Общая выручка: ${(reportData.summary.totalRevenue || 0).toFixed(2)} ₽`, 14, 50);
    }
    
    if (data.length > 0) {
      doc.autoTable({
        head: headers,
        body: data,
        startY: 60,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [138, 155, 110] }
      });
    }
    
    doc.save(`${title}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const reports = [
    { id: 'orders', name: 'Выполненные заказы' },
    { id: 'master-services', name: 'Услуги мастеров' },
    { id: 'revenue', name: 'Выручка' },
    { id: 'workload', name: 'Загруженность мастеров' },
    { id: 'popular', name: 'Популярность услуг' }
  ];

  const renderActiveReport = () => {
    if (loading) return <div className={styles.loading}>Загрузка отчета...</div>;
    if (!reportData) return <div className={styles.empty}>Нет данных для отображения</div>;

    switch (activeReport) {
      case 'orders':
        return <OrdersReport data={reportData} />;
      case 'master-services':
        return <MasterServicesReport data={reportData} />;
      case 'revenue':
        return <RevenueReport data={reportData} groupBy={groupBy} setGroupBy={setGroupBy} />;
      case 'workload':
        return <WorkloadReport data={reportData} />;
      case 'popular':
        return <PopularServicesReport data={reportData} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Отчеты</h2>
      
      <div className={styles.controls}>
        <div className={styles.date_range}>
          <label>
            <FiCalendar /> С
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </label>
          <label>
            По
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </label>
        </div>
        
        {(activeReport === 'orders' || activeReport === 'master-services') && (
          <select
            value={selectedMaster}
            onChange={(e) => setSelectedMaster(e.target.value)}
            className={styles.master_select}
          >
            <option value="">Все мастера</option>
            {masters.map(master => (
              <option key={master.id} value={master.id}>
                {master.User?.firstName} {master.User?.lastName}
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div className={styles.report_tabs}>
        {reports.map((report) => (
          <button
            key={report.id}
            className={`${styles.report_tab} ${activeReport === report.id ? styles.active : ''}`}
            onClick={() => setActiveReport(report.id)}
          >
            {report.name}
          </button>
        ))}
      </div>
      
      <div className={styles.export_buttons}>
        <button onClick={exportToExcel} className={styles.export_btn_excel}>
          <FiDownload /> Экспорт в Excel
        </button>
        <button onClick={exportToPDF} className={styles.export_btn_pdf}>
          <FiPrinter /> Экспорт в PDF
        </button>
      </div>
      
      {renderActiveReport()}
    </div>
  );
};

export default Reports;