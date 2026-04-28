// getTextMeasure    // 줄 높이 계산
// getCurrencyNumber // 숫자가 아니면 0으로 처리
// loadImages  // 이미지 세팅
// saveImages
// makeTemplateData : 데이터를 아규먼트로 받아서 만들어야 
// getProductSumByUnit : 데이터를 아규먼트로 받아서 만들어야 
import lodash from 'lodash';
import { getCellIndexes, getCellAddress } from "@/components/BrSpreadsheet/workbook/common/address.js";
import { getCell, setCell } from "@/components/BrSpreadsheet/workbook/base/cell.js";
import { getRow, setRow } from "@/components/BrSpreadsheet/workbook/base/row.js";
import { getSheet } from "@/components/BrSpreadsheet/workbook/base/sheet.js";
import { edit_number_format } from '@/util/fmt';

/**
 * @param isCanvas Element
 * @param val Measure Text
 * @param font Measure Font
 * @param isVert Height / Width 구분
 */
export function getTextMeasure(isCanvas, val, font, isVert) {
  const canvas = isCanvas || (isCanvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(val);
  if (isVert) {
    let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    if (!val) val = "";
    let lines = val.split("\n");
    return fontHeight * lines.length + 4;
  }
  return metrics.width;
}


/**
 * Get Currency Code + Number
 * @param number : 변환 대상 숫자
 * @param invoiceData : Object Data
 */
export function getCurrencyNumber(number, invoiceData) {
  // 숫자가 아니면 0으로 처리
  if (isNaN(number)) {
    number = 0;
  }
  const precision = invoiceData.clients.currencyPrecision ? invoiceData.clients.currencyPrecision : invoiceData.company.currencyPrecision ? invoiceData.company.currencyPrecision : 2;

  let fixedNumber = edit_number_format(number, { precision: precision, fixedDecimal: true });
  if (invoiceData.clients.currencyTp != null) {
    if (invoiceData.clients.currencyTp == '0010') {
      return invoiceData.clients.currencySymbol + " " + fixedNumber;
    }
    else {
      return fixedNumber + " " + invoiceData.clients.currencyCd;
    }
  }
  else {
    if (invoiceData.company.currencyTp == '0010') {
      return invoiceData.company.currencySymbol + " " + fixedNumber;
    }
    else {
      return fixedNumber + " " + invoiceData.company.currencyCd;
    }
  }

}


// 세팅에서~
export function loadImages(workbook, imageCells) {
  //(workbook, activeSheet, imageCells, invoiceItemData.length, insertRowsHeight) 
  for (let i = 0; i < imageCells.length; i++) {
    const cellData = imageCells[i].cell;
    for (let k = 0; k < cellData.image.length; k++) {
      const image = cellData.image[k];
      workbook.insertImage([{
        src: image.src,
        height: image.height,
        width: image.width,
        left: image.left,
      },], getCellAddress(imageCells[i].rowIndex, imageCells[i].cellIndexs));
    }
  }

}

export function saveImages(workbook, activeSheet) {
  let useColEndIndex = activeSheet.properties.usedRange.colIndex;
  let useRowEndIndex = activeSheet.properties.usedRange.rowIndex;
  let imageCells = [];
  let rowsHeight = 0;

  for (let i = 0; i < useRowEndIndex; i++) {
    let rowData = JSON.parse(JSON.stringify(getRow(activeSheet, i)));
    rowsHeight = rowsHeight + (rowData.height ? rowData.height : 20);
    if (!rowData.cells) continue;
    for (let j = 0; j < rowData.cells.length; j++) {
      if (rowData.cells[j].image) {
        const imageCell = {
          rowIndex: i,
          cellIndex: j,
          cell: rowData.cells[j],
          images: rowData.cells[j].image,
          rowsHeight: rowsHeight
        };

        let cellData = getCell(i, j, activeSheet);
        cellData.image = [];
        setCell(i, j, activeSheet, cellData);
        let cellAddr = activeSheet.name + "!" + getCellAddress(i, j);
        workbook.updateCell(cellData, cellAddr);
        imageCells.push(imageCell);
      }
    }
  }
  return imageCells;
}


export function makeTemplateData(invoice, templates, tmplId, vueType) {

  // 데이터 만들기 시작
  let sellerAddr = "";
  if (invoice.company.compNm) {
    sellerAddr = invoice.company.compNm;
  }
  if (invoice.company.suite) {
    sellerAddr += "\n" + invoice.company.suite;
  }
  if (invoice.company.street) {
    sellerAddr += "\n" + invoice.company.street;
  }
  if (invoice.company.state || invoice.company.city || invoice.company.postalCode) {
    sellerAddr += "\n";
    if (invoice.company.city) {
      sellerAddr += invoice.company.city;
    }
    if (invoice.company.state) {
      if (invoice.company.state) sellerAddr += ", ";
      sellerAddr += invoice.company.state;
    }
    if (invoice.company.postalCode) {
      if (invoice.company.postalCode) sellerAddr += ", ";
      sellerAddr += invoice.company.postalCode;
    }
  }
  if (invoice.company.countryNm) {
    sellerAddr += "\n" + invoice.company.countryNm;
  }

  // Buyer Address
  let clientAddr = "";
  if (invoice.clients.clientNm) {
    clientAddr = invoice.clients.clientNm;
  }
  if (invoice.clients.suite) {
    clientAddr += "\n" + invoice.clients.suite;
  }
  if (invoice.clients.street) {
    clientAddr += "\n" + invoice.clients.street;
  }
  if (invoice.clients.state || invoice.clients.city || invoice.clients.postalCode) {
    clientAddr += "\n";
    if (invoice.clients.city) {
      clientAddr += invoice.clients.city;
    }
    if (invoice.clients.state) {
      if (invoice.clients.state) clientAddr += ", ";
      clientAddr += invoice.clients.state;
    }
    if (invoice.clients.postalCode) {
      if (invoice.clients.postalCode) clientAddr += ", ";
      clientAddr += invoice.clients.postalCode;
    }
  }
  if (invoice.clients.countryNm) {
    clientAddr += "\n" + invoice.clients.countryNm;
  }

  let consigneeAddr = "";
  if (invoice.info.destinationType == "0020") {
    // 배송지구분이 Consignee인 경우
    if (invoice.info.consigneeNm) {
      consigneeAddr = invoice.info.consigneeNm;
    }    
    consigneeAddr += "\n" + invoice.info.consigneeSuite;
    if (invoice.info.consigneeStreet) {
      consigneeAddr += "\n" + invoice.info.consigneeStreet;
    }
    if (invoice.info.consigneeState || invoice.info.consigneeCity || invoice.info.consigneePostalCode) {
      consigneeAddr += "\n";
      if (invoice.info.consigneeCity) {
        consigneeAddr += invoice.info.consigneeCity;
      }
      if (invoice.info.consigneeState) {
        if (invoice.info.consigneeState) consigneeAddr += ", ";
        consigneeAddr += invoice.info.consigneeState;
      }
      if (invoice.info.consigneePostalCode) {
        if (invoice.info.consigneePostalCode) consigneeAddr += ", ";
        consigneeAddr += invoice.info.consigneePostalCode;
      }
    }
    if (invoice.info.consigneeCountryNm) {
      consigneeAddr += "\n" + invoice.info.consigneeCountryNm;
    }
  }
  else {
    // 배송지구분이 Consignee가 아닌 경우
    if (invoice.info.shippingSuite) {
      consigneeAddr = invoice.info.shippingSuite;
    }        
    if (invoice.info.shippingStreet) {
      consigneeAddr += "\n" + invoice.info.shippingStreet;
    }
    if (invoice.info.shippingState || invoice.info.shippingCity || invoice.info.shippingPostalCode) {
      consigneeAddr += "\n";
      if (invoice.info.shippingCity) {
        consigneeAddr += invoice.info.shippingCity;
      }
      if (invoice.info.shippingState) {
        if (invoice.info.shippingState) consigneeAddr += ", ";
        consigneeAddr += invoice.info.shippingState;
      }
      if (invoice.info.shippingPostalCode) {
        if (invoice.info.shippingPostalCode) consigneeAddr += ", ";
        consigneeAddr += invoice.info.shippingPostalCode;
      }
    }
    if (invoice.info.shippingCountryNm) {
      consigneeAddr += "\n" + invoice.info.shippingCountryNm;
    }
  }

  let invoiceData = {
    invoiceNo: invoice.info.invoiceNo,
    invoiceDt: invoice.info.invoiceDt, // dayjs(this.invoice.info.invoiceDt).format('MMM. DD, YYYY'),
    lcNo: invoice.info.lcNo,
    lcDt: invoice.info.lcDt, // dayjs(this.invoice.info.lcDt).format('MMM. DD, YYYY'),
    midCd: invoice.info.midCd,

    departure: invoice.info.departure,
    arrive: invoice.info.arrive, // shipping>Destination
    departureDt: invoice.info.departureDt,
    shipMethod: invoice.info.shipMethod, // shipping>Ship by

    sellerAddr: sellerAddr,
    clientAddr: clientAddr,
    consignee: consigneeAddr,

    paymentInfo: invoice.info.paymentInfo, // Items>Term of Shipment
    productInfo: invoice.info.productInfo, // Items>Products title

    // productCount: this.invoice.company.countryNm,
    productCount: 0, // Summary>qtySum
    totalAmount: 0,  // Summary>Total Amount
    addDeduct: 0,    // Summary>Add/Deduct
    grandTotal: 0,   // Summary>Grand Total

    otherReference: invoice.info.otherReference,
    invoiceTerm: invoice.info.invoiceTerm,
    textShipMark: invoice.info.textShipMark,
    imgShipMark: invoice.info.imgShipMark,
    textShipMark: invoice.info.textShipMark,
    printShipmarkImg: invoice.info.printShipmarkImg,

    invoiceItemData: []

  };

  let invoiceItemData = [];
  for (let i = 0; i < invoice.products.length; i++) {
    const product = invoice.products[i];
    let item = {
      itemNm: product.itemNm,
      itemDesc: product.itemDesc,
      price: getCurrencyNumber(product.price, invoice),
      qty: product.qty + (product.unitNm ? " " + product.unitNm : product.unit ? " " + product.unit : ""),
      itemAmt: getCurrencyNumber(product.itemAmt, invoice),
    };

    // 선택된 템플릿이 있고 템플릿 아이템이 있으면 상품 반복 항목에 추가한다.
    if (tmplId && tmplId.length > 0) {
      const index = templates.findIndex((template, index, array) => {
        return template.tmplId == tmplId;
      });
      if (index > -1) {

        let templateItems = null;
        // 화면별 할당되는 값 형태가 들려 구분자 추가_jje
        // S: setting , CI: commercial invoice
        if (vueType == 'S') {
          templateItems = templates[index].templateitems;
        } else if (vueType == 'CI') {
          templateItems = templates;
        }

        for (let i = 0; i < templateItems.length; i++) {
          item[templateItems[i].itemId] = product[templateItems[i].itemId];
        }
      }
    }
    // console.log("item :: ", item);
    invoiceItemData.push(item);

    // 합계금액 계산
    invoiceData.totalAmount = invoiceData.totalAmount + product.itemAmt;
    if (product.discountKn == "0010") {
      invoiceData.addDeduct = invoiceData.addDeduct - product.discountAmt;
      invoiceData.grandTotal = invoiceData.grandTotal + product.itemAmt - product.discountAmt;
    }
    else {
      invoiceData.addDeduct = invoiceData.addDeduct + product.discountAmt;
      invoiceData.grandTotal = invoiceData.grandTotal + product.itemAmt + product.discountAmt;
    }
  }
  // console.log("합계 나오기 전에", invoiceData);
  invoiceData.productCount = getProductSumByUnit(invoice); // 아이템 단위별 합 계산
  invoiceData.totalAmount = getCurrencyNumber(invoiceData.totalAmount, invoice);
  invoiceData.grandTotal = getCurrencyNumber(invoiceData.grandTotal, invoice);
  invoiceData.addDeduct = getCurrencyNumber(invoiceData.addDeduct, invoice);
  // console.log("합계한 후", invoiceData);
  invoiceData.invoiceItemData = invoiceItemData;

  return invoiceData;

}


export function getProductSumByUnit(invoiceData) {
  let productSumByUnit = [];
  let returnData = [];

  for (let i = 0; i < invoiceData.products.length; i++) {
    const product = invoiceData.products[i];
    const unitNm = product.unitNm ? product.unitNm : product.unit ? product.unit : "";
    const index = productSumByUnit.findIndex(
      (item) => item.unitNm == unitNm
    );

    if (index < 0) {
      let unitSum = { unitNm: unitNm, qty: product.qty };
      productSumByUnit.push(unitSum);
    } else {
      let qty = product.qty + productSumByUnit[index].qty;
      productSumByUnit[index].qty = qty;
    }
  }

  for (let i = 0; i < productSumByUnit.length; i++) {
    const unitSum = productSumByUnit[i];
    returnData += edit_number_format(unitSum.qty, 0) + " " + unitSum.unitNm;
    if (i != productSumByUnit.length - 1) {
      returnData += "  & \n ";
    }
  }

  return returnData;
}

export function makeInvoiceWorkbook(workbook, pdfInfo, _canvas) {

  // this.previewLoading = true;
  // let loader = this.$dialog.loading({ size: 70, width: 7, color: '#283C46' });
  // setTimeout(() => {
  // qty sum ..
  const invoiceData = makeTemplateData(pdfInfo, pdfInfo.orgTemplateItemList, pdfInfo.info.template.tmplId, 'CI'); // makeTemplateData 함수로 분리_240911jje
  const invoiceItemData = invoiceData.invoiceItemData;

  // const workbook = this.$refs.brSheet.ej2Instances;
  const activeSheet = getSheet(workbook, workbook.activeSheetIndex);
  // 단건 변환 아이템 찾아서 바꾸기
  const matchItems = JSON.parse(pdfInfo.info.template.tmplDocItem);
  const singleItems = lodash.filter(matchItems, { type: 'S' });
  for (let i = 0; i < singleItems.length; i++) {
    let item = singleItems[i];
    const cellIndexs = getCellIndexes(item.cellAddress);
    let cellData = getCell(cellIndexs[0], cellIndexs[1], activeSheet);

    // ShipMark 추가
    if (cellData == null) {
      // cellData = { value: invoiceData[item.itemId] };
      cellData = { value: invoiceData[item.itemId] };
    } else {
      cellData.notes = null;
      cellData.value = invoiceData[item.itemId];
    }
    // Shipmark Image / Text 넣기
    if (item.itemId == "shipmark") {
      if (invoiceData.printShipmarkImg) {
        workbook.insertImage([{
          src: invoiceData.imgShipMark,
          height: activeSheet.columns[cellIndexs[1]].width,
          width: activeSheet.columns[cellIndexs[1]].width,
        },], item.cellAddress);
      }
      else {
        cellData.value = invoiceData["textShipMark"];
      }
    }
    // 날짜 포맷 설정
    else if (item.itemId == "invoiceDt" || item.itemId == "lcDt" || item.itemId == "departureDt") {
      cellData.format = "mmm. dd, yyyy";
    }
    else {
      cellData.format = "@";
    }
    // format
    setCell(cellIndexs[0], cellIndexs[1], activeSheet, cellData);
    let cellAddr = activeSheet.name + "!" + getCellAddress(cellIndexs[0], cellIndexs[1]);
    workbook.updateCell(cellData, cellAddr);
  }

  /**
   * Row Insert 할때 Index가 같으면 안된다.
   */
  // 설정된 반복 Row Band 찾아서 반복 Row 만들기
  let repeatRows = [];
  const repeatItems = lodash.filter(matchItems, { type: 'M' });
  for (let j = 0; j < repeatItems.length; j++) {

    const cellIndexs = getCellIndexes(repeatItems[j].cellAddress);
    const index = repeatRows.findIndex((row, index, array) => {
      return row == cellIndexs[0];
    });
    if (index < 0) repeatRows.push(cellIndexs[0]);
  }

  let repeatRowData = [];
  for (let j = 0; j < repeatRows.length; j++) {
    let rowData = lodash.cloneDeep(getRow(activeSheet, repeatRows[j]));
    rowData.index = repeatRows[j];
    for (let k = 0; k < rowData.cells.length; k++) {
      let cellData = rowData.cells[k];
      cellData.notes = null;
    }
    repeatRowData.push(rowData);
  }

  // 마지막 데이터는 Cron Cell을 업데이트 한다.
  let insertRowsHeight = 0;
  const lastInvoiceItemData = invoiceItemData[invoiceItemData.length - 1];
  for (let i = 0; i < repeatRows.length; i++) {

    let rowData = getRow(activeSheet, repeatRows[i]);
    insertRowsHeight = insertRowsHeight - rowData.height;

    for (let j = 0; j < repeatItems.length; j++) {
      let repeatItem = repeatItems[j];
      const cellIndexs = getCellIndexes(repeatItem.cellAddress);

      // 매칭아이템 Row와 반복열 Row가 다르면 넘긴다.
      if (cellIndexs[0] != repeatRows[i]) continue;
      let cellData = getCell(cellIndexs[0], cellIndexs[1], activeSheet);
      if (cellData == null) {
        cellData = { value: lastInvoiceItemData[repeatItem.itemId] };
        cellData.format = "@";
        cellData.wrap = true;
      } else {
        cellData.notes = null;
        cellData.value = lastInvoiceItemData[repeatItem.itemId];
        cellData.format = "@";
        cellData.wrap = true;
      }
      // 줄 높이 계산
      const cell = rowData.cells[cellIndexs[1]];
      let fontWeight = cell.style ? (cell.style.fontWeight || "normal") : "normal";
      let fontSize = cell.style.style ? (cell.style.style.fontSize || "10pt") : "10pt";
      let fontFamily = cell.style.style ? (cell.style.style.fontFamily || "Calibri") : "Calibri";
      let font = `${fontWeight} ${fontSize} ${fontFamily}`;
      // let height = this.getTextMeasure(rowData.cells[cellIndexs[1]].value, font, true); jje
      let height = getTextMeasure(_canvas, rowData.cells[cellIndexs[1]].value, font, true);
      if (rowData.height < height) rowData.height = height;
      workbook.setRowHeight(rowData.height, cellIndexs[0], 0);

      setCell(cellIndexs[0], cellIndexs[1], activeSheet, cellData);
      let cellAddr = activeSheet.name + "!" + getCellAddress(cellIndexs[0], cellIndexs[1]);
      workbook.updateCell(cellData, cellAddr);
    }

    rowData = getRow(activeSheet, repeatRows[i]);
  }

  // 반복건 변환 아이템 찾아서 바꾸기
  // 마지막 데이터는 Cron Row를 변경하므로 상품수 -1 만큼만 돌린다.
  var rowsModel = [];
  for (let i = 0; i < invoiceItemData.length - 1; i++) {
    let rowData = null;
    for (let x = 0; x < repeatRowData.length; x++) {

      rowData = lodash.cloneDeep(repeatRowData[x]);
      // 시작반복열 뒤로부터 넣는다.
      rowData.index = rowData.index;

      for (let j = 0; j < repeatItems.length; j++) {

        let repeatItem = repeatItems[j];
        const cellIndexs = getCellIndexes(repeatItem.cellAddress);

        // 매칭아이템 Row와 반복열 Row가 다르면 넘긴다.
        if (cellIndexs[0] != repeatRows[x]) continue;
        /**
         * 상품의 마지막 데이터는 반복열의 값을 변경한다.
         * Row를 삭제하면 오류가 발생하므로...
         */
        rowData.cells[cellIndexs[1]].value = invoiceItemData[i][repeatItem.itemId];
        // 줄넘김 추가
        rowData.cells[cellIndexs[1]].wrap = true;
        rowData.cells[cellIndexs[1]].format = "@";
        // 줄 높이 계산
        const cell = rowData.cells[cellIndexs[1]];
        let fontWeight = cell.style ? (cell.style.fontWeight || "normal") : "normal";
        let fontSize = cell.style.style ? (cell.style.style.fontSize || "10pt") : "10pt";
        let fontFamily = cell.style.style ? (cell.style.style.fontFamily || "Calibri") : "Calibri";
        let font = `${fontWeight} ${fontSize} ${fontFamily}`;
        // let height = this.getTextMeasure(rowData.cells[cellIndexs[1]].value, font, true); jje
        let height = getTextMeasure(_canvas, rowData.cells[cellIndexs[1]].value, font, true);
        if (rowData.height < height) rowData.height = height;
      }

      rowsModel.push(rowData);
    }
    if (repeatRowData.length > 0) {
      insertRowsHeight = insertRowsHeight + rowData.height + 1;
    }
  }

  if (rowsModel.length > 1) {
    workbook.insertRow(rowsModel);
  }

  /**
   * 이미지 위치변경
   * 
   */
  //  모든 이미지를 가져온다.
  let imageCells = saveImages(workbook, activeSheet);
  //  모든 이미지를 다시 배치한다.
  loadImages(workbook, imageCells);

  workbook.refresh();

  // if (loader) loader.hide();
  // }, 100);
  return;
}
