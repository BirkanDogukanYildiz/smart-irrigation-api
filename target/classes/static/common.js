const API = '';

function getToken(){ return localStorage.getItem('token'); }
function getRole(){ return localStorage.getItem('role'); }
function getUsername(){ return localStorage.getItem('username'); }

// Her korumalı sayfanın en başında çağrılır: token yoksa login'e atar
function requireLogin(){
    if(!getToken()){
        window.location.href = 'login.html';
    }
}

// Sadece admin sayfalarında çağrılır: rol admin değilse anasayfaya atar
function requireAdmin(){
    if(getRole() !== 'ADMIN'){
        window.location.href = 'index.html';
    }
}

function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

async function apiCall(path, options={}){
    const headers = Object.assign({'Content-Type':'application/json'}, options.headers || {});
    const token = getToken();
    if(token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(API + path, Object.assign({}, options, {headers}));
    if(res.status === 401){
        logout();
        throw new Error('Oturum sona erdi, tekrar giriş yap.');
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch(e){ data = text; }
    if(!res.ok){
        const message = (data && data.message) ? data.message : (typeof data === 'string' ? data : 'Bir hata oluştu.');
        throw new Error(message);
    }
    return data;
}

// Her sayfanın <header> içindeki #navBox ve #userBox'unu doldurur
function setupNav(activePage){
    const isAdmin = getRole() === 'ADMIN';
    const links = [
        {href:'index.html', label:'Anasayfa', adminOnly:false},
        {href:'bolgeler.html', label:'Bölgeler', adminOnly:true},
        {href:'cihazlar.html', label:'Cihazlar', adminOnly:true},
        {href:'kullanicilar.html', label:'Kullanıcılar', adminOnly:true},
        {href:'loglar.html', label:'İşlem Geçmişi', adminOnly:true},
    ];
    const navBox = document.getElementById('navBox');
    if(navBox){
        navBox.innerHTML = links
            .filter(l => !l.adminOnly || isAdmin)
            .map(l => `<a href="${l.href}" class="${l.href === activePage ? 'aktif' : ''}">${l.label}</a>`)
            .join('');
    }

    const userBox = document.getElementById('userBox');
    if(userBox){
        const username = getUsername() || '';
        const initial = username.charAt(0).toUpperCase() || '?';
        userBox.innerHTML = `
      <span class="kullanici-adi"><span class="avatar">${initial}</span>${username}</span>
      <span class="rozet ${getRole()}">${isAdmin ? 'Admin' : 'Bahçivan'}</span>
      <button class="btn-cikis" onclick="logout()">Çıkış Yap</button>
    `;
    }
}
