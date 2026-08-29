/**
 * CITYMIND Binary & JSON Serialization Engine
 * High-performance Protocol-Buffers-style binary buffer serializer and compressed JSON codec
 * for city grid state, fast network packet transmission via Socket.IO, and compact file storage.
 */

export class BinaryWriter {
  constructor(initialCapacity = 65536) {
    this.buffer = new Uint8Array(initialCapacity);
    this.view = new DataView(this.buffer.buffer);
    this.offset = 0;
  }

  ensureCapacity(additionalBytes) {
    if (this.offset + additionalBytes > this.buffer.length) {
      let newCapacity = this.buffer.length * 2;
      while (this.offset + additionalBytes > newCapacity) {
        newCapacity *= 2;
      }
      const newBuffer = new Uint8Array(newCapacity);
      newBuffer.set(this.buffer);
      this.buffer = newBuffer;
      this.view = new DataView(this.buffer.buffer);
    }
  }

  writeUint8(val) {
    this.ensureCapacity(1);
    this.view.setUint8(this.offset, val);
    this.offset += 1;
  }

  writeInt8(val) {
    this.ensureCapacity(1);
    this.view.setInt8(this.offset, val);
    this.offset += 1;
  }

  writeUint16(val) {
    this.ensureCapacity(2);
    this.view.setUint16(this.offset, val, true);
    this.offset += 2;
  }

  writeInt16(val) {
    this.ensureCapacity(2);
    this.view.setInt16(this.offset, val, true);
    this.offset += 2;
  }

  writeUint32(val) {
    this.ensureCapacity(4);
    this.view.setUint32(this.offset, val, true);
    this.offset += 4;
  }

  writeInt32(val) {
    this.ensureCapacity(4);
    this.view.setInt32(this.offset, val, true);
    this.offset += 4;
  }

  writeFloat32(val) {
    this.ensureCapacity(4);
    this.view.setFloat32(this.offset, val, true);
    this.offset += 4;
  }

  writeFloat64(val) {
    this.ensureCapacity(8);
    this.view.setFloat64(this.offset, val, true);
    this.offset += 8;
  }

  writeString(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    this.writeUint32(bytes.length);
    this.ensureCapacity(bytes.length);
    this.buffer.set(bytes, this.offset);
    this.offset += bytes.length;
  }

  getBuffer() {
    return this.buffer.subarray(0, this.offset);
  }
}

export class BinaryReader {
  constructor(buffer) {
    this.buffer = new Uint8Array(buffer);
    this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    this.offset = 0;
  }

  readUint8() {
    const val = this.view.getUint8(this.offset);
    this.offset += 1;
    return val;
  }

  readInt8() {
    const val = this.view.getInt8(this.offset);
    this.offset += 1;
    return val;
  }

  readUint16() {
    const val = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return val;
  }

  readInt16() {
    const val = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return val;
  }

  readUint32() {
    const val = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return val;
  }

  readInt32() {
    const val = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return val;
  }

  readFloat32() {
    const val = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return val;
  }

  readFloat64() {
    const val = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return val;
  }

  readString() {
    const length = this.readUint32();
    const bytes = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }
}

export class TileGridCodec {
  static serializeGrid(grid) {
    const writer = new BinaryWriter();
    writer.writeUint16(grid.width);
    writer.writeUint16(grid.height);

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const tile = grid.tiles[y][x];
        writer.writeUint8(tile.type || 0); // 0: grass, 1: water, 2: forest, 3: rock, 4: road
        writer.writeUint8(tile.zone || 0); // 0: none, 1: res, 2: com, 3: ind
        writer.writeUint16(tile.buildingId ? 1 : 0);
        writer.writeFloat32(tile.elevation || 0);
        writer.writeFloat32(tile.pollution || 0);
        writer.writeFloat32(tile.landValue || 100);
      }
    }

    return writer.getBuffer();
  }

  static deserializeGrid(buffer) {
    const reader = new BinaryReader(buffer);
    const width = reader.readUint16();
    const height = reader.readUint16();
    const tiles = [];

    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push({
          x,
          y,
          type: reader.readUint8(),
          zone: reader.readUint8(),
          hasBuilding: reader.readUint16() > 0,
          elevation: reader.readFloat32(),
          pollution: reader.readFloat32(),
          landValue: reader.readFloat32(),
        });
      }
      tiles.push(row);
    }

    return { width, height, tiles };
  }
}

export class RunLengthEncoder {
  static encode(data) {
    if (!data || data.length === 0) return [];
    const encoded = [];
    let current = data[0];
    let count = 1;

    for (let i = 1; i < data.length; i++) {
      if (data[i] === current && count < 65535) {
        count++;
      } else {
        encoded.push([current, count]);
        current = data[i];
        count = 1;
      }
    }
    encoded.push([current, count]);
    return encoded;
  }

  static decode(encoded) {
    const result = [];
    for (const [val, count] of encoded) {
      for (let i = 0; i < count; i++) {
        result.push(val);
      }
    }
    return result;
  }
}

export default {
  BinaryWriter,
  BinaryReader,
  TileGridCodec,
  RunLengthEncoder,
};
