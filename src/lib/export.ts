import { jsPDF } from "jspdf";

interface SummaryData {
  originalText: string;
  resultText: string;
  charCount: number;
  summaryCharCount: number | null;
  wordCount: number | null;
  summaryWordCount: number | null;
  sentenceCount: number | null;
  summarySentenceCount: number | null;
  readingTime: number | null;
  summaryReadingTime: number | null;
  createdAt: Date | string;
}

function formatDateTR(d: Date | string): string {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFilenameBase(createdAt: Date | string): string {
  const d = new Date(createdAt);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `ozet-${y}-${m}-${day}`;
}

function calcCompressionRate(original: number, summary: number | null): number {
  if (!original || !summary) return 0;
  return Math.round((1 - summary / original) * 100);
}

async function loadUnicodeFont(doc: jsPDF): Promise<string> {
  const sources = [
    "/fonts/NotoSans-Regular.ttf",
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5/files/noto-sans-latin-400-normal.otf",
  ];
  for (const url of sources) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const buf = await resp.arrayBuffer();
      if (buf.byteLength < 1000) continue;
      const ext = url.split(".").pop() || "ttf";
      const filename = `UnicodeFont.${ext}`;
      const blob = new Blob([buf]);
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string).split(",")[1]);
        r.readAsDataURL(blob);
      });
      doc.addFileToVFS(filename, base64);
      doc.addFont(filename, "UnicodeFont", "normal", 400, "Identity-H");
      doc.setFont("UnicodeFont");
      return "UnicodeFont";
    } catch {
      continue;
    }
  }
  return "helvetica";
}

const ML = 22;
const MR = 22;
const FOOTER_Y = 285;
const MAX_Y = 272;

export async function exportSummaryAsPDF(data: SummaryData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const cw = pw - ML - MR;
  let y = 18;

  const font = await loadUnicodeFont(doc);

  let pageNum = 1;

  function need(mm: number) {
    if (y + mm > MAX_Y) {
      doc.addPage();
      pageNum++;
      y = 18;
    }
  }

  function hr() {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(ML, y, pw - MR, y);
    y += 3;
  }

  function sectionTitle(label: string) {
    need(10);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont(font, "bold");
    doc.text(label, ML, y + 2);
    y += 4;
    hr();
  }

  function bodyText(text: string, indent: number, size: number): number {
    const lines = doc.splitTextToSize(text, cw - indent);
    const lh = size * 0.35 + 0.5;
    for (const line of lines) {
      if (y + lh > MAX_Y) {
        doc.addPage();
        pageNum++;
        y = 18;
      }
      doc.text(line, ML + indent, y);
      y += lh;
    }
    return lines.length;
  }

  /* ══════════════════════════════════════
     HEADER
     ══════════════════════════════════════ */
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.setFont(font, "bold");
  doc.text("Dilekçe Özeti", ML, y);
  y += 2;

  doc.setFontSize(9);
  doc.setFont(font, "normal");
  doc.setTextColor(80);
  const dateStr = formatDateTR(data.createdAt);
  doc.text(dateStr, ML, y + 1);

  const charInfo = `${(data.charCount || 0).toLocaleString("tr-TR")} → ${(data.summaryCharCount || 0).toLocaleString("tr-TR")} karakter`;
  doc.text(charInfo, pw - MR - doc.getTextWidth(charInfo), y + 1);
  y += 5;
  hr();

  /* ══════════════════════════════════════
     STATS ROW
     ══════════════════════════════════════ */
  need(10);
  const stats: { label: string; val: string }[] = [
    { label: "Orijinal", val: (data.charCount || 0).toLocaleString("tr-TR") + " krk" },
    { label: "Özet", val: (data.summaryCharCount || 0).toLocaleString("tr-TR") + " krk" },
    { label: "Sıkıştırma", val: `%${calcCompressionRate(data.charCount, data.summaryCharCount)}` },
    { label: "Kelime", val: `${(data.summaryWordCount || 0).toLocaleString("tr-TR")} / ${(data.wordCount || 0).toLocaleString("tr-TR")}` },
    { label: "Cümle", val: `${(data.summarySentenceCount || 0).toLocaleString("tr-TR")} / ${(data.sentenceCount || 0).toLocaleString("tr-TR")}` },
    { label: "Okuma", val: `${data.summaryReadingTime || 0} / ${data.readingTime || 0} dk` },
  ];

  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.setFont(font, "normal");
  const colW = cw / 3;
  stats.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = ML + col * colW;
    const ry = y + row * 7.5;
    doc.text(s.label, x, ry);
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.setFont(font, "bold");
    doc.text(s.val, x, ry + 4);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.setFont(font, "normal");
  });
  y += 14;
  hr();

  /* ══════════════════════════════════════
     ÖZET
     ══════════════════════════════════════ */
  sectionTitle("ÖZET");
  need(2);
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont(font, "normal");
  bodyText(data.resultText, 0, 10);
  y += 3;

  /* ══════════════════════════════════════
     ORIJINAL METIN
     ══════════════════════════════════════ */
  if (data.originalText) {
    sectionTitle("ORİJİNAL METİN");
    need(2);
    doc.setFontSize(8);
    doc.setTextColor(60);
    doc.setFont(font, "normal");
    bodyText(data.originalText, 0, 8);
    y += 3;
  }

  /* ══════════════════════════════════════
     DETAYLI ISTATISTIKLER
     ══════════════════════════════════════ */
  sectionTitle("Detaylı İstatistikler");

  const details: { label: string; val: string }[] = [
    { label: "Orijinal Karakter", val: (data.charCount || 0).toLocaleString("tr-TR") },
    { label: "Özet Karakter", val: (data.summaryCharCount || 0).toLocaleString("tr-TR") },
    { label: "Sıkıştırma Oranı", val: `%${calcCompressionRate(data.charCount, data.summaryCharCount)}` },
    { label: "Orijinal Kelime", val: (data.wordCount || 0).toLocaleString("tr-TR") },
    { label: "Özet Kelime", val: (data.summaryWordCount || 0).toLocaleString("tr-TR") },
    { label: "Orijinal Cümle", val: (data.sentenceCount || 0).toLocaleString("tr-TR") },
    { label: "Özet Cümle", val: (data.summarySentenceCount || 0).toLocaleString("tr-TR") },
    { label: "Orijinal Okuma Süresi", val: `${data.readingTime || 0} dk` },
    { label: "Özet Okuma Süresi", val: `${data.summaryReadingTime || 0} dk` },
  ];

  need(4);
  doc.setFontSize(9);
  doc.setFont(font, "normal");

  const w2 = Math.max(...details.map((d) => doc.getTextWidth(d.val)));
  const rowH = 5;

  details.forEach((d) => {
    need(rowH + 1);
    doc.setTextColor(60);
    doc.setFont(font, "normal");
    doc.text(d.label, ML, y + 1);
    doc.setTextColor(0);
    doc.setFont(font, "bold");
    doc.text(d.val, ML + cw - w2, y + 1);
    y += rowH;
  });

  /* ══════════════════════════════════════
     FOOTER her sayfaya
     ══════════════════════════════════════ */
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(ML, FOOTER_Y - 3, pw - MR, FOOTER_Y - 3);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.setFont(font, "normal");
    doc.text(
      `Dilekçe Özeti  |  Sayfa ${i}/${total}`,
      pw / 2,
      FOOTER_Y,
      { align: "center" }
    );
  }

  doc.save(`${getFilenameBase(data.createdAt)}.pdf`);
}

export async function exportSummaryAsUDF(data: SummaryData): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const { saveAs } = await import("file-saver");

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<template version="1">
  <elements>
    <table tableName="Sabit" columnCount="1" columnWidth="15000,15000" border="borderCell">
      <row rowName="row1" rowType="dataRow" border="borderCell">
        <cell colspan="1" align="top" fillColor="16777215" border="borderCell" borderSpec="15">
          <paragraph Alignment="0" LineSpacing="115" SpaceBefore="0" SpaceAfter="0">
            <content Bold="true" Italic="false" Underline="false" FontName="Tahoma" Size="12" Color="-1" Strikeout="false">Dilekce Ozeti</content>
          </paragraph>
          <paragraph Alignment="0" LineSpacing="115" SpaceBefore="0" SpaceAfter="0">
            <content Bold="false" Italic="false" Underline="false" FontName="Tahoma" Size="10" Color="-16777216" Strikeout="false">Tarih: ${formatDateTR(data.createdAt)}</content>
          </paragraph>
          <paragraph Alignment="0" LineSpacing="115" SpaceBefore="0" SpaceAfter="0">
            <content Bold="false" Italic="false" Underline="false" FontName="Tahoma" Size="10" Color="-16777216" Strikeout="false">Orijinal: ${data.charCount.toLocaleString("tr-TR")} karakter | Ozet: ${(data.summaryCharCount || 0).toLocaleString("tr-TR")} karakter | Sikistirma: %${calcCompressionRate(data.charCount, data.summaryCharCount)}</content>
          </paragraph>
        </cell>
      </row>
    </table>
    <paragraph Alignment="0" LineSpacing="115" SpaceBefore="200" SpaceAfter="100">
      <content Bold="true" Italic="false" Underline="false" FontName="Tahoma" Size="14" Color="-1" Strikeout="false">OZET</content>
    </paragraph>
    <table tableName="Ozet" columnCount="1" columnWidth="15000,15000" border="borderCell">
      <row rowName="row1" rowType="dataRow" border="borderCell">
        <cell colspan="1" align="top" fillColor="16777215" border="borderCell" borderSpec="15">
          ${escapeXml(data.resultText)
            .split("\n")
            .map(
              (line) =>
                `<paragraph Alignment="0" LineSpacing="115" SpaceBefore="0" SpaceAfter="0"><content Bold="false" Italic="false" Underline="false" FontName="Tahoma" Size="11" Color="-16777216" Strikeout="false">${escapeXml(line)}</content></paragraph>`
            )
            .join("\n          ")}
        </cell>
      </row>
    </table>
    <paragraph Alignment="0" LineSpacing="115" SpaceBefore="200" SpaceAfter="100">
      <content Bold="true" Italic="false" Underline="false" FontName="Tahoma" Size="14" Color="-1" Strikeout="false">ORIJINAL METIN</content>
    </paragraph>
    <table tableName="Orijinal" columnCount="1" columnWidth="15000,15000" border="borderCell">
      <row rowName="row1" rowType="dataRow" border="borderCell">
        <cell colspan="1" align="top" fillColor="16777215" border="borderCell" borderSpec="15">
          ${escapeXml(data.originalText)
            .split("\n")
            .map(
              (line) =>
                `<paragraph Alignment="0" LineSpacing="115" SpaceBefore="0" SpaceAfter="0"><content Bold="false" Italic="false" Underline="false" FontName="Tahoma" Size="11" Color="-16777216" Strikeout="false">${escapeXml(line)}</content></paragraph>`
            )
            .join("\n          ")}
        </cell>
      </row>
    </table>
  </elements>
</template>`;

  zip.file("content.xml", content);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${getFilenameBase(data.createdAt)}.udf`);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
