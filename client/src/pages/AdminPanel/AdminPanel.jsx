import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiBarChart2 } from 'react-icons/fi';
import TabsNav from './components/TabsNav';
import SearchBar from './components/SearchBar';
import UsersTab from './components/UsersTab';
import ServicesTab from './components/ServicesTab';
import CategoriesTab from './components/CategoriesTab';
import MastersTab from './components/MastersTab';
import AppointmentsTab from './components/AppointmentsTab';
import ReviewsTab from './components/ReviewsTab';
import WorkPhotosTab from './components/WorkPhotosTab';
import PromotionsTab from './components/PromotionsTab';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [masterModalOpen, setMasterModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [workPhotoModalOpen, setWorkPhotoModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [masters, setMasters] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [workPhotos, setWorkPhotos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchWorkPhotos();
    fetchPromotions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchServices(),
      fetchCategories(),
      fetchMasters(),
      fetchAppointments(),
      fetchReviews()
    ]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const response = await axios.get('/api/admin/users');
    setUsers(response.data);
  };

  const fetchServices = async () => {
    const response = await axios.get('/api/services');
    setServices(response.data);
  };

  const fetchCategories = async () => {
    const response = await axios.get('/api/services/categories');
    setCategories(response.data);
  };

  const fetchMasters = async () => {
    const response = await axios.get('/api/admin/masters');
    setMasters(response.data);
  };

  const fetchAppointments = async () => {
    const response = await axios.get('/api/admin/appointments');
    setAppointments(response.data);
  };

  const fetchReviews = async () => {
    const response = await axios.get('/api/reviews/all');
    setReviews(response.data);
  };

  const fetchWorkPhotos = async () => {
    const response = await axios.get('/api/admin/work-photos');
    setWorkPhotos(response.data);
  };

  const fetchPromotions = async () => {
    const response = await axios.get('/api/admin/promotions');
    setPromotions(response.data);
  };

  const handleAddClick = () => {
    switch (activeTab) {
      case 'users':
        setUserModalOpen(true);
        break;
      case 'services':
        setServiceModalOpen(true);
        break;
      case 'categories':
        setCategoryModalOpen(true);
        break;
      case 'masters':
        setMasterModalOpen(true);
        break;
      case 'appointments':
        setAppointmentModalOpen(true);
        break;
      case 'reviews':
        setReviewModalOpen(true);
        break;
      case 'workPhotos':
        setWorkPhotoModalOpen(true);
        break;
      case 'promotions':
        setPromotionModalOpen(true);
        break;
      default:
        break;
    }
  };

  const showMessage = (text, isError = false) => {
    if (isError) {
      setError(text);
      setTimeout(() => setError(''), 3000);
    } else {
      setMessage(text);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const tabs = [
    { id: 'users', label: 'Пользователи' },
    { id: 'services', label: 'Услуги' },
    { id: 'categories', label: 'Категории' },
    { id: 'masters', label: 'Мастера' },
    { id: 'appointments', label: 'Записи' },
    { id: 'reviews', label: 'Отзывы' },
    { id: 'workPhotos', label: 'Фото работ' },
    { id: 'promotions', label: 'Акции' }
  ];

  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'users':
        return users.filter(u =>
          u.firstName?.toLowerCase().includes(term) ||
          u.lastName?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
        );
      case 'services':
        return services.filter(s =>
          s.name?.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term)
        );
      case 'categories':
        return categories.filter(c => c.name?.toLowerCase().includes(term));
      case 'masters':
        return masters.filter(m =>
          `${m.User?.firstName} ${m.User?.lastName}`.toLowerCase().includes(term) ||
          m.User?.email?.toLowerCase().includes(term)
        );
      case 'appointments':
        return appointments.filter(a =>
          a.Service?.name?.toLowerCase().includes(term) ||
          a.User?.firstName?.toLowerCase().includes(term) ||
          a.User?.lastName?.toLowerCase().includes(term)
        );
      case 'reviews':
        return reviews.filter(r =>
          r.text?.toLowerCase().includes(term) ||
          r.User?.firstName?.toLowerCase().includes(term) ||
          r.User?.lastName?.toLowerCase().includes(term)
        );
      case 'workPhotos':
        return workPhotos.filter(p =>
          p.masterName?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
        );
      case 'promotions':
        return promotions.filter(p =>
          p.title?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
        );
      default:
        return [];
    }
  };

  const handleRefresh = () => {
    fetchData();
    fetchWorkPhotos();
    fetchPromotions();
  };

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loading}>Загрузка...</div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Панель администратора</h2>
        <div className={styles.linkAdmin}>
          <Link to="/admin/reports">Отчеты</Link>
          <Link to="/admin/schedule">Расписание мастеров</Link>
        </div>
      </div>

      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <TabsNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        tabs={tabs}
        totalCount={getFilteredData().length}
        onAddClick={handleAddClick}
      />

      {activeTab === 'users' && (
        <UsersTab
          data={getFilteredData()}
          onRefresh={handleRefresh}
          showMessage={showMessage}
          modalOpen={userModalOpen}
          setModalOpen={setUserModalOpen}
        />
      )}

      {activeTab === 'services' && (
        <ServicesTab
          data={getFilteredData()}
          categories={categories}
          onRefresh={handleRefresh}
          showMessage={showMessage}
          modalOpen={serviceModalOpen}
          setModalOpen={setServiceModalOpen}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab
          data={getFilteredData()}
          onRefresh={handleRefresh}
          showMessage={showMessage}
          modalOpen={categoryModalOpen}
          setModalOpen={setCategoryModalOpen}
        />
      )}

      {activeTab === 'masters' && (
        <MastersTab
          data={getFilteredData()}
          onRefresh={handleRefresh}
          showMessage={showMessage}
          modalOpen={masterModalOpen}
          setModalOpen={setMasterModalOpen}
        />
      )}

      {activeTab === 'appointments' && (
        <AppointmentsTab
          data={getFilteredData()}
          onRefresh={handleRefresh}
          showMessage={showMessage}
          modalOpen={appointmentModalOpen}
          setModalOpen={setAppointmentModalOpen}
        />
      )}

      {activeTab === 'reviews' && (
        <ReviewsTab
          data={getFilteredData()}
          onRefresh={handleRefresh}
          showMessage={showMessage}
          modalOpen={reviewModalOpen}
          setModalOpen={setReviewModalOpen}
        />
      )}

      {activeTab === 'workPhotos' && (
        <WorkPhotosTab
          data={getFilteredData()}
          categories={categories}
          onRefresh={handleRefresh}
          showMessage={showMessage}
          modalOpen={workPhotoModalOpen}
          setModalOpen={setWorkPhotoModalOpen}
        />
      )}

      {activeTab === 'promotions' && (
        <PromotionsTab
          data={getFilteredData()}
          onRefresh={handleRefresh}
          showMessage={showMessage}
          modalOpen={promotionModalOpen}
          setModalOpen={setPromotionModalOpen}
        />
      )}
    </div>
  );
};

export default AdminPanel;