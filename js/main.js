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

function isOptimizedRatgeberPage() {
  var normalizedPath = getNormalizedRatgeberPath();
  var optimizedPages = {
    '/ratgeber/streitpunkte-und-kuerzungsversuche/': true,
    '/ratgeber/wildunfall-was-tun/': true,
    '/ratgeber/kfz-gutachten-leasingrueckgabe/': true,
    '/ratgeber/dauer-gutachten-auszahlung/': true,
    '/ratgeber/totalschaden-bedeutung-auszahlung/': true,
    '/ratgeber/bagatellschaden-definition/': true
  };
  return Boolean(optimizedPages[normalizedPath]);
}

function getNormalizedRatgeberPath() {
  return window.location.pathname.replace(/index\.html$/, '');
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

function initRatgeberArticleLayoutEnhancements() {
  if (!isOptimizedRatgeberPage()) return;

  var article = document.querySelector('.article-content');
  var title = article ? article.querySelector('h1.page-title') : null;
  if (!article || !title) return;

  article.classList.add('article-content--optimized');

  if (!document.querySelector('.article-progress')) {
    var progress = document.createElement('div');
    progress.className = 'article-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span class="article-progress-bar" data-article-progress></span>';
    document.body.insertBefore(progress, document.body.firstChild);
  }

  if (!article.querySelector('.article-hero')) {
    var firstCta = article.querySelector('.article-cta-wrap');
    var hero = document.createElement('section');
    hero.className = 'article-hero';

    var current = title;
    while (current && current !== firstCta) {
      var next = current.nextElementSibling;
      hero.appendChild(current);
      current = next;
    }

    article.insertBefore(hero, firstCta || article.firstChild);
  }

  var lead = article.querySelector('.article-hero > p');
  if (lead) {
    lead.classList.add('article-lead', 'article-lead-box');
  }

  var firstCompactList = article.querySelector('.article-hero ul, .article-hero ol');
  if (firstCompactList && !firstCompactList.parentElement.classList.contains('article-highlight-box')) {
    var compactBox = document.createElement('div');
    compactBox.className = 'article-highlight-box';
    firstCompactList.parentElement.insertBefore(compactBox, firstCompactList);
    compactBox.appendChild(firstCompactList);
  }

  var ctaHint = Array.prototype.find.call(article.querySelectorAll('p'), function (paragraph) {
    return paragraph.querySelector('strong') && paragraph.textContent.indexOf('Kontakt') !== -1;
  });
  if (ctaHint) {
    ctaHint.classList.add('article-highlight-box');
  }
}

function initRatgeberRelatedLinks() {
  if (!isOptimizedRatgeberPage()) return;

  var article = document.querySelector('.article-content');
  if (!article) return;

  var recommendationMap = {
    '/ratgeber/streitpunkte-und-kuerzungsversuche/': [
      ['/ratgeber/dauer-gutachten-auszahlung/', 'Wie lange dauert ein Gutachten und wann kommt die Auszahlung?'],
      ['/ratgeber/totalschaden-bedeutung-auszahlung/', 'Totalschaden: Bedeutung, Berechnung und Auszahlung verständlich erklärt'],
      ['/ratgeber/bagatellschaden-definition/', 'Bagatellschaden: Definition, Grenze und wann ein Gutachten sinnvoll ist']
    ],
    '/ratgeber/wildunfall-was-tun/': [
      ['/ratgeber/bagatellschaden-definition/', 'Bagatellschaden: Definition, Grenze und wann ein Gutachten sinnvoll ist'],
      ['/ratgeber/dauer-gutachten-auszahlung/', 'Wie lange dauert ein Gutachten und wann kommt die Auszahlung?'],
      ['/ratgeber/streitpunkte-und-kuerzungsversuche/', 'Versicherung kürzt nach Unfall – typische Streitpunkte verständlich erklärt']
    ],
    '/ratgeber/kfz-gutachten-leasingrueckgabe/': [
      ['/ratgeber/bagatellschaden-definition/', 'Bagatellschaden: Definition, Grenze und wann ein Gutachten sinnvoll ist'],
      ['/ratgeber/dauer-gutachten-auszahlung/', 'Wie lange dauert ein Gutachten und wann kommt die Auszahlung?'],
      ['/ratgeber/streitpunkte-und-kuerzungsversuche/', 'Versicherung kürzt nach Unfall – typische Streitpunkte verständlich erklärt']
    ],
    '/ratgeber/dauer-gutachten-auszahlung/': [
      ['/ratgeber/streitpunkte-und-kuerzungsversuche/', 'Versicherung kürzt nach Unfall – typische Streitpunkte verständlich erklärt'],
      ['/ratgeber/totalschaden-bedeutung-auszahlung/', 'Totalschaden: Bedeutung, Berechnung und Auszahlung verständlich erklärt'],
      ['/ratgeber/wildunfall-was-tun/', 'Wildunfall: Was tun – und wann ein Gutachten sinnvoll ist']
    ],
    '/ratgeber/totalschaden-bedeutung-auszahlung/': [
      ['/ratgeber/dauer-gutachten-auszahlung/', 'Wie lange dauert ein Gutachten und wann kommt die Auszahlung?'],
      ['/ratgeber/streitpunkte-und-kuerzungsversuche/', 'Versicherung kürzt nach Unfall – typische Streitpunkte verständlich erklärt'],
      ['/ratgeber/bagatellschaden-definition/', 'Bagatellschaden: Definition, Grenze und wann ein Gutachten sinnvoll ist']
    ],
    '/ratgeber/bagatellschaden-definition/': [
      ['/ratgeber/wildunfall-was-tun/', 'Wildunfall: Was tun – und wann ein Gutachten sinnvoll ist'],
      ['/ratgeber/kfz-gutachten-leasingrueckgabe/', 'Kfz-Gutachten vor Leasingrückgabe: Wann sinnvoll, was wird geprüft?'],
      ['/ratgeber/wann-sich-ein-gutachten-lohnt/', 'Wann lohnt sich ein Gutachten nach dem Unfall?']
    ]
  };

  Array.prototype.forEach.call(article.querySelectorAll('p'), function (paragraph) {
    if (paragraph.dataset.relatedEnhanced === 'true') return;
    var text = paragraph.textContent.trim();
    if (text.indexOf('Passend dazu:') !== 0 && text.indexOf('Weiterlesen:') !== 0 && text.indexOf('Ergänzend lesen:') !== 0) return;

    var links = paragraph.querySelectorAll('a');
    if (!links.length) return;

    var box = document.createElement('section');
    box.className = 'article-related-box';

    var heading = document.createElement('p');
    heading.textContent = text.split(':')[0] + ':';
    box.appendChild(heading);

    var grid = document.createElement('div');
    grid.className = 'article-related-grid';

    Array.prototype.forEach.call(links, function (link) {
      var card = document.createElement('a');
      card.className = 'article-related-card';
      card.href = link.href;
      card.textContent = link.textContent;
      grid.appendChild(card);
    });

    box.appendChild(grid);
    paragraph.replaceWith(box);
  });

  if (!article.querySelector('[data-additional-recommendations]')) {
    var additionalLinks = recommendationMap[getNormalizedRatgeberPath()] || [];
    if (additionalLinks.length) {
      var recommendations = document.createElement('section');
      recommendations.className = 'article-related-box';
      recommendations.dataset.additionalRecommendations = 'true';

      var recommendationsTitle = document.createElement('p');
      recommendationsTitle.textContent = 'Ebenfalls lesenswert';
      recommendations.appendChild(recommendationsTitle);

      var recommendationsGrid = document.createElement('div');
      recommendationsGrid.className = 'article-related-grid';
      additionalLinks.forEach(function (entry) {
        var recommendationLink = document.createElement('a');
        recommendationLink.className = 'article-related-card';
        recommendationLink.href = entry[0];
        recommendationLink.textContent = entry[1];
        recommendationsGrid.appendChild(recommendationLink);
      });
      recommendations.appendChild(recommendationsGrid);

      var bottomCta = article.querySelector('.article-cta-wrap--bottom') || article.querySelectorAll('.article-cta-wrap')[1];
      if (bottomCta) {
        article.insertBefore(recommendations, bottomCta);
      } else {
        article.appendChild(recommendations);
      }
    }
  }
}

function initRatgeberFaqConversion() {
  if (!isOptimizedRatgeberPage()) return;

  var article = document.querySelector('.article-content');
  if (!article) return;

  var faqHeading = Array.prototype.find.call(article.querySelectorAll('h2'), function (heading) {
    return heading.textContent.trim().indexOf('Häufige Fragen') === 0;
  });

  if (!faqHeading || faqHeading.nextElementSibling && faqHeading.nextElementSibling.matches('[data-faq-accordion]')) {
    return;
  }

  var wrapper = document.createElement('div');
  wrapper.className = 'article-faq-list faq-list';
  wrapper.setAttribute('data-faq-accordion', '');
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', faqHeading.textContent.trim());

  var cursor = faqHeading.nextElementSibling;
  while (cursor && cursor.tagName !== 'H2') {
    if (cursor.tagName === 'H3') {
      var question = cursor;
      var answer = question.nextElementSibling;
      if (answer && answer.tagName === 'P') {
        var item = document.createElement('article');
        item.className = 'faq-item';

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'faq-trigger';
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = '<span>' + question.textContent + '</span><span class="faq-symbol" aria-hidden="true">+</span>';

        var panel = document.createElement('div');
        panel.className = 'faq-panel';
        var answerParagraph = document.createElement('p');
        answerParagraph.innerHTML = answer.innerHTML;
        panel.appendChild(answerParagraph);

        item.appendChild(trigger);
        item.appendChild(panel);
        wrapper.appendChild(item);

        var afterAnswer = answer.nextElementSibling;
        question.remove();
        answer.remove();
        cursor = afterAnswer;
        continue;
      }
    }
    var next = cursor.nextElementSibling;
    cursor.remove();
    cursor = next;
  }

  faqHeading.insertAdjacentElement('afterend', wrapper);
}

function initRatgeberBreadcrumbsAndSchemas() {
  if (!isOptimizedRatgeberPage()) return;

  var article = document.querySelector('.article-content');
  var title = article ? article.querySelector('h1.page-title') : null;
  if (!article || !title) return;

  if (!article.querySelector('.article-breadcrumbs')) {
    var breadcrumbs = document.createElement('nav');
    breadcrumbs.className = 'article-breadcrumbs';
    breadcrumbs.setAttribute('aria-label', 'Breadcrumb');
    breadcrumbs.innerHTML = '<a href=\"/\">Startseite</a><span aria-hidden=\"true\">/</span><a href=\"/ratgeber/\">Ratgeber</a><span aria-hidden=\"true\">/</span><span>' + title.textContent + '</span>';
    article.insertBefore(breadcrumbs, article.firstChild);
  }

  if (!document.querySelector('script[data-breadcrumb-schema]')) {
    var breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://svb-brueckers.de/' },
        { '@type': 'ListItem', position: 2, name: 'Ratgeber', item: 'https://svb-brueckers.de/ratgeber/' },
        { '@type': 'ListItem', position: 3, name: title.textContent.trim(), item: window.location.href }
      ]
    };
    var breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.dataset.breadcrumbSchema = 'true';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);
  }
}

function initMiddleBackButton() {
  if (!isOptimizedRatgeberPage()) return;
  var article = document.querySelector('.article-content');
  if (!article || article.querySelector('.ratgeber-back-button--middle')) return;

  var firstCta = article.querySelector('.article-cta-wrap');
  if (!firstCta) return;

  var middleButton = document.createElement('a');
  middleButton.href = '/ratgeber/';
  middleButton.className = 'ratgeber-back-button ratgeber-back-button--middle';
  middleButton.textContent = '← Zurück zum Ratgeber';
  firstCta.insertAdjacentElement('afterend', middleButton);
}

function initStickyCtaClone() {
  if (!isOptimizedRatgeberPage()) return;
  if (document.querySelector('[data-mobile-sticky-cta]')) return;

  var sourceGroup = document.querySelector('.article-cta-wrap .article-cta-group');
  if (!sourceGroup) return;

  var sticky = document.createElement('div');
  sticky.className = 'article-mobile-sticky-cta';
  sticky.setAttribute('data-mobile-sticky-cta', '');
  sticky.setAttribute('aria-label', 'Schnelle Kontaktmöglichkeiten');
  sticky.innerHTML = sourceGroup.innerHTML;
  document.body.appendChild(sticky);
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

function initArticleReadingProgress() {
  var progressBar = document.querySelector('[data-article-progress]');
  var article = document.querySelector('.article-content');
  if (!progressBar || !article) return;

  function updateProgress() {
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var articleTop = article.offsetTop;
    var articleHeight = article.offsetHeight;
    var maxScrollable = Math.max(1, articleHeight - viewportHeight);
    var progressRaw = (window.scrollY - articleTop) / maxScrollable;
    var progress = Math.min(1, Math.max(0, progressRaw));
    progressBar.style.width = String(progress * 100) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

function initMobileStickyArticleCta() {
  var stickyCta = document.querySelector('[data-mobile-sticky-cta]');
  if (!stickyCta) return;

  var mobileMediaQuery = window.matchMedia('(max-width: 768px)');

  function syncStickyVisibility() {
    if (!mobileMediaQuery.matches) {
      stickyCta.classList.remove('is-visible');
      return;
    }

    if (window.scrollY > 420) {
      stickyCta.classList.add('is-visible');
    } else {
      stickyCta.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', syncStickyVisibility, { passive: true });
  window.addEventListener('resize', syncStickyVisibility);
  if (mobileMediaQuery.addEventListener) {
    mobileMediaQuery.addEventListener('change', syncStickyVisibility);
  } else if (mobileMediaQuery.addListener) {
    mobileMediaQuery.addListener(syncStickyVisibility);
  }

  syncStickyVisibility();
}

function initProcessSlider() {
  var section = document.querySelector('[data-process-slider]');
  if (!section) return;

  var track = section.querySelector('[data-process-track]');
  var prevButton = section.querySelector('[data-process-prev]');
  var nextButton = section.querySelector('[data-process-next]');
  var dotsContainer = document.querySelector('[data-process-dots]');
  var mobileMediaQuery = window.matchMedia('(max-width: 768px)');
  var cards = [];
  var initialIndex = 0;

  function isMobileProcessSlider() {
    return mobileMediaQuery.matches;
  }

  function getCards() {
    if (!track) return [];
    var selector = isMobileProcessSlider()
      ? '[data-process-card], .process-card-dummy'
      : '[data-process-card]';
    return Array.prototype.slice.call(track.querySelectorAll(selector));
  }

  if (!track || !dotsContainer) return;

  dotsContainer.innerHTML = '';

  function getMaxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  function getIndex() {
    var trackCenter = track.scrollLeft + track.clientWidth / 2;
    var closestIndex = 0;
    var closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach(function (card, cardIndex) {
      var cardCenter = card.offsetLeft + card.offsetWidth / 2;
      var distance = Math.abs(cardCenter - trackCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = cardIndex;
      }
    });

    return closestIndex;
  }

  function scrollToIndex(index, behavior) {
    var boundedIndex = Math.max(0, Math.min(cards.length - 1, index));
    var targetCard = cards[boundedIndex];
    if (!targetCard) return;

    var rawTarget = targetCard.offsetLeft - (track.clientWidth - targetCard.offsetWidth) / 2;
    var target = Math.min(Math.max(0, rawTarget), getMaxScroll());

    if (cards.length <= 1) {
      track.scrollTo({ left: 0, behavior: behavior || 'smooth' });
      return;
    }

    track.scrollTo({ left: target, behavior: behavior || 'smooth' });
  }

  function updateActiveCard(index) {
    cards.forEach(function (card, cardIndex) {
      var isActive = cardIndex === index;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function updateControls() {
    var index = getIndex();
    var slidesCount = cards.length;

    if (!slidesCount) return;

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
    cards = getCards();
    var slidesCount = cards.length;
    dotsContainer.innerHTML = '';

    if (!slidesCount) return;

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
  if (mobileMediaQuery.addEventListener) {
    mobileMediaQuery.addEventListener('change', renderDots);
  } else if (mobileMediaQuery.addListener) {
    mobileMediaQuery.addListener(renderDots);
  }

  renderDots();
  requestAnimationFrame(function () {
    initialIndex = isMobileProcessSlider() ? 1 : 0;
    scrollToIndex(initialIndex, 'auto');
  });
}


function init130Rechner() {
  var calculator = document.querySelector('[data-130-calculator]');
  if (!calculator) return;

  var wbwInput = calculator.querySelector('[data-calc-input="wbw"]');
  var repairInput = calculator.querySelector('[data-calc-input="repair"]');
  var restInput = calculator.querySelector('[data-calc-input="rest"]');
  var wbwRange = calculator.querySelector('[data-calc-range="wbw"]');
  var repairRange = calculator.querySelector('[data-calc-range="repair"]');
  var restRange = calculator.querySelector('[data-calc-range="rest"]');
  var warning = calculator.querySelector('[data-calc-warning]');
  var result = calculator.querySelector('[data-calc-result]');
  var percentTarget = calculator.querySelector('[data-calc-percent]');
  var netRepairTarget = calculator.querySelector('[data-calc-net-repair]');
  var totalPayoutTarget = calculator.querySelector('[data-calc-total-payout]');
  var fictivePayoutTarget = calculator.querySelector('[data-calc-fictive-payout]');
  var wbwLive = calculator.querySelector('[data-calc-live="wbw"]');
  var repairLive = calculator.querySelector('[data-calc-live="repair"]');
  var restLive = calculator.querySelector('[data-calc-live="rest"]');
  var statusBox = calculator.querySelector('[data-calc-status]');
  var statusTitle = calculator.querySelector('[data-calc-status-title]');
  var statusRepair = calculator.querySelector('[data-calc-repair]');
  var statusFictive = calculator.querySelector('[data-calc-fictive]');
  var fictiveNote = calculator.querySelector('[data-calc-fictive-note]');
  var cta = calculator.querySelector('[data-calc-cta]');
  var marker = calculator.querySelector('[data-calc-marker]');
  var compareNet = calculator.querySelector('[data-calc-compare="netRepair"]');
  var compareTotal = calculator.querySelector('[data-calc-compare="totalBasis"]');
  var compareNetTag = calculator.querySelector('[data-calc-compare-tag="netRepair"]');
  var compareTotalTag = calculator.querySelector('[data-calc-compare-tag="totalBasis"]');

  var zones = {
    safe: calculator.querySelector('[data-calc-zone="safe"]'),
    positive: calculator.querySelector('[data-calc-zone="positive"]'),
    rule: calculator.querySelector('[data-calc-zone="rule"]'),
    critical: calculator.querySelector('[data-calc-zone="critical"]')
  };

  if (!wbwInput || !repairInput || !restInput || !wbwRange || !repairRange || !restRange || !warning || !result || !percentTarget || !netRepairTarget || !totalPayoutTarget || !fictivePayoutTarget || !wbwLive || !repairLive || !restLive || !statusBox || !statusTitle || !statusRepair || !statusFictive || !fictiveNote || !cta || !marker || !compareNet || !compareTotal || !compareNetTag || !compareTotalTag || !zones.safe || !zones.positive || !zones.rule || !zones.critical) {
    return;
  }

  var statusContent = {
    safe: {
      className: 'calculator-box calculator-box--repair calculator-status--safe',
      title: 'Klar im Reparaturbereich',
      repair: 'Die Reparatur liegt deutlich innerhalb des Fahrzeugwerts. Sie können das Fahrzeug wirtschaftlich sinnvoll reparieren lassen.',
      fictive: 'Wenn Sie sich den Schaden auszahlen lassen möchten, ist für Ihre Auszahlung der niedrigere Betrag aus Reparaturkosten netto und Wiederbeschaffungswert abzüglich Restwert maßgeblich.',
      fictiveNote: 'Damit wird für Sie direkt sichtbar, welcher Betrag bei einer Auszahlung ohne Reparatur maßgeblich ist.',
      cta: 'Jetzt Gutachten anfragen',
      zone: 'safe'
    },
    positive: {
      className: 'calculator-box calculator-box--repair calculator-status--positive',
      title: 'Reparatur weiterhin möglich',
      repair: 'Die Reparatur liegt noch innerhalb des Wiederbeschaffungswerts. Eine Reparatur ist weiterhin wirtschaftlich möglich.',
      fictive: 'Auch hier ist für eine Auszahlung ohne Reparatur der niedrigere Betrag aus Reparaturkosten netto und Wiederbeschaffungswert abzüglich Restwert maßgeblich.',
      fictiveNote: 'Je näher die Reparaturkosten am Wiederbeschaffungswert liegen, desto wichtiger ist eine saubere gutachterliche Bewertung.',
      cta: 'Schaden prüfen lassen',
      zone: 'positive'
    },
    rule: {
      className: 'calculator-box calculator-box--repair calculator-status--rule',
      title: 'Bereich der 130%-Regel',
      repair: 'Die Reparaturkosten liegen über dem Wiederbeschaffungswert. Eine vollständige Erstattung der Reparaturkosten kommt nur in Betracht, wenn das Fahrzeug fachgerecht entsprechend dem Gutachten repariert wird.',
      fictive: 'Wenn Sie sich den Schaden ohne Reparatur auszahlen lassen möchten, ist für Ihre Auszahlung der niedrigere Betrag aus Reparaturkosten netto und Wiederbeschaffungswert abzüglich Restwert maßgeblich.',
      fictiveNote: 'Damit sehen Sie direkt, welcher Betrag ohne Reparatur in Ihrem Fall wirtschaftlich maßgeblich ist. Wenn Sie nicht fachgerecht reparieren und auf Reparaturbasis abrechnen, ist ebenfalls der niedrigere Betrag für die Auszahlung maßgeblich.',
      cta: 'Reparaturbasis prüfen lassen',
      zone: 'rule'
    },
    critical: {
      className: 'calculator-box calculator-box--repair calculator-status--critical',
      title: 'Wirtschaftlicher Totalschaden',
      repair: 'Die Reparaturkosten überschreiten die 130%-Grenze. Eine Reparatur ist wirtschaftlich in der Regel nicht mehr erstattungsfähig.',
      fictive: 'Wenn Sie sich den Schaden auszahlen lassen, ist für Ihre Auszahlung der niedrigere Betrag maßgeblich. In diesem Bereich ist das regelmäßig der Wiederbeschaffungswert abzüglich Restwert.',
      fictiveNote: 'Wenn Sie sich den Schaden auszahlen lassen, ist in Ihrem Fall dieser Betrag maßgeblich.',
      cta: 'Totalschaden prüfen lassen',
      zone: 'critical'
    },
    invalid: {
      className: 'calculator-box calculator-box--repair calculator-status--invalid',
      title: 'Bitte Eingaben prüfen',
      repair: 'Geben Sie Wiederbeschaffungswert, Reparaturkosten und Restwert als positive Zahlen ein.',
      fictive: 'Dann zeigt der Rechner sofort, welche Auszahlung ohne Reparatur in Ihrem Fall maßgeblich ist.',
      fictiveNote: '',
      cta: 'Jetzt Gutachten anfragen',
      zone: null
    }
  };

  function formatEuro(value) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value) + ' %';
  }

  function parseValue(input) {
    if (!input.value.trim()) return null;
    var parsed = Number(input.value);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < 0) return null;
    return parsed;
  }

  function clampValue(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  function setWarning(message) {
    warning.hidden = !message;
    warning.textContent = message || '';
  }

  function updateActiveZone(zoneName) {
    Object.keys(zones).forEach(function (key) {
      zones[key].classList.remove('is-active');
    });

    if (!zoneName || !zones[zoneName]) {
      marker.style.transform = 'translate(-9999px, -9999px)';
      return;
    }

    var segment = zones[zoneName];
    segment.classList.add('is-active');
    var meterRect = segment.parentElement.getBoundingClientRect();
    var segmentRect = segment.getBoundingClientRect();
    var x = segmentRect.left - meterRect.left + (segmentRect.width / 2) - 8;
    var y = segmentRect.top - meterRect.top - 6;
    marker.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  }

  function setStatus(config) {
    statusBox.className = config.className;
    statusTitle.textContent = config.title;
    statusRepair.textContent = config.repair;
    statusFictive.textContent = config.fictive;
    fictiveNote.textContent = config.fictiveNote;
    cta.textContent = config.cta;
    updateActiveZone(config.zone);
  }

  function markRelevantPayout(key) {
    compareNet.classList.remove('is-relevant');
    compareTotal.classList.remove('is-relevant');
    compareNetTag.hidden = true;
    compareTotalTag.hidden = true;

    if (key === 'netRepair') {
      compareNet.classList.add('is-relevant');
      compareNetTag.hidden = false;
    } else if (key === 'totalBasis') {
      compareTotal.classList.add('is-relevant');
      compareTotalTag.hidden = false;
    }
  }

  function syncRangeToInput(input, range) {
    var value = Number(input.value);
    var min = Number(range.min);
    var max = Number(range.max);
    value = clampValue(value, min, max);
    input.value = String(value);
    range.value = String(value);
  }

  function updateLiveValues() {
    wbwLive.textContent = formatEuro(Number(wbwInput.value) || 0);
    repairLive.textContent = formatEuro(Number(repairInput.value) || 0);
    restLive.textContent = formatEuro(Number(restInput.value) || 0);
  }

  function getStatusKey(percent) {
    if (percent <= 75) return 'safe';
    if (percent <= 100) return 'positive';
    if (percent <= 130) return 'rule';
    return 'critical';
  }

  function setInvalidState(message) {
    result.classList.add('is-invalid');
    setStatus(statusContent.invalid);
    percentTarget.textContent = '–';
    netRepairTarget.textContent = '–';
    totalPayoutTarget.textContent = '–';
    fictivePayoutTarget.textContent = '–';
    markRelevantPayout(null);
    setWarning(message);
  }

  function update() {
    var wbw = parseValue(wbwInput);
    var repair = parseValue(repairInput);
    var rest = parseValue(restInput);
    updateLiveValues();

    result.classList.remove('is-invalid');

    if (wbw === null || repair === null || rest === null) {
      setInvalidState('Bitte geben Sie in alle Felder gültige, positive Zahlen ein.');
      return;
    }

    if (wbw === 0) {
      setInvalidState('Der Wiederbeschaffungswert muss größer als 0 sein, damit eine Berechnung möglich ist.');
      return;
    }

    if (rest > wbw) {
      setInvalidState('Bitte prüfen Sie Ihre Eingaben – der Restwert darf den Wiederbeschaffungswert nicht überschreiten.');
      percentTarget.textContent = formatPercent((repair / wbw) * 100);
      return;
    }

    setWarning('');

    var percent = (repair / wbw) * 100;
    var netRepair = repair / 1.19;
    var totalBasis = wbw - rest;
    var fictivePayout = Math.min(netRepair, totalBasis);
    var relevantKey = netRepair <= totalBasis ? 'netRepair' : 'totalBasis';
    var statusKey = getStatusKey(percent);

    if (percent > 130) {
      fictivePayout = totalBasis;
      relevantKey = 'totalBasis';
    }

    percentTarget.textContent = formatPercent(percent);
    netRepairTarget.textContent = formatEuro(netRepair);
    totalPayoutTarget.textContent = formatEuro(totalBasis);
    fictivePayoutTarget.textContent = 'Maßgebliche Auszahlung ohne Reparatur: ' + formatEuro(fictivePayout);

    setStatus(statusContent[statusKey]);
    markRelevantPayout(relevantKey);
  }

  [
    { input: wbwInput, range: wbwRange },
    { input: repairInput, range: repairRange },
    { input: restInput, range: restRange }
  ].forEach(function (pair) {
    pair.range.addEventListener('input', function () {
      pair.input.value = pair.range.value;
      update();
    });

    pair.input.addEventListener('input', function () {
      syncRangeToInput(pair.input, pair.range);
      update();
    });

    pair.input.addEventListener('blur', function () {
      syncRangeToInput(pair.input, pair.range);
      update();
    });
  });

  window.addEventListener('resize', function () {
    var activeZone = Object.keys(zones).find(function (key) {
      return zones[key].classList.contains('is-active');
    });
    updateActiveZone(activeZone || null);
  });

  update();
}

function initPageFeatures() {
  initScrollRestorationFix();
  initConsentAndMaps();
  initRatgeberArticleLayoutEnhancements();
  initRatgeberRelatedLinks();
  initRatgeberFaqConversion();
  initRatgeberBreadcrumbsAndSchemas();
  initRatgeberBackButtons();
  initMiddleBackButton();
  initStickyCtaClone();
  initFaqAccordion();
  initRatgeberArticleSchema();
  initArticleReadingProgress();
  initMobileStickyArticleCta();
  initProcessSlider();
  init130Rechner();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageFeatures);
} else {
  initPageFeatures();
}
