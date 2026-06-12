import React from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import styles from '../AdminPanel.module.css';

const SearchBar = ({ searchTerm, setSearchTerm, activeTab, tabs, totalCount, onAddClick }) => {
  const currentTabLabel = tabs.find(t => t.id === activeTab)?.label || '';
  
  return (
    <div className={styles.search_section}>
      <div className={styles.search_bar}>
        <FiSearch className={styles.search_icon} />
        <input
          type="text"
          placeholder={`Поиск ${currentTabLabel.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.search_input}
        />
      </div>
      <div className={styles.search_info}>
        <span className={styles.result_count}>Найдено: {totalCount}</span>
        <button onClick={onAddClick} className={styles.add_btn}>
          <FiPlus /> Добавить {currentTabLabel.toLowerCase()}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;