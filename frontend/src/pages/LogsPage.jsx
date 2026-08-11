import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import LogTable from "../components/logs/LogTable";
import { listLogs } from "../api/logs";

export default function LogsPage() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listLogs()
      .then(setLogs)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Section title="İşlem Geçmişi" subtitle="Sistemde yapılan işlemlerin kaydı.">
      <Alert type="error">{error}</Alert>
      <LogTable logs={logs} />
    </Section>
  );
}
