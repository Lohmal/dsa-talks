import "server-only";
import ExcelJS from "exceljs";
import { db } from "./db";
import { getQuestions } from "./survey";
import { ratingStats, responseAverage, scopeLabel, scopeWhere } from "./stats";
import { formatDateTime, formatRange } from "./time";

const NAVY = "FF13224B";
const RED = "FFD7182A";

// The Excel file behind “Excel olarak indir”: every response plus a summary sheet.
export async function buildResponsesWorkbook(scope: string) {
  const [responses, questions] = await Promise.all([
    db.response.findMany({ where: scopeWhere(scope), orderBy: { createdAt: "asc" } }),
    getQuestions(),
  ]);

  // Columns: current questions in their order, then questions that were deleted later.
  const columns = new Map<string, { text: string; type: "RATING" | "TEXT" }>();
  for (const q of questions) columns.set(q.id, { text: q.textTr, type: q.type });
  for (const r of responses) {
    for (const a of r.answers) if (!columns.has(a.questionId)) columns.set(a.questionId, { text: a.textTr, type: a.type });
  }
  const questionColumns = [...columns.entries()];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DSATalks";
  workbook.created = new Date();

  // Sheet 1 – every response.
  const sheet = workbook.addWorksheet("Yanıtlar", { views: [{ state: "frozen", ySplit: 1, xSplit: 2 }] });
  sheet.columns = [
    { header: "Gönderim (TSİ)", key: "date", width: 20 },
    { header: "Ad Soyad", key: "name", width: 26 },
    { header: "E-posta", key: "email", width: 30 },
    { header: "Kapsam", key: "scope", width: 40 },
    { header: "Oturum saati", key: "session", width: 30 },
    { header: "Sertifika No", key: "certificateNo", width: 20 },
    { header: "E-posta durumu", key: "emailStatus", width: 16 },
    { header: "Form dili", key: "locale", width: 10 },
    { header: "Ortalama", key: "average", width: 11 },
    ...questionColumns.map(([id, q], index) => ({
      header: `${index + 1}. ${q.text}`,
      key: `q_${id}`,
      width: q.type === "TEXT" ? 60 : 16,
    })),
  ];

  const statusText: Record<string, string> = { sent: "Gönderildi", failed: "Başarısız", pending: "Bekliyor" };
  for (const r of responses) {
    const average = responseAverage(r);
    const row: Record<string, string | number | null> = {
      date: formatDateTime(r.createdAt),
      name: r.name,
      email: r.email,
      scope: scopeLabel(r),
      session: r.sessionStartsAt && r.sessionEndsAt ? formatRange(r.sessionStartsAt, r.sessionEndsAt, "tr") : "",
      certificateNo: r.certificateNo,
      emailStatus: statusText[r.emailStatus] ?? r.emailStatus,
      locale: r.locale.toUpperCase(),
      average: average === null ? null : Math.round(average * 100) / 100,
    };
    for (const a of r.answers) row[`q_${a.questionId}`] = a.type === "RATING" ? a.rating : (a.text ?? "");
    sheet.addRow(row);
  }

  styleHeader(sheet.getRow(1));
  sheet.getRow(1).height = 48;
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
  });

  // Sheet 2 – averages and the 5…1 distribution per rating question.
  const summary = workbook.addWorksheet("Özet");
  summary.columns = [
    { header: "Soru", key: "text", width: 60 },
    { header: "Ortalama", key: "average", width: 12 },
    { header: "Yanıt", key: "count", width: 10 },
    { header: "5 Kesinlikle katılıyorum", key: "r5", width: 14 },
    { header: "4 Katılıyorum", key: "r4", width: 14 },
    { header: "3 Kararsızım", key: "r3", width: 14 },
    { header: "2 Katılmıyorum", key: "r2", width: 14 },
    { header: "1 Kesinlikle katılmıyorum", key: "r1", width: 14 },
  ];
  for (const stat of ratingStats(responses, questions)) {
    summary.addRow({
      text: stat.text,
      average: stat.average === null ? null : Math.round(stat.average * 100) / 100,
      count: stat.count,
      r5: stat.distribution[5],
      r4: stat.distribution[4],
      r3: stat.distribution[3],
      r2: stat.distribution[2],
      r1: stat.distribution[1],
    });
  }
  styleHeader(summary.getRow(1));
  summary.getRow(1).height = 36;
  summary.addRow([]);
  summary.addRow([`Toplam yanıt: ${responses.length}`]).font = { bold: true };
  summary.addRow([`Oluşturulma: ${formatDateTime(new Date())} (TSİ)`]).font = { italic: true, color: { argb: "FF5B6478" } };

  return workbook.xlsx.writeBuffer();
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.alignment = { vertical: "middle", wrapText: true };
  row.eachCell((cell, column) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: column <= 2 ? RED : NAVY } };
    cell.border = { bottom: { style: "thin", color: { argb: "FFFFFFFF" } } };
  });
}
