/* ============================================
   JAMIA MASJID E ALI — SHARED JAVASCRIPT
   ============================================ */

/**
 * Intro Screen — Proximity-Reactive Dot Grid
 * Ported from Framer "Dots_1" component by Framerusercontent.
 *
 * Renders a canvas grid of dots + lines. Dots nearest the cursor
 * brighten based on proximity, exactly matching the Framer component behaviour.
 * Colours are matched to the site's cream/gold palette.
 */
function initIntroDots() {
  var canvas = document.getElementById('intro-dots-canvas');
  var intro  = document.getElementById('intro-screen');
  if (!canvas || !intro) return;

  var ctx = canvas.getContext('2d');

  // ── Config (mirrors Framer component props) ────────────────────────────
  var DOT_COLOR        = '#b89146';   // site gold
  var DOT_SIZE         = 3;           // radius in px
  var SPACING          = 48;          // grid cell size
  var PROXIMITY_RADIUS = 160;         // cursor influence radius
  var MAX_OPACITY      = 0.85;        // brightest a dot can get
  var BG_OPACITY       = 0.05;        // resting dim opacity
  var FADE_DURATION    = 600;         // ms for dots to fade back after cursor leaves
  // ───────────────────────────────────────────────────────────────────────

  var W = 0, H = 0;
  var mouse = { x: -9999, y: -9999 };
  var dots  = [];
  // Map of dot key -> timestamp when cursor left proximity
  var fadingDots = new Map();

  function resize() {
    W = canvas.width  = intro.offsetWidth;
    H = canvas.height = intro.offsetHeight;
    buildGrid();
  }

  function buildGrid() {
    dots = [];
    var cols = Math.ceil(W / SPACING);
    var rows = Math.ceil(H / SPACING);
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        dots.push({
          x:   c * SPACING + SPACING / 2,
          y:   r * SPACING + SPACING / 2,
          key: r + '_' + c,
          opacity: BG_OPACITY,
        });
      }
    }
  }

  function getTargetOpacity(dot) {
    var dx = mouse.x - dot.x;
    var dy = mouse.y - dot.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > PROXIMITY_RADIUS) return BG_OPACITY;
    return BG_OPACITY + (1 - dist / PROXIMITY_RADIUS) * (MAX_OPACITY - BG_OPACITY);
  }

  var lastTime = 0;

  function draw(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min(ts - lastTime, 50);
    lastTime = ts;

    ctx.clearRect(0, 0, W, H);

    // ── Dots ─────────────────────────────────────────────────────────────
    var speed = dt / 80; // lerp speed per frame

    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      var target = getTargetOpacity(dot);

      // Lerp toward target (smooth fade in/out)
      if (target > dot.opacity) {
        // Brighten fast
        dot.opacity += (target - dot.opacity) * speed * 2.5;
      } else {
        // Fade back slowly
        dot.opacity += (target - dot.opacity) * speed * 0.8;
      }
      dot.opacity = Math.max(BG_OPACITY, Math.min(MAX_OPACITY, dot.opacity));

      ctx.globalAlpha = dot.opacity;
      ctx.fillStyle   = DOT_COLOR;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    if (intro && !intro.classList.contains('hidden')) {
      requestAnimationFrame(draw);
    }
  }

  // ── Mouse tracking ───────────────────────────────────────────────────
  window.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  // Touch support
  window.addEventListener('touchmove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }, { passive: true });

  // ── Init ─────────────────────────────────────────────────────────────
  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(draw);
}
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const icon = btn.querySelector('.faq-icon');
  const isOpen = answer.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-a').forEach(function(a) {
    a.classList.remove('open');
  });
  document.querySelectorAll('.faq-icon').forEach(function(i) {
    i.classList.remove('open');
  });

  // Toggle clicked
  if (!isOpen) {
    answer.classList.add('open');
    icon.classList.add('open');
  }
}

/**
 * Contact form submission handler
 * Basic client-side validation and success feedback
 */
function handleSubmit() {
  var name    = document.getElementById('contact-name').value.trim();
  var email   = document.getElementById('contact-email').value.trim();
  var subject = document.getElementById('contact-subject').value;
  var message = document.getElementById('contact-message').value.trim();

  if (!name || !email || !message) {
    alert('Please fill in all required fields.');
    return;
  }

  var btn = document.querySelector('.form-submit');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  var templateParams = {
    from_name:    name,
    from_email:   email,
    subject:      subject,
    message:      message,
    reply_to:     email
  };

  emailjs.send('service_xts1dzi', 'template_etnd6cs', templateParams)
    .then(function() {
      btn.textContent = 'Message sent \u2014 JazakAllahu Khayran';
      btn.style.background = '#2d5016';

      document.getElementById('contact-name').value    = '';
      document.getElementById('contact-email').value   = '';
      document.getElementById('contact-subject').value = 'Select a topic';
      document.getElementById('contact-message').value = '';
    })
    .catch(function(err) {
      console.error('EmailJS error:', err);
      btn.textContent = 'Failed to send. Please try again.';
      btn.style.background = '#c0392b';
      btn.disabled = false;
    });
}

/**
 * Mobile navigation toggle
 */
function toggleMobileNav() {
  var hamburger = document.getElementById('nav-hamburger');
  var navLinks = document.getElementById('nav-links');
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
}

/**
 * Intro screen logic
 * Plays once per session, dismissed on click or scroll.
 */
function dismissIntro() {
  var intro = document.getElementById('intro-screen');
  if (intro && !intro.classList.contains('hidden')) {
    intro.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore scroll
  }
}

/**
 * Scroll-reveal animation via IntersectionObserver
 * Elements with class "reveal" fade in when scrolled into view
 */
document.addEventListener('DOMContentLoaded', function() {
  
  // Intro dots grid
  initIntroDots();

  // Handle Intro Screen
  var intro = document.getElementById('intro-screen');
  if (intro) {
    if (!sessionStorage.getItem('introSeen')) {
      document.body.style.overflow = 'hidden'; // Lock scroll initially
      // Listeners to dismiss
      window.addEventListener('wheel', dismissIntro, { once: true });
      window.addEventListener('touchmove', dismissIntro, { once: true });
      // Fallback timeout in case they do nothing
      setTimeout(dismissIntro, 6000);
      sessionStorage.setItem('introSeen', 'true');
    } else {
      intro.style.display = 'none'; // Instantly hide if already seen
    }
  }

  // Existing reveal observer
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function(el) {
    observer.observe(el);
  });
});

/**
 * Courses horizontal scroll — native on all devices.
 * Arrow buttons + progress bar sync.
 */
function initCoursesTrack() {
  var track = document.getElementById('courses-track');
  var progressBar = document.getElementById('courses-progress-bar');
  var prevBtn = document.getElementById('courses-prev');
  var nextBtn = document.getElementById('courses-next');
  var hint = document.getElementById('swipe-hint');
  if (!track) return;

  // Update progress bar on scroll
  function onScroll() {
    var max = track.scrollWidth - track.clientWidth;
    if (progressBar && max > 0) {
      progressBar.style.width = (track.scrollLeft / max * 100) + '%';
    }
    // Update arrow states
    if (prevBtn) prevBtn.style.opacity = track.scrollLeft <= 4 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = track.scrollLeft >= max - 4 ? '0.3' : '1';
    // Hide swipe hint on first scroll
    if (hint) { hint.style.opacity = '0'; }
  }

  track.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // init state

  // Card-width scroll on arrow click
  function scrollByCard(dir) {
    var card = track.querySelector('.course-card');
    var amount = card ? (card.offsetWidth + 24) : 400;
    track.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  if (prevBtn) prevBtn.addEventListener('click', function() { scrollByCard(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function() { scrollByCard(1); });
}

document.addEventListener('DOMContentLoaded', initCoursesTrack);

// Legacy no-op
function moveCourseCarousel() {}