(function(){
  const supported = ['tr','en','ru'];
  function currentLang(){
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    return urlLang || localStorage.getItem('lang') || 'tr';
  }
  function setLang(lang){
    if(!supported.includes(lang)) lang='tr';
    localStorage.setItem('lang',lang);
    document.documentElement.lang = lang;
    const selector=document.querySelector('.language-selector');
    if(selector && window.translations){
      selector.textContent = window.translations[lang]?.langButtonText || lang;
    }
  }
  function translate(lang){
    if(!window.translations) return;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const txt = window.translations[lang]?.[key];
      if(txt){
        if(el.placeholder!==undefined && (el.tagName==='INPUT'||el.tagName==='TEXTAREA')){
          el.placeholder = txt;
        }else{
          el.textContent = txt;
        }
      }
    });
  }
  window.changeLang = function(next){
    const current = currentLang();
    if(!next){
      next = current==='tr'?'en':current==='en'?'ru':'tr';
    }
    setLang(next);
    translate(next);
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const lang = currentLang();
    setLang(lang);
    translate(lang);
    const selector=document.querySelector('.language-selector');
    if(selector) selector.addEventListener('click',()=>window.changeLang());
  });
})();
