import React, { useState } from 'react';
import { useSearchContext } from '../context/SearchContext';
import { SearchBar } from './SearchBar';
import { ActiveTabs } from './ActiveTabs';
import { UnusedTabs } from './UnusedTabs';
import { OldTabs } from './OldTabs';

type Section = 'active' | 'inactive' | 'forgotten';

interface SectionViewProps {
  section: Section;
  onBack: () => void;
}

const sectionTitles: Record<Section, string> = {
  active: 'Active Tabs',
  inactive: 'Recently Inactive',
  forgotten: 'Forgotten Tabs',
};

export const SectionView: React.FC<SectionViewProps> = ({ section, onBack }) => {
  const { setSearchQuery } = useSearchContext();
  const [showingDetail, setShowingDetail] = useState(false);

  const handleBack = () => {
    setSearchQuery('');
    onBack();
  };

  return (
    <div className="section-view">
      {!showingDetail && (
        <>
          <button className="back-icon-button" onClick={handleBack} aria-label="Back to home">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className="section-view-title">{sectionTitles[section]}</h2>
          <div className="section-view-search">
            <SearchBar />
          </div>
        </>
      )}
      {section === 'active' && <ActiveTabs onDetailView={setShowingDetail} />}
      {section === 'inactive' && <UnusedTabs onDetailView={setShowingDetail} />}
      {section === 'forgotten' && <OldTabs onDetailView={setShowingDetail} />}
    </div>
  );
};
