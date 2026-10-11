(() => {
  if (window.badrMobilePolishLoaded) return;
  window.badrMobilePolishLoaded = true;
  if (!['/', '/index.html'].includes(location.pathname)) return;

  const style = document.createElement('style');
  style.id = 'badr-mobile-polish';
  style.textContent = `
    .mobile-section-nav{display:none!important}

    @media(max-width:720px){
      body.recruiter-polish{overflow-x:hidden}
      body.recruiter-polish .wrap{width:calc(100% - 28px);max-width:none}

      body.recruiter-polish .nav{backdrop-filter:blur(18px);background:rgba(13,13,15,.96)}
      body.recruiter-polish .navin{height:auto;min-height:64px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:0 12px;padding:10px 0 9px}
      body.recruiter-polish .brand{font-size:16px;letter-spacing:.2em;grid-column:1}
      body.recruiter-polish .cta{padding:9px 12px;font-size:12px;white-space:nowrap;grid-column:2}
      body.recruiter-polish .links{display:flex!important;grid-column:1/-1;width:100%;gap:8px;overflow-x:auto;padding:9px 0 0;margin-top:8px;border-top:1px solid rgba(255,255,255,.07);scrollbar-width:none;-webkit-overflow-scrolling:touch}
      body.recruiter-polish .links::-webkit-scrollbar{display:none}
      body.recruiter-polish .links a{flex:0 0 auto;padding:7px 11px;border:1px solid #29292f;border-radius:999px;background:#121215;color:#c9c8c3;font-size:11px;font-weight:800;letter-spacing:.02em}
      body.recruiter-polish .links a:active{background:#c9a55a;color:#111;border-color:#c9a55a}

      #design,#video,#production-experience,#about,#contact{scroll-margin-top:122px!important}

      body.recruiter-polish .hero{padding:42px 0 34px}
      body.recruiter-polish .heroGrid{max-width:none;margin:0}
      body.recruiter-polish .hero .eyebrow{font-size:10px;line-height:1.55;letter-spacing:.13em;margin-bottom:13px;max-width:330px}
      body.recruiter-polish .heroName{font-size:clamp(62px,20vw,86px)!important;line-height:.88!important;letter-spacing:.16em!important;margin:4px -.16em 22px 0!important}
      body.recruiter-polish .hero .lead{font-size:17px;line-height:1.5;margin-bottom:22px;max-width:340px}
      body.recruiter-polish .hero .actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;width:100%}
      body.recruiter-polish .hero .actions .btn{justify-content:center;padding:12px 10px;font-size:13px;border-radius:12px}
      body.recruiter-polish .hero .micro{font-size:11.5px;line-height:1.55;margin-top:18px;max-width:350px}
      body.recruiter-polish .stats{grid-template-columns:1fr 1fr;gap:8px;margin-top:24px;max-width:none}
      body.recruiter-polish .stat{padding:12px;border-radius:12px;min-height:76px}
      body.recruiter-polish .stat b{font-size:12px;line-height:1.25}
      body.recruiter-polish .stat span{display:block;font-size:10.5px;line-height:1.35;margin-top:4px}

      body.recruiter-polish section{padding:46px 0}
      body.recruiter-polish .sectionHead{display:block;margin-bottom:20px}
      body.recruiter-polish .sectionHead h2{font-size:29px;line-height:1.08;letter-spacing:-.035em;margin-bottom:9px}
      body.recruiter-polish .sectionHead p{font-size:13.5px;line-height:1.58;max-width:none}

      #design{padding-top:38px}
      #design .brandPriorityGrid{grid-template-columns:1fr!important;gap:14px}
      #design .brandPriorityCard,#design .brandPriorityWide{grid-column:auto!important;border-radius:18px;overflow:hidden;box-shadow:0 12px 34px rgba(0,0,0,.16)}
      #design .brandPriorityMedia{aspect-ratio:16/10}
      #design .brandPriorityCard .cardBody{padding:17px 17px 18px}
      #design .brandPriorityCard .kicker{font-size:9.5px;letter-spacing:.1em}
      #design .brandPriorityCard h3{font-size:20px;line-height:1.18;margin:7px 0}
      #design .brandPriorityCard p{font-size:12.8px;line-height:1.52}
      #design .miniChips{gap:6px;margin-top:11px}
      #design .miniChips span{font-size:9.5px;padding:5px 7px}

      #recruiter-summary{padding:0 0 34px!important}
      #recruiter-summary .recruiter-summary-grid{grid-template-columns:1fr!important;gap:9px}
      #recruiter-summary .recruiter-summary-item{padding:14px 15px;border-radius:13px}
      #recruiter-summary .recruiter-summary-item span{font-size:9px;margin-bottom:4px}
      #recruiter-summary .recruiter-summary-item b{font-size:12.5px;margin-bottom:3px}
      #recruiter-summary .recruiter-summary-item p{font-size:10.8px;line-height:1.45}

      #video{padding-top:42px!important}
      #video>.video-intro{padding-bottom:2px}
      #video>#reel{padding-top:12px!important}
      #reel .showreelBox{border-radius:20px}
      #reel .showreelInner{display:block}
      #reel .showreelVideo{background:#050506}
      #reel .showreelVideo video{width:100%;height:auto;max-height:72vh;aspect-ratio:9/16;object-fit:contain;background:#000}
      #reel .showreelCopy{padding:21px 19px 22px}
      #reel .showreelCopy h3{font-size:25px;line-height:1.12;margin-bottom:10px}
      #reel .showreelCopy p{font-size:12.8px;line-height:1.55;margin-bottom:15px}
      #reel .chips{gap:6px}
      #reel .chip{font-size:9.5px;padding:6px 8px}

      #video>#work{padding-top:34px!important}
      #work .sectionHead{margin-bottom:18px}
      #work .grid{display:grid;grid-template-columns:1fr!important;gap:14px}
      #work .grid>.card,#work .grid>.card:first-child{display:block!important;min-height:0!important;border-radius:18px;background:#151518}
      #work .grid>.card>.media,#work .grid>.card:first-child>.media{width:100%;height:auto!important;min-height:0!important;aspect-ratio:4/5!important;max-height:none!important;border-right:0!important;border-bottom:1px solid #29292e;background:#070708}
      #work .grid>.card>.media video,#work .grid>.card:first-child>.media video{width:100%;height:100%;object-fit:cover}
      #work .grid>.card>.cardBody,#work .grid>.card:first-child>.cardBody{padding:17px 17px 18px!important}
      #work .grid>.card>.cardBody .kicker{font-size:9.5px}
      #work .grid>.card>.cardBody h3,#work .grid>.card:first-child>.cardBody h3{font-size:20px!important;line-height:1.18;margin:6px 0 7px}
      #work .grid>.card>.cardBody>p,#work .grid>.card:first-child>.cardBody>p{font-size:12.5px;line-height:1.5}
      #work .grid>.card>.cardBody>.projectFacts,#work .grid>.card>.cardBody>.ai-workflow-proof,#work .grid>.card:first-child>.cardBody>.projectFacts,#work .grid>.card:first-child>.cardBody>.ai-workflow-proof{display:none!important}
      #work .grid>.card>.cardBody>.project-rating{padding-top:12px;margin-top:10px}
      #work .rank{top:10px;left:10px;font-size:9px;padding:5px 7px}
      #work .miniChips{gap:5px;margin-top:10px}
      #work .miniChips span{font-size:9px;padding:4px 6px}
      #work .work-toggle-wrap{margin-top:19px}
      #work .work-toggle{width:100%;min-width:0;padding:14px 16px;font-size:12.5px;border-radius:14px}

      #production-experience .two{grid-template-columns:1fr!important;gap:12px}
      #production-experience .panel{padding:20px;border-radius:16px}
      #production-experience .panel h3{font-size:20px;line-height:1.2;margin-bottom:10px}
      #production-experience .panel p{font-size:12.8px;line-height:1.55}
      #production-experience .chips{gap:6px;margin-top:13px}
      #production-experience .chip{font-size:9.5px;padding:6px 8px}

      #about .two{grid-template-columns:1fr!important;gap:12px}
      #about .panel{padding:20px;border-radius:16px}
      #about .aboutProfile{grid-template-columns:88px minmax(0,1fr);gap:14px}
      #about .aboutPortrait{width:88px;border-radius:14px}
      #about .aboutProfile h3{font-size:19px}
      #about .aboutSummary,#about .about p,#about .panel p{font-size:12.8px;line-height:1.58}
      #about .skillList{grid-template-columns:1fr!important;gap:0}
      #about .skillList div{font-size:12px;padding:8px 0}

      #contact .contact{padding:22px 18px;border-radius:18px;display:block}
      #contact .contact h2{font-size:26px;line-height:1.12;margin-bottom:8px}
      #contact .contact p{font-size:12.8px;line-height:1.55}
      #contact .contactActions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:18px}
      #contact .contactActions .btn{justify-content:center;width:100%}

      body.recruiter-polish .footer{padding:26px 0 34px;margin-top:34px;font-size:11px;gap:7px}
    }

    @media(max-width:380px){
      body.recruiter-polish .wrap{width:calc(100% - 22px)}
      body.recruiter-polish .heroName{font-size:58px!important}
      body.recruiter-polish .hero .actions{grid-template-columns:1fr}
      body.recruiter-polish .stats{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);

  // Keep one mobile section navigation only: use the existing main navigation links.
  document.querySelectorAll('.mobile-section-nav').forEach(node => node.remove());
})();
