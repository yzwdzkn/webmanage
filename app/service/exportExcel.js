'use strict';
const Service = require('egg').Service;
const Excel = require('exceljs');

class ExportExcel extends Service {

  // 生成excel 表格
  async generateExcel(headers, data) {
    const titleRows = headers.length;// 标题栏行数
    const columns = [];// exceljs要求的columns
    const hjRow = {};// 合计行

    // 处理表头
    for (let i = 0; i < titleRows; i++) {
      const row = headers[i];
      for (let j = 0, rlen = row.length; j < rlen; j++) {
        const col = row[j];
        const { f, t, w = 15 } = col;
        if (f) {
          if (col.totalRow) hjRow[f] = true;
          if (col.totalRowText) hjRow[f] = col.totalRowText;
          col.style = { alignment: { vertical: 'middle', horizontal: 'center' } };
          col.header = t;
          col.key = f;
          col.width = w;
          columns.push(col);
        }
      }
    }

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('My Sheet', { views: [{ xSplit: 1, ySplit: 1 }] });
    sheet.columns = columns;
    if (data) {
      sheet.addRows(data);
    }


    // 处理复杂表头
    if (titleRows > 1) {
      for (let i = 1; i < titleRows; i++) sheet.spliceRows(1, 0, []);// 头部插入空行

      for (let i = 0; i < titleRows; i++) {
        const row = headers[i];
        for (let j = 0, rlen = row.length; j < rlen; j++) {
          const col = row[j];
          if (col.m1) {

            sheet.getCell(col.m1).value = col.t;
            sheet.mergeCells(col.m1 + ':' + col.m2);
          }
        }
      }
    }

    sheet.eachRow((row, rowNumber) => {
      // 设置行高
      row.height = 25;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // 设置边框 黑色 细实线
        const top = { style: 'thin', color: { argb: '000000' } };
        const left = { style: 'thin', color: { argb: '000000' } };
        const bottom = { style: 'thin', color: { argb: '000000' } };
        const right = { style: 'thin', color: { argb: '000000' } };
        cell.border = { top, left, bottom, right };

        // 设置标题部分为粗体
        if (rowNumber <= titleRows) { cell.font = { bold: true }; }
      });
    });

    const res = await workbook.xlsx.writeBuffer();
    return res;
  }
}
module.exports = ExportExcel;
