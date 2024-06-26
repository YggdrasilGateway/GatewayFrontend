function hex(buf: ArrayBuffer) {
  return Array.prototype.map
    .call(new Uint8Array(buf), (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

export function convertData(data: any): BufferSource {
  if (data instanceof ArrayBuffer) return data;

  return new TextEncoder().encode(String(data));
}

export async function digest(algorithm: string, data: any) {
  const result = await crypto.subtle.digest(algorithm, convertData(data));
  return hex(result);
}

export async function sha512(data: any) {
  return await digest('SHA-512', data);
}