interface Client {
  dispose(): void;

  getCellValue: (sheet: string, cell: string) => string;

  setCellValue: (sheet: string, cell: string, value: string) => boolean;

  loadExcel: (buf: Uint8Array, size: number) => void;

  getExcel: (buf: Uint8Array) => void;

  getExcelSize: () => number;
}

class Client {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export default Client;
