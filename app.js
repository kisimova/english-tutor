 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app.js b/app.js
new file mode 100644
index 0000000000000000000000000000000000000000..576686e9229d91f77ce9fd11612adf4f6d8960fd
--- /dev/null
+++ b/app.js
@@ -0,0 +1,151 @@
+const $ = (id) => document.getElementById(id);
+
+const scrollButtons = document.querySelectorAll('[data-scroll]');
+scrollButtons.forEach((btn) => {
+  btn.addEventListener('click', () => {
+    const target = document.querySelector(btn.dataset.scroll);
+    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
+  });
+});
+
+const setMsg = (id, msg) => { $(id).textContent = msg; };
+
+$('bookingForm').addEventListener('submit', (e) => {
+  e.preventDefault();
+  const data = Object.fromEntries(new FormData(e.target).entries());
+  setMsg('bookingMsg', `Запрос для ${data.student} принят. Подтверждение отправлено в ${data.contact}.`);
+  e.target.reset();
+});
+
+$('payBtn').addEventListener('click', () => {
+  setMsg('payMsg', 'Checkout: подключите реальный URL платежного провайдера в app.js (TODO_PRODUCTION_CHECKOUT_URL).');
+});
+
+$('templateForm').addEventListener('submit', (e) => {
+  e.preventDefault();
+  const d = Object.fromEntries(new FormData(e.target).entries());
+  $('templateResult').classList.remove('muted');
+  $('templateResult').innerHTML = `
+    <b>Тема:</b> ${d.topic}<br>
+    <b>Цель:</b> ${d.goal}<br>
+    <b>Тип:</b> ${d.mode}<br><br>
+    1) Разогрев 7 мин<br>
+    2) Ввод материала 15 мин<br>
+    3) Практика 20 мин<br>
+    4) Продукция (говорение) 13 мин<br>
+    5) Домашнее задание 5 мин
+  `;
+});
+
+$('loginForm').addEventListener('submit', (e) => {
+  e.preventDefault();
+  setMsg('loginMsg', 'Вход выполнен (демо). Для production подключите backend авторизации (JWT/session).');
+  $('dashboard').style.outline = '2px solid #b8c8ff';
+});
+
+$('hwForm').addEventListener('submit', (e) => {
+  e.preventDefault();
+  setMsg('hwMsg', 'Ответ отправлен. Проверка появится в кабинете после проверки преподавателем.');
+  e.target.reset();
+});
+
+$('offlineForm').addEventListener('submit', (e) => {
+  e.preventDefault();
+  const d = Object.fromEntries(new FormData(e.target).entries());
+  $('offlineResult').classList.remove('muted');
+  $('offlineResult').innerHTML = `
+    <b>Printable worksheet</b><br>
+    Тема: ${d.topic}<br>
+    Уровень: ${d.level}<br><br>
+    • Vocabulary drill — 12 слов<br>
+    • Gap-fill — 10 предложений<br>
+    • Speaking cards — 6 ситуаций<br>
+    • Exit ticket — 5 вопросов
+  `;
+});
+
+const apiKeyInput = $('apiKey');
+const endpointInput = $('apiEndpoint');
+const modelInput = $('apiModel');
+
+endpointInput.value = localStorage.getItem('lt_endpoint') || endpointInput.value;
+modelInput.value = localStorage.getItem('lt_model') || modelInput.value;
+apiKeyInput.value = localStorage.getItem('lt_key') || '';
+
+[apiKeyInput, endpointInput, modelInput].forEach((input) => {
+  input.addEventListener('change', () => {
+    localStorage.setItem('lt_endpoint', endpointInput.value.trim());
+    localStorage.setItem('lt_model', modelInput.value.trim());
+    localStorage.setItem('lt_key', apiKeyInput.value.trim());
+  });
+});
+
+const fallbackAIPlan = (d) => `
+  <b>Персональный план (fallback режим)</b><br>
+  Ученик: ${d.student}<br>
+  Цель: ${d.objective}<br>
+  Интересы: ${d.interests || 'не указаны'}<br><br>
+  1) Icebreaker (8 мин) — разговор по интересам<br>
+  2) Input (12 мин) — объяснение структуры и примеров<br>
+  3) Guided practice (15 мин) — 8 заданий с подсказками<br>
+  4) Speaking mission (15 мин) — диалог/монолог под цель<br>
+  5) Review (5 мин) — корректировка ошибок
+  6) Homework (5 мин) — короткое письменное + voice note
+`;
+
+$('aiForm').addEventListener('submit', async (e) => {
+  e.preventDefault();
+  const btn = $('aiBtn');
+  const out = $('aiResult');
+  const msg = $('aiMsg');
+  const d = Object.fromEntries(new FormData(e.target).entries());
+  const apiKey = apiKeyInput.value.trim();
+  const endpoint = endpointInput.value.trim();
+  const model = modelInput.value.trim();
+
+  btn.disabled = true;
+  msg.textContent = 'Генерация плана...';
+
+  if (!apiKey) {
+    out.classList.remove('muted');
+    out.innerHTML = fallbackAIPlan(d);
+    msg.textContent = 'Нет API ключа: показан fallback-план.';
+    btn.disabled = false;
+    return;
+  }
+
+  try {
+    const prompt = `Собери практичный план урока английского на 60 минут. Ученик: ${d.student}. Цель: ${d.objective}. Интересы: ${d.interests || 'не указаны'}. Формат: тайминг, активности, домашка, критерии оценки.`;
+    const response = await fetch(endpoint, {
+      method: 'POST',
+      headers: {
+        'Content-Type': 'application/json',
+        Authorization: `Bearer ${apiKey}`,
+      },
+      body: JSON.stringify({
+        model,
+        messages: [
+          { role: 'system', content: 'Ты эксперт-методист по преподаванию английского.' },
+          { role: 'user', content: prompt },
+        ],
+        temperature: 0.6,
+      }),
+    });
+
+    if (!response.ok) throw new Error(`HTTP ${response.status}`);
+
+    const payload = await response.json();
+    const answer = payload?.choices?.[0]?.message?.content?.trim();
+    if (!answer) throw new Error('пустой ответ');
+
+    out.classList.remove('muted');
+    out.innerHTML = answer.replace(/\n/g, '<br>');
+    msg.textContent = 'План успешно сгенерирован через API.';
+  } catch (error) {
+    out.classList.remove('muted');
+    out.innerHTML = fallbackAIPlan(d);
+    msg.textContent = `API недоступен (${error.message}). Показан fallback-план.`;
+  } finally {
+    btn.disabled = false;
+  }
+});
 
EOF
)
