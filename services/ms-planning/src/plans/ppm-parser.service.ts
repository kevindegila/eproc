import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface PpmMetadata {
  entityName: string;
  fiscalYear: number;
  version: number;
  fileName: string;
}

export interface PpmEntry {
  lineNumber: number;
  referenceCode: string | null;
  description: string;
  marketType: string;
  method: string;
  estimatedAmount: number;
  fundingSource: string | null;
  budgetLine: string | null;
  controlBody: string | null;
  category: string;
  launchAuthDate: string | null;
  milestones: Record<string, string | null>;
}

export interface PpmParseResult {
  metadata: PpmMetadata;
  entries: PpmEntry[];
}

@Injectable()
export class PpmParserService {
  async parse(buffer: Buffer, fileName: string): Promise<PpmParseResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const metadata = this.extractMetadata(workbook, fileName);
    const entries: PpmEntry[] = [];

    // Parse first sheet: Fournitures, travaux, services
    const sheet1 = workbook.worksheets[0];
    if (sheet1) {
      entries.push(...this.parseSheet(sheet1, 'FOURNITURES_TRAVAUX_SERVICES'));
    }

    // Parse second sheet: Prestations Intellectuelles
    const sheet2 = workbook.worksheets[1];
    if (sheet2) {
      entries.push(...this.parseSheet(sheet2, 'PRESTATIONS_INTELLECTUELLES'));
    }

    if (entries.length === 0) {
      throw new BadRequestException(
        'Aucune entree trouvee dans le fichier Excel. Verifiez le format du fichier.',
      );
    }

    // Re-number entries sequentially across both sheets
    entries.forEach((entry, idx) => {
      entry.lineNumber = idx + 1;
    });

    return { metadata, entries };
  }

  private extractMetadata(
    workbook: ExcelJS.Workbook,
    fileName: string,
  ): PpmMetadata {
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new BadRequestException('Le fichier Excel est vide');
    }

    // Try to extract entity name from row 3 (GENERALITE header area)
    let entityName = '';
    const row3 = sheet.getRow(3);
    for (let col = 1; col <= 10; col++) {
      const val = this.getCellValue(row3.getCell(col));
      if (val && val.length > 3) {
        entityName = val;
        break;
      }
    }

    // Parse filename pattern: "Plan de passation n° {ORG}_{YEAR}_{VERSION} - {DATE}.xlsx"
    let fiscalYear = new Date().getFullYear();
    let version = 1;

    const filenameMatch = fileName.match(
      /([A-Z]+)_(\d{4})_(\d+)/,
    );
    if (filenameMatch) {
      fiscalYear = parseInt(filenameMatch[2], 10);
      version = parseInt(filenameMatch[3], 10);
    }

    return { entityName, fiscalYear, version, fileName };
  }

  private parseSheet(sheet: ExcelJS.Worksheet, category: string): PpmEntry[] {
    const entries: PpmEntry[] = [];
    const isPI = category === 'PRESTATIONS_INTELLECTUELLES';

    // Extract milestone column headers from rows 9-10
    const milestoneHeaders: string[] = [];
    const headerRow9 = sheet.getRow(9);
    const headerRow10 = sheet.getRow(10);
    for (let col = 11; col <= 37; col++) {
      const h9 = this.getCellValue(headerRow9.getCell(col));
      const h10 = this.getCellValue(headerRow10.getCell(col));
      const header = [h9, h10].filter(Boolean).join(' - ') || `milestone_col_${col}`;
      milestoneHeaders.push(header);
    }

    // Data starts at row 11
    const rowCount = sheet.rowCount;
    for (let rowNum = 11; rowNum <= rowCount; rowNum++) {
      const row = sheet.getRow(rowNum);

      const colA = this.getCellValue(row.getCell(1)); // N°
      const colB = this.getCellValue(row.getCell(2)); // Ref N°
      const colC = this.getCellValue(row.getCell(3)); // Description
      const colD = this.getCellValue(row.getCell(4)); // Sheet1: Type de marche / Sheet2: Mode de passation
      const colE = this.getCellValue(row.getCell(5)); // Sheet1: Mode de passation / Sheet2: empty
      const colF = this.getNumericValue(row.getCell(6)); // Montant Estimatif
      const colG = this.getCellValue(row.getCell(7)); // Source de financement
      const colH = this.getCellValue(row.getCell(8)); // Ligne d'imputation
      const colI = this.getCellValue(row.getCell(9)); // Organe de controle

      // Skip empty rows, header-like rows, and total/summary rows
      if (!colC || colC.trim() === '') continue;
      if (
        colC.toUpperCase().startsWith('TOTAL') ||
        colC.toUpperCase().startsWith('SOUS-TOTAL') ||
        colC.toUpperCase().startsWith('SOUS TOTAL')
      ) {
        continue;
      }

      // Parse line number from column A
      const lineNumber = parseInt(String(colA), 10) || 0;
      if (lineNumber === 0 && !colB) continue;

      // For Prestations Intellectuelles: col D = mode, type is always "Prestations Intellectuelles"
      // For Fournitures/Travaux/Services: col D = type, col E = mode
      let marketType: string;
      let method: string;
      if (isPI) {
        marketType = 'Prestations Intellectuelles';
        method = colD || '';
      } else {
        marketType = colD || '';
        method = colE || '';
      }

      // Extract "Date d'autorisation du lancement du DAO"
      // Sheet 1: column O (15)
      // Sheet 2: column O (15) = "Date d'autorisation du lancement l'AMI"
      //          column Y (25) = "Date d'autorisation du lancement de la DP"
      //          We use col O as the primary launch auth date for both sheets
      const launchAuthDate = this.getCellValue(row.getCell(15)) || null;

      // Parse milestones (columns K-AK)
      const milestones: Record<string, string | null> = {};
      for (let col = 11; col <= 37; col++) {
        const cell = row.getCell(col);
        const val = this.getCellValue(cell);
        if (val) {
          const key = milestoneHeaders[col - 11] || `col_${col}`;
          milestones[key] = val;
        }
      }

      entries.push({
        lineNumber,
        referenceCode: colB || null,
        description: colC.trim(),
        marketType,
        method,
        estimatedAmount: colF,
        fundingSource: colG || null,
        budgetLine: colH || null,
        controlBody: colI || null,
        category,
        launchAuthDate,
        milestones: Object.keys(milestones).length > 0 ? milestones : {},
      });
    }

    return entries;
  }

  private getCellValue(cell: ExcelJS.Cell): string {
    if (!cell || cell.value === null || cell.value === undefined) return '';
    const val = cell.value;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return String(val);
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'object' && 'result' in val) {
      return String((val as { result: unknown }).result ?? '');
    }
    if (typeof val === 'object' && 'richText' in val) {
      return ((val as { richText: Array<{ text: string }> }).richText || [])
        .map((r) => r.text)
        .join('');
    }
    if (typeof val === 'object' && 'text' in val) {
      return String((val as { text: string }).text ?? '');
    }
    return String(val);
  }

  private getNumericValue(cell: ExcelJS.Cell): number {
    if (!cell || cell.value === null || cell.value === undefined) return 0;
    const val = cell.value;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^\d.,\-]/g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    }
    if (typeof val === 'object' && 'result' in val) {
      const result = (val as { result: unknown }).result;
      if (typeof result === 'number') return result;
      return parseFloat(String(result)) || 0;
    }
    return 0;
  }
}
