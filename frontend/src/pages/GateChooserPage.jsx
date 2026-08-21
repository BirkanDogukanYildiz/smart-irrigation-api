import { useNavigate, Navigate } from "react-router-dom";
import IBBLogo from "../components/common/IBBLogo";
import ThemeToggle from "../components/common/ThemeToggle";
import Icon from "../components/common/Icon";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

// Sistemin giriş kapısı: kullanıcı burada "Vatandaş Girişi" veya "Personel Girişi"
// seçer. Önceden /giris doğrudan personel giriş formunu gösteriyordu; vatandaş
// görünümüne sadece formun altındaki küçük bir linkle ulaşılabiliyordu — bu da
// "vatandaş görünümü" işlevini ikinci sınıf/gizli bir özellik gibi gösteriyordu.
// Artık iki seçenek eşit ağırlıkta, ilk bakışta tıklanabilir kartlar olarak sunuluyor.
export default function GateChooserPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Zaten giriş yapmış bir personel tekrar /giris'e gelirse anasayfaya yönlendir.
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="auth-shell">
      {/* --- Sol: dekoratif marka paneli --- */}
      <div className="auth-visual">
        <div className="auth-visual-pattern" />
        <div className="auth-visual-glow" />

        <div className="auth-visual-content">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <IBBLogo size={30} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Park Takip Sistemi</span>
          </div>
        </div>

        <div>
          <div className="auth-visual-icons">
            <div className="auth-visual-icon-badge is-lg">
              <Icon name="park" size={38} />
            </div>
            <div className="auth-visual-icon-badge">
              <Icon name="pin" size={26} />
            </div>
            <div className="auth-visual-icon-badge">
              <Icon name="clipboard" size={26} />
            </div>
          </div>
          <div className="auth-visual-title">Belediye ve vatandaş, tek bir platformda buluşuyor.</div>
          <p className="auth-visual-sub">
            Vatandaşlar parkları görüntüleyip talep oluşturabilir; personel ekipman, bölge ve
            talep yönetimini tek bir yerden yürütebilir.
          </p>
        </div>

        <div className="auth-visual-footer">İstanbul Büyükşehir Belediyesi · Park ve Bahçeler</div>
      </div>

      {/* --- Sağ: seçim paneli --- */}
      <div className="auth-panel">
        <div className="auth-theme-toggle">
          <ThemeToggle />
        </div>

        <div className="login-card gate-card">
          <div className="login-brand">
            <IBBLogo size={40} />
            <h1>Park Takip Sistemi</h1>
            <div className="login-sub">İstanbul Büyükşehir Belediyesi · Park ve Bahçeler</div>
          </div>

          <div className="login-body">
            <h2>Nasıl devam etmek istersiniz?</h2>
            <p>Aşağıdan size uygun girişi seçin.</p>

            <div className="gate-choices">
              <button type="button" className="gate-choice" onClick={() => navigate("/vatandas")}>
                <div className="gate-choice-icon">
                  <Icon name="pin" size={22} />
                </div>
                <div className="gate-choice-body">
                  <span className="gate-choice-badge">Vatandaş</span>
                  <h3>Vatandaş Girişi</h3>
                  <p>Parkların konumlarını görün, ekipman durumunu inceleyin, talep oluşturun.</p>
                </div>
                <Icon name="chevronRight" size={16} className="gate-choice-arrow" />
              </button>

              <button type="button" className="gate-choice" onClick={() => navigate("/giris/personel")}>
                <div className="gate-choice-icon">
                  <Icon name="user" size={22} />
                </div>
                <div className="gate-choice-body">
                  <span className="gate-choice-badge">Personel</span>
                  <h3>Personel Girişi</h3>
                  <p>Kullanıcı adı ve şifrenizle ekipman, bölge ve talep yönetimine erişin.</p>
                </div>
                <Icon name="chevronRight" size={16} className="gate-choice-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
