import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, FileUp, Mic, RotateCcw, Square, Upload, Video } from "lucide-react";
import { completePublicDocumentUpload, createPublicDocumentUpload, getPublicDocumentUploadLink, uploadDocumentToSignedUrl, type PublicDocumentUploadLinkDetail } from "@/api/documentApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { PublicLanguageSelector } from "@/modules/quotationRequests/PublicLanguageSelector";
import { usePublicDocumentUploadI18n } from "@/modules/documents/publicDocumentUploadI18n";

type CaptureMode = "Video" | "Audio";
type PendingCapture = { file: File; type: CaptureMode; url: string };

export function PublicDocumentUploadPage() {
  const du = usePublicDocumentUploadI18n();
  const { token = "" } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [link, setLink] = useState<PublicDocumentUploadLinkDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recordingMode, setRecordingMode] = useState<CaptureMode | null>(null);
  const [pendingCapture, setPendingCapture] = useState<PendingCapture | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    void getPublicDocumentUploadLink(token)
      .then(setLink)
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => () => {
    stopAudioSignal();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => () => {
    if (pendingCapture) URL.revokeObjectURL(pendingCapture.url);
  }, [pendingCapture]);

  useEffect(() => {
    if (recordingMode !== "Video" || !previewVideoRef.current || !streamRef.current) return;
    previewVideoRef.current.srcObject = streamRef.current;
    void previewVideoRef.current.play();
  }, [recordingMode]);

  async function upload(file: File, attachmentType: "Video" | "Audio" | "File") {
    setIsUploading(true);
    setProgress(0);
    try {
      const signed = await createPublicDocumentUpload(token, file, attachmentType);
      await uploadDocumentToSignedUrl(signed.uploadUrl, file, (nextProgress) => setProgress(Math.min(nextProgress, 95)));
      const updated = await completePublicDocumentUpload(token, signed.document.id, file.size);
      setProgress(100);
      setLink(updated);
      toast.success(du("UploadComplete", "Upload complete"), file.name);
    } catch (error) {
      toast.error(du("UploadFailed", "Upload failed"), error instanceof Error ? error.message : du("TryAgain", "Please try again."));
    } finally {
      setIsUploading(false);
    }
  }

  async function startRecording(mode: CaptureMode) {
    clearPendingCapture();
    const stream = await navigator.mediaDevices.getUserMedia(mode === "Video" ? { video: true, audio: true } : { audio: true });
    streamRef.current = stream;
    startAudioSignal(stream);
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      stopAudioSignal();
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
      const mimeType = mode === "Video" ? "video/webm" : "audio/webm";
      const file = new File(chunksRef.current, `${link?.referenceNumber || "document"}-${mode.toLowerCase()}.webm`, { type: mimeType });
      setRecordingMode(null);
      setPendingCapture({ file, type: mode, url: URL.createObjectURL(file) });
    };
    recorder.start();
    setRecordingMode(mode);
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  async function uploadPendingCapture() {
    if (!pendingCapture) return;
    const capture = pendingCapture;
    setPendingCapture(null);
    URL.revokeObjectURL(capture.url);
    await upload(capture.file, capture.type);
  }

  function recapturePending() {
    if (!pendingCapture) return;
    const mode = pendingCapture.type;
    clearPendingCapture();
    void startRecording(mode);
  }

  function clearPendingCapture() {
    setPendingCapture((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  function startAudioSignal(stream: MediaStream) {
    stopAudioSignal();
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) return;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.frequencyBinCount);
    audioContextRef.current = audioContext;
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      const sum = samples.reduce((total, sample) => {
        const centered = sample - 128;
        return total + centered * centered;
      }, 0);
      setAudioLevel(Math.min(100, Math.round(Math.sqrt(sum / samples.length) * 5)));
      audioFrameRef.current = window.requestAnimationFrame(tick);
    };
    tick();
  }

  function stopAudioSignal() {
    if (audioFrameRef.current !== null) {
      window.cancelAnimationFrame(audioFrameRef.current);
      audioFrameRef.current = null;
    }
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setAudioLevel(0);
  }

  if (isLoading) {
    return <main className="min-h-screen bg-slate-50 p-6 text-sm text-slate-600">{du("Loading", "Loading upload link...")}</main>;
  }

  if (!link) {
    return <main className="min-h-screen bg-slate-50 p-6 text-sm text-red-700">{du("NotFound", "Upload link was not found.")}</main>;
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-sm font-medium text-blue-700">{link.moduleName}{link.referenceNumber ? ` ${link.referenceNumber}` : ""}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">{du("Title", "Upload Media And Files")}</h1>
      </div>
      <PublicLanguageSelector />

      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>{du("Video", "Video")}</CardTitle></CardHeader><CardContent className="space-y-3">
          <Button type="button" className="w-full" onClick={() => videoInputRef.current?.click()} disabled={isUploading || Boolean(recordingMode) || Boolean(pendingCapture)}><Video className="h-4 w-4" />{du("CameraVideo", "Camera Video")}</Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => void startRecording("Video")} disabled={isUploading || Boolean(recordingMode) || Boolean(pendingCapture)}>{du("RecordVideo", "Record Video")}</Button>
          <input ref={videoInputRef} className="hidden" type="file" accept="video/*" capture="environment" onChange={(e) => void uploadSelected(e, "Video", upload)} />
        </CardContent></Card>

        <Card><CardHeader><CardTitle>{du("Audio", "Audio")}</CardTitle></CardHeader><CardContent className="space-y-3">
          <Button type="button" className="w-full" onClick={() => audioInputRef.current?.click()} disabled={isUploading || Boolean(recordingMode) || Boolean(pendingCapture)}><Mic className="h-4 w-4" />{du("MicrophoneAudio", "Microphone Audio")}</Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => void startRecording("Audio")} disabled={isUploading || Boolean(recordingMode) || Boolean(pendingCapture)}>{du("RecordAudio", "Record Audio")}</Button>
          <input ref={audioInputRef} className="hidden" type="file" accept="audio/*" capture onChange={(e) => void uploadSelected(e, "Audio", upload)} />
        </CardContent></Card>

        <Card><CardHeader><CardTitle>{du("File", "File")}</CardTitle></CardHeader><CardContent className="space-y-3">
          <Button type="button" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isUploading || Boolean(recordingMode) || Boolean(pendingCapture)}><FileUp className="h-4 w-4" />{du("ChooseFile", "Choose File")}</Button>
          <p className="text-xs text-muted-foreground">{du("FileHelp", "Photos, PDFs, documents, and other supporting files.")}</p>
          <input ref={fileInputRef} className="hidden" type="file" onChange={(e) => void uploadSelected(e, "File", upload)} />
        </CardContent></Card>
      </section>

      {recordingMode ? <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
        <div className="flex items-center justify-between gap-3">
          <span>{du("RecordingInProgress", "{0} recording in progress").replace("{0}", translateCaptureType(du, recordingMode))}</span>
          <Button type="button" variant="destructive" size="sm" onClick={stopRecording}><Square className="h-4 w-4" />{du("Stop", "Stop")}</Button>
        </div>
        {recordingMode === "Video" ? <video ref={previewVideoRef} className="aspect-video w-full rounded-md bg-black object-cover" muted playsInline autoPlay /> : null}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs"><span>{du("MicrophoneSignal", "Microphone signal")}</span><span>{audioLevel}%</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-red-600 transition-[width]" style={{ width: `${audioLevel}%` }} /></div>
        </div>
      </div> : null}

      {pendingCapture ? <div className="space-y-3 rounded-md border bg-white p-3 text-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-slate-900">{du("ReadyToUpload", "{0} ready to upload").replace("{0}", translateCaptureType(du, pendingCapture.type))}</p>
            <p className="text-xs text-muted-foreground">{pendingCapture.file.name}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={recapturePending} disabled={isUploading}><RotateCcw className="h-4 w-4" />{du("Recapture", "Recapture")}</Button>
            <Button type="button" size="sm" onClick={() => void uploadPendingCapture()} disabled={isUploading}><Upload className="h-4 w-4" />{du("Upload", "Upload")}</Button>
          </div>
        </div>
        {pendingCapture.type === "Video" ? <video className="aspect-video w-full rounded-md bg-black object-cover" src={pendingCapture.url} controls playsInline /> : <audio className="w-full" src={pendingCapture.url} controls />}
      </div> : null}

      {isUploading ? <div className="rounded-md border bg-white p-3">
        <div className="mb-2 flex justify-between text-sm"><span>{du("Uploading", "Uploading")}</span><span>{progress}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
      </div> : null}

      <Card>
        <CardHeader><CardTitle>{du("UploadedItems", "Uploaded Items")}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {link.documents.length ? link.documents.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2 text-sm">
            <span className="min-w-0 truncate">{item.originalFileName}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{item.documentCategory}</span>
          </div>) : <p className="text-sm text-muted-foreground">{du("NoUploads", "No uploads yet.")}</p>}
          {link.documents.length ? <div className="flex items-center gap-2 pt-2 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{du("FilesAttached", "Files are attached.")}</div> : null}
        </CardContent>
      </Card>
    </div>
  </main>;
}

async function uploadSelected(event: ChangeEvent<HTMLInputElement>, type: "Video" | "Audio" | "File", upload: (file: File, type: "Video" | "Audio" | "File") => Promise<void>) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (file) await upload(file, type);
}

function translateCaptureType(du: (key: string, fallback: string) => string, type: CaptureMode) {
  return type === "Video" ? du("VideoType", "Video") : du("AudioType", "Audio");
}
