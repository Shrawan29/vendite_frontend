import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Invoice = () => {
  const bill = {
    company: { name: "My Company", address: "123 Business St.", phone: "123-456-7890" },
    customer: { name: "John Doe", address: "456 Customer Ave." },
    invoiceNumber: "INV-1001",
    date: "2025-06-02",
    items: [
      { description: "Product A", quantity: 2, price: 50 },
      { description: "Product B", quantity: 1, price: 100 },
    ],
  };

  const calculateTotal = () =>
    bill.items.reduce((total, item) => total + item.quantity * item.price, 0);

  const generatePDF = () => {
    const input = document.getElementById("invoice");
    if (!input) {
      alert("Invoice element not found!");
      return;
    }

    html2canvas(input, { scale: 2, useCORS: true, logging: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");
    }).catch((error) => {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    });
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <div
        id="invoice"
        style={{
          width: 595, // A4 width in px at 72dpi
          padding: 20,
          backgroundColor: "white",
          color: "black",
          border: "1px solid #ccc",
        }}
      >
        <h1>{bill.company.name}</h1>
        <p>{bill.company.address}</p>
        <p>Phone: {bill.company.phone}</p>

        <hr />

        <h2>Bill To:</h2>
        <p>{bill.customer.name}</p>
        <p>{bill.customer.address}</p>

        <p>
          Invoice #: {bill.invoiceNumber} <br />
          Date: {bill.date}
        </p>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Description</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Qty</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Price</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{item.description}</td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  {item.quantity}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  ${item.price.toFixed(2)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ textAlign: "right", marginTop: 10 }}>
          Total: ${calculateTotal().toFixed(2)}
        </h3>
      </div>

      <button
        onClick={generatePDF}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: 4,
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default Invoice;
