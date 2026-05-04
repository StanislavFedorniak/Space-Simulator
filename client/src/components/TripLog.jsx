import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const readProtectedRouteError = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const errorData = await response.json().catch(() => ({}));
    return errorData.message || `Protected route request failed with status ${response.status}`;
  }

  const fallbackText = await response.text().catch(() => '');
  return fallbackText || `Unexpected non-JSON response received with status ${response.status}`;
};

function TripLog() {
  const [protectedStatus, setProtectedStatus] = useState('');
  const [protectedError, setProtectedError] = useState('');
  const [protectedUser, setProtectedUser] = useState(null);
  const [loadingProtected, setLoadingProtected] = useState(false);

  const handleProtectedRouteTest = async () => {
    setLoadingProtected(true);
    setProtectedError('');
    setProtectedStatus('');
    setProtectedUser(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('JWT token is missing from localStorage. Log in again to test the protected route.');
      }

      const response = await fetch(`${API_BASE_URL}/api/protected`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        throw new Error(await readProtectedRouteError(response));
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Unexpected non-JSON response received from the protected route.');
      }

      const data = await response.json();

      setProtectedStatus(data.message);
      setProtectedUser(data.user);
    } catch (error) {
      setProtectedError(error.message);
    } finally {
      setLoadingProtected(false);
    }
  };

  return (
    <section className="trip-log" aria-labelledby="trip-log-heading">
      <h2 id="trip-log-heading">Історія завершених подорожей</h2>

      <div className="protected-route-card">
        <h3>JWT перевірка</h3>
        <button type="button" onClick={handleProtectedRouteTest} disabled={loadingProtected} className="protected-route-button">
          {loadingProtected ? 'Перевірка...' : 'Test Protected Route'}
        </button>
        {protectedStatus && <p className="success-message">{protectedStatus}</p>}
        {protectedError && <p className="error-message">{protectedError}</p>}
        {protectedUser && (
          <pre className="protected-route-result">{JSON.stringify(protectedUser, null, 2)}</pre>
        )}
      </div>

      <article className="trip">
        <h3>МКС — ротація екіпажу</h3>
        <p>
          <strong>Дата завершення:</strong> 2025-11-02
        </p>
        <p>
          <strong>Маршрут:</strong> Земля → МКС → Земля
        </p>
        <p>
          <strong>Результат:</strong> успішно
        </p>
      </article>

      <article className="trip">
        <h3>Місяць — тест посадкового модуля</h3>
        <p>
          <strong>Дата завершення:</strong> 2024-08-19
        </p>
        <p>
          <strong>Маршрут:</strong> орбіта Місяця, зліт і посадка
        </p>
        <p>
          <strong>Результат:</strong> успішно, всі системи в нормі
        </p>
      </article>

      <article className="trip">
        <h3>Тестові маневри біля Лагранжа L1</h3>
        <p>
          <strong>Дата завершення:</strong> 2023-04-07
        </p>
        <p>
          <strong>Маршрут:</strong> Земля — точка L1 — Земля
        </p>
        <p>
          <strong>Результат:</strong> завершено з мінімальним витрачанням палива
        </p>
      </article>
    </section>
  );
}

export default TripLog;
