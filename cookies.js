'use strict';
(() => {
  const ID = 'G-772KWNMJ39';
  const KEY = 'dr-crazy-sivi-mentol:analyticsConsent:v2';
  const LEGACY_KEY = 'dr-crazy-sivi-mentol:cookieNotice:v1';
  const DURATION = 180 * 24 * 60 * 60 * 1000;
  const BASE_PATH = '/dr-crazy-sivi-mentol/';
  const notice = document.getElementById('cookie-notice');
  const heading = document.getElementById('cookie-heading');
  const status = document.getElementById('cookie-status');
  if (!notice) return;
  let tagLoaded = false;
  let tagElement = null;
  let sessionChoice = null;
  let expiryTimer;
  window['ga-disable-' + ID] = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
  const consent = analytics => ({
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
  });
  window.gtag('consent', 'default', consent(false));
  const readPreference = () => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      const value = JSON.parse(raw);
      if (value && value.version === 2 && typeof value.analytics === 'boolean' && Number.isFinite(value.expiresAt) && value.expiresAt > Date.now()) return value;
      window.localStorage.removeItem(KEY);
    } catch { /* Browser storage may be unavailable. */ }
    return null;
  };
  try { if (window.localStorage.getItem(LEGACY_KEY) !== null) window.localStorage.removeItem(LEGACY_KEY); } catch {}
  const clearAnalyticsCookies = () => {
    const names = document.cookie.split(';').map(part => part.split('=')[0].trim()).filter(name => name.startsWith('dr_mentol_'));
    for (const name of names) {
      for (const cookiePath of [BASE_PATH, '/']) {
        for (const domain of ['', window.location.hostname, '.' + window.location.hostname]) {
          document.cookie = name + '=; Max-Age=0; Path=' + cookiePath + (domain ? '; Domain=' + domain : '') + '; SameSite=Lax; Secure';
        }
      }
    }
  };
  const stopAnalytics = () => {
    window['ga-disable-' + ID] = true;
    window.gtag('consent', 'update', consent(false));
    if (tagElement) tagElement.remove();
    clearAnalyticsCookies();
    return tagLoaded;
  };
  const enableAnalytics = () => {
    window['ga-disable-' + ID] = false;
    window.gtag('consent', 'update', consent(true));
    if (tagLoaded) return;
    tagLoaded = true;
    const policyPage = window.location.pathname.endsWith('/cerez-politikasi.html');
    const pageLocation = window.location.origin + BASE_PATH + (policyPage ? 'cerez-politikasi.html' : '');
    let pageReferrer = '';
    try {
      const referrer = new URL(document.referrer);
      if (referrer.protocol === 'https:' || referrer.protocol === 'http:') pageReferrer = referrer.origin + '/';
    } catch {}
    window.gtag('js', new Date());
    window.gtag('config', ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_prefix: 'dr_mentol',
      cookie_path: BASE_PATH,
      cookie_domain: window.location.hostname,
      cookie_expires: DURATION / 1000,
      cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure',
      page_location: pageLocation,
      page_referrer: pageReferrer,
      page_title: policyPage ? 'Çerez ve Gizlilik | Dr. Crazy' : 'Dr. Crazy Sıvı Mentol'
    });
    tagElement = document.createElement('script');
    tagElement.id = 'dr-crazy-google-analytics';
    tagElement.async = true;
    tagElement.referrerPolicy = 'origin';
    tagElement.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(tagElement);
  };
  const setVisible = visible => {
    notice.hidden = !visible;
    document.body.classList.toggle('cookie-notice-open', visible);
  };
  const currentPreference = () => sessionChoice || readPreference();
  const updateText = () => {
    const value = currentPreference();
    document.querySelectorAll('[data-cookie-state]').forEach(element => {
      element.textContent = value ? (value.analytics ? 'Analiz izniniz açık.' : 'Analiz izniniz kapalı.') : 'Henüz bir analiz tercihi kaydedilmedi. Analytics kapalı.';
    });
    document.querySelectorAll('[data-cookie-reset]').forEach(button => { button.hidden = !value; });
  };
  const scheduleExpiry = value => {
    window.clearTimeout(expiryTimer);
    if (!value) return;
    expiryTimer = window.setTimeout(() => {
      if (Date.now() >= value.expiresAt) {
        sessionChoice = null;
        const reload = stopAnalytics();
        readPreference();
        updateText();
        setVisible(true);
        if (reload) window.location.reload();
      } else scheduleExpiry(value);
    }, Math.min(value.expiresAt - Date.now(), 2147483647));
  };
  const saveChoice = analytics => {
    const value = { version: 2, analytics, expiresAt: Date.now() + DURATION };
    try { window.localStorage.setItem(KEY, JSON.stringify(value)); } catch {
      if (analytics) {
        status.textContent = 'Tercih saklanamıyor. Analytics açılmadı; reddederek devam edebilirsiniz.';
        setVisible(true);
        return;
      }
      sessionChoice = value;
      const reload = stopAnalytics();
      status.textContent = 'Analiz bu ziyaret için kapatıldı. Tercihi kalıcı silmek için tarayıcınızın site verilerini temizleyebilirsiniz.';
      updateText();
      setVisible(Boolean(reload));
      return;
    }
    sessionChoice = value;
    status.textContent = '';
    const reload = analytics ? (enableAnalytics(), false) : stopAnalytics();
    scheduleExpiry(value);
    updateText();
    setVisible(false);
    if (reload) window.location.reload();
  };
  document.querySelectorAll('[data-cookie-remember]').forEach(button => button.addEventListener('click', () => saveChoice(true)));
  document.querySelectorAll('[data-cookie-dismiss]').forEach(button => button.addEventListener('click', () => saveChoice(false)));
  document.querySelectorAll('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => {
    status.textContent = '';
    updateText();
    setVisible(true);
    heading.focus({ preventScroll: true });
  }));
  document.querySelectorAll('[data-cookie-reset]').forEach(button => button.addEventListener('click', () => {
    sessionChoice = null;
    const reload = stopAnalytics();
    try {
      window.localStorage.removeItem(KEY);
      status.textContent = 'Analiz tercihiniz silindi. Yeni seçiminize kadar Analytics kapalı.';
    } catch { status.textContent = 'Analiz bu ziyaret için durduruldu. Kayıtlı tercihi silmek için tarayıcınızın site verilerini temizleyin.'; }
    window.clearTimeout(expiryTimer);
    updateText();
    setVisible(true);
    heading.focus({ preventScroll: true });
    if (reload && !readPreference()) window.location.reload();
  }));
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    sessionChoice = null;
    const value = readPreference();
    const reload = value?.analytics ? (enableAnalytics(), false) : stopAnalytics();
    updateText();
    setVisible(!value);
    scheduleExpiry(value);
    if (reload) window.location.reload();
  });
  const initial = readPreference();
  if (initial?.analytics) enableAnalytics();
  else clearAnalyticsCookies();
  updateText();
  setVisible(!initial);
  scheduleExpiry(initial);
})();