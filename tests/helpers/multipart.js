export const buildMultipartPayload = ({ fields = {}, files = [] }) => {
  const boundary = `----vitest-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
  const chunks = [];

  const push = (value) => {
    chunks.push(Buffer.from(value));
  };

  for (const [name, value] of Object.entries(fields)) {
    push(`--${boundary}\r\n`);
    push(`Content-Disposition: form-data; name="${name}"\r\n\r\n`);
    push(`${value}\r\n`);
  }

  for (const file of files) {
    push(`--${boundary}\r\n`);
    push(
      `Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"\r\n`,
    );
    push(`Content-Type: ${file.contentType}\r\n\r\n`);
    chunks.push(
      Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content),
    );
    push("\r\n");
  }

  push(`--${boundary}--\r\n`);

  return {
    boundary,
    payload: Buffer.concat(chunks),
  };
};
