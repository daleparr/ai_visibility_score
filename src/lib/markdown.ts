/**
 * Simple markdown to HTML converter
 * Handles common markdown syntax without external dependencies
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Convert headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');

  // Convert bold text
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');

  // Convert italic text
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

  // Convert links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

  // Convert lists
  const lines = html.split('\n');
  let inList = false;
  let listType = '';
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Unordered lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push('</ol>');
        processedLines.push('<ul class="list-disc list-inside my-4 space-y-2">');
        inList = true;
        listType = 'ul';
      }
      processedLines.push(`<li class="text-gray-700">${line.trim().substring(2)}</li>`);
    }
    // Ordered lists
    else if (line.trim().match(/^\d+\.\s/)) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push('</ul>');
        processedLines.push('<ol class="list-decimal list-inside my-4 space-y-2">');
        inList = true;
        listType = 'ol';
      }
      processedLines.push(`<li class="text-gray-700">${line.trim().replace(/^\d+\.\s/, '')}</li>`);
    }
    // Close list if needed
    else {
      if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = '';
      }
      processedLines.push(line);
    }
  }
  
  if (inList) {
    processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
  }

  html = processedLines.join('\n');

  // Convert blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-6 text-gray-600">$1</blockquote>');

  // Convert horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-300" />');

  // Convert inline code
  html = html.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-blue-600">$1</code>');

  // Convert paragraphs (anything not already in a tag)
  html = html.replace(/^(?!<[hul]|<\/|<blockquote|<hr|<code)(.+)$/gm, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p class="mb-4 leading-relaxed text-gray-700"><\/p>/g, '');
  html = html.replace(/<p class="mb-4 leading-relaxed text-gray-700">\s*<\/p>/g, '');

  return html;
}

/**
 * Convert markdown for blog/job posts with table support
 */
export function markdownToHtmlAdvanced(markdown: string): string {
  let html = markdownToHtml(markdown);

  // Handle tables
  const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
  html = html.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n');
    const headers = lines[0].split('|').filter(h => h.trim()).map(h => h.trim());
    const rows = lines.slice(2).map(row => 
      row.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
    );

    let table = '<div class="overflow-x-auto my-6"><table class="min-w-full divide-y divide-gray-200 border">';
    table += '<thead class="bg-gray-50"><tr>';
    headers.forEach(header => {
      table += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`;
    });
    table += '</tr></thead><tbody class="divide-y divide-gray-200">';
    rows.forEach(row => {
      table += '<tr>';
      row.forEach(cell => {
        table += `<td class="px-6 py-4 text-sm text-gray-700">${cell}</td>`;
      });
      table += '</tr>';
    });
    table += '</tbody></table></div>';
    return table;
  });

  return html;
}

