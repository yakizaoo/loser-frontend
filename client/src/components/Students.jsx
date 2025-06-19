import React, { useState, useEffect } from 'react';
import '../styles/minimalist.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/users?role=student');
        if (!response.ok) {
          throw new Error('Ошибка при загрузке студентов');
        }
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="students-page">
      <h1>Студенты</h1>
      <div className="students-list">
        {students.map(student => (
          <div key={student.id} className="student-item">
            <div className="student-info">
              <span className="student-name">{student.name}</span>
              <span className="student-email">{student.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Students;
