import JSZip from "jszip";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class FileParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileParseError";
  }
}

function validateFile(file: File, allowedTypes: string[]): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileParseError(
      `Dosya boyutu ${Math.round(file.size / 1024 / 1024)}MB. Maksimum 5MB olabilir.`
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !allowedTypes.includes(`.${ext}`)) {
    throw new FileParseError(
      `Geçersiz dosya formatı. İzin verilen formatlar: ${allowedTypes.join(", ")}`
    );
  }
}

export async function parsePDF(file: File): Promise<string> {
  validateFile(file, [".pdf"]);

  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item) => {
        if ("str" in item) {
          return item.str;
        }
        return "";
      })
      .join(" ");

    fullText += pageText + "\n\n";
  }

  const cleaned = cleanText(fullText.trim());
  if (!cleaned) {
    throw new FileParseError("PDF dosyasından metin çıkarılamadı. Lütfen metin içeren bir PDF yükleyin.");
  }

  return cleaned;
}

/**
 * ANSI escape kodlarını, kontrol karakterlerini ve bozuk encoding
 * artifact'larını temizler. Türkçe karakterlerin düzgün kalmasını sağlar.
 */
function cleanText(text: string): string {
  return (
    text
      // ANSI escape sequence'lerini temizle: ESC[... (ör: ESC[97;5u, ESC[45:95:61;6u)
      .replace(/\x1B\[[\d;:]+[a-zA-Z~_]/g, "")
      // Diğer ESC seqeunce'leri
      .replace(/\x1B[\[\]()][\d;]*[a-zA-Z]/g, "")
      // C0 kontrol karakterlerini temizle (null, bell, backspace, vb.)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Birden fazla ardışık boşluğu teke indir
      .replace(/ {2,}/g, " ")
      // Satır başı karakterlerini temizle
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Üçten fazla ardışık newline'ı ikiye indir
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

export async function parseUDF(file: File): Promise<string> {
  validateFile(file, [".udf"]);

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const contentXml = zip.file("content.xml");
  if (!contentXml) {
    throw new FileParseError("Geçersiz UDF dosyası: content.xml bulunamadı.");
  }

  const xmlText = await contentXml.async("string");
  const text = extractTextFromXml(xmlText);

  const cleaned = cleanText(text.trim());
  if (!cleaned) {
    throw new FileParseError("UDF dosyasından metin çıkarılamadı.");
  }

  return cleaned;
}

function extractTextFromXml(xml: string): string {
  const texts: string[] = [];

  // content elementleri içindeki metinleri çıkar
  const contentRegex = /<content[^>]*>([\s\S]*?)<\/content>/gi;
  let match;
  while ((match = contentRegex.exec(xml)) !== null) {
    const content = match[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .trim();

    if (content) {
      texts.push(content);
    }
  }

  // paragraph elementlerinden de metin çıkar (content yoksa)
  if (texts.length === 0) {
    const paragraphRegex = /<paragraph[^>]*>([\s\S]*?)<\/paragraph>/gi;
    while ((match = paragraphRegex.exec(xml)) !== null) {
      const text = match[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();

      if (text) {
        texts.push(text);
      }
    }
  }

  return texts.join("\n\n");
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function isPDFFile(file: File): boolean {
  return getFileExtension(file.name) === "pdf";
}

export function isUDFFile(file: File): boolean {
  return getFileExtension(file.name) === "udf";
}
