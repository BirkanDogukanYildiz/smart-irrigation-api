const API = '';

function getToken(){ return localStorage.getItem('token'); }
function getRole(){ return localStorage.getItem('role'); }
function getUsername(){ return localStorage.getItem('username'); }

// Her korumalı sayfanın en başında çağrılır: token yoksa login'e atar
function girisGerekli(){
    if(!getToken()){
        window.location.href = 'login.html';
    }
}

// Sadece admin sayfalarında çağrılır: rol admin değilse anasayfaya atar
function adminGerekli(){
    if(getRole() !== 'ADMIN'){
        window.location.href = 'index.html';
    }
}

function cikisYap(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

async function apiCagir(yol, secenekler={}){
    const headers = Object.assign({'Content-Type':'application/json'}, secenekler.headers || {});
    const token = getToken();
    if(token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(API + yol, Object.assign({}, secenekler, {headers}));
    if(res.status === 401){
        cikisYap();
        throw new Error('Oturum sona erdi, tekrar giriş yap.');
    }
    const metin = await res.text();
    let veri = null;
    try { veri = metin ? JSON.parse(metin) : null; } catch(e){ veri = metin; }
    if(!res.ok){
        const mesaj = (veri && veri.message) ? veri.message : (typeof veri === 'string' ? veri : 'Bir hata oluştu.');
        throw new Error(mesaj);
    }
    return veri;
}

// Her sayfanın <header> içindeki #navKutusu ve #kullaniciKutusu'nu doldurur
function navKur(aktifSayfa){
    const adminMi = getRole() === 'ADMIN';
    const linkler = [
        {href:'index.html', etiket:'Anasayfa', sadeceAdmin:false},
        {href:'bolgeler.html', etiket:'Bölgeler', sadeceAdmin:true},
        {href:'cihazlar.html', etiket:'Cihazlar', sadeceAdmin:true},
        {href:'kullanicilar.html', etiket:'Kullanıcılar', sadeceAdmin:true},
    ];
    const navKutu = document.getElementById('navKutusu');
    if(navKutu){
        navKutu.innerHTML = linkler
            .filter(l => !l.sadeceAdmin || adminMi)
            .map(l => `<a href="${l.href}" class="${l.href === aktifSayfa ? 'aktif' : ''}">${l.etiket}</a>`)
            .join('');
    }

    const kullaniciKutusu = document.getElementById('kullaniciKutusu');
    if(kullaniciKutusu){
        kullaniciKutusu.innerHTML = `
      <span>${getUsername()}</span>
      <span class="rozet ${getRole()}">${getRole() === 'ADMIN' ? 'Admin' : 'Bahçivan'}</span>
      <button class="btn-cikis" onclick="cikisYap()">Çıkış Yap</button>
    `;
    }
}