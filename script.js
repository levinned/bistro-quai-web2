(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Land on the top of each new page (or the linked anchor) instead of wherever the
  // previous page happened to be scrolled to. The browser's default scroll restoration
  // is meant for back/forward within one page's own history, not for landing on a
  // different page entirely, but the artifact viewer's own navigation handling was
  // carrying the old scroll position over regardless. history.scrollRestoration would
  // ideally be set before the page paints at all (a tiny inline script in <head> does
  // that on every page), but this is a second, explicit pass to correct it either way.
  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
  var landOnCorrectPosition = function(){
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) { target.scrollIntoView({ block: 'start', behavior: 'auto' }); return; }
    }
    window.scrollTo(0, 0);
  };
  landOnCorrectPosition();
  // pageshow (not just load) also catches back/forward-cache restores, which can
  // reapply a stale scroll position after this script has already run once.
  window.addEventListener('pageshow', landOnCorrectPosition);

  // Sticky nav (guarded: every page has a nav, but keep this safe regardless)
  var nav = document.getElementById('siteNav');
  if (nav) {
    var onScroll = function(){
      if(window.scrollY > 40){ nav.classList.add('is-scrolled'); } else { nav.classList.remove('is-scrolled'); }
    };
    document.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  // Mobile menu
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function(){
      var open = navLinks.classList.toggle('is-open');
      burger.classList.toggle('is-active', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ navLinks.classList.remove('is-open'); burger.classList.remove('is-active'); burger.setAttribute('aria-expanded','false'); });
    });
  }

  // Scroll reveal (safe on every page: querySelectorAll simply returns an empty list
  // on a page with no .reveal elements)
  if('IntersectionObserver' in window && !reduce){
    var els = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.16, rootMargin:'0px 0px -8% 0px' });
    els.forEach(function(el, i){ el.style.setProperty('--d', (i % 4) * 0.09 + 's'); io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('is-visible'); });
  }

  // Subtle hero parallax -- only the homepage has .hero-media
  var heroMedia = document.querySelector('.hero-media');
  if(heroMedia && !reduce){
    var ticking = false;
    function updateParallax(){
      var y = window.scrollY;
      var shift = Math.min(y * 0.18, 140);
      heroMedia.style.transform = 'translateY(' + shift + 'px) scale(' + (1 + Math.min(y*0.0003,0.06)) + ')';
      ticking = false;
    }
    document.addEventListener('scroll', function(){
      if(!ticking){ window.requestAnimationFrame(updateParallax); ticking = true; }
    }, {passive:true});
    updateParallax();
  }

  // Testimonial scroller controls -- only the homepage has these three elements
  var scroller = document.getElementById('scroller');
  var prev = document.getElementById('scrollPrev');
  var next = document.getElementById('scrollNext');
  if (scroller && prev && next) {
    function step(dir){
      var card = scroller.querySelector('.review-card');
      var w = card ? card.getBoundingClientRect().width + 22 : 320;
      scroller.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function(){ step(-1); });
    next.addEventListener('click', function(){ step(1); });
  }

  // Contact form -- only contactus.html has #contactForm. This is a front-end-only
  // demo: it does not send the data anywhere. Wire it to a real backend (Formspree
  // or similar) before relying on it for real reservations.
  var form = document.getElementById('contactForm');
  if (form) {
    var success = document.getElementById('formSuccess');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      form.hidden = true;
      if (success) { success.hidden = false; success.classList.add('is-visible'); success.focus(); }
    });
  }
})();
