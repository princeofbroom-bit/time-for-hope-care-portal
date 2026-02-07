/**
 * Securely validates file content by checking Magic Bytes (not just extension)
 */

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const MAGIC_BYTES = {
    PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
    JPEG: [0xFF, 0xD8, 0xFF],
    PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    DOC: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], // OLE Header (Legacy .doc)
    DOCX: [0x50, 0x4B, 0x03, 0x04], // ZIP Header (Modern .docx)
};

export async function validateFile(buffer: Uint8Array): Promise<{ valid: boolean; error?: string }> {
    // 1. Size Check
    if (buffer.length > MAX_FILE_SIZE) {
        return { valid: false, error: "File size exceeds 50MB limit." };
    }

    // 2. Magic Byte Check
    const isPDF = checkMagicBytes(buffer, MAGIC_BYTES.PDF);
    const isJPEG = checkMagicBytes(buffer, MAGIC_BYTES.JPEG);
    const isPNG = checkMagicBytes(buffer, MAGIC_BYTES.PNG);
    const isDoc = checkMagicBytes(buffer, MAGIC_BYTES.DOC);
    const isDocx = checkMagicBytes(buffer, MAGIC_BYTES.DOCX);

    if (!isPDF && !isJPEG && !isPNG && !isDoc && !isDocx) {
        return { valid: false, error: "Invalid format. Only PDF, JPG, PNG, and Word (DOC/DOCX) are allowed." };
    }

    return { valid: true };
}

function checkMagicBytes(buffer: Uint8Array, signature: number[]): boolean {
    for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) return false;
    }
    return true;
}
