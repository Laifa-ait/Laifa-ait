/**
 * Utility to export headers and data rows to a native CSV file.
 * Encoded with UTF-8 BOM so Microsoft Excel can display non-ASCII characters
 * (e.g., Arabic and French accents) perfectly.
 */
export function exportToCSVNative(headers: string[], rows: (string | number | boolean | null | undefined)[][], filename: string): void {
  const escapeCSVField = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    // If the string contains double quotes, commas, semicolons, or newlines, wrap in quotes and escape internal quotes
    if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('\r')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCSVField).join(';'), // Use Semicolon which is native for Excel French/Algerian locale
    ...rows.map(row => row.map(escapeCSVField).join(';'))
  ].join('\r\n');

  // UTF-8 BOM
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  // Change extension to .csv if it was .xlsx
  const csvFilename = filename.endsWith('.xlsx') ? filename.replace(/\.xlsx$/, '.csv') : filename;
  link.setAttribute('download', csvFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
