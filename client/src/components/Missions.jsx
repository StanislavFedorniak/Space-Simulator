import { useState, useEffect } from 'react';
import { fetchMissions } from '../services/dbServices';

function Missions() {
  const [difficulty, setDifficulty] = useState('усі');
  const [missionType, setMissionType] = useState('усі');
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [crewName, setCrewName] = useState('');
  const [crewRole, setCrewRole] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState('');

  useEffect(() => {
    const loadMissions = async () => {
      try {
        setLoading(true);
        const missionsData = await fetchMissions();
        setMissions(missionsData);
      } catch (err) {
        console.error('Error fetching missions from Firestore:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMissions();
  }, []);

  const handleMissionSelect = (missionId) => {
    const mission = missions.find(m => m.id === missionId);
    setSelectedMission(mission);
    setFormMessage('');
    setFormMessageType('');
  };

  const handleCrewSubmit = (e) => {
    e.preventDefault();
    
    if (!crewName.trim() || !crewRole.trim()) {
      setFormMessage('Помилка: Заповніть ім\'я та спеціалізацію');
      setFormMessageType('error');
      return;
    }

    if (!selectedMission) {
      setFormMessage('Помилка: Спочатку оберіть місію');
      setFormMessageType('error');
      return;
    }

    setMissions(prevMissions => 
      prevMissions.map(mission => {
        if (mission.id === selectedMission.id) {
          if (mission.crew.length < mission.maxCrew) {
            const newCrew = [...mission.crew, { name: crewName.trim(), role: crewRole.trim() }];
            return {
              ...mission,
              crew: newCrew,
              status: newCrew.length >= mission.maxCrew ? 'повний' : 'набір'
            };
          }
        }
        return mission;
      })
    );

    setCrewName('');
    setCrewRole('');
    setFormMessage('Член екіпажу успішно додано!');
    setFormMessageType('success');
  };

  const handleCandidateSelect = (candidate) => {
    setCrewName(candidate.name);
    setCrewRole(candidate.role);
  };

  const filteredMissions = missions.filter((m) => {
    const byDifficulty = difficulty === 'усі' || m.difficulty === difficulty;
    const byType = missionType === 'усі' || m.type === missionType;
    return byDifficulty && byType;
  });

  return (
    <section className="missions" aria-labelledby="missions-heading">
      <h2 id="missions-heading">Доступні експедиції</h2>

      <div className="mission-filters">
        <label className="filter-label">
          <span>Складність</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="mission-btn"
            aria-label="Фільтр за складністю"
          >
            <option value="усі">Усі</option>
            <option value="легка">Легка</option>
            <option value="середня">Середня</option>
            <option value="складна">Складна</option>
          </select>
        </label>
        <label className="filter-label">
          <span>Тип місії</span>
          <select
            value={missionType}
            onChange={(e) => setMissionType(e.target.value)}
            className="mission-btn"
            aria-label="Фільтр за типом місії"
          >
            <option value="усі">Усі</option>
            <option value="дослідницька">Дослідницькі</option>
            <option value="рятувальна">Рятувальні</option>
            <option value="колонізація">Колонізація</option>
          </select>
        </label>
      </div>

      {selectedMission && (
        <div className="crew-form-container">
          <h3>Управління екіпажем для: {selectedMission.title}</h3>
          
          <div className="candidates-section">
            <h4>Доступні кандидати:</h4>
            <div className="candidates-list">
              {missions.find(m => m.id === 1)?.crew?.length === 0 && (
                <>
                  <div 
                    className="candidate-item" 
                    onClick={() => handleCandidateSelect({ name: 'Олена Коваленко', role: 'Головний інженер' })}
                  >
                    Олена Коваленко - Головний інженер
                  </div>
                  <div 
                    className="candidate-item" 
                    onClick={() => handleCandidateSelect({ name: 'Марк Уотні', role: 'Ботанік' })}
                  >
                    Марк Уотні - Ботанік
                  </div>
                  <div 
                    className="candidate-item" 
                    onClick={() => handleCandidateSelect({ name: 'Купер', role: 'Пілот-випробувач' })}
                  >
                    Купер - Пілот-випробувач
                  </div>
                </>
              )}
            </div>
          </div>

          <form className="crew-form" onSubmit={handleCrewSubmit}>
            <div className="form-group">
              <label>
                Ім\'я:
                <input
                  type="text"
                  value={crewName}
                  onChange={(e) => setCrewName(e.target.value)}
                  placeholder="Введіть ім\'я члена екіпажу"
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Спеціалізація:
                <input
                  type="text"
                  value={crewRole}
                  onChange={(e) => setCrewRole(e.target.value)}
                  placeholder="Введіть спеціалізацію"
                />
              </label>
            </div>
            <button type="submit" className="submit-btn">
              Додати до екіпажу
            </button>
          </form>

          {formMessage && (
            <div className={`form-message ${formMessageType}`}>
              {formMessage}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="loading-message">Завантаження місій...</p>
      ) : error ? (
        <p className="error-message">Помилка: {error}</p>
      ) : filteredMissions.length === 0 ? (
        <p className="no-missions-message">
          Немає місій за обраними фільтрами. Спробуйте змінити складність або тип.
        </p>
      ) : (
        filteredMissions.map((mission) => (
          <article key={mission.id} className="mission">
            <div className="mission-header">
              <img 
                src={process.env.PUBLIC_URL + mission.image} 
                alt={`Зображення місії: ${mission.title}`}
                className="mission-image"
              />
              <div className="mission-info">
                <h3>{mission.title}</h3>
                <p>
                  <strong>Опис:</strong> {mission.description}
                </p>
                <p>
                  <strong>Призначення:</strong> {mission.destination}
                </p>
              </div>
            </div>
            <div className="mission-tasks">
              <strong>Завдання:</strong>
              <ul>
                {mission.tasks.map((task, index) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>
            <div className="mission-crew">
              <p>
                <strong>Екіпаж:</strong> {mission.crew?.length || 0}/{mission.maxCrew}
              </p>
              <p>
                <strong>Статус:</strong> {mission.status}
              </p>
              
              {mission.crew && mission.crew.length > 0 && (
                <div className="crew-members">
                  <strong>Склад екіпажу:</strong>
                  <ul>
                    {mission.crew.map((member, index) => (
                      <li key={index}>
                        <strong>{member.name}</strong> — <em>{member.role}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button 
                className="crew-button"
                onClick={() => handleMissionSelect(mission.id)}
                disabled={mission.crew?.length >= mission.maxCrew}
              >
                {selectedMission?.id === mission.id ? 'Обрано' : 
                 mission.crew?.length >= mission.maxCrew ? 'Екіпаж повний' : 'Обрати місію'}
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}

export default Missions;

