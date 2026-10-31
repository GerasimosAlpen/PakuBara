import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import { jsPDF } from "jspdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const area = mockStore.areas.find((a) => a.id === id || a.slug === id) || mockStore.areas[0];
    const nodes = mockStore.nodes.filter((n) => n.area_id === area.id);
    const alerts = mockStore.alerts.filter((a) => a.area_id === area.id);
    const actions = mockStore.actions.filter((a) => a.alert_id && alerts.some((al) => al.id === a.alert_id));

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Lembaga
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("KEMENTERIAN LINGKUNGAN HIDUP DAN KEHUTANAN REPUBLIK INDONESIA", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("DIREKTORAT PENGENDALIAN KERUSAKAN GAMBUT", pageWidth / 2, 27, { align: "center" });
    doc.text("SISTEM MONITORING DINI BARA GAMBUT PAKUBARA", pageWidth / 2, 33, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(14, 38, pageWidth - 14, 38);

    // Judul Dokumen
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("LAPORAN AUDIT KESIAPSIAGAAN & PENANGANAN KARHUTLA", 14, 48);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Standar Acuan: Permen LHK No. P.32/MenLHK/Setjen/Kum.1/3/2016`, 14, 54);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, 14, 60);

    // Ringkasan Wilayah
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("1. PROFIL DAN STATUS WILAYAH PANTAU", 14, 70);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Nama Area: ${area.name}`, 18, 77);
    doc.text(`Tingkat Risiko: ${area.risk_level.toUpperCase()}`, 18, 83);
    doc.text(`Rantai Hari Aman: ${area.safe_days_streak} hari berturut-turut`, 18, 89);
    doc.text(`Jumlah Titik Sensor Terpasang: ${nodes.length} unit (LoRa 433 MHz)`, 18, 95);

    // Status Titik Sensor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("2. INVENTARISASI TITIK SENSOR (PAKU & TIANG GAS)", 14, 107);

    let y = 115;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ID Titik", 18, y);
    doc.text("Tipe", 40, y);
    doc.text("Status", 65, y);
    doc.text("Suhu 50cm / CO", 95, y);
    doc.text("Baterai", 140, y);
    doc.text("Sinyal (RSSI)", 170, y);
    doc.line(14, y + 2, pageWidth - 14, y + 2);

    y += 7;
    doc.setFont("helvetica", "normal");
    for (const node of nodes) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const readingText =
        node.type === "probe"
          ? `${node.last_reading.t50 ?? "-"} °C`
          : `${node.last_reading.co ?? "-"} ppm CO`;
      
      doc.text(node.id, 18, y);
      doc.text(node.type === "probe" ? "Paku Suhu" : "Tiang Gas", 40, y);
      doc.text(node.status.toUpperCase(), 65, y);
      doc.text(readingText, 95, y);
      doc.text(`${(node.batt_mv / 1000).toFixed(2)} V`, 140, y);
      doc.text(`${node.rssi} dBm`, 170, y);
      y += 6;
    }

    // Riwayat Insiden & Tindakan
    y += 8;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("3. RIWAYAT DETEKSI DINI & TINDAKAN TIM LAPANGAN", 14, y);
    y += 8;

    if (actions.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Tidak ada catatan insiden bara atau tindakan pemadaman dalam periode ini.", 18, y);
      y += 10;
    } else {
      for (const act of actions) {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(`Tindakan: ${act.kind.toUpperCase()} (${new Date(act.created_at).toLocaleString("id-ID")})`, 18, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Injeksi Air: ${act.water_liters || 0} Liter | Kedalaman: ${act.depth_cm || 50} cm`, 22, y);
        y += 5;
        doc.text(`Catatan: ${act.note || "Tidak ada catatan tambahan."}`, 22, y);
        y += 7;
      }
    }

    // Kolom Tanda Tangan
    if (y > 230) {
      doc.addPage();
      y = 30;
    } else {
      y += 15;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Mengetahui,", 140, y);
    y += 5;
    doc.text("Koordinator Satgas Karhutla", 140, y);
    y += 25;
    doc.setFont("helvetica", "bold");
    doc.text("(................................................)", 140, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("NIP. Tim Pengendalian Gambut", 140, y);

    const pdfBuffer = doc.output("arraybuffer");
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="laporan-audit-${area.slug}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Gagal generate PDF laporan:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

