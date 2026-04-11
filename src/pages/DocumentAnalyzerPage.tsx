import { FileWarning, LockKeyhole, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { analyzeDocument } from '@/lib/mockApi';
import type { AppLanguage } from '@/types/app';

export const DocumentAnalyzerPage = () => {
  const { addAnalyzerRecord, analyzerHistory, language, user } = useAppContext();
  const navigate = useNavigate();
  const [selectedFileName, setSelectedFileName] = useState('');
  const [outputLanguage, setOutputLanguage] = useState<AppLanguage>(language);
  const [isProcessing, setIsProcessing] = useState(false);

  const canUseAnalyzer = Boolean(user);

  const submitForAnalysis = async () => {
    if (!selectedFileName || !canUseAnalyzer) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await analyzeDocument(selectedFileName, outputLanguage);
      addAnalyzerRecord(result);
      setSelectedFileName('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/50 bg-card/70 p-5 sm:p-7">
        <h1 className="text-3xl sm:text-4xl">
          {language === 'es' ? 'Analizador de documentos' : 'Document analyzer'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {language === 'es'
            ? 'Sube PDFs o imágenes y recibe una explicación sencilla en tu idioma. Las respuestas son informativas y no sustituyen asesoría legal profesional.'
            : 'Upload PDFs or images and receive a plain-language explanation in your preferred language. Outputs are informational and do not replace professional legal advice.'}
        </p>
      </section>

      {!canUseAnalyzer ? (
        <section className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-5">
          <p className="inline-flex items-center gap-2 font-heading text-lg">
            <LockKeyhole className="size-5" aria-hidden="true" />
            {language === 'es' ? 'Función para usuarios registrados' : 'Feature for signed-in users'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === 'es'
              ? 'Inicia sesión para analizar documentos y mantener tu historial de resultados.'
              : 'Sign in to analyze documents and retain your analysis history.'}
          </p>
          <Button
            type="button"
            className="mt-4 h-11 cursor-pointer bg-[var(--cta)] text-background hover:bg-[var(--cta)]/85"
            onClick={() => navigate('/auth')}
          >
            {language === 'es' ? 'Ir a autenticación' : 'Go to authentication'}
          </Button>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <article className="rounded-2xl border border-border/50 bg-card/80 p-4 lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {language === 'es' ? 'Carga de archivo' : 'File upload'}
            </p>

            <label
              htmlFor="document-upload"
              className="mt-3 flex min-h-52 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/60 bg-primary/5 p-6 text-center transition-colors duration-200 hover:bg-primary/10"
            >
              <UploadCloud className="size-8 text-primary" aria-hidden="true" />
              <span className="mt-3 text-sm font-semibold">
                {language === 'es'
                  ? 'Haz clic para elegir un PDF o imagen'
                  : 'Click to select a PDF or image'}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {selectedFileName
                  ? selectedFileName
                  : language === 'es'
                    ? 'Formatos admitidos: .pdf .jpg .png'
                    : 'Supported formats: .pdf .jpg .png'}
              </span>
            </label>

            <input
              id="document-upload"
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) {
                  setSelectedFileName(selected.name);
                }
              }}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full">
                <label htmlFor="output-language" className="mb-2 block text-sm font-medium">
                  {language === 'es' ? 'Idioma de salida' : 'Output language'}
                </label>
                <select
                  id="output-language"
                  value={outputLanguage}
                  onChange={(event) => setOutputLanguage(event.target.value as AppLanguage)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <Button
                type="button"
                onClick={() => {
                  void submitForAnalysis();
                }}
                disabled={!selectedFileName || isProcessing}
                className="h-11 cursor-pointer bg-primary hover:bg-primary/85"
              >
                {isProcessing
                  ? language === 'es'
                    ? 'Analizando...'
                    : 'Analyzing...'
                  : language === 'es'
                    ? 'Analizar documento'
                    : 'Analyze document'}
              </Button>
            </div>

            <p className="mt-4 inline-flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-xs text-muted-foreground">
              <FileWarning className="mt-0.5 size-4 shrink-0 text-amber-200" aria-hidden="true" />
              {language === 'es'
                ? 'Esta explicación es solo informativa. Para decisiones legales o médicas, consulta profesionales acreditados.'
                : 'This explanation is informational only. For legal or medical decisions, consult accredited professionals.'}
            </p>
          </article>

          <article className="rounded-2xl border border-border/50 bg-card/80 p-4 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {language === 'es' ? 'Historial reciente' : 'Recent history'}
            </p>

            <div className="mt-3 space-y-3">
              {analyzerHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {language === 'es'
                    ? 'Aún no hay análisis guardados.'
                    : 'No analyses saved yet.'}
                </p>
              ) : (
                analyzerHistory.map((record) => (
                  <article key={record.id} className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-sm font-semibold">{record.fileName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{record.summary}</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {record.nextSteps.map((step) => (
                        <li key={step}>• {step}</li>
                      ))}
                    </ul>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>
      )}
    </div>
  );
};
