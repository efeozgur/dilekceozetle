import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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

export function exportSummaryAsPDF(data: SummaryData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Dilekce Ozeti", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  doc.text(formatDateTR(data.createdAt), margin, y);
  y += 10;

  // Stats box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "F");
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const stats = [
    `Orijinal: ${data.charCount.toLocaleString("tr-TR")} karakter`,
    `Ozet: ${(data.summaryCharCount || 0).toLocaleString("tr-TR")} karakter`,
    `Kompresyon: ${data.charCount > 0 ? Math.round(((data.summaryCharCount || 0) / data.charCount) * 100) : 0}%`,
  ];
  doc.text(stats.join("  |  "), margin + 4, y + 4);
  y += 14;

  // Summary section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("OZET", margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(data.resultText, contentWidth);
  for (const line of summaryLines) {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 5;
  }
  y += 8;

  // Original text section
  if (y > 250) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ORIJINAL METIN", margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const originalLines = doc.splitTextToSize(data.originalText, contentWidth);
  for (const line of originalLines) {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 4;
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Dilekce Ozeti  |  Sayfa ${i}/${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`${getFilenameBase(data.createdAt)}.pdf`);
}

export async function exportSummaryAsUDF(data: SummaryData): Promise<void> {
  const zip = new JSZip();

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
            <content Bold="false" Italic="false" Underline="false" FontName="Tahoma" Size="10" Color="-16777216" Strikeout="false">Orijinal: ${data.charCount.toLocaleString("tr-TR")} karakter | Ozet: ${(data.summaryCharCount || 0).toLocaleString("tr-TR")} karakter</content>
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
