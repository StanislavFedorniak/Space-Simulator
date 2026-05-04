import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const readResponseError = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const errorData = await response.json().catch(() => ({}));
    return errorData.message || `Request failed with status ${response.status}`;
  }

  const errorText = await response.text().catch(() => '');
  return errorText || `Unexpected non-JSON response received with status ${response.status}`;
};

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
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

        const response = await fetch(`${API_BASE_URL}/api/missions`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });

        const contentType = response.headers.get('content-type') || '';

        if (!response.ok) {
          throw new Error(await readResponseError(response));
        }

        if (!contentType.includes('application/json')) {
          throw new Error('Server returned a non-JSON response while loading missions.');
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
    
    if (!formData.title.trim()) {
      setFormMessage('Помилка: Назва місії є обов\'язковою');
      setFormMessageType('error');
      return;
    }

    if (!formData.description.trim()) {
      setFormMessage('Помилка: Опис місії є обов\'язковим');
      setFormMessageType('error');
      return;
    }

    if (!formData.startTime) {
      setFormMessage('Помилка: Час початку є обов\'язковим');
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

      const response = await fetch(`${API_BASE_URL}/api/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          startTime: formData.startTime
        })
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        throw new Error(await readResponseError(response));
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Server returned a non-JSON response while creating a mission.');
      }

      const data = await response.json();
      if (data.success) {
        // Add new mission to local state immediately
        setMissions(prev => [...prev, data.mission]);
        
        // Clear form
        setFormData({
          title: '',
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
        <form className="mission-form mission-form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Назва місії</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Введіть назву місії"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Опис</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Введіть опис місії"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="startTime">Час початку</label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mission-form-actions">
            <button type="submit" className="submit-btn">
              Зберегти місію
            </button>
          </div>
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
            <article key={mission.id} className="mission mission-card">
              <div className="mission-header">
                <div className="mission-info">
                  <h3>{mission.title}</h3>
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

