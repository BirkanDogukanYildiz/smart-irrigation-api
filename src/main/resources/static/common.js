const API = '';

function getToken(){ return localStorage.getItem('token'); }
function getRole(){ return localStorage.getItem('role'); }
function getUsername(){ return localStorage.getItem('username'); }
function requireManager(){
    const role = getRole();
    if(role !== 'ADMIN' && role !== 'HEADGARDENER'){
        window.location.href = 'index.html';
    }
}
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
    const role = getRole();
    const isAdmin = role === 'ADMIN';
    const isHead = role === 'HEADGARDENER'; // Baş Bahçivanı değişkene atadık

    // Sayfaların kimlere görüneceğini 'visible' özelliği ile kontrol ediyoruz
    const links = [
        {href:'index.html', label:'Anasayfa', visible: true}, // Herkes
        {href:'bolgeler.html', label:'Bölgeler', visible: isAdmin}, // Sadece Admin
        {href:'harita.html', label:'Harita Görünümü', visible: true}, // Herkes
        {href:'cihazlar.html', label:'Cihazlar', visible: isAdmin || isHead}, // Admin VE Baş Bahçivan
        {href:'kullanicilar.html', label:'Kullanıcılar', visible: isAdmin}, // Sadece Admin
        {href:'loglar.html', label:'İşlem Geçmişi', visible: isAdmin || isHead}, // Admin VE Baş Bahçivan
    ];

    const navBox = document.getElementById('navBox');
    if(navBox){
        navBox.innerHTML = links
            .filter(l => l.visible) // Sadece visible özelliği "true" olanları ekrana bas
            .map(l => `<a href="${l.href}" class="${l.href === activePage ? 'aktif' : ''}">${l.label}</a>`)
            .join('');
    }

    const userBox = document.getElementById('userBox');
    if(userBox){
        const username = getUsername() || '';
        const initial = username.charAt(0).toUpperCase() || '?';

        let rolIsmi = '';
        if (role === 'ADMIN') {
            rolIsmi = 'Admin';
        } else if (role === 'HEADGARDENER') {
            rolIsmi = 'Baş Bahçivan';
        } else {
            rolIsmi = 'Bahçivan';
        }

        userBox.innerHTML = `
      <span class="kullanici-adi"><span class="avatar">${initial}</span>${username}</span>
      <span class="rozet ${role}">${rolIsmi}</span>
      <button class="btn-cikis" onclick="logout()">Çıkış Yap</button>
    `;
    }
}