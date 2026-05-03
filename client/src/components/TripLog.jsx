function TripLog() {
  return (
    <section className="trip-log" aria-labelledby="trip-log-heading">
      <h2 id="trip-log-heading">Історія завершених подорожей</h2>

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
