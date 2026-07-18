export function getDirectDriveLink(url: string | undefined): string | undefined {
  if (!url) return url;
  
  // check if it is a google drive sharing link
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  
  return url;
}
