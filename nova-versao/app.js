(() => {
  'use strict';

  const STORAGE = Object.freeze({
    admins: 'nc_v2_system_admins',
    registrations: 'nc_v2_pending_registrations',
    migration: 'nc_v2_cache_reset_20260731'
  });

  const SYSTEM_ADMINS = Object.freeze([
    Object.freeze({
      id: 'admin-tiago',
      fullName: 'Tiago Pereira de Albuquerque',
      role: 'Administrador',
      status: 'Pré-cadastrado',
      credentialStatus: 'Credenciais pendentes'
    }),
    Object.freeze({
      id: 'admin-helio',
      fullName: 'Hélio da Silva Pereira',
      role: 'Administrador',
      status: 'Pré-cadastrado',
      credentialStatus: 'Credenciais pendentes'
    })
  ]);

  const STEP_TITLES = ['Identificação', 'Contato', 'Operação', 'Acesso', 'Revisão'];
  const form = document.getElementById('registrationForm');
  let currentStep = 1;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function safeParse(value, fallback) {
    try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
  }

  function normalize(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function getRegistrations() {
    return safeParse(localStorage.getItem(STORAGE.registrations), []);
  }

  function saveRegistrations(items) {
    localStorage.setItem(STORAGE.registrations, JSON.stringify(items));
  }

  function seedAdmins() {
    localStorage.setItem(STORAGE.admins, JSON.stringify(SYSTEM_ADMINS));
    const list = $('#adminList');
    if (!list) return;
    list.innerHTML = SYSTEM_ADMINS.map(admin => `
      <article class="admin-item">
        <div>
          <strong>${escapeHtml(admin.fullName)}</strong>
          <small>${escapeHtml(admin.status)} · ${escapeHtml(admin.credentialStatus)}</small>
        </div>
        <span class="admin-role">${escapeHtml(admin.role)}</span>
      </article>
    `).join('');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function showView(id, updateHash = true) {
    const target = document.getElementById(id);
    if (!target) return;
    $$('.view').forEach(view => view.classList.toggle('active', view === target));
    if (id === 'registrationView') updateWizard();
    if (updateHash) history.replaceState(null, '', id === 'landingView' ? '#inicio' : `#${id.replace('View', '')}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function routeFromHash() {
    const routes = {
      '#inicio': 'landingView',
      '#cadastro': 'registrationView',
      '#registration': 'registrationView',
      '#acesso': 'accessView',
      '#access': 'accessView'
    };
    showView(routes[window.location.hash] || 'landingView', false);
  }

  function bindRoutes() {
    document.addEventListener('click', event => {
      const control = event.target.closest('[data-route]');
      if (!control) return;
      event.preventDefault();
      showView(control.dataset.route);
    });
    window.addEventListener('hashchange', routeFromHash);
  }

  function maskCpf(value) {
    return value.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function maskPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  }

  function validateCpf(cpf) {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
    const calculate = length => {
      let sum = 0;
      for (let index = 0; index < length; index += 1) sum += Number(digits[index]) * (length + 1 - index);
      const remainder = (sum * 10) % 11;
      return remainder === 10 ? 0 : remainder;
    };
    return calculate(9) === Number(digits[9]) && calculate(10) === Number(digits[10]);
  }

  function setError(field, message = '') {
    const error = $(`[data-error-for="${field.name}"]`);
    field.classList.toggle('invalid', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
  }

  function validateField(field) {
    const value = field.type === 'checkbox' ? field.checked : field.value.trim();
    let message = '';

    if (field.required && !value) message = 'Campo obrigatório.';
    if (!message && field.name === 'cpf' && !validateCpf(field.value)) message = 'Informe um CPF válido.';
    if (!message && field.name === 'phone' && field.value.replace(/\D/g, '').length < 10) message = 'Informe um telefone válido.';
    if (!message && field.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) message = 'Informe um e-mail válido.';
    if (!message && field.name === 'birthDate') {
      const date = new Date(`${field.value}T12:00:00`);
      const today = new Date();
      if (Number.isNaN(date.getTime()) || date > today) message = 'Informe uma data válida.';
    }
    if (!message && field.name === 'username') {
      const username = normalize(field.value);
      const pattern = /^[a-z0-9._-]{4,40}$/;
      const duplicate = getRegistrations().some(item => normalize(item.username) === username);
      if (!pattern.test(username)) message = 'Use de 4 a 40 caracteres válidos.';
      else if (duplicate) message = 'Este nome de usuário já foi solicitado.';
    }

    setError(field, message);
    return !message;
  }

  function validateCurrentStep() {
    const step = $(`.form-step[data-step="${currentStep}"]`, form);
    if (!step) return true;
    const fields = $$('input, select', step).filter(field => field.required || field.value);
    const results = fields.map(validateField);
    const firstInvalid = fields.find(field => field.classList.contains('invalid'));
    if (firstInvalid) firstInvalid.focus();
    return results.every(Boolean);
  }

  function updateWizard() {
    $$('.form-step', form).forEach(step => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
    $$('[data-step-dot]').forEach(dot => {
      const step = Number(dot.dataset.stepDot);
      dot.classList.toggle('active', step === currentStep);
      dot.classList.toggle('complete', step < currentStep);
    });

    const percent = currentStep * 20;
    $('#stepLabel').textContent = `Etapa ${currentStep} de 5`;
    $('#stepTitle').textContent = STEP_TITLES[currentStep - 1];
    $('#progressPercent').textContent = `${percent}%`;
    $('#progressBar').style.width = `${percent}%`;
    $('#previousStep').hidden = currentStep === 1;
    $('#nextStep').hidden = currentStep === 5;
    $('#submitRegistration').hidden = currentStep !== 5;

    if (currentStep === 5) renderReview();
  }

  function renderReview() {
    const data = new FormData(form);
    const rows = [
      ['Nome completo', data.get('fullName')],
      ['CPF', data.get('cpf')],
      ['Nascimento', formatDate(data.get('birthDate'))],
      ['WhatsApp', data.get('phone')],
      ['E-mail', data.get('email')],
      ['Função', data.get('jobTitle')],
      ['Perfil solicitado', data.get('requestedRole')],
      ['Localidade', `${data.get('city')} / ${data.get('state')}`],
      ['Nome de usuário', data.get('username')],
      ['Situação inicial', 'Aguardando aprovação']
    ];
    $('#reviewGrid').innerHTML = rows.map(([label, value]) => `
      <div class="review-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '—')}</strong></div>
    `).join('');
  }

  function formatDate(value) {
    if (!value) return '—';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  function protocol() {
    const now = new Date();
    const stamp = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('');
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `NC-${stamp}-${random}`;
  }

  function submitRegistration(event) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const registration = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `reg-${Date.now()}`,
      protocol: protocol(),
      fullName: data.fullName.trim(),
      cpf: data.cpf,
      birthDate: data.birthDate,
      phone: data.phone,
      email: data.email.trim().toLowerCase(),
      company: 'Natural Castanhas',
      jobTitle: data.jobTitle.trim(),
      requestedRole: data.requestedRole,
      city: data.city.trim(),
      state: data.state,
      username: normalize(data.username),
      role: 'Pendente de definição',
      status: 'Aguardando aprovação',
      createdAt: new Date().toISOString(),
      source: 'cadastro-inicial-v1'
    };

    const registrations = getRegistrations();
    registrations.push(registration);
    saveRegistrations(registrations);

    $('#registrationProtocol').textContent = registration.protocol;
    form.reset();
    form.elements.company.value = 'Natural Castanhas';
    currentStep = 1;
    updateWizard();
    showView('successView');
  }

  function bindForm() {
    if (!form) return;

    form.elements.cpf.addEventListener('input', event => { event.target.value = maskCpf(event.target.value); setError(event.target); });
    form.elements.phone.addEventListener('input', event => { event.target.value = maskPhone(event.target.value); setError(event.target); });
    form.elements.username.addEventListener('input', event => {
      event.target.value = normalize(event.target.value).replace(/[^a-z0-9._-]/g, '');
      setError(event.target);
    });
    $$('input, select', form).forEach(field => field.addEventListener('blur', () => {
      if (field.required || field.value) validateField(field);
    }));

    $('#nextStep').addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      currentStep = Math.min(5, currentStep + 1);
      updateWizard();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $('#previousStep').addEventListener('click', () => {
      currentStep = Math.max(1, currentStep - 1);
      updateWizard();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    form.addEventListener('submit', submitRegistration);
    updateWizard();
  }

  function findAccessRecord(value) {
    const needle = normalize(value);
    const admin = SYSTEM_ADMINS.find(item => normalize(item.fullName) === needle || normalize(item.id) === needle);
    if (admin) return { type: 'admin', record: admin };
    const registration = getRegistrations().find(item => [item.fullName, item.username, item.email, item.protocol].some(field => normalize(field) === needle));
    if (registration) return { type: 'registration', record: registration };
    return null;
  }

  function bindLookup() {
    const lookupForm = $('#accessLookupForm');
    const result = $('#lookupResult');
    if (!lookupForm || !result) return;

    lookupForm.addEventListener('submit', event => {
      event.preventDefault();
      const value = new FormData(lookupForm).get('lookup');
      const match = findAccessRecord(value);
      result.hidden = false;
      result.className = 'lookup-result';

      if (!match) {
        result.classList.add('error');
        result.innerHTML = '<strong>Cadastro não localizado</strong><span>Confira a identificação ou realize o primeiro cadastro.</span>';
        return;
      }

      if (match.type === 'admin') {
        result.classList.add('success');
        result.innerHTML = `<strong>${escapeHtml(match.record.fullName)}</strong><span>Perfil: Administrador · ${escapeHtml(match.record.status)} · ${escapeHtml(match.record.credentialStatus)}.</span>`;
        return;
      }

      result.classList.add('warning');
      result.innerHTML = `<strong>${escapeHtml(match.record.fullName)}</strong><span>Situação: ${escapeHtml(match.record.status)} · Protocolo: ${escapeHtml(match.record.protocol)}.</span>`;
    });
  }

  async function resetLegacyCacheAndRegisterWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      if (!localStorage.getItem(STORAGE.migration)) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        }
        localStorage.setItem(STORAGE.migration, new Date().toISOString());
      }
      await navigator.serviceWorker.register('./service-worker.js?v=20260731-2', { scope: './', updateViaCache: 'none' });
    } catch (error) {
      console.warn('Service worker não pôde ser atualizado:', error);
    }
  }

  function init() {
    seedAdmins();
    bindRoutes();
    bindForm();
    bindLookup();
    routeFromHash();
    resetLegacyCacheAndRegisterWorker();
    document.documentElement.dataset.naturalCastanhasVersion = 'cadastro-v1';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
