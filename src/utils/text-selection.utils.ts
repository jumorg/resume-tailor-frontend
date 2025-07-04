export interface TextSelection {
  text: string;
  range: Range;
  rect: DOMRect;
}

export function getTextSelection(): TextSelection | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const text = selection.toString().trim();
  
  if (!text) {
    return null;
  }

  const rect = range.getBoundingClientRect();
  
  return { text, range, rect };
}

export function clearSelection(): void {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
}

export function replaceSelectedText(range: Range, newText: string): void {
  range.deleteContents();
  range.insertNode(document.createTextNode(newText));
}