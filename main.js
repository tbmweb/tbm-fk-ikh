// TBM FK IKH — renderer berbasis konten.js. Seluruh data publik dikendalikan Editor Konten Lokal.
(() => {
'use strict';
const $ = id => document.getElementById(id);
const make=(tag,cls)=>{const el=document.createElement(tag);if(cls)el.className=cls;return el;};
const text=(el,value)=>{if(el)el.textContent=String(value??'');};
const validLink=(v)=>{const s=String(v||'').trim();if(/^#[a-zA-Z][\w-]*$/.test(s))return s;try{const u=new URL(s);return u.protocol==='https:'?u.href:null;}catch{return null;}};
const validImage=(v)=>{const s=String(v||'');return /^(data:image\/(?:jpeg|png|webp);base64,[a-z\d+/=]+)$/i.test(s)||validLink(s)?.startsWith('https://')?s:null;};
function putImage(el,src){if(!el)return;const u=validImage(src);if(u){el.src=u;el.hidden=false;}else{el.hidden=true;el.removeAttribute('src');}}
function linkSetup(el,url,label){if(!el)return;const safe=validLink(url);text(el,safe?(label||'Buka tautan ↗'):'Formulir belum tersedia');if(safe){el.href=safe;el.removeAttribute('aria-disabled');if(safe.startsWith('https://')){el.target='_blank';el.rel='noopener noreferrer';}else{el.removeAttribute('target');el.removeAttribute('rel');}}else{el.removeAttribute('href');el.setAttribute('aria-disabled','true');}}
const sectionIds=['hero','statistik','tentang','program','kegiatan','berita','galeri','daftar','donasi','kerjasama','kontak'];
const allNav=[{judul:'Tentang',tujuan:'#tentang',aktif:true},{judul:'Program',tujuan:'#program',aktif:true},{judul:'Kegiatan',tujuan:'#kegiatan',aktif:true},{judul:'Berita',tujuan:'#berita',aktif:true},{judul:'Galeri',tujuan:'#galeri',aktif:true},{judul:'Pendaftaran',tujuan:'#daftar',aktif:true},{judul:'Donasi',tujuan:'#donasi',aktif:true},{judul:'Kerja sama',tujuan:'#kerjasama',aktif:true},{judul:'Kontak',tujuan:'#kontak',aktif:true}];
let d={};
function card(item,kind){
 const art=make('article','card');
 const img=validImage(item.gambar);
 if(img){const photo=make('img','card-photo');photo.src=img;photo.loading='lazy';photo.alt=String(item.alt||item.judul||'Dokumentasi TBM').slice(0,170);art.append(photo);}
 else{const ico=make('span','card-icon');ico.textContent=kind==='program'?(item.ikon||'✦'):kind==='kegiatan'?'📆':'📰';art.append(ico);}
 const meta=kind==='kegiatan'?[item.tanggal,item.lokasi].filter(Boolean).join(' • '):kind==='berita'?item.tanggal:'';
 if(meta){const m=make('div','meta');text(m,meta);art.append(m);}
 const h=make('h3');text(h,item.judul||kind);art.append(h);
 const p=make('p');text(p,item.deskripsi||item.ringkasan||'');art.append(p);
 const href=validLink(item.link);
 if(href){const a=make('a');a.href=href;text(a,'Baca selengkapnya ↗');if(href.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}art.append(a);}
 return art;
}
function populate(id,items,empty,build){const root=$(id);if(!root)return;root.replaceChildren();if(!Array.isArray(items)||items.length===0){const div=make('div','empty');text(div,empty);root.append(div);return;}items.forEach(item=>root.append(build(item)));}
function renderNav(){
 const root=$('navLinks'),footer=$('footerNav');if(!root||!footer)return;root.replaceChildren();footer.replaceChildren();
 const items=Array.isArray(d.menu)?d.menu:allNav;
 items.filter(x=>x&&x.aktif!==false&&x.judul&&validLink(x.tujuan)).forEach((item,i)=>{
  const dest=validLink(item.tujuan);const ref=dest.startsWith('#')?dest.slice(1):null;
  if(ref&&d.tampilBagian?.[ref]===false)return;
  const a=make('a');text(a,item.judul);a.href=dest;
  if(dest.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}
  if(i===items.length-1||item.tujuan==='#kerjasama')a.classList.add('nav-cta');root.append(a);
  if(['#tentang','#kegiatan','#daftar','#kontak','#galeri'].includes(dest)){
   const f=make('a');text(f,item.judul);f.href=dest;footer.append(f);
  }
 });
}
function render(next){
 d=next||{};
 document.querySelectorAll('[data-text]').forEach(el=>{const v=d[el.dataset.text];if(typeof v==='string')text(el,v);});
 document.title=String(d.pageTitle||d.nama||'TBM FK IKH').slice(0,150);
 const description=$('siteDescription');if(description)description.content=String(d.pageDescription||d.heroDeskripsi||'').slice(0,300);
 const hex=v=>/^#[0-9a-f]{6}$/i.test(String(v))?String(v):null;
 const navy=hex(d.warnaUtama)||'#102847',red=hex(d.warnaAksen)||'#e34d63',light=hex(d.warnaLembut)||'#eff6fb';
 document.documentElement.style.setProperty('--navy',navy);
 document.documentElement.style.setProperty('--red',red);
 document.documentElement.style.setProperty('--accent-2',red);
 document.documentElement.style.setProperty('--light',light);
 document.documentElement.style.setProperty('--radius',`${Math.min(32,Math.max(0,Number(d.radiusKartu)||18))}px`);
 document.documentElement.style.setProperty('--max-content',`${Math.min(1440,Math.max(760,Number(d.lebarKonten)||1140))}px`);
 const meta=$('themeColorMeta');if(meta)meta.content=navy;
 const notice=document.querySelector('.notice');if(notice)notice.hidden=d.noticeAktif===false;
 sectionIds.forEach(id=>{const e=document.querySelector(`[data-section="${id}"]`);if(e)e.hidden=d.tampilBagian?.[id]===false;});
 putImage($('logoImage'),d.logoGambar);
 const mark=document.querySelector('.brandmark');if(mark)mark.classList.toggle('has-photo',!!validImage(d.logoGambar));
 putImage($('heroPhoto'),d.heroGambar);if($('heroPhoto'))$('heroPhoto').alt=String(d.heroAlt||'Foto kegiatan TBM FK IKH');const art=$('heroArt');if(art){art.classList.toggle('has-photo',!!validImage(d.heroGambar));art.setAttribute('aria-label',String(d.heroAlt||'Dokumentasi TBM'));}
 putImage($('aboutPhoto'),d.tentangGambar);putImage($('partnerPhoto'),d.kerjasamaGambar);
 linkSetup($('heroCta1'),d.heroButton1Link||'#daftar',d.heroButton1||'Bergabung');
 linkSetup($('heroCta2'),d.heroButton2Link||'#program',d.heroButton2||'Lihat program');
 // Update text fragments from editor where needed.
 const stats=$('statList');if(stats){stats.replaceChildren();(Array.isArray(d.statistik)?d.statistik:[]).forEach(x=>{
  const div=make('div');const n=make('span','num-icon');text(n,x.nomor);const strong=make('strong');text(strong,x.judul);const small=make('small');text(small,x.deskripsi);div.append(n,strong,small);stats.append(div);
 });}
 populate('programList',d.program,'Belum ada program yang dipublikasikan.',i=>card(i,'program'));
 populate('kegiatanList',d.kegiatan,'Belum ada kegiatan yang dipublikasikan.',i=>card(i,'kegiatan'));
 populate('beritaList',d.berita,'Belum ada berita yang dipublikasikan.',i=>card(i,'berita'));
 populate('galeriList',d.galeri,'Foto galeri belum ditambahkan. Pengurus dapat mengunggahnya melalui editor.',i=>{
  const f=make('figure','gallery-item'),img=make('img');const src=validImage(i.gambar);if(src){img.src=src;img.loading='lazy';img.alt=String(i.alt||i.judul||'Galeri TBM').slice(0,170);f.append(img);}const cap=make('figcaption');const h=make('strong');text(h,i.judul||'Dokumentasi');cap.append(h);if(i.keterangan){const p=make('p');text(p,i.keterangan);cap.append(p);}f.append(cap);return f;
 });
 linkSetup($('formRelawan'),d.formRelawan,d.formButtonLabel);
 linkSetup($('formPeserta'),d.formPeserta,d.formButtonLabel);
 linkSetup($('formKerjasama'),d.formKerjasama,d.formButtonLabel);
 text($('donasiText'),d.donasiDeskripsi||'Kanal donasi belum dibuka.');
 const url=validLink(d.donasiLink);const enabled=d.donasiAktif===true&&!!url;
 const donasi=$('donasiButton');if(donasi){donasi.hidden=!enabled;if(enabled){donasi.href=url;text(donasi,d.donasiButtonLabel||'Lihat donasi resmi ↗');donasi.rel='noopener noreferrer';donasi.target='_blank';}}
 text($('donasiStatus'),enabled?'Kanal resmi tersedia':'Belum dibuka');
 function contact(id,value,url){const el=$(id);if(!el)return;el.replaceChildren();if(!value){text(el,'Belum dicantumkan');return;}
  if(url){const a=make('a');a.href=url;a.textContent=value;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}el.append(a);}else{text(el,value);}}
 contact('kontakEmail',d.email,/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email||'')?'mailto:'+d.email:null);
 const wa=String(d.whatsapp||'').replace(/\D/g,'');contact('kontakWhatsapp',d.whatsapp,wa?'https://wa.me/'+wa:null);
 contact('kontakInstagram',d.instagram,validLink(d.instagram));contact('kontakAlamat',d.alamat,null);
 text($('year'),new Date().getFullYear());renderNav();
}
const menu=$('menuBtn');const links=$('navLinks');if(menu&&links){menu.addEventListener('click',()=>{const v=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(v));});links.addEventListener('click',e=>{if(e.target.closest('a')){links.classList.remove('open');menu.setAttribute('aria-expanded','false');}});document.addEventListener('keydown',e=>{if(e.key==='Escape'){links.classList.remove('open');menu.setAttribute('aria-expanded','false');}});}
render(window.TBM_DATA||{});
// Pratinjau di editor lokal: perubahan hanya dalam memori, tidak tersimpan otomatis.
if(window.parent!==window){window.addEventListener('message',event=>{if(event.source!==window.parent||event.data?.type!=='TBM_PREVIEW_V2'||typeof event.data.content!=='object'||event.data.content===null)return;if(location.protocol==='https:'&&event.origin!==location.origin)return;render(event.data.content);});window.parent.postMessage({type:'TBM_READY_V2'},'*');}
})();
