import { useState, useEffect } from 'react';

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: ''
  });
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState('');

  // Fetch missions from backend API
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Токен автентифікації відсутній. Будь ласка, увійдіть знову.');
          return;
        }

        const response = await fetch('/api/missions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Помилка завантаження місій');
        }

        const data = await response.json();
        if (data.success) {
          setMissions(data.missions);
        } else {
          throw new Error(data.message || 'Помилка завантаження місій');
        }
      } catch (err) {
        console.error('Error fetching missions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormMessage('Помилка: Назва місії є обов\'язковою');
      setFormMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFormMessage('Помилка: Токен автентифікації відсутній');
        setFormMessageType('error');
        return;
      }

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          startTime: formData.startTime || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка створення місії');
      }

      const data = await response.json();
      if (data.success) {
        // Add new mission to local state immediately
        setMissions(prev => [...prev, data.mission]);
        
        // Clear form
        setFormData({
          name: '',
          description: '',
          startTime: ''
        });
        
        setFormMessage('Місію успішно створено!');
        setFormMessageType('success');
      } else {
        throw new Error(data.message || 'Помилка створення місії');
      }
    } catch (err) {
      console.error('Error creating mission:', err);
      setFormMessage(err.message);
      setFormMessageType('error');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="missions" aria-labelledby="missions-heading">
      <h2 id="missions-heading">Мої подорожі</h2>

      {/* Form for creating new missions */}
      <div className="mission-form-container">
        <h3>Створити нову місію</h3>
        <form className="mission-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Назва місії:
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введіть назву місії"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="description">
              Опис:
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Введіть опис місії"
                rows="3"
              />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="startTime">
              Час початку:
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <button type="submit" className="submit-btn">
            Зберегти місію
          </button>
        </form>

        {formMessage && (
          <div className={`form-message ${formMessageType}`}>
            {formMessage}
          </div>
        )}
      </div>

      {/* Display missions list */}
      <div className="missions-list">
        <h3>Активні місії</h3>
        
        {loading ? (
          <p className="loading-message">Завантаження місій...</p>
        ) : error ? (
          <p className="error-message">Помилка: {error}</p>
        ) : missions.length === 0 ? (
          <p className="no-missions-message">
            Немає активних місій. Створіть свою першу місію!
          </p>
        ) : (
          missions.map((mission) => (
            <article key={mission.id} className="mission">
              <div className="mission-header">
                <div className="mission-info">
                  <h3>{mission.name}</h3>
                  <p>
                    <strong>Опис:</strong> {mission.description || 'Опис відсутній'}
                  </p>
                  <p>
                    <strong>Час початку:</strong> {formatDate(mission.startTime)}
                  </p>
                  <p>
                    <strong>Статус:</strong> {mission.status}
                  </p>
                  <p>
                    <strong>Створено:</strong> {formatDate(mission.createdAt)}
                  </p>
                  {mission.user && (
                    <p>
                      <strong>Автор:</strong> {mission.user.username}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default Missions;

