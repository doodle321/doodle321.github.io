/* ============================================================
   SITE CONFIG — every contact detail and link in one place.
   Change a value here and every button/link on the site
   (header, hero, contact, mobile menu, footer) updates.
   ============================================================ */
'use strict';

const SITE = {
  name: "Muhammad Ammar",
  studio: "DevByAmmar",
  city: "Hyderabad, Pakistan",
  phoneDisplay: "+92 310 3694160",
  phone: "+923103694160",            // used for tel: links
  whatsapp: "923103694160",          // used for wa.me links (no +)
  email: "muhammadammar.5@proton.me",
  instagram: "https://www.instagram.com/dev.by_ammar/",
  linkedin: "https://www.linkedin.com/in/muhammad-ammar-ba8b422b6/",
  messages: {
    project: "Hi Ammar, I need a website for my business.",
    chat: "Hi Ammar, let's talk about my restaurant website."
  }
};

(() => {
  const wa = msg => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg || SITE.messages.project)}`;
  const targets = {
    wa:     el => el.href = wa(SITE.messages[el.dataset.msg]),
    tel:    el => el.href = `tel:${SITE.phone}`,
    mail:   el => el.href = `mailto:${SITE.email}`,
    ig:     el => el.href = SITE.instagram,
    li:     el => el.href = SITE.linkedin
  };
  document.querySelectorAll('[data-cfg]').forEach(el => (targets[el.dataset.cfg] || (() => {}))(el));
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
