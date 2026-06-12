import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiMapPin, FiPhone, FiMail, FiClock, FiChevronDown, FiChevronUp, 
  FiCamera, FiUser, FiPhoneCall, FiNavigation, FiAward, FiUsers, FiStar 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from './About.module.css';
import { useTheme } from '../../contexts/ThemeContext';
import { API_URL } from '../../config';

const About = () => {
  const [masters, setMasters] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const [galleryImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600', title: 'Зона стрижки' },
    { id: 2, url: 'https://images.unsplash.com/photo-1583244685026-851c62b2d3c7?w=600', title: 'Маникюрный зал' },
    { id: 3, url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600', title: 'Салон красоты' },
    { id: 4, url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600', title: 'Зона ожидания' },
    { id: 5, url: 'https://images.unsplash.com/photo-1583244685026-851c62b2d3c7?w=600', title: 'Кабинет мастера' },
    { id: 6, url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600', title: 'Интерьер салона' }
  ]);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const response = await axios.get('/api/masters');
      setMasters(response.data.slice(0, 4));
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
    } finally {
      setLoading(false);
    }
  };

  const faqData = [
    {
      id: 1,
      question: 'Как записаться на услугу?',
      answer: 'Вы можете записаться онлайн через наш сайт, выбрав услугу, мастера и удобное время. Также вы можете позвонить нам по телефону +7 (495) 123-45-67 или написать в мессенджеры.'
    },
    {
      id: 2,
      question: 'Нужно ли вносить предоплату?',
      answer: 'Предоплата не требуется. Оплата производится после оказания услуги наличными, банковской картой или через терминал.'
    },
    {
      id: 3,
      question: 'Можно ли отменить или перенести запись?',
      answer: 'Да, вы можете отменить или перенести запись за 2 часа до назначенного времени без штрафных санкций. Для этого зайдите в личный кабинет или позвоните администратору.'
    },
    {
      id: 4,
      question: 'Есть ли скидки для постоянных клиентов?',
      answer: 'Да, для постоянных клиентов действует накопительная система скидок. После 5 посещений вы получаете скидку 10%, после 10 - 15%. Также регулярно проводятся акции и специальные предложения.'
    },
    {
      id: 5,
      question: 'Какие бренды косметики вы используете?',
      answer: 'Мы работаем только с профессиональной косметикой ведущих брендов: L\'Oreal, Wella, Kerastase, OPI, CND и других. Все средства сертифицированы и безопасны.'
    },
    {
      id: 6,
      question: 'Есть ли парковка рядом с салоном?',
      answer: 'Да, рядом с салоном есть бесплатная парковка для клиентов, а также охраняемая парковка в 50 метрах от входа.'
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className={styles.about}>
     
      <div className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Наши мастера</h2>
          <div className={styles.mastersGrid}>
            {masters.map(master => (
              <div key={master.id} className={styles.masterCard}>
                <div className={styles.masterImage}>
                  {master.photo ? (
                    <img 
                      src={`${API_URL}/uploads/${master.photo}`} 
                      alt={master.User.firstName}
                    />
                  ) : (
                    <div className={styles.masterImagePlaceholder}>
                      <FiUser />
                    </div>
                  )}
                </div>
                <div className={styles.masterContent}>
                  <h3>{master.User.firstName} {master.User.lastName}</h3>
                  <p className={styles.masterBadge}>Топ-мастер</p>
                  <p className={styles.masterBio}>
                    {master.bio || 'Опытный мастер с многолетним стажем. Профессионал своего дела, постоянно повышает квалификацию.'}
                  </p>
                  <Link to="/catalog">
                    <button className={styles.masterBtn}>Записаться к мастеру</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Галерея салона */}
      <div className={`${styles.section} ${styles.sectionGray}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Галерея салона</h2>
          <div className={styles.galleryGrid}>
            {galleryImages.map(image => (
              <div key={image.id} className={styles.galleryItem}>
                <img 
                  src={image.url} 
                  alt={image.title}
                  className={styles.galleryImage}
                />
                <div className={styles.galleryOverlay}>
                  <FiCamera />
                  <p>{image.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Вопросы и ответы */}
      <div className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
          <div className={styles.faqList}>
            {faqData.map(faq => (
              <div key={faq.id} className={styles.faqItem}>
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className={styles.faqQuestion}
                >
                  <span>{faq.question}</span>
                  {openFaq === faq.id ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === faq.id && (
                  <div className={styles.faqAnswer}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Как добраться</h2>
          <div className={styles.mapContainer}>
            <div className={styles.mapWrapper}>
              <iframe
                src="https://yandex.ru/map-widget/v1/?um=constructor%
                3Ac2d2f7ff039c176f138ff8432e610741ee969c2a63d6a8ad06332fe119931b7f&amp;source=constructor"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                title="Карта салона"
              />
            </div>
            <div className={styles.contactCard}>
              <h3>Контактная информация</h3>
              
              <div className={styles.contactItem}>
                <FiMapPin />
                <div>
                  <div className={styles.contactLabel}>Адрес</div>
                  <div className={styles.contactValue}>г. Оренбург, пер. Южный, 35, 1 этаж</div>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <FiPhone />
                <div>
                  <div className={styles.contactLabel}>Телефон</div>
                  <div className={styles.contactValue}>+7 (987) 857-74-74</div>
                </div>
              </div>
              
                           
              <div className={styles.contactItem}>
                <FiClock />
                <div>
                  <div className={styles.contactLabel}>Режим работы</div>
                  <div className={styles.contactValue}>C 10:00 до 20:00 (Пн-Вс)</div>
                  <div className={styles.contactValue}>По предварительной записи</div>
                </div>
              </div>
              
              <div className={styles.contactActions}>
                <Link to="/catalog">
                  <button className={styles.bookBtn}>Записаться онлайн</button>
                </Link>
                <a href="tel:+79878577474" className={styles.iconBtn}>
                  <FiPhoneCall />
                </a>
                <a href="https://yandex.ru/profile/-/CPgu4Ljn" target="_blank" rel="noopener noreferrer" className={styles.iconBtn}>
                  <FiNavigation />
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default About;