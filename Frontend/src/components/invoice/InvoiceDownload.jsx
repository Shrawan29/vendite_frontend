import React from 'react';

function InvoiceDownloader({ bill }) {
  if (!bill) return null;

  const generateInvoiceHTML = (bill) => {
    const rows = bill.products.map(p => {
      const totalPrice = p.unitPrice * p.quantity;
      const taxAmount = (p.tax / 100) * totalPrice;
      return { ...p, totalPrice, taxAmount };
    });

    const subtotal = rows.reduce((acc, r) => acc + r.totalPrice, 0);
    const discountAmount = (bill.discount / 100) * subtotal;
    const totalTax = bill.tax || 0;
    const total = subtotal - discountAmount + totalTax;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
        </div>
        <div>
          <h3>Bill To:</h3>
          <p>${bill.customer.name}</p>
          <p>${bill.customer.phone}</p>
          ${bill.customer.email ? `<p>${bill.customer.email}</p>` : ''}
        </div>
        <p><strong>Invoice ID:</strong> ${bill._id || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${bill.paymentMethod}</p>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price (₹)</th>
              <th>Tax (%)</th>
              <th>Tax Amount (₹)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>${item.tax}</td>
                <td>${item.taxAmount.toFixed(2)}</td>
                <td>${item.totalPrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
          <p>Discount (${bill.discount}%): -₹${discountAmount.toFixed(2)}</p>
          <p>Tax: ₹${totalTax.toFixed(2)}</p>
          <p class="total-row">Total: ₹${total.toFixed(2)}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = () => {
    try {
      const invoiceContent = generateInvoiceHTML(bill);
      const blob = new Blob([invoiceContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${bill._id || Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to generate invoice for download.');
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      title="Download Invoice"
    >
      Download
    </button>
  );
}

export default InvoiceDownloader;
