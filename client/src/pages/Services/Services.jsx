import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFilter, FiX, FiClock, FiDollarSign } from 'react-icons/fi';
import styles from './Services.module.css';
import { API_URL } from '../../config';

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || '',
    search: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [filters]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      const response = await axios.get(`/api/services?${params.toString()}`);
      setServices(response.data);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/services/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };
  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    if (e.target.name === 'categoryId') {
      if (e.target.value) {
        setSearchParams({ categoryId: e.target.value });
      } else {
        setSearchParams({});
      }
    }
  };
  const clearFilters = () => {
    setFilters({ categoryId: '', search: '', minPrice: '', maxPrice: ''    });
    setSearchParams({});
  };

  const hasActiveFilters = filters.categoryId || filters.search || filters.minPrice || filters.maxPrice;

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loading}>Загрузка услуг...</div>
    </div>
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Наши услуги</h2>
      
      <div className={styles.filters_desktop}>
        <div className={styles.filters_card}>
          <div className={styles.filters_header}>
            <h3><FiFilter /> Фильтры</h3>
            {hasActiveFilters && <button onClick={clearFilters} className={styles.clear_btn}><FiX /> Сбросить</button>}
          </div>
          <div className={styles.filters_grid}>
            <div className={styles.filter_group}>
              <label>Категория</label>
              <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
                <option value="">Все категории</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className={styles.filter_group}>
              <label>Поиск</label>
              <div className={styles.search_wrapper}>
                <FiSearch className={styles.search_icon} />
                <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Поиск услуг..." />
              </div>
            </div>
            <div className={styles.filter_group}>
              <label>Цена от</label>
              <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="0 ₽" />
            </div>
            <div className={styles.filter_group}>
              <label>Цена до</label>
              <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="9999 ₽" />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filters_mobile}>
        <button onClick={() => setShowFilters(true)} className={styles.show_filters_btn}><FiFilter /> Фильтры </button>
        
        {showFilters && (
          <div className={styles.modal_overlay} onClick={() => setShowFilters(false)}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modal_header}>
                <h3>Фильтры</h3>
                <button onClick={() => setShowFilters(false)} className={styles.close_modal_btn}><FiX /></button>
              </div>
              <div className={styles.modal_body}>
                <div className={styles.filter_group}>
                  <label>Категория</label>
                  <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
                    <option value="">Все категории</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className={styles.filter_group}>
                  <label>Поиск</label>
                  <div className={styles.search_wrapper}>
                    <FiSearch className={styles.search_icon} />
                    <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Поиск услуг..." />
                  </div>
                </div>
                <div className={styles.filter_group}>
                  <label>Цена от</label>
                  <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="0 ₽" />
                </div>
                <div className={styles.filter_group}>
                  <label>Цена до</label>
                  <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="9999 ₽" />
                </div>
              </div>
              <div className={styles.modal_footer}>
                <button onClick={clearFilters} className={styles.clear_filters_btn}>Сбросить все</button>
                <button onClick={() => setShowFilters(false)} className={styles.apply_filters_btn}>Применить</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {services.length === 0 ? (
        <div className={styles.empty_state}>
          <p>Услуги не найдены</p>
          <button onClick={clearFilters} className={styles.reset_btn}>Сбросить фильтры</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {services.map(service => (
            <div key={service.id} className={styles.service_card}>
              {service.photo && (
                <div className={styles.image_wrapper}>
                  <img src={`${API_URL}/uploads/services/${service.photo}`} alt={service.name} />
                </div>
              )}
              <div className={styles.service_content}>
                <h3>{service.name}</h3>
                <p className={styles.description}>{service.description.substring(0, 80)}...</p>
                <div className={styles.service_info}>
                  <span><FiClock /> {service.duration} мин</span>
                  <span><FiDollarSign /> {service.price} ₽</span>
                </div>
                <Link to={`/services/${service.id}`}>
                  <button className={styles.details_btn}>Подробнее</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;