/**
 * Helper to export JSON array data to a downloadable CSV file.
 * Includes UTF-8 BOM prefix (\uFEFF) to ensure Microsoft Excel correctly opens
 * unicode characters (e.g. Indian names, special symbols).
 *
 * @param {Array<Object>} data - Array of objects to export
 * @param {Array<{ key: string, label: string }>} columns - Column definitions
 * @param {string} filename - Output file name without extension
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Header row
  const headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let value = col.key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), item);

        if (value === null || value === undefined) {
          value = '';
        } else if (value instanceof Date) {
          value = value.toISOString();
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }

        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
