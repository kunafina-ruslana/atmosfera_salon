import React from 'react';
import { FiUsers, FiGrid, FiTag, FiUserCheck, FiCalendar, FiStar, FiImage, FiPercent } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const iconMap = {
  users: FiUsers,
  services: FiGrid,
  categories: FiTag,
  masters: FiUserCheck,
  appointments: FiCalendar,
  reviews: FiStar,
  workPhotos: FiImage,
  promotions: FiPercent
};

const TabsNav = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className={styles.tabs}>
      {tabs.map(tab => {
        const Icon = iconMap[tab.id];
        return (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabsNav;