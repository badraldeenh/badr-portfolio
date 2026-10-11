(() => {
  if (window.badrExperienceUpdateLoaded) return;
  window.badrExperienceUpdateLoaded = true;

  const HOME = ['/', '/index.html', '/home-v4.html'].includes(location.pathname);
  if (!HOME) return;

  const style = document.createElement('style');
  style.id = 'badr-experience-update-style';
  style.textContent = `
    #production-experience .experience-timeline{display:grid;gap:14px;margin-top:22px}
    #production-experience .experience-role{display:grid;grid-template-columns:180px minmax(0,1fr);gap:24px;padding:24px 26px;border:1px solid var(--line,#2b2b30);border-radius:18px;background:linear-gradient(145deg,#171719,#111113)}
    #production-experience .experience-date{color:var(--accent,#c9a55a);font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;padding-top:3px}
    #production-experience .experience-company{margin:0 0 3px;font-size:21px;line-height:1.2;color:#f4f3ee}
    #production-experience .experience-role-title{margin:0 0 11px;color:#c7c6c1;font-size:13px;font-weight:800}
    #production-experience .experience-location{color:#8f8e89;font-weight:600}
    #production-experience .experience-points{margin:0;padding-left:18px;color:#aaa9a4;font-size:13.5px;line-height:1.58}
    #production-experience .experience-points li+li{margin-top:5px}
    #production-experience .experience-certificate{display:inline-flex;margin-top:13px;padding:6px 9px;border-radius:999px;border:1px solid rgba(201,165,90,.32);background:rgba(201,165,90,.07);color:#ead7a8;font-size:10.5px;font-weight:850;letter-spacing:.02em}
    @media(max-width:720px){
      #production-experience .experience-timeline{gap:10px;margin-top:16px}
      #production-experience .experience-role{grid-template-columns:1fr;gap:7px;padding:19px 17px;border-radius:15px}
      #production-experience .experience-company{font-size:19px}
      #production-experience .experience-role-title{font-size:12.5px}
      #production-experience .experience-points{font-size:12.5px;line-height:1.55;padding-left:17px}
    }
  `;
  document.head.appendChild(style);

  function updateRecruiterSummary(){
    const grid = document.querySelector('#recruiter-summary .recruiter-summary-grid');
    if (!grid) return false;
    grid.setAttribute('aria-label','Professional experience timeline');
    grid.innerHTML = `
      <div class="recruiter-summary-item"><span>2024 - Present</span><b>Marketing, Graphic Design & Social Media</b><p>MALEH & HELOW SWEETS - Abu Dhabi, UAE</p></div>
      <div class="recruiter-summary-item"><span>2021 - 2024</span><b>Social Media & Content Designer</b><p>Transformer General Trading - Mussafah Industrial Area, Abu Dhabi</p></div>
      <div class="recruiter-summary-item"><span>2019 - 2021</span><b>Graphic Designer</b><p>VIP Stationery - Al Ain, UAE • Print & production experience</p></div>`;
    return true;
  }

  function updateExperience(){
    const section = document.getElementById('production-experience');
    if (!section) return false;
    const heading = section.querySelector('.sectionHead h2');
    const intro = section.querySelector('.sectionHead p');
    if (heading) heading.textContent = 'Professional Experience';
    if (intro) intro.textContent = 'Career progression from hands-on print production to social media, content creation and multi-branch marketing design.';

    const wrap = section.querySelector('.wrap');
    if (!wrap) return false;
    let timeline = section.querySelector('.experience-timeline');
    if (!timeline) {
      timeline = document.createElement('div');
      timeline.className = 'experience-timeline';
      const old = section.querySelector('.two');
      if (old) old.replaceWith(timeline);
      else wrap.appendChild(timeline);
    }
    timeline.innerHTML = `
      <article class="experience-role">
        <div class="experience-date">2024 - Present</div>
        <div>
          <h3 class="experience-company">MALEH & HELOW SWEETS</h3>
          <p class="experience-role-title">Marketing, Graphic Design & Social Media <span class="experience-location">• Abu Dhabi, UAE</span></p>
          <ul class="experience-points">
            <li>Handle marketing, graphic design and social media creative work across six branches.</li>
            <li>Create promotional visuals, social campaigns, product and e-commerce content, and short-form video.</li>
            <li>Support campaign execution and reporting while maintaining consistent brand presentation across digital and in-store touchpoints.</li>
          </ul>
        </div>
      </article>
      <article class="experience-role">
        <div class="experience-date">2021 - 2024</div>
        <div>
          <h3 class="experience-company">Transformer General Trading</h3>
          <p class="experience-role-title">Social Media & Content Designer <span class="experience-location">• Mussafah Industrial Area, Abu Dhabi</span></p>
          <ul class="experience-points">
            <li>Managed day-to-day social media visual content and branded communication.</li>
            <li>Designed promotional graphics and advertising materials for digital channels.</li>
            <li>Created branded photo/video content and short-form videos for social media.</li>
          </ul>
          <span class="experience-certificate">Experience certificate available upon request</span>
        </div>
      </article>
      <article class="experience-role">
        <div class="experience-date">2019 - 2021</div>
        <div>
          <h3 class="experience-company">VIP Stationery</h3>
          <p class="experience-role-title">Graphic Designer <span class="experience-location">• Al Ain, UAE</span></p>
          <ul class="experience-points">
            <li>Designed and produced acrylic/plastic products and prepared advertising signage for printing and fabrication.</li>
            <li>Prepared artwork and printed customized apparel and clothing.</li>
            <li>Designed and produced custom stamps and handled production finishing.</li>
            <li>Operated a wide range of printing and production machines used by the stationery shop.</li>
          </ul>
          <span class="experience-certificate">Experience certificate available upon request</span>
        </div>
      </article>`;
    return true;
  }

  function apply(){
    updateRecruiterSummary();
    updateExperience();
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(apply, 120), {once:true});
  [350, 900, 1800].forEach(delay => setTimeout(apply, delay));
})();
