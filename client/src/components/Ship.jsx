import { useState, useEffect } from 'react';
import { fetchShipData, saveShipData } from '../services/dbServices';
import { auth } from '../firebase';

function Ship() {
  const [shipData, setShipData] = useState({
    name: '',
    fuel: 76,
    hull: 98,
    shields: 100,
    crew: 'Готовий'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadShipData = async () => {
      if (auth.currentUser) {
        try {
          const data = await fetchShipData();
          if (data) {
            setShipData(prev => ({
              ...prev,
              name: data.name || '',
              fuel: data.fuel || 76
            }));
          }
        } catch (error) {
          console.error('Error loading ship data:', error);
        }
      }
      setLoading(false);
    };

    loadShipData();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) {
      setSaveMessage('Спочатку увійдіть в систему');
      return;
    }

    setSaving(true);
    setSaveMessage('');
    
    try {
      await saveShipData(shipData.name, shipData.fuel);
      setSaveMessage('Дані корабля успішно збережено!');
    } catch (error) {
      console.error('Error saving ship data:', error);
      setSaveMessage('Помилка збереження даних');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="ship" aria-labelledby="ship-heading">
        <h2 id="ship-heading">Стан космічного корабля</h2>
        <p>Завантаження даних...</p>
      </section>
    );
  }

  return (
    <section className="ship" aria-labelledby="ship-heading">
      <h2 id="ship-heading">Стан космічного корабля</h2>
      
      <div className="ship-stats-container">
        <div className="stat-item">
          <p>Корпус</p>
          <strong>{shipData.hull}%</strong>
        </div>
        <div className="stat-item">
          <p>Щити</p>
          <strong>{shipData.shields}%</strong>
        </div>
        <div className="stat-item">
          <p>Паливо</p>
          <strong>{shipData.fuel}%</strong>
        </div>
        <div className="stat-item">
          <p>Екіпаж</p>
          <strong>{shipData.crew}</strong>
        </div>
      </div>

      {auth.currentUser && (
        <div className="ship-config-form">
          <h3>Налаштування корабля</h3>
          <div className="form-group">
            <label htmlFor="ship-name">Назва корабля:</label>
            <input
              id="ship-name"
              type="text"
              value={shipData.name}
              onChange={(e) => setShipData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введіть назву корабля"
            />
          </div>
          <div className="form-group">
            <label htmlFor="fuel-level">Рівень палива (%):</label>
            <input
              id="fuel-level"
              type="number"
              min="0"
              max="100"
              value={shipData.fuel}
              onChange={(e) => setShipData(prev => ({ ...prev, fuel: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="save-ship-button"
          >
            {saving ? 'Збереження...' : 'Зберегти конфігурацію'}
          </button>
          {saveMessage && (
            <div className={`save-message ${saveMessage.includes('Помилка') ? 'error' : 'success'}`}>
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Ship;
