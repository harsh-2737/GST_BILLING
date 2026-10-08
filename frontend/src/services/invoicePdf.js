import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function formatPdfDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPdfAmount(value) {
  return `INR ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}`;
}

const onesToNineteen = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const tensWords = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function wordsBelowThousand(value) {
  const number = Math.floor(value);
  if (number < 20) return onesToNineteen[number];
  if (number < 100) {
    return `${tensWords[Math.floor(number / 10)]}${number % 10 ? ` ${onesToNineteen[number % 10]}` : ""}`;
  }
  return `${onesToNineteen[Math.floor(number / 100)]} hundred${number % 100 ? ` ${wordsBelowThousand(number % 100)}` : ""}`;
}

function amountInWords(value) {
  let amount = Math.max(0, Math.floor(Number(value) || 0));
  const groups = [
    [10000000, "crore"],
    [100000, "lakh"],
    [1000, "thousand"],
  ];
  const words = [];

  for (const [divisor, label] of groups) {
    const count = Math.floor(amount / divisor);
    if (count) {
      words.push(`${wordsBelowThousand(count)} ${label}`);
      amount %= divisor;
    }
  }

  if (amount) words.push(wordsBelowThousand(amount));
  return `${words.join(" ") || "zero"} rupees only`;
}

export function downloadInvoicePdf(invoice, business = {}) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const borderColor = [166, 49, 61];
  const invoiceNumber = `INV-${String(invoice.invoiceid).padStart(4, "0")}`;
  const businessName = business.businessName || invoice.user?.name || "Business";
  const lineItems = (invoice.items || []).map((item, index) => {
    const baseAmount = Number(item.price || 0) * Number(item.buyitem || 0);
    const taxAmount = (baseAmount * Number(item.gst?.gstrate || 0)) / 100;
    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;

    return {
      row: [
        index + 1,
        item.productname || "Product",
        item.hsncode || "-",
        Number(item.buyitem || 0),
        formatPdfAmount(item.price),
        formatPdfAmount(baseAmount),
      ],
      gstRate: Number(item.gst?.gstrate || 0),
      baseAmount,
      cgstAmount,
      sgstAmount,
    };
  });

  const totals = lineItems.reduce((sum, item) => ({
    subtotal: sum.subtotal + item.baseAmount,
    cgst: sum.cgst + item.cgstAmount,
    sgst: sum.sgst + item.sgstAmount,
  }), { subtotal: 0, cgst: 0, sgst: 0 });

  pdf.setDrawColor(...borderColor);
  pdf.setLineWidth(0.8);
  pdf.rect(7, 7, pageWidth - 14, pageHeight - 14);
  pdf.setTextColor(...borderColor);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("TAX INVOICE", pageWidth / 2, 16, { align: "center" });
  pdf.setFontSize(22);
  pdf.text(businessName.toUpperCase(), pageWidth / 2, 29, { align: "center", maxWidth: pageWidth - 34 });
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(35, 35, 35);
  pdf.setFontSize(8);
  pdf.setDrawColor(...borderColor);
  pdf.setLineWidth(0.35);
  pdf.rect(16, 32, pageWidth - 32, 9);
  pdf.setFont("helvetica", "bold");
  pdf.text("ADDRESS:", 20, 37.8);
  pdf.setFont("helvetica", "normal");
  pdf.text(business.address || "-", 40, 37.8, { maxWidth: pageWidth - 62 });
  pdf.rect(58, 43, 94, 7);
  pdf.setFont("helvetica", "bold");
  pdf.text(`GST NO. : ${business.gstin || "-"}`, pageWidth / 2, 47.6, { align: "center" });
  pdf.text(`Proprietor: ${business.name || invoice.user?.name || "-"}`, pageWidth - 13, 16, { align: "right" });
  pdf.text(`Mobile: ${business.phone_no || "-"}`, pageWidth - 13, 21, { align: "right" });

  pdf.setDrawColor(...borderColor);
  pdf.line(9, 52, pageWidth - 9, 52);
  pdf.line(9, 88, pageWidth - 9, 88);
  pdf.line(132, 52, 132, 88);
  pdf.setTextColor(...borderColor);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("M/s.", 12, 59);
  pdf.text("Address:", 12, 67);
  pdf.text("GSTIN:", 12, 78);
  pdf.text("Mobile:", 12, 84);
  pdf.text("Bill No.:", 136, 59);
  pdf.text("Date:", 136, 68);
  pdf.text("P. Challan:", 136, 77);
  pdf.text("State Code:", 136, 84);
  pdf.setTextColor(35, 35, 35);
  pdf.setFont("helvetica", "normal");
  pdf.text(invoice.customer?.name || "Customer", 25, 59, { maxWidth: 103 });
  const addressLines = pdf.splitTextToSize(invoice.customer?.address || "-", 96).slice(0, 2);
  pdf.text(addressLines, 31, 67);
  pdf.text(invoice.customer?.gstin || "-", 31, 78);
  pdf.text(invoice.customer?.phone_no || "-", 31, 84);
  pdf.text(invoiceNumber, 163, 59);
  pdf.text(formatPdfDate(invoice.invoicedate), 163, 68);
  pdf.text("-", 163, 77);
  pdf.text(invoice.customer?.gstin?.slice(0, 2) || "-", 163, 84);

  autoTable(pdf, {
    startY: 92,
    head: [["Sr. No.", "Description of Goods", "HSN Code", "Pieces", "Rate", "Amount"]],
    body: lineItems.map((item) => item.row),
    theme: "grid",
    margin: { left: 10, right: 10, bottom: 18 },
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5, textColor: [35, 35, 35], lineColor: borderColor, lineWidth: 0.3 },
    headStyles: { fillColor: borderColor, textColor: [255, 255, 255], fontStyle: "bold", minCellHeight: 10 },
    alternateRowStyles: { fillColor: [255, 248, 248] },
    columnStyles: {
      0: { cellWidth: 16, halign: "center" },
      1: { cellWidth: 68 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 27, halign: "right" },
      5: { cellWidth: 33, halign: "right" },
    },
  });

  let summaryY = Math.max(pdf.lastAutoTable.finalY + 8, 158);
  if (summaryY > pageHeight - 83) {
    pdf.addPage();
    summaryY = 18;
  }

  pdf.setDrawColor(...borderColor);
  pdf.line(10, summaryY, pageWidth - 10, summaryY);
  pdf.setTextColor(...borderColor);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("TOTAL INVOICE AMOUNT IN WORDS:", 13, summaryY + 8);
  pdf.setTextColor(35, 35, 35);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(amountInWords(invoice.totalamount).toUpperCase(), 13, summaryY + 15, { maxWidth: 100 });

  const rates = [...new Set(lineItems.map((item) => item.gstRate))];
  const rateLabel = rates.length === 1
    ? `${rates[0] / 2}%`
    : "half of GST";
  const totalRows = [
    ["Total", formatPdfAmount(totals.subtotal)],
    [`Add. CGST ${rateLabel}`, formatPdfAmount(totals.cgst)],
    [`Add. SGST ${rateLabel}`, formatPdfAmount(totals.sgst)],
    ["Add. IGST", formatPdfAmount(0)],
    ["Total Amount", formatPdfAmount(invoice.totalamount)],
  ];

  let taxY = summaryY + 5;
  for (const [index, [label, amount]] of totalRows.entries()) {
    pdf.setFont("helvetica", label === "Total Amount" ? "bold" : "normal");
    pdf.setFontSize(label === "Total Amount" ? 10 : 8);
    pdf.setTextColor(...(label.includes("CGST") || label.includes("SGST") || label === "Total Amount" ? borderColor : [35, 35, 35]));
    pdf.text(label, 124, taxY + 5);
    pdf.setTextColor(35, 35, 35);
    pdf.text(amount, pageWidth - 13, taxY + 5, { align: "right" });
    if (index < totalRows.length - 1) {
      pdf.setDrawColor(...borderColor);
      pdf.setLineWidth(0.2);
      pdf.line(124, taxY + 8.5, pageWidth - 13, taxY + 8.5);
    }
    taxY += 7;
  }

  const signatureY = Math.min(Math.max(taxY + 9, summaryY + 48), pageHeight - 23);
  pdf.setDrawColor(...borderColor);
  pdf.line(118, summaryY, 118, signatureY - 5);
  pdf.line(10, signatureY - 5, pageWidth - 10, signatureY - 5);
  pdf.setTextColor(35, 35, 35);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("Certified that the particulars given above are true and correct.", 13, signatureY + 2, { maxWidth: 100 });
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...borderColor);
  pdf.text(`For ${businessName}`, pageWidth - 13, signatureY + 2, { align: "right", maxWidth: 75 });
  pdf.setDrawColor(90, 90, 90);
  pdf.line(pageWidth - 65, signatureY + 18, pageWidth - 13, signatureY + 18);
  pdf.setTextColor(35, 35, 35);
  pdf.setFont("helvetica", "normal");
  pdf.text("Proprietor / Authorised Signatory", pageWidth - 13, signatureY + 23, { align: "right" });

  const pageCount = pdf.internal.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...borderColor);
    pdf.text("VYAPAR | GST invoice", 13, pdf.internal.pageSize.getHeight() - 11);
    pdf.text(`Page ${page} of ${pageCount}`, pageWidth - 13, pdf.internal.pageSize.getHeight() - 11, { align: "right" });
    pdf.setDrawColor(...borderColor);
    pdf.setLineWidth(0.8);
    pdf.rect(7, 7, pageWidth - 14, pageHeight - 14);
  }

  pdf.save(`VYAPAR-${invoiceNumber}.pdf`);
}
