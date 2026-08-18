import { useNavigate, Navigate } from "react-router-dom";
import IBBLogo from "../components/common/IBBLogo";
import ThemeToggle from "../components/common/ThemeToggle";
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
    <main className="login-page">
      <div className="login-theme-toggle">
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
              <span className="gate-choice-badge">Vatandaş</span>
              <h3>Vatandaş Girişi</h3>
              <p>Parkların haritadaki konumlarını görün, ekipman durumunu inceleyin, arıza/bakım talebi veya öneri-şikayet oluşturun.</p>
              <span className="gate-choice-arrow">Devam et →</span>
            </button>

            <button type="button" className="gate-choice" onClick={() => navigate("/giris/personel")}>
              <span className="gate-choice-badge">Personel</span>
              <h3>Personel Girişi</h3>
              <p>Kullanıcı adı ve şifrenizle giriş yapın; ekipman, bölge ve talep yönetimine erişin.</p>
              <span className="gate-choice-arrow">Giriş yap →</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
