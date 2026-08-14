import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../api/notifications";
import { formatDateTime } from "../../utils/format";
import "../../styles/layout.css";

// Bildirim merkezi. Gerçek zamanlı bir teknoloji (websocket/SSE) KULLANILMADI —
// mevcut mimariye uygun düz REST: sayfa açılışında (Header her authenticated sayfada
// bir kez mount olur) okunmamış sayı çekilir; zile tıklanınca tam liste getirilir.
// Arka planda periyodik "polling" de BİLİNÇLİ OLARAK eklenmedi (gereksiz karmaşıklık/
// zamanlayıcı yönetimi) — kullanıcı zili her açtığında liste zaten güncellenir.
export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    getUnreadNotificationCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => {
        // Bildirim sayısı yüklenemezse sessizce 0'da kalır, sayfanın geri kalanını etkilemez.
      });
  }, []);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      listNotifications()
        .then(setNotifications)
        .catch(() => setNotifications([]));
    }
  }

  async function handleNotificationClick(n) {
    if (!n.read) {
      try {
        await markNotificationRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Okundu işaretlenemese bile yönlendirmeye devam et.
      }
    }
    setOpen(false);
    if (n.resourceType === "CIHAZ" && n.resourceId != null) {
      navigate(`/cihazlar/${n.resourceId}`);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev?.map((x) => ({ ...x, read: true })) ?? prev);
      setUnreadCount(0);
    } catch {
      // sessizce yut
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        onClick={toggleOpen}
        aria-label="Bildirimler"
        title="Bildirimler"
        style={{
          position: "relative",
          background: "transparent",
          border: "1px solid var(--color-border-strong)",
          borderRadius: "var(--radius-sm)",
          width: 34,
          height: 34,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              background: "var(--color-danger)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 42,
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <strong style={{ fontSize: 13 }}>Bildirimler</strong>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: "none", border: "none", color: "var(--color-primary)", fontSize: 11.5, cursor: "pointer" }}
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          {notifications === null && (
            <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-faint)" }}>Yükleniyor...</div>
          )}
          {notifications && notifications.length === 0 && (
            <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-faint)" }}>Henüz bildirim yok.</div>
          )}
          {notifications &&
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--color-border)",
                  background: n.read ? "transparent" : "var(--color-primary-light)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  {!n.read && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: n.read ? 500 : 700, color: "var(--color-text)" }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-faint)", marginTop: 4 }}>
                      {formatDateTime(n.createdAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
