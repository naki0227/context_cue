export const MAX_IMPORT_FILE_SIZE = 512 * 1024;

export function isImportableKnowledgeFile(file: File) {
  const normalizedName = file.name.toLowerCase();
  return normalizedName.endsWith('.md') || normalizedName.endsWith('.txt');
}

export function stripExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '');
}

export function readFileText(file: File) {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
