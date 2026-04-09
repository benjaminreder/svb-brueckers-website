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
  var mapCanvas = document.querySelector('[data-map-canvas]');
  var mapPlaceholder = document.querySelector('[data-map-placeholder]');
  var mapStatus = document.querySelector('[data-map-status]');
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

  function loadGoogleMapsApi(apiKey) {
    if (window.google && window.google.maps) {
      return Promise.resolve(window.google.maps);
    }

    if (window.__svbGoogleMapsPromise) {
      return window.__svbGoogleMapsPromise;
    }

    window.__svbGoogleMapsPromise = new Promise(function (resolve, reject) {
      var callbackName = 'initSvbGoogleMapsApi';
      window[callbackName] = function () {
        resolve(window.google.maps);
        delete window[callbackName];
      };

      var script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey) + '&callback=' + callbackName;
      script.async = true;
      script.defer = true;
      script.onerror = function () {
        reject(new Error('Google Maps konnte nicht geladen werden.'));
        delete window[callbackName];
      };

      document.head.appendChild(script);
    });

    return window.__svbGoogleMapsPromise;
  }

  function initServiceAreaMap() {
    if (!mapCanvas || mapCanvas.dataset.mapInitialized === 'true') return;

    // Firmenstandort aus bestehender Einbindung übernommen.
    var companyPosition = { lat: 48.7475466, lng: 9.2399083 };

    // Kompakte, harmonische Polygon-Kontur für das mobile Einsatzgebiet.
    var serviceAreaCoords = [
      { lat: 48.7368, lng: 9.1702 }, // Degerloch
      { lat: 48.7648, lng: 9.2015 }, // Wangen
      { lat: 48.7792, lng: 9.2368 }, // Mettingen (leicht geglättet)
      { lat: 48.7635, lng: 9.2588 }, // Obertürkheim (leicht geglättet)
      { lat: 48.7265, lng: 9.2528 }, // Scharnhauser Park / Ostfildern (leicht geglättet)
      { lat: 48.7148, lng: 9.2148 }, // Heumaden
      { lat: 48.7268, lng: 9.2012 }  // Sillenbuch
    ];

    var map = new google.maps.Map(mapCanvas, {
      center: companyPosition,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'cooperative',
      clickableIcons: false
    });

    var companyMarker = new google.maps.Marker({
      position: companyPosition,
      map: map,
      title: 'SVB Brückers – Firmenstandort'
    });

    var serviceAreaPolygon = new google.maps.Polygon({
      paths: serviceAreaCoords,
      strokeColor: '#1a365d',
      strokeOpacity: 0.86,
      strokeWeight: 2,
      fillColor: '#E07A3A',
      fillOpacity: 0.2,
      map: map
    });

    var bounds = new google.maps.LatLngBounds();
    bounds.extend(companyPosition);

    serviceAreaCoords.forEach(function (point) {
      bounds.extend(point);
    });

    function fitMapToServiceArea() {
      map.fitBounds(bounds, {
        top: 36,
        right: 36,
        bottom: 36,
        left: 36
      });
    }

    fitMapToServiceArea();

    google.maps.event.addListenerOnce(map, 'idle', function () {
      if (map.getZoom() > 13) {
        map.setZoom(13);
      }
    });

    window.addEventListener('resize', fitMapToServiceArea);

    companyMarker.addListener('click', function () {
      new google.maps.InfoWindow({
        content: '<strong>SVB Brückers</strong><br>Firmenstandort'
      }).open(map, companyMarker);
    });

    serviceAreaPolygon.addListener('click', function () {
      map.fitBounds(bounds);
    });

    mapCanvas.dataset.mapInitialized = 'true';
  }

  function showMapStatus(message) {
    if (!mapStatus) return;
    mapStatus.textContent = message;
    mapStatus.hidden = false;
  }

  function renderMap() {
    if (!mapContainer || !mapCanvas || mapContainer.dataset.mapLoaded === 'true') return;

    var apiKey = (mapContainer.dataset.mapApiKey || '').trim();
    if (!apiKey || apiKey === 'HIER_GOOGLE_MAPS_API_KEY_EINFUEGEN') {
      console.warn('Google Maps API Key fehlt. Karte kann nicht geladen werden.');
      showMapStatus('Google Maps ist aktuell nicht verfügbar, weil der API-Key noch fehlt.');
      if (mapConsentButton) mapConsentButton.hidden = true;
      return;
    }

    loadGoogleMapsApi(apiKey)
      .then(function () {
        mapContainer.dataset.mapLoaded = 'true';
        mapContainer.classList.add('is-loaded');
        mapCanvas.hidden = false;
        if (mapPlaceholder) {
          mapPlaceholder.hidden = true;
        }
        initServiceAreaMap();
      })
      .catch(function () {
        console.warn('Google Maps API konnte nicht geladen werden.');
        showMapStatus('Die Karte konnte aktuell nicht geladen werden. Bitte versuchen Sie es später erneut.');
      });
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

    if (mapCanvas) {
      mapCanvas.hidden = true;
    }

    if (mapConsentButton) {
      mapConsentButton.hidden = false;
    }

    if (mapStatus) {
      mapStatus.hidden = true;
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

function initPageFeatures() {
  initScrollRestorationFix();
  initFaqAccordion();
  initConsentAndMaps();
  initRatgeberBackButtons();
  initRatgeberArticleSchema();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageFeatures);
} else {
  initPageFeatures();
}
