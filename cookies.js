'use strict';
(() => {
  const KEY = 'dr-crazy-sivi-mentol:cookieNotice:v1';
  const DURATION = 180 * 24 * 60 * 60 * 1000;
  const notice = document.getElementById('cookie-notice');
  const heading = document.getElementById('cookie-heading');
  const status = document.getElementById('cookie-status');
  if (!notice) return;
  const readPreference = () => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      const value = JSON.parse(raw);
      if (value.version === 1 && value.preference === 'remember-notice' && Number.isFinite(value.expiresAt) && value.expiresAt > Date.now()) return value;
      window.localStorage.removeItem(KEY);
    } catch { /* Storage can be blocked by browser settings. */ }
    return null;
  };
  const removePreference = () => {
    try {
      if (window.localStorage.getItem(KEY) !== null) window.localStorage.removeItem(KEY);
      return true;
    } catch { return false; }
  };
  const setVisible = visible => {
    notice.hidden = !visible;
    document.body.classList.toggle('cookie-notice-open', visible);
  };
  const updatePreferenceText = () => {
    const remembered = Boolean(readPreference());
    document.querySelectorAll('[data-cookie-state]').forEach(element => {
      element.textContent = remembered ? 'Bilgilendirme tercihiniz bu cihazda hatırlanıyor.' : 'Bu cihazda kayıtlı bir bilgilendirme tercihi bulunmuyor.';
    });
    document.querySelectorAll('[data-cookie-reset]').forEach(button => { button.hidden = !remembered; });
  };
  document.querySelectorAll('[data-cookie-remember]').forEach(button => {
    button.addEventListener('click', () => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ version: 1, preference: 'remember-notice', expiresAt: Date.now() + DURATION }));
        status.textContent = '';
        setVisible(false);
      } catch {
        status.textContent = 'Bu tarayıcıda tercih saklanamıyor. Kaydetmeden devam edebilirsiniz.';
        setVisible(true);
      }
      updatePreferenceText();
    });
  });
  document.querySelectorAll('[data-cookie-dismiss]').forEach(button => {
    button.addEventListener('click', () => {
      const removed = removePreference();
      if (!removed && readPreference()) {
        status.textContent = 'Kayıtlı tercih silinemedi. Tarayıcınızın site verileri ayarından bu kaydı silebilirsiniz.';
        return;
      }
      status.textContent = '';
      setVisible(false);
      updatePreferenceText();
    });
  });
  document.querySelectorAll('[data-cookie-settings]').forEach(button => {
    button.addEventListener('click', () => {
      status.textContent = '';
      updatePreferenceText();
      setVisible(true);
      heading.focus({ preventScroll: true });
    });
  });
  document.querySelectorAll('[data-cookie-reset]').forEach(button => {
    button.addEventListener('click', () => {
      const removed = removePreference();
      updatePreferenceText();
      setVisible(true);
      status.textContent = removed ? 'Kayıtlı tercih silindi. Bilgilendirme tercihinizi yeniden seçebilirsiniz.' : 'Tercih silinemedi. Tarayıcınızın site verileri ayarından bu kaydı silebilirsiniz.';
      heading.focus({ preventScroll: true });
    });
  });
  updatePreferenceText();
  setVisible(!readPreference());
})();