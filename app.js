'use strict';
const form = document.getElementById('order-form');
const result = document.getElementById('request-result');
const preview = document.getElementById('message-preview');
const status = document.getElementById('copy-status');
form.querySelector('button[type="submit"]').disabled = false;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  for (const key of Object.keys(values)) values[key] = values[key].trim();
  if (!values.name || !values.company || !values.city) {
    status.textContent = '';
    for (const key of ['name','company','city']) {
      const input = form.elements.namedItem(key);
      input.setCustomValidity(values[key] ? '' : 'Lütfen bu alanı doldurun.');
      input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
    }
    form.reportValidity();
    return;
  }
  const lines = [
    'Merhaba, Dr. Crazy Premium Fresh Mentol sıvı mentol (10 ml) için toptan alım teklifi rica ediyorum.',
    '',
    'Ad soyad: ' + values.name,
    'Firma: ' + values.company,
    'İşletme türü: ' + values.business,
    'Telefon: ' + values.phone,
    ...(values.email ? ['E-posta: ' + values.email] : []),
    'Teslimat şehri: ' + values.city,
    'Talep edilen adet: ' + values.quantity,
    ...(values.note ? ['', 'Not: ' + values.note] : []),
    '',
    'Güncel birim fiyat, minimum sipariş adedi, stok ve teslimat koşulları hakkında bilgi paylaşabilir misiniz?'
  ];
  preview.value = lines.join('\n');
  // Personal request text stays in memory and is opened only by the send action.
  status.textContent = '';
  document.getElementById('copy-message').textContent = 'Mesajı kopyala';
  result.hidden = false;
  result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  preview.focus({ preventScroll: true });
});
document.getElementById('copy-message').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('unavailable');
    await navigator.clipboard.writeText(preview.value);
    status.textContent = 'Mesaj kopyalandı. WhatsApp veya e-posta üzerinden iletebilirsiniz.';
    document.getElementById('copy-message').textContent = 'Kopyalandı ✓';
  } catch {
    preview.focus();
    preview.select();
    status.textContent = 'Mesaj seçildi. Kopyalamak için Ctrl+C kullanın veya telefonunuzda metne basılı tutup Kopyala’yı seçin.';
  }
});
document.getElementById('close-result').addEventListener('click', () => {
  result.hidden = true;
  form.querySelector('button[type="submit"]').focus();
});
// Responsive primary navigation.
(() => {
  const toggle = document.querySelector('.p-menu-toggle');
  const navigation = document.getElementById('primary-navigation');
  if (!toggle || !navigation) return;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    navigation.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) setOpen(false);
  });
})();

// Keep private message bodies out of DOM link URLs used by outbound-click measurement.
document.getElementById('send-whatsapp').addEventListener('click', event => {
  event.preventDefault();
  if (!preview.value) return;
  window.open('https://wa.me/905469325840?text=' + encodeURIComponent(preview.value), '_blank', 'noopener,noreferrer');
});
document.getElementById('send-email').addEventListener('click', event => {
  event.preventDefault();
  if (!preview.value) return;
  window.location.href = 'mailto:troysoapun@gmail.com?subject=' + encodeURIComponent('Dr. Crazy Sıvı Mentol — Toptan teklif talebi') + '&body=' + encodeURIComponent(preview.value);
});
