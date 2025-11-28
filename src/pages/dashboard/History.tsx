import React, { useState, useMemo } from 'react';
import { MOCK_QUIZ_HISTORY, type Quiz } from '../../services/mockData';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Finished' | 'Unfinished'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredQuizzes = useMemo(() => {
    return MOCK_QUIZ_HISTORY.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || quiz.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const currentQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '2rem',
        color: 'var(--color-text)'
      }}>
        Previous Quizzes
      </h1>

      {/* Controls Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)',
              fontSize: '1rem'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-secondary)'
          }}>
            🔍
          </span>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'var(--color-bg-secondary)',
          padding: '0.25rem',
          borderRadius: '8px'
        }}>
          {(['All', 'Finished', 'Unfinished'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === tab ? 'var(--color-card-bg)' : 'transparent',
                color: activeTab === tab ? 'var(--color-text)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {currentQuizzes.map((quiz) => (
          <div key={quiz.id} style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--color-card-bg)',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid var(--color-border)'
          }}>
            {/* Image */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginRight: '1.5rem',
              flexShrink: 0
            }}>
              <img
                src={quiz.image}
                alt={quiz.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: '0 0 0.25rem 0',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--color-text)'
              }}>
                {quiz.title}
              </h3>
              <p style={{
                margin: 0,
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem'
              }}>
                {quiz.subject} • {new Date(quiz.date).toLocaleDateString()}
              </p>
            </div>

            {/* Status/Score */}
            <div style={{ textAlign: 'right' }}>
              {quiz.status === 'Finished' ? (
                <div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: quiz.score >= 80 ? 'var(--color-success)' : quiz.score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
                  }}>
                    {quiz.score}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {quiz.totalQuestions} Questions
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: '20px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  Unfinished
                </div>
              )}
            </div>
          </div>
        ))}

        {currentQuizzes.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-text-secondary)'
          }}>
            No quizzes found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '2rem'
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: currentPage === page ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: currentPage === page ? 'white' : 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;