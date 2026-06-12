import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiScissors, FiArrowRight, FiUser, FiMail, FiMessageSquare,
  FiCheckCircle, FiAlertCircle, FiChevronLeft, FiChevronRight,
  FiX, FiPercent, FiCalendar, FiStar, FiFilter
} from 'react-icons/fi';
import styles from './Home.module.css';
import { API_URL } from '../../config';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [allWorksPhotos, setAllWorksPhotos] = useState([]);
  const [worksPhotos, setWorksPhotos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [feedbackStatus, setFeedbackStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewSlide, setReviewSlide] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [photoCurrentPage, setPhotoCurrentPage] = useState(0);
  const [promotionsSlide, setPromotionsSlide] = useState(0);
  const photosPerPage = 6;
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchWorksPhotos();
    fetchPromotions();
    fetchReviews();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    filterPhotosByCategory();
  }, [selectedCategory, allWorksPhotos]);

  useEffect(() => {
    setPhotoCurrentPage(0);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/services/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const fetchWorksPhotos = async () => {
    try {
      const response = await axios.get('/api/public/work-photos');
      setAllWorksPhotos(response.data);
      setWorksPhotos(response.data.slice(0, photosPerPage));
    } catch (error) {
      console.error('Ошибка загрузки фото работ:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await axios.get('/api/public/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Ошибка загрузки акций:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    }
  };

  const filterPhotosByCategory = () => {
    if (selectedCategory === 'all') {
      setWorksPhotos(allWorksPhotos.slice(0, photosPerPage));
    } else {
      const filtered = allWorksPhotos.filter(photo => photo.categoryId === parseInt(selectedCategory));
      setWorksPhotos(filtered.slice(0, photosPerPage));
    }
  };

  const handlePhotoNextPage = () => {
    let filteredPhotos;
    if (selectedCategory === 'all') {
      filteredPhotos = allWorksPhotos;
    } else {
      filteredPhotos = allWorksPhotos.filter(photo => photo.categoryId === parseInt(selectedCategory));
    }

    const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);
    if (photoCurrentPage + 1 < totalPages) {
      const newPage = photoCurrentPage + 1;
      setPhotoCurrentPage(newPage);
      const start = newPage * photosPerPage;
      setWorksPhotos(filteredPhotos.slice(start, start + photosPerPage));
    }
  };

  const handlePhotoPrevPage = () => {
    if (photoCurrentPage > 0) {
      const newPage = photoCurrentPage - 1;
      setPhotoCurrentPage(newPage);

      let filteredPhotos;
      if (selectedCategory === 'all') {
        filteredPhotos = allWorksPhotos;
      } else {
        filteredPhotos = allWorksPhotos.filter(photo => photo.categoryId === parseInt(selectedCategory));
      }

      const start = newPage * photosPerPage;
      setWorksPhotos(filteredPhotos.slice(start, start + photosPerPage));
    }
  };

  const handleResize = () => {
    if (window.innerWidth <= 480) {
      setSlidesToShow(1);
    } else if (window.innerWidth <= 768) {
      setSlidesToShow(2);
    } else {
      setSlidesToShow(3);
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, Math.max(0, categories.length - slidesToShow)));
  };

  const handlePromotionsPrev = () => {
    const promotionsToShow = slidesToShow > promotions.length ? promotions.length : slidesToShow;
    setPromotionsSlide(prev => Math.max(prev - 1, 0));
  };

  const handlePromotionsNext = () => {
    const promotionsToShow = slidesToShow > promotions.length ? promotions.length : slidesToShow;
    setPromotionsSlide(prev => Math.min(prev + 1, Math.max(0, promotions.length - promotionsToShow)));
  };

  const handleReviewPrev = () => {
    setReviewSlide(prev => Math.max(prev - 1, 0));
  };

  const handleReviewNext = () => {
    setReviewSlide(prev => Math.min(prev + 1, Math.max(0, reviews.length - slidesToShow)));
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/services?categoryId=${categoryId}`);
  };

  const handleFeedbackChange = (e) => {
    setFeedbackForm({
      ...feedbackForm,
      [e.target.name]: e.target.value
    });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackStatus({ message: '', type: '' });

    try {
      const response = await axios.post('/api/feedback', {
        name: feedbackForm.name,
        email: feedbackForm.email,
        message: feedbackForm.message
      });

      if (response.status === 201) {
        setFeedbackStatus({
          message: 'Спасибо за ваше сообщение! Оно отправлено на модерацию администратору.',
          type: 'success'
        });
        setFeedbackForm({ name: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      setFeedbackStatus({
        message: 'Произошла ошибка при отправке. Пожалуйста, попробуйте позже.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedbackStatus({ message: '', type: '' }), 5000);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getTotalPhotoPages = () => {
    let filteredPhotos;
    if (selectedCategory === 'all') {
      filteredPhotos = allWorksPhotos;
    } else {
      filteredPhotos = allWorksPhotos.filter(photo => photo.categoryId === parseInt(selectedCategory));
    }
    return Math.ceil(filteredPhotos.length / photosPerPage);
  };

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <div className={styles.hero_content}>
          <h1 className={styles.hero_title}>Добро пожаловать <br />в салон красоты «Атмосфера»</h1>
          <p className={styles.hero_subtitle}>Профессиональные услуги красоты по доступным ценам</p>
          <Link to="/services">
            <button className={styles.hero_btn}>Записаться сейчас</button>
          </Link>
        </div>
      </div>

      <div className={`${styles.section} container`}>
        <h2 className={styles.section_title}>Наши услуги</h2>
        {categories.length > 0 && (
          <div className={styles.slider_container}>
            <button className={styles.slider_arrow} onClick={handlePrevSlide} disabled={currentSlide === 0}>
              <FiChevronLeft />
            </button>

            <div className={styles.slider_wrapper}>
              <div className={styles.slider_track} style={{ transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` }}>
                {categories.map((category) => (
                  <div key={category.id} className={styles.slide_item} style={{ flex: `0 0 ${100 / slidesToShow}%` }}>
                    <div className={styles.category_card} onClick={() => handleCategoryClick(category.id)}>
                      <div className={styles.category_image}>
                        {category.photo ? (
                          <img src={`${API_URL}/uploads/categories/${category.photo}`} alt={category.name} />
                        ) : (
                          <div className={styles.category_image_placeholder}><FiScissors /></div>
                        )}
                        <div className={styles.category_overlay}>
                          <button className={styles.category_btn}>Подробнее <FiArrowRight /></button>
                        </div>
                      </div>
                      <div className={styles.category_content}>
                        <h3>{category.name}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className={styles.slider_arrow} onClick={handleNextSlide} disabled={currentSlide >= categories.length - slidesToShow}>
              <FiChevronRight />
            </button>
          </div>
        )}

        <div className={styles.slider_dots}>
          {Array.from({ length: Math.max(1, Math.ceil(categories.length / slidesToShow)) }).map((_, index) => (
            <button key={index} className={`${styles.slider_dot} ${currentSlide === index ? styles.active : ''}`} onClick={() => setCurrentSlide(index)} />
          ))}
        </div>
      </div>

      <div className={`${styles.section} ${styles.section_gray}`}>
        <div className='container'>
          <h2 className={styles.section_title}>Наши работы</h2>

          {categories.length > 0 && (
            <div className={styles.photo_filter}>
              <button
                className={`${styles.filter_btn} ${selectedCategory === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <FiFilter /> Все
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`${styles.filter_btn} ${selectedCategory === category.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {worksPhotos.length === 0 ? (
            <div className={styles.empty_state}><p>Фото работ скоро появятся</p></div>
          ) : (
            <>
              <div className={styles.works_grid}>
                {worksPhotos.map((photo, index) => (
                  <div key={index} className={styles.work_card} onClick={() => setSelectedPhoto(photo)}>
                    <div className={styles.work_image}>
                      <img src={`${API_URL}/uploads/works/${photo.imageUrl}`} alt={photo.description || 'Работа мастера'} />
                    </div>
                    <div className={styles.work_content}>
                      <p className={styles.work_master}><FiUser /> Мастер: {photo.masterName}</p>
                      <p className={styles.work_text}>{photo.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {getTotalPhotoPages() > 1 && (
                <div className={styles.photo_pagination}>
                  <button
                    onClick={handlePhotoPrevPage}
                    disabled={photoCurrentPage === 0}
                    className={styles.pagination_btn}
                  >
                    <FiChevronLeft /> Назад
                  </button>
                  <span className={styles.pagination_info}>
                    Страница {photoCurrentPage + 1} из {getTotalPhotoPages()}
                  </span>
                  <button
                    onClick={handlePhotoNextPage}
                    disabled={photoCurrentPage + 1 >= getTotalPhotoPages()}
                    className={styles.pagination_btn}
                  >
                    Вперед <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {promotions.length > 0 ? (
        <div className={`${styles.section} container`}>

          <h2 className={styles.section_title}>Акции и спецпредложения</h2>

          {promotions.length > 0 && (
            <div className={styles.slider_container}>
             

              <div className={styles.slider_wrapper}>
                <div className={styles.slider_track} style={{ transform: `translateX(-${promotionsSlide * (100 / slidesToShow)}%)` }}>
                  {promotions.map((promo) => (
                    <div key={promo.id} className={styles.promotion_slide} style={{ flex: `0 0 ${100 / slidesToShow}%` }}>
                      <div className={styles.promotion_card}>
                        {promo.imageUrl && (
                          <div className={styles.promotion_image}>
                            <img src={`${API_URL}/uploads/promotions/${promo.imageUrl}`} alt={promo.title} />
                          </div>
                        )}
                        <div className={styles.promotion_content}>
                          {promo.discount && promo.discount > 0 && (
                            <div className={styles.promotion_discount}>-{promo.discount}%</div>
                          )}
                          <h3>{promo.title}</h3>
                          <p>{promo.description}</p>
                          {promo.validTo && (
                            <p className={styles.promotion_date}>
                              <FiCalendar /> Действует до: {new Date(promo.validTo).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

           
            </div>
          )}

          {promotions.length > slidesToShow && (
            <div className={styles.slider_dots}>
              {Array.from({ length: Math.ceil(promotions.length / slidesToShow) }).map((_, index) => (
                <button
                  key={index}
                  className={`${styles.slider_dot} ${promotionsSlide === index ? styles.active : ''}`}
                  onClick={() => setPromotionsSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={`${styles.section} container`}>

          <h2 className={styles.section_title}> Акции и спецпредложения</h2>
          <div className={styles.no_promotions}>
            <h3>На данный момент нет активных акций</h3>
            <p>Следите за обновлениями, скоро появятся новые спецпредложения!</p>
          </div>
        </div>
      )}

      <div className={`${styles.section} ${styles.section_gray}`}>
        <div className='container'>
          <h2 className={styles.section_title}> Отзывы клиентов</h2>

          {reviews.length > 0 && (
            <div className={styles.slider_container}>
             

              <div className={styles.slider_wrapper}>
                <div className={styles.slider_track} style={{ transform: `translateX(-${reviewSlide * (100 / slidesToShow)}%)` }}>
                  {reviews.map((review) => (
                    <div key={review.id} className={styles.review_item} style={{ flex: `0 0 ${100 / slidesToShow}%` }}>
                      <div className={styles.review_card}>
                        <div className={styles.review_rating}>{renderStars(review.rating)}</div>
                        <p className={styles.review_text}>"{review.text}"</p>
                        <div className={styles.review_author}>
                          <strong>{review.User?.firstName} {review.User?.lastName}</strong>
                          <span>мастер: {review.Master?.User?.firstName} {review.Master?.User?.lastName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}


        </div>
      </div>

      <div className={styles.feedback_section}>
        <div className={styles.feedback_overlay}>
          <div className={styles.feedback_container}>
            <div className={styles.feedback_form_wrapper}>
              <h2 className={styles.feedback_title}>Обратная связь</h2>

              {feedbackStatus.message && (
                <div className={`${styles.feedback_status} ${styles[feedbackStatus.type]}`}>
                  {feedbackStatus.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                  {feedbackStatus.message}
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className={styles.feedback_form}>
                <div className={styles.form_group}>
                  <label><FiUser /> Ваше имя</label>
                  <input type="text" name="name" value={feedbackForm.name} onChange={handleFeedbackChange} placeholder="Введите ваше имя" required />
                </div>

                <div className={styles.form_group}>
                  <label><FiMail /> Почта</label>
                  <input type="email" name="email" value={feedbackForm.email} onChange={handleFeedbackChange} placeholder="example@mail.ru" required />
                </div>

                <div className={styles.form_group}>
                  <label><FiMessageSquare /> Ваше сообщение</label>
                  <textarea name="message" value={feedbackForm.message} onChange={handleFeedbackChange} rows="5" placeholder="Расскажите о вашем опыте посещения салона или задайте вопрос..." required />
                </div>

                <button type="submit" disabled={loading} className={styles.submit_btn}>
                  {loading ? 'Отправка...' : 'Отправить сообщение'}
                </button>
              </form>

              <p className={styles.feedback_note}>* Все сообщения проходят модерацию перед публикацией</p>
            </div>
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <div className={styles.photo_modal} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.photo_modal_content} onClick={(e) => e.stopPropagation()}>
            <button className={styles.photo_modal_close} onClick={() => setSelectedPhoto(null)}><FiX /></button>
            <img src={`${API_URL}/uploads/works/${selectedPhoto.imageUrl}`} alt={selectedPhoto.description} />
            <div className={styles.photo_modal_info}>
              <p><FiUser /> Мастер: {selectedPhoto.masterName}</p>
              <p>{selectedPhoto.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;