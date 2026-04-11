// Mobile Menu Toggle
function toggleMenu() {
  document.getElementById('nav').classList.toggle('open');
}

function closeMenu() {
  document.getElementById('nav').classList.remove('open');
}

// Sticky Header Shadow on Scroll
window.addEventListener('scroll', function () {
  var header = document.querySelector('.header');
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
  } else {
    header.style.boxShadow = 'none';
  }
});

// FAQ Accordion (single-open)
function initFaqAccordion() {
  var accordion = document.querySelector('[data-faq-accordion]');
  if (!accordion) return;

  var items = accordion.querySelectorAll('.faq-item');

  function collapsePanel(panel) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
    requestAnimationFrame(function () {
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
    });
  }

  function expandPanel(panel) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
    panel.style.opacity = '1';
  }

  function closeItem(item) {
    var button = item.querySelector('.faq-trigger');
    var panel = item.querySelector('.faq-panel');
    var symbol = item.querySelector('.faq-symbol');

    item.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    symbol.textContent = '+';
    collapsePanel(panel);
  }

  function openItem(item) {
    var button = item.querySelector('.faq-trigger');
    var panel = item.querySelector('.faq-panel');
    var symbol = item.querySelector('.faq-symbol');

    item.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    symbol.textContent = '−';
    expandPanel(panel);
  }

  items.forEach(function (item) {
    var panel = item.querySelector('.faq-panel');
    panel.hidden = false;
    panel.removeAttribute('hidden');
    panel.style.maxHeight = '0px';
    panel.style.opacity = '0';

    var trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      if (isOpen) {
        closeItem(item);
        return;
      }

      items.forEach(function (otherItem) {
        if (otherItem !== item) {
          closeItem(otherItem);
        }
      });

      openItem(item);
    });
  });

  window.addEventListener('resize', function () {
    var openItemElement = accordion.querySelector('.faq-item.is-open .faq-panel');
    if (openItemElement) {
      openItemElement.style.maxHeight = openItemElement.scrollHeight + 'px';
    }
  });
}

function initConsentAndMaps() {
  var CONSENT_KEY = 'siteConsentExternalContent';
  var CONSENT_ACCEPTED = 'accepted';
  var CONSENT_DECLINED = 'declined';
  var mapContainer = document.querySelector('[data-map-container]');
  var mapPlaceholder = document.querySelector('[data-map-placeholder]');
  var mapConsentButton = document.querySelector('[data-map-consent-button]');
  var consentBanner = document.querySelector('[data-consent-banner]');
  var acceptButton = document.querySelector('[data-consent-accept]');
  var declineButton = document.querySelector('[data-consent-decline]');
  var settingsTriggers = document.querySelectorAll('[data-open-cookie-settings]');

  function getConsentValue() {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return null;
    }
  }

  function setConsentValue(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      // Fallback ohne Persistenz
    }
  }

  function hideBanner() {
    if (!consentBanner) return;
    consentBanner.hidden = true;
  }

  function showBanner() {
    if (!consentBanner) return;
    consentBanner.hidden = false;
  }

  function renderMap() {
    if (!mapContainer || mapContainer.dataset.mapLoaded === 'true') return;

    var mapIframe = document.createElement('iframe');
    mapIframe.src = 'https://maps.google.com/maps?q=48.7475466,9.2399083&z=15&output=embed';
    mapIframe.loading = 'lazy';
    mapIframe.referrerPolicy = 'no-referrer-when-downgrade';
    mapIframe.allowFullscreen = true;
    mapIframe.title = 'Google Maps Standort von SVB Brückers';

    mapContainer.innerHTML = '';
    mapContainer.appendChild(mapIframe);
    mapContainer.dataset.mapLoaded = 'true';
  }

  function applyConsentState(value) {
    if (value === CONSENT_ACCEPTED) {
      renderMap();
      hideBanner();
      return;
    }

    if (mapPlaceholder) {
      mapPlaceholder.hidden = false;
    }

    if (value === CONSENT_DECLINED) {
      hideBanner();
      return;
    }

    showBanner();
  }

  if (acceptButton) {
    acceptButton.addEventListener('click', function () {
      setConsentValue(CONSENT_ACCEPTED);
      applyConsentState(CONSENT_ACCEPTED);
    });
  }

  if (declineButton) {
    declineButton.addEventListener('click', function () {
      setConsentValue(CONSENT_DECLINED);
      applyConsentState(CONSENT_DECLINED);
    });
  }

  if (mapConsentButton) {
    mapConsentButton.addEventListener('click', function () {
      setConsentValue(CONSENT_ACCEPTED);
      applyConsentState(CONSENT_ACCEPTED);
      hideBanner();
    });
  }

  settingsTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      showBanner();
    });
  });

  applyConsentState(getConsentValue());
}

function initScrollRestorationFix() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  var navigationEntries = performance.getEntriesByType
    ? performance.getEntriesByType('navigation')
    : [];
  var navigationType = navigationEntries.length ? navigationEntries[0].type : null;

  if (!navigationType && performance.navigation) {
    navigationType = performance.navigation.type === 1 ? 'reload' : null;
  }

  function scrollToTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  if (navigationType === 'reload') {
    scrollToTop();
  }

  window.addEventListener('pageshow', function (event) {
    if (event.persisted || navigationType === 'reload') {
      scrollToTop();
    }
  });

  window.addEventListener('load', function () {
    if (navigationType === 'reload') {
      scrollToTop();
    }
  });
}

function isRatgeberArticlePage() {
  var path = window.location.pathname;
  return path.startsWith('/ratgeber/') && path !== '/ratgeber/' && path !== '/ratgeber/index.html';
}

function initRatgeberBackButtons() {
  if (!isRatgeberArticlePage()) return;

  var article = document.querySelector('.article-content');
  var title = article ? article.querySelector('h1.page-title') : null;

  if (!article || !title) return;

  function createBackButton(extraClass) {
    var link = document.createElement('a');
    link.href = '/ratgeber/';
    link.className = 'ratgeber-back-button' + (extraClass ? ' ' + extraClass : '');
    link.textContent = '← Zurück zum Ratgeber';
    return link;
  }

  if (!article.querySelector('.ratgeber-back-button--top')) {
    article.insertBefore(createBackButton('ratgeber-back-button--top'), title);
  }

  if (!article.querySelector('.ratgeber-back-button--bottom')) {
    var bottomButton = createBackButton('ratgeber-back-button--bottom');
    var ctaWrap = article.querySelector('.article-cta-wrap');
    if (ctaWrap) {
      article.insertBefore(bottomButton, ctaWrap);
    } else {
      article.appendChild(bottomButton);
    }
  }
}

function initRatgeberArticleSchema() {
  if (!isRatgeberArticlePage()) return;
  if (document.querySelector('script[data-ratgeber-schema]')) return;

  var article = document.querySelector('.article-content');
  var title = article ? article.querySelector('h1.page-title') : null;
  var firstParagraph = article ? article.querySelector('p') : null;
  if (!title || !firstParagraph) return;

  var schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title.textContent.trim(),
    description: firstParagraph.textContent.trim(),
    inLanguage: 'de-DE',
    mainEntityOfPage: window.location.href,
    author: {
      '@type': 'Person',
      name: 'Bastian Brückers'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SVB Brückers'
    }
  };

  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.ratgeberSchema = 'true';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function initProcessSlider() {
  var section = document.querySelector('[data-process-slider]');
  if (!section) return;

  var track = section.querySelector('[data-process-track]');
  var cards = track ? track.querySelectorAll('[data-process-card]') : [];
  var prevButton = section.querySelector('[data-process-prev]');
  var nextButton = section.querySelector('[data-process-next]');
  var dotsContainer = document.querySelector('[data-process-dots]');

  if (!track || !cards.length || !dotsContainer) return;

  dotsContainer.innerHTML = '';

  function getMaxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  function getIndex() {
    var trackCenter = track.scrollLeft + track.clientWidth / 2;
    var closestIndex = 0;
    var closestDistance = Number.POSITIVE_INFINITY;

    Array.prototype.forEach.call(cards, function (card, cardIndex) {
      var cardCenter = card.offsetLeft + card.offsetWidth / 2;
      var distance = Math.abs(cardCenter - trackCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = cardIndex;
      }
    });

    return closestIndex;
  }

  function scrollToIndex(index) {
    var boundedIndex = Math.max(0, Math.min(cards.length - 1, index));
    var targetCard = cards[boundedIndex];
    if (!targetCard) return;

    var rawTarget = targetCard.offsetLeft - (track.clientWidth - targetCard.offsetWidth) / 2;
    var target = Math.min(Math.max(0, rawTarget), getMaxScroll());

    if (cards.length <= 1) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    track.scrollTo({ left: target, behavior: 'smooth' });
  }

  function updateActiveCard(index) {
    Array.prototype.forEach.call(cards, function (card, cardIndex) {
      var isActive = cardIndex === index;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function updateControls() {
    var index = getIndex();
    var slidesCount = cards.length;

    Array.prototype.forEach.call(dotsContainer.children, function (dot, dotIndex) {
      var active = dotIndex === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });

    updateActiveCard(index);

    if (prevButton) prevButton.disabled = index === 0;
    if (nextButton) nextButton.disabled = index >= slidesCount - 1;
  }

  function renderDots() {
    var slidesCount = cards.length;
    dotsContainer.innerHTML = '';

    for (var i = 0; i < slidesCount; i += 1) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'process-dot';
      dot.setAttribute('aria-label', 'Zu Ansicht ' + (i + 1));
      dot.addEventListener('click', (function (index) {
        return function () {
          scrollToIndex(index);
        };
      })(i));
      dotsContainer.appendChild(dot);
    }

    updateControls();
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      scrollToIndex(Math.max(0, getIndex() - 1));
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      scrollToIndex(Math.min(cards.length - 1, getIndex() + 1));
    });
  }

  track.addEventListener('scroll', updateControls, { passive: true });
  window.addEventListener('resize', renderDots);

  renderDots();
}

function initPageFeatures() {
  initScrollRestorationFix();
  initFaqAccordion();
  initConsentAndMaps();
  initRatgeberBackButtons();
  initRatgeberArticleSchema();
  initProcessSlider();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageFeatures);
} else {
  initPageFeatures();
}
